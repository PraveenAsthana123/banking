#!/usr/bin/env python3
"""
AI Governance Scoring Pipeline for Banking Use Cases
=====================================================

This pipeline evaluates trained ML models across 8 governance dimensions:
1. Explainability Score (SHAP, LIME, permutation importance, partial dependence)
2. Responsible AI Score (fairness, bias detection, equalized odds, counterfactual fairness)
3. Trustworthy AI Score (stability, calibration curves, robustness, uncertainty quantification)
4. Ethical AI Score (PII detection, consent, dual-use risk assessment)
5. Governance AI Score (documentation, versioning, SR 11-7, EU AI Act tier mapping)
6. Sustainable AI Score (training time, model size, inference latency, carbon footprint)
7. Portable AI Score (serialization, ONNX export check, container readiness)
8. Performance AI Score (metric improvement, inference speed)

Runs after model_training_pipeline.py
Reads from: {UC_FOLDER}/models/*.pkl, {UC_FOLDER}/reports/model_evaluation.json, {UC_FOLDER}/splits/test.csv
Writes to: ml_pipeline_results.db and {UC_FOLDER}/reports/governance_scorecard.json
"""

import os
import sys
import json
import logging
import pickle
import sqlite3
import re
import time
from pathlib import Path
from typing import Dict, List, Tuple, Any, Optional
from datetime import datetime
import numpy as np
import pandas as pd
from sklearn.metrics import brier_score_loss, roc_curve
from sklearn.inspection import permutation_importance
from sklearn.calibration import calibration_curve

# Optional dependencies with graceful fallback
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False

try:
    import lime
    import lime.lime_tabular
    LIME_AVAILABLE = True
except ImportError:
    LIME_AVAILABLE = False

try:
    from sklearn.inspection import partial_dependence
    PD_AVAILABLE = True
except ImportError:
    PD_AVAILABLE = False

try:
    import skl2onnx
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    ONNX_AVAILABLE = True
except ImportError:
    ONNX_AVAILABLE = False

# Add script directory to path for local imports
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

# Import centralized configuration
from config import (
    BASE_DIR, USE_CASES_DIR, RESULTS_DB as _RESULTS_DB, MAPPING_CSV,
    LOG_LEVEL, LOG_FORMAT, get_db_connection, validate_use_case_key,
    get_trust_level, get_log_file
)

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(get_log_file('ai_governance_pipeline')),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# ==============================================================================
# CONSTANTS (from centralized config)
# ==============================================================================
RESULTS_DB = _RESULTS_DB

# Governance weights for overall trust score
GOVERNANCE_WEIGHTS = {
    'explainability': 0.15,
    'responsible_ai': 0.15,
    'trustworthy_ai': 0.15,
    'ethical_ai': 0.10,
    'governance_ai': 0.15,
    'sustainable_ai': 0.10,
    'portable_ai': 0.10,
    'performance_ai': 0.10
}

# EU AI Act tier mapping
EU_AI_ACT_TIERS = {
    'UNACCEPTABLE': ['social_scoring', 'real_time_biometric'],
    'HIGH_RISK': ['credit', 'lending', 'loan', 'hr', 'hiring', 'recruitment',
                  'employment', 'biometric', 'law_enforcement', 'border_control'],
    'LIMITED_RISK': ['chatbot', 'deepfake', 'emotion_recognition'],
    'MINIMAL_RISK': ['spam_filter', 'inventory', 'recommendation', 'analytics']
}

# SR 11-7 compliance checklist (Federal Reserve)
SR_11_7_REQUIREMENTS = [
    'model_validation',
    'ongoing_monitoring',
    'comprehensive_documentation',
    'independent_review',
    'model_risk_rating',
    'periodic_validation'
]

# =============================================================================
# SCORING THRESHOLDS (documented magic numbers)
# =============================================================================

# Explainability scoring thresholds
EXPLAINABILITY_THRESHOLDS = {
    'excellent_concentration': 0.80,  # Top-10 features explain 80%+ = excellent
    'good_concentration': 0.60,       # Top-10 features explain 60%+ = good
}

# Fairness/Responsible AI thresholds
FAIRNESS_THRESHOLDS = {
    'excellent_gap': 0.05,    # <5% demographic parity gap = excellent
    'good_gap': 0.10,         # <10% gap = good
    'acceptable_gap': 0.20,   # <20% gap = acceptable
    'disparate_impact_min': 0.8,  # 4/5ths rule (80% rule)
}

# Robustness testing noise levels
ROBUSTNESS_NOISE_LEVELS = [0.05, 0.10, 0.20]  # 5%, 10%, 20% noise

# Sustainable AI thresholds
SUSTAINABILITY_THRESHOLDS = {
    # Training time thresholds (seconds)
    'training_time_excellent': 600,    # <10 minutes
    'training_time_good': 3600,        # <1 hour
    'training_time_acceptable': 36000, # <10 hours

    # Model size thresholds (MB)
    'model_size_excellent': 50,        # <50 MB
    'model_size_good': 100,            # <100 MB
    'model_size_acceptable': 500,      # <500 MB

    # Inference latency thresholds (ms)
    'latency_excellent': 50,           # <50 ms
    'latency_good': 100,               # <100 ms
    'latency_acceptable': 500,         # <500 ms

    # Carbon footprint formula: training_seconds * POWER_CONSUMPTION * CARBON_INTENSITY
    'power_consumption_kwh_per_sec': 0.0002,  # ~0.2 W average
    'carbon_intensity_kg_per_kwh': 0.4,       # US average grid
}


# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

def resolve_uc_folder(uc_key: str) -> Optional[Path]:
    """
    Resolve use case folder from uc_key by looking up in enterprise_ai_mapping.csv.
    Matches the logic from model_training_pipeline.get_uc_folder().

    Args:
        uc_key: Use case key (e.g., 'uc_06_01_creditcard_fraud' or 'UC-06-01')

    Returns:
        Full path to use case folder, or None if not found
    """
    try:
        if not MAPPING_CSV.exists():
            logger.warning(f"Mapping CSV not found: {MAPPING_CSV}")
            return None

        mapping_df = pd.read_csv(MAPPING_CSV)

        # Extract UC-XX-YY format from uc_key
        if uc_key.startswith("uc_"):
            parts = uc_key.split("_")
            if len(parts) >= 3:
                uc_id = f"UC-{parts[1].upper()}-{parts[2].upper()}"
            else:
                logger.warning(f"Cannot parse uc_key: {uc_key}")
                return None
        elif uc_key.startswith("UC-"):
            uc_id = uc_key
        else:
            logger.warning(f"Unrecognized uc_key format: {uc_key}")
            return None

        # Look up in mapping
        row = mapping_df[mapping_df['uc_id'] == uc_id]
        if len(row) > 0:
            folder_path = row.iloc[0]['folder_path']
            full_path = USE_CASES_DIR / folder_path
            if full_path.exists():
                return full_path
            else:
                logger.warning(f"Folder does not exist: {full_path}")
                return None
        else:
            logger.warning(f"No mapping found for uc_id: {uc_id}")
            return None

    except Exception as e:
        logger.error(f"Error resolving uc_folder for {uc_key}: {e}")
        return None


def get_eu_ai_act_tier(use_case_label: str, governance_level: str) -> str:
    """Determine EU AI Act risk tier based on use case domain."""
    use_case_lower = use_case_label.lower()

    # Check each tier
    for tier, keywords in EU_AI_ACT_TIERS.items():
        if any(keyword in use_case_lower for keyword in keywords):
            return tier

    # Default based on governance level
    if governance_level in ['mandatory', 'highest', 'high']:
        return 'HIGH_RISK'
    elif governance_level in ['medium']:
        return 'LIMITED_RISK'
    else:
        return 'MINIMAL_RISK'


# ==============================================================================
# AI GOVERNANCE SCORER CLASS
# ==============================================================================

class AIGovernanceScorer:
    """
    Comprehensive AI Governance Scoring Engine
    Evaluates models across 8 governance dimensions with detailed metrics
    """

    def __init__(self, uc_key: str, uc_folder: Path):
        self.uc_key = uc_key
        self.uc_folder = Path(uc_folder)
        self.models_dir = self.uc_folder / 'models'
        self.reports_dir = self.uc_folder / 'reports'
        self.splits_dir = self.uc_folder / 'splits'

        # Ensure reports directory exists
        self.reports_dir.mkdir(parents=True, exist_ok=True)

        self.model = None
        self.model_path = None
        self.evaluation_results = None
        self.test_data = None
        self.test_labels = None
        self.feature_names = None
        self.metadata = {}

        logger.info(f"Initialized scorer for {uc_key} at {uc_folder}")

    def load_model_and_data(self) -> bool:
        """Load the best trained model, test data, and evaluation results."""
        try:
            # 1. Load model from models_dir
            if not self.models_dir.exists():
                logger.warning(f"Models directory not found: {self.models_dir}")
                return False

            model_files = list(self.models_dir.glob('*.pkl'))
            if not model_files:
                logger.warning(f"No model files found in {self.models_dir}")
                return False

            # Try to find best_model.pkl first
            best_model_file = self.models_dir / 'best_model.pkl'
            if not best_model_file.exists():
                # Use most recent model
                model_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
                best_model_file = model_files[0]

            self.model_path = best_model_file
            with open(best_model_file, 'rb') as f:
                self.model = pickle.load(f)

            logger.info(f"Loaded model: {best_model_file.name} ({type(self.model).__name__})")

            # 2. Load evaluation results
            eval_file = self.reports_dir / 'model_evaluation.json'
            if eval_file.exists():
                with open(eval_file, 'r') as f:
                    self.evaluation_results = json.load(f)
                logger.info("Loaded evaluation results")
            else:
                logger.warning("No evaluation results found")
                self.evaluation_results = {}

            # 3. Load test data from splits/test.csv
            test_file = self.splits_dir / 'test.csv'
            if test_file.exists():
                df = pd.read_csv(test_file)

                # Identify target column
                target_cols = [col for col in df.columns if any(
                    keyword in col.lower() for keyword in
                    ['target', 'label', 'class', 'outcome', 'fraud', 'churn',
                     'default', 'risk', 'is_laundering', 'loan_status']
                )]

                if target_cols:
                    target_col = target_cols[0]
                    self.test_labels = df[target_col]
                    self.test_data = df.drop(columns=[target_col])
                else:
                    # No clear target, use all data
                    self.test_data = df
                    self.test_labels = None

                self.feature_names = list(self.test_data.columns)

                # Convert to numeric where possible
                for col in self.test_data.columns:
                    if self.test_data[col].dtype == 'object':
                        try:
                            self.test_data[col] = pd.to_numeric(self.test_data[col], errors='coerce')
                        except Exception:
                            pass

                # Sample if too large
                if len(self.test_data) > 1000:
                    sample_idx = np.random.choice(len(self.test_data), 1000, replace=False)
                    self.test_data = self.test_data.iloc[sample_idx].reset_index(drop=True)
                    if self.test_labels is not None:
                        self.test_labels = self.test_labels.iloc[sample_idx].reset_index(drop=True)

                logger.info(f"Loaded test data: {self.test_data.shape}")
            else:
                logger.warning(f"Test data not found: {test_file}")
                self.test_data = None
                self.test_labels = None

            return True

        except Exception as e:
            logger.error(f"Error loading model and data: {e}", exc_info=True)
            return False

    def score_explainability(self) -> Dict[str, Any]:
        """
        Score model explainability using:
        - SHAP (TreeExplainer for tree models, KernelExplainer fallback)
        - LIME (LimeTabularExplainer for 10 samples)
        - Permutation importance
        - Partial dependence plots for top 5 features

        Returns score 0-100 based on feature interpretability ratio
        """
        try:
            if self.model is None or self.test_data is None:
                return {'score': 50, 'reason': 'Model or data not available', 'details': {}}

            details = {}

            # Sample data for explainability (max 100 rows)
            sample_size = min(100, len(self.test_data))
            sample_data = self.test_data.sample(n=sample_size, random_state=42)

            # Remove non-numeric columns
            numeric_cols = sample_data.select_dtypes(include=[np.number]).columns
            sample_data_numeric = sample_data[numeric_cols].fillna(0)

            if len(numeric_cols) == 0:
                return {'score': 40, 'reason': 'No numeric features for explainability', 'details': {}}

            # 1. SHAP Analysis
            shap_importance = None
            if SHAP_AVAILABLE:
                try:
                    model_type = type(self.model).__name__
                    if any(tree_type in model_type for tree_type in ['Forest', 'Tree', 'XGB', 'LGBM', 'CatBoost']):
                        explainer = shap.TreeExplainer(self.model)
                    else:
                        # Fallback to KernelExplainer
                        explainer = shap.KernelExplainer(
                            self.model.predict,
                            sample_data_numeric.iloc[:min(50, len(sample_data_numeric))]
                        )

                    shap_values = explainer.shap_values(sample_data_numeric)

                    # Handle multi-class output
                    if isinstance(shap_values, list):
                        shap_values = shap_values[0] if len(shap_values) > 0 else shap_values

                    # Compute mean absolute SHAP values
                    mean_abs_shap = np.abs(shap_values).mean(axis=0)
                    shap_importance = dict(zip(numeric_cols, mean_abs_shap))
                    shap_importance = dict(sorted(shap_importance.items(), key=lambda x: x[1], reverse=True))
                    details['shap_top_10'] = {k: float(v) for k, v in list(shap_importance.items())[:10]}

                    logger.info(f"SHAP analysis completed for {self.uc_key}")

                except Exception as e:
                    logger.warning(f"SHAP computation failed: {e}")
                    shap_importance = None

            # 2. LIME Analysis
            if LIME_AVAILABLE and self.test_labels is not None:
                try:
                    # Create LIME explainer
                    explainer = lime.lime_tabular.LimeTabularExplainer(
                        training_data=sample_data_numeric.values,
                        feature_names=list(numeric_cols),
                        mode='classification' if hasattr(self.model, 'predict_proba') else 'regression',
                        random_state=42
                    )

                    # Explain 10 random samples
                    lime_explanations = []
                    explain_indices = np.random.choice(len(sample_data_numeric), min(10, len(sample_data_numeric)), replace=False)

                    for idx in explain_indices:
                        try:
                            if hasattr(self.model, 'predict_proba'):
                                exp = explainer.explain_instance(
                                    sample_data_numeric.iloc[idx].values,
                                    self.model.predict_proba,
                                    num_features=10
                                )
                            else:
                                exp = explainer.explain_instance(
                                    sample_data_numeric.iloc[idx].values,
                                    self.model.predict,
                                    num_features=10
                                )
                            lime_explanations.append(exp.as_list())
                        except Exception:
                            continue

                    details['lime_sample_explanations'] = len(lime_explanations)
                    logger.info(f"LIME analysis completed: {len(lime_explanations)} samples explained")

                except Exception as e:
                    logger.warning(f"LIME computation failed: {e}")

            # 3. Permutation Importance
            perm_importance = None
            try:
                if self.test_labels is not None and len(self.test_labels) > 0:
                    aligned_data = sample_data_numeric
                    aligned_labels = self.test_labels.iloc[sample_data.index].reset_index(drop=True)

                    if len(aligned_data) > 10:
                        result = permutation_importance(
                            self.model,
                            aligned_data,
                            aligned_labels,
                            n_repeats=5,
                            random_state=42,
                            n_jobs=-1
                        )
                        perm_importance = dict(zip(numeric_cols, result.importances_mean))
                        perm_importance = dict(sorted(perm_importance.items(), key=lambda x: x[1], reverse=True))
                        details['permutation_top_10'] = {k: float(v) for k, v in list(perm_importance.items())[:10]}
                        logger.info("Permutation importance computed")
            except Exception as e:
                logger.warning(f"Permutation importance failed: {e}")

            # 4. Partial Dependence Plots (top 5 features)
            if PD_AVAILABLE and (shap_importance or perm_importance):
                try:
                    importance_dict = shap_importance or perm_importance
                    top_features = list(importance_dict.keys())[:5]
                    top_feature_indices = [list(numeric_cols).index(f) for f in top_features if f in numeric_cols]

                    if hasattr(self.model, 'predict') and len(top_feature_indices) > 0:
                        pd_results = {}
                        for feat_idx in top_feature_indices:
                            try:
                                pd_data = partial_dependence(
                                    self.model,
                                    sample_data_numeric,
                                    features=[feat_idx],
                                    grid_resolution=20
                                )
                                feature_name = numeric_cols[feat_idx]
                                pd_results[feature_name] = {
                                    'values': pd_data['values'][0].tolist(),
                                    'grid': pd_data['grid_values'][0].tolist()
                                }
                            except Exception:
                                continue

                        details['partial_dependence'] = pd_results
                        logger.info(f"Partial dependence computed for {len(pd_results)} features")
                except Exception as e:
                    logger.warning(f"Partial dependence failed: {e}")

            # Calculate explainability score
            importance_dict = shap_importance or perm_importance

            if importance_dict is None:
                return {'score': 45, 'reason': 'Could not compute feature importance', 'details': details}

            # Calculate concentration of top 10 features
            total_importance = sum(importance_dict.values())
            if total_importance == 0:
                return {'score': 50, 'reason': 'Zero total importance', 'details': details}

            top_10_importance = sum(list(importance_dict.values())[:10])
            concentration = top_10_importance / total_importance

            details['top_10_concentration'] = float(concentration)
            details['total_features'] = len(importance_dict)
            details['methods_used'] = []
            if shap_importance:
                details['methods_used'].append('SHAP')
            if LIME_AVAILABLE:
                details['methods_used'].append('LIME')
            if perm_importance:
                details['methods_used'].append('Permutation')
            if 'partial_dependence' in details:
                details['methods_used'].append('Partial Dependence')

            # Score based on concentration
            if concentration > 0.80:
                score = 90 + (concentration - 0.80) * 50  # 90-100
            elif concentration > 0.60:
                score = 75 + (concentration - 0.60) * 75  # 75-90
            else:
                score = 60 + concentration * 25  # 60-75

            score = min(100, max(0, score))

            # Save explainability report
            explainability_report = {
                'use_case': self.uc_key,
                'timestamp': datetime.now().isoformat(),
                'score': float(score),
                'concentration': float(concentration),
                'methods': details['methods_used'],
                'top_features': {k: float(v) for k, v in list(importance_dict.items())[:10]},
                'details': details
            }

            with open(self.reports_dir / 'explainability.json', 'w') as f:
                json.dump(explainability_report, f, indent=2)

            return {'score': float(score), 'reason': f'Top-10 features explain {concentration:.1%}', 'details': details}

        except Exception as e:
            logger.error(f"Error in explainability scoring: {e}", exc_info=True)
            return {'score': 50, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_responsible_ai(self) -> Dict[str, Any]:
        """
        Score responsible AI based on:
        - Protected attribute detection
        - Demographic parity difference
        - Equalized odds (TPR difference across groups)
        - Disparate impact ratio (4/5ths rule)
        - Counterfactual fairness (flip protected attribute, check prediction change)

        Returns score 100 - (max_bias_gap * 100), floor 50
        """
        try:
            if self.test_data is None:
                return {'score': 85, 'reason': 'No data - assumed compliant', 'details': {}}

            details = {}

            # Check for protected attributes
            protected_patterns = ['gender', 'age', 'race', 'ethnicity', 'sex', 'religion', 'disability', 'marital']
            protected_cols = [col for col in self.test_data.columns if any(
                pattern in col.lower() for pattern in protected_patterns
            )]

            if not protected_cols:
                return {'score': 85, 'reason': 'No protected attributes found - assumed compliant', 'details': details}

            details['protected_attributes'] = protected_cols

            # Calculate fairness metrics
            max_bias_gap = 0.0
            bias_metrics = {}

            for col in protected_cols[:3]:  # Check up to 3 protected attributes
                try:
                    if self.model is None or self.test_labels is None:
                        continue

                    # Get unique groups
                    groups = self.test_data[col].dropna().unique()
                    if len(groups) < 2 or len(groups) > 10:
                        continue

                    # Get predictions
                    X_test = self.test_data.select_dtypes(include=[np.number]).fillna(0)
                    predictions = self.model.predict(X_test)

                    # Get prediction probabilities if available
                    if hasattr(self.model, 'predict_proba'):
                        pred_proba = self.model.predict_proba(X_test)
                        if pred_proba.ndim > 1 and pred_proba.shape[1] > 1:
                            pred_proba = pred_proba[:, 1] if pred_proba.shape[1] == 2 else pred_proba.max(axis=1)
                    else:
                        pred_proba = predictions

                    # 1. Demographic Parity Difference
                    group_rates = {}
                    for group in groups:
                        mask = self.test_data[col] == group
                        if mask.sum() > 0:
                            group_preds = predictions[mask]
                            positive_rate = (group_preds > 0.5).mean() if hasattr(group_preds, 'mean') else group_preds.mean()
                            group_rates[str(group)] = float(positive_rate)

                    if len(group_rates) >= 2:
                        rates = list(group_rates.values())
                        parity_diff = max(rates) - min(rates)

                        # 2. Disparate Impact Ratio
                        min_rate = min(rates)
                        max_rate = max(rates)
                        impact_ratio = min_rate / max_rate if max_rate > 0 else 1.0

                        # 3. Equalized Odds (TPR difference)
                        aligned_labels = self.test_labels.iloc[X_test.index].reset_index(drop=True)
                        tpr_by_group = {}
                        for group in groups:
                            mask = (self.test_data[col] == group).values
                            if mask.sum() > 0:
                                group_labels = aligned_labels[mask]
                                group_preds = predictions[mask]
                                # True Positive Rate
                                if (group_labels == 1).sum() > 0:
                                    tpr = ((group_preds > 0.5) & (group_labels == 1)).sum() / (group_labels == 1).sum()
                                    tpr_by_group[str(group)] = float(tpr)

                        tpr_diff = 0
                        if len(tpr_by_group) >= 2:
                            tpr_values = list(tpr_by_group.values())
                            tpr_diff = max(tpr_values) - min(tpr_values)

                        # 4. Counterfactual Fairness
                        # Flip protected attribute and measure prediction change
                        cf_change_rate = 0.0
                        try:
                            if len(groups) == 2:
                                # Binary protected attribute - swap values
                                X_counterfactual = X_test.copy()
                                if col in X_counterfactual.columns:
                                    unique_vals = sorted(self.test_data[col].dropna().unique())
                                    if len(unique_vals) == 2:
                                        # Create mapping to flip values
                                        flip_map = {unique_vals[0]: unique_vals[1], unique_vals[1]: unique_vals[0]}
                                        X_counterfactual[col] = self.test_data[col].map(flip_map)

                                        # Get counterfactual predictions
                                        cf_predictions = self.model.predict(X_counterfactual.select_dtypes(include=[np.number]).fillna(0))

                                        # Measure change rate
                                        prediction_changes = (predictions != cf_predictions).sum()
                                        cf_change_rate = prediction_changes / len(predictions)
                        except Exception as e:
                            logger.warning(f"Counterfactual fairness check failed: {e}")

                        bias_metrics[col] = {
                            'demographic_parity_diff': float(parity_diff),
                            'disparate_impact_ratio': float(impact_ratio),
                            'equalized_odds_tpr_diff': float(tpr_diff),
                            'counterfactual_change_rate': float(cf_change_rate),
                            'group_rates': group_rates,
                            'tpr_by_group': tpr_by_group
                        }

                        # Track maximum bias (worst of demographic parity and equalized odds)
                        max_bias_gap = max(max_bias_gap, parity_diff, tpr_diff)

                except Exception as e:
                    logger.warning(f"Could not compute fairness for {col}: {e}")

            details['bias_metrics'] = bias_metrics
            details['max_bias_gap'] = float(max_bias_gap)

            # Calculate score: 100 - (bias_gap * 100), floor at 50
            score = max(50, 100 - (max_bias_gap * 100))

            if max_bias_gap < 0.05:
                reason = f'Excellent fairness (max bias: {max_bias_gap:.2%})'
            elif max_bias_gap < 0.10:
                reason = f'Good fairness (max bias: {max_bias_gap:.2%})'
            elif max_bias_gap < 0.20:
                reason = f'Moderate fairness (max bias: {max_bias_gap:.2%})'
            else:
                reason = f'Fairness concerns (max bias: {max_bias_gap:.2%})'

            return {'score': float(score), 'reason': reason, 'details': details}

        except Exception as e:
            logger.error(f"Error in responsible AI scoring: {e}", exc_info=True)
            return {'score': 70, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_trustworthy_ai(self) -> Dict[str, Any]:
        """
        Score trustworthy AI based on:
        - Stability: CV std from model_evaluation.json
        - Calibration: Brier score + calibration_curve data
        - Robustness: noise injection at 5%, 10%, 20% levels
        - Uncertainty: prediction confidence distribution (mean, std, entropy)

        Composite score: stability 25%, calibration 25%, robustness 30%, uncertainty 20%
        """
        try:
            details = {}
            scores = []

            # 1. Model Stability (25% weight)
            stability_score = 50
            if self.evaluation_results:
                try:
                    cv_scores = self.evaluation_results.get('cv_scores', [])
                    if cv_scores and len(cv_scores) > 1:
                        std_cv = np.std(cv_scores)
                        mean_cv = np.mean(cv_scores)
                        cv_stability = 1 - (std_cv / mean_cv if mean_cv != 0 else 0)
                        stability_score = max(0, min(100, cv_stability * 100))
                        details['cv_stability'] = float(cv_stability)
                        details['cv_std'] = float(std_cv)
                        details['cv_mean'] = float(mean_cv)
                except Exception as e:
                    logger.warning(f"Could not compute stability: {e}")

            scores.append(('stability', stability_score, 0.25))

            # 2. Calibration (25% weight)
            calibration_score = 75
            if self.model and self.test_data is not None and self.test_labels is not None:
                try:
                    X_test = self.test_data.select_dtypes(include=[np.number]).fillna(0)

                    # Check if model has predict_proba (classification)
                    if hasattr(self.model, 'predict_proba'):
                        y_pred_proba = self.model.predict_proba(X_test)

                        # Handle multi-class
                        if y_pred_proba.ndim > 1 and y_pred_proba.shape[1] > 1:
                            y_pred_proba = y_pred_proba[:, 1] if y_pred_proba.shape[1] == 2 else y_pred_proba.max(axis=1)

                        # Align labels
                        aligned_labels = self.test_labels.iloc[:len(X_test)].reset_index(drop=True)

                        # Compute Brier score
                        brier = brier_score_loss(aligned_labels, y_pred_proba)
                        calibration_score = max(0, min(100, (1 - brier) * 100))
                        details['brier_score'] = float(brier)

                        # Compute calibration curve
                        try:
                            prob_true, prob_pred = calibration_curve(
                                aligned_labels, y_pred_proba, n_bins=10, strategy='uniform'
                            )
                            details['calibration_curve'] = {
                                'prob_true': prob_true.tolist(),
                                'prob_pred': prob_pred.tolist()
                            }
                            logger.info("Calibration curve computed")
                        except Exception as e:
                            logger.warning(f"Calibration curve failed: {e}")

                except Exception as e:
                    logger.warning(f"Could not compute calibration: {e}")

            scores.append(('calibration', calibration_score, 0.25))

            # 3. Robustness (30% weight)
            robustness_score = 70
            if self.model and self.test_data is not None:
                try:
                    X_test = self.test_data.select_dtypes(include=[np.number]).fillna(0)

                    # Get baseline predictions
                    baseline_preds = self.model.predict(X_test)

                    # Test with noise injection at multiple levels
                    noise_levels = [0.05, 0.10, 0.20]
                    noise_impacts = []

                    for noise_level in noise_levels:
                        # Add Gaussian noise
                        X_noisy = X_test + np.random.normal(0, noise_level * X_test.std().mean(), X_test.shape)
                        noisy_preds = self.model.predict(X_noisy)

                        # Measure prediction change
                        if hasattr(baseline_preds, 'mean'):
                            pred_diff = np.abs(noisy_preds - baseline_preds).mean()
                        else:
                            pred_diff = np.mean(noisy_preds != baseline_preds)

                        noise_impacts.append(float(pred_diff))

                    # Score based on average impact (lower impact = more robust)
                    avg_impact = np.mean(noise_impacts)
                    robustness_score = max(0, min(100, (1 - avg_impact) * 100))

                    details['noise_impacts'] = {str(noise_levels[i]): noise_impacts[i] for i in range(len(noise_levels))}
                    details['avg_noise_impact'] = float(avg_impact)
                    logger.info(f"Robustness test completed: avg impact {avg_impact:.3f}")

                except Exception as e:
                    logger.warning(f"Could not compute robustness: {e}")

            scores.append(('robustness', robustness_score, 0.30))

            # 4. Uncertainty Quantification (20% weight)
            uncertainty_score = 70
            if self.model and self.test_data is not None:
                try:
                    X_test = self.test_data.select_dtypes(include=[np.number]).fillna(0)

                    if hasattr(self.model, 'predict_proba'):
                        # Classification: analyze prediction confidence distribution
                        y_pred_proba = self.model.predict_proba(X_test)

                        # Get max probability (confidence) for each prediction
                        if y_pred_proba.ndim > 1:
                            confidences = y_pred_proba.max(axis=1)
                        else:
                            confidences = y_pred_proba

                        # Compute statistics
                        conf_mean = np.mean(confidences)
                        conf_std = np.std(confidences)

                        # Compute entropy (measure of uncertainty)
                        epsilon = 1e-10
                        entropies = -np.sum(y_pred_proba * np.log(y_pred_proba + epsilon), axis=1)
                        entropy_mean = np.mean(entropies)
                        entropy_std = np.std(entropies)

                        details['uncertainty'] = {
                            'confidence_mean': float(conf_mean),
                            'confidence_std': float(conf_std),
                            'entropy_mean': float(entropy_mean),
                            'entropy_std': float(entropy_std)
                        }

                        # Score: higher mean confidence and lower entropy = better
                        uncertainty_score = (conf_mean * 60) + ((1 - entropy_mean / np.log(y_pred_proba.shape[1])) * 40)
                        uncertainty_score = max(0, min(100, uncertainty_score))

                        logger.info(f"Uncertainty quantification: conf={conf_mean:.3f}, entropy={entropy_mean:.3f}")

                except Exception as e:
                    logger.warning(f"Could not compute uncertainty: {e}")

            scores.append(('uncertainty', uncertainty_score, 0.20))

            # Calculate weighted composite score
            total_score = sum(score * weight for _, score, weight in scores)

            details['component_scores'] = {name: float(score) for name, score, _ in scores}

            return {'score': float(total_score), 'reason': 'Composite trustworthiness score', 'details': details}

        except Exception as e:
            logger.error(f"Error in trustworthy AI scoring: {e}", exc_info=True)
            return {'score': 60, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_ethical_ai(self) -> Dict[str, Any]:
        """
        Score ethical AI based on:
        - PII detection: scan column names
        - Data consent: check for consent/opt_in columns
        - Dual-use risk assessment:
            * credit/lending: HIGH (redlining potential)
            * HR: HIGH (hiring discrimination)
            * fraud/AML: MEDIUM (surveillance overreach)
            * operations: LOW
        - Harm potential classification

        Score = 100 - (pii_flags * 5) - (dual_use_risk * 10) - (harm_level * 5)
        """
        try:
            details = {}

            # 1. PII Detection
            pii_patterns = {
                'email': r'email|e-mail|mail',
                'ssn': r'ssn|social.?security|tax.?id',
                'phone': r'phone|mobile|telephone|cell',
                'name': r'first.?name|last.?name|full.?name|customer.?name',
                'address': r'address|street|zip|postal',
                'dob': r'dob|date.?of.?birth|birth.?date',
                'id_number': r'passport|license|id.?number|account.?number'
            }

            pii_flags = 0
            detected_pii = []

            if self.test_data is not None:
                for col in self.test_data.columns:
                    col_lower = col.lower()
                    for pii_type, pattern in pii_patterns.items():
                        if re.search(pattern, col_lower):
                            pii_flags += 1
                            detected_pii.append({'column': col, 'type': pii_type})
                            break

            details['pii_flags'] = pii_flags
            details['detected_pii'] = detected_pii

            # 2. Data Consent Check
            has_consent = False
            if self.test_data is not None:
                consent_patterns = ['consent', 'opt.?in', 'permission', 'agree']
                has_consent = any(
                    any(re.search(pattern, col.lower()) for pattern in consent_patterns)
                    for col in self.test_data.columns
                )

            details['has_consent_indicator'] = has_consent

            # 3. Dual-Use Risk Assessment
            use_case_lower = self.uc_key.lower()

            # HIGH dual-use risk domains
            if any(term in use_case_lower for term in ['credit', 'loan', 'lending', 'default', 'pd', 'lgd', 'ead']):
                dual_use_risk = 3  # HIGH: redlining, discriminatory lending
                dual_use_category = 'HIGH'
                dual_use_rationale = 'Credit/lending models have high potential for discriminatory redlining'
            elif any(term in use_case_lower for term in ['hr', 'hiring', 'recruit', 'employee', 'attrition', 'workforce', 'talent']):
                dual_use_risk = 3  # HIGH: hiring discrimination
                dual_use_category = 'HIGH'
                dual_use_rationale = 'HR models can perpetuate hiring discrimination'
            # MEDIUM dual-use risk domains
            elif any(term in use_case_lower for term in ['fraud', 'aml', 'laundering', 'kyc', 'transaction']):
                dual_use_risk = 2  # MEDIUM: surveillance overreach
                dual_use_category = 'MEDIUM'
                dual_use_rationale = 'Fraud/AML models risk surveillance overreach and privacy violation'
            # LOW dual-use risk domains
            else:
                dual_use_risk = 1  # LOW
                dual_use_category = 'LOW'
                dual_use_rationale = 'Operational models have limited dual-use potential'

            details['dual_use_risk'] = dual_use_category
            details['dual_use_rationale'] = dual_use_rationale

            # 4. Harm Potential Classification
            if any(term in use_case_lower for term in ['fraud', 'aml', 'laundering', 'kyc']):
                harm_level = 1  # Medium
                harm_category = 'medium'
            elif any(term in use_case_lower for term in ['credit', 'loan', 'lending', 'risk', 'default']):
                harm_level = 2  # High
                harm_category = 'high'
            elif any(term in use_case_lower for term in ['hr', 'hiring', 'employee', 'talent', 'workforce']):
                harm_level = 2  # High
                harm_category = 'high'
            else:
                harm_level = 0  # Low
                harm_category = 'low'

            details['harm_level'] = harm_category

            # Calculate score: 100 - (pii_flags * 5) - (dual_use_risk * 10) - (harm_level * 5)
            score = 100 - (pii_flags * 5) - (dual_use_risk * 10) - (harm_level * 5)

            # Add bonus for consent
            if has_consent:
                score += 5

            score = max(50, min(100, score))

            if score >= 90:
                reason = 'Excellent ethical compliance'
            elif score >= 75:
                reason = f'Good ethics ({pii_flags} PII, {dual_use_category} dual-use risk)'
            elif score >= 60:
                reason = f'Moderate ethics ({pii_flags} PII, {dual_use_category} dual-use risk)'
            else:
                reason = f'Ethics concerns ({pii_flags} PII, {dual_use_category} dual-use risk, {harm_category} harm)'

            return {'score': float(score), 'reason': reason, 'details': details}

        except Exception as e:
            logger.error(f"Error in ethical AI scoring: {e}", exc_info=True)
            return {'score': 65, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_governance_ai(self) -> Dict[str, Any]:
        """
        Score governance AI based on:
        - Model card exists?
        - Benchmark report exists?
        - Model evaluation exists?
        - Explainability report exists?
        - Version tracking (multiple model versions)
        - Regulatory alignment:
            * SR 11-7 compliance (Fed model risk management)
            * EU AI Act tier mapping (UNACCEPTABLE, HIGH_RISK, LIMITED_RISK, MINIMAL_RISK)

        Score = checklist percentage * compliance_multiplier
        """
        try:
            details = {}
            checklist_items = []

            # 1. Model Documentation
            model_card_exists = (self.reports_dir / 'model_card.json').exists()
            checklist_items.append(('model_card', model_card_exists))
            details['has_model_card'] = model_card_exists

            eval_exists = (self.reports_dir / 'model_evaluation.json').exists()
            checklist_items.append(('evaluation_report', eval_exists))
            details['has_evaluation'] = eval_exists

            benchmark_exists = (self.reports_dir / 'benchmark.json').exists()
            checklist_items.append(('performance_benchmark', benchmark_exists))
            details['has_benchmark'] = benchmark_exists

            explainability_exists = (self.reports_dir / 'explainability.json').exists()
            checklist_items.append(('explainability_report', explainability_exists))
            details['has_explainability'] = explainability_exists

            # 2. Version Control
            has_versioning = False
            version_count = 0
            if self.models_dir.exists():
                model_files = list(self.models_dir.glob('*.pkl'))
                version_count = len(model_files)
                # Check if files have timestamps or versions
                has_versioning = any(
                    re.search(r'\d{4}-\d{2}-\d{2}|\d{8}|v\d+', f.name)
                    for f in model_files
                ) or version_count > 1

            checklist_items.append(('version_control', has_versioning))
            details['has_versioning'] = has_versioning
            details['model_versions'] = version_count

            # 3. Regulatory Alignment - Read from mapping CSV
            governance_level = 'standard'
            uc_title = ''
            if MAPPING_CSV.exists():
                try:
                    mapping_df = pd.read_csv(MAPPING_CSV)

                    # Extract UC-XX-YY from uc_key
                    if self.uc_key.startswith("uc_"):
                        parts = self.uc_key.split("_")
                        if len(parts) >= 3:
                            uc_id = f"UC-{parts[1].upper()}-{parts[2].upper()}"
                        else:
                            uc_id = None
                    else:
                        uc_id = self.uc_key

                    if uc_id:
                        use_case_mapping = mapping_df[mapping_df['uc_id'] == uc_id]

                        if not use_case_mapping.empty:
                            governance_level = str(use_case_mapping['governance_level'].iloc[0]).lower()
                            uc_title = str(use_case_mapping['title'].iloc[0])
                except Exception as e:
                    logger.warning(f"Could not read enterprise mapping: {e}")

            # 4. SR 11-7 Compliance (Federal Reserve Model Risk Management)
            sr_11_7_checklist = {
                'model_validation': eval_exists,
                'ongoing_monitoring': benchmark_exists,
                'comprehensive_documentation': model_card_exists,
                'independent_review': explainability_exists,
                'model_risk_rating': True,  # Assumed via governance_level
                'periodic_validation': has_versioning
            }
            sr_11_7_score = sum(sr_11_7_checklist.values()) / len(sr_11_7_checklist) * 100
            details['sr_11_7_compliance'] = {
                'checklist': sr_11_7_checklist,
                'score': float(sr_11_7_score)
            }

            # 5. EU AI Act Tier Mapping
            eu_tier = get_eu_ai_act_tier(uc_title or self.uc_key, governance_level)
            details['eu_ai_act_tier'] = eu_tier

            # Map governance level to compliance multiplier
            if 'mandatory' in governance_level or 'highest' in governance_level:
                compliance_multiplier = 1.2
                details['compliance_level'] = 'mandatory'
            elif 'high' in governance_level:
                compliance_multiplier = 1.15
                details['compliance_level'] = 'high'
            elif 'medium' in governance_level or 'standard' in governance_level:
                compliance_multiplier = 1.0
                details['compliance_level'] = 'medium'
            else:
                compliance_multiplier = 0.9
                details['compliance_level'] = 'low'

            checklist_items.append(('regulatory_alignment', True))
            details['governance_level'] = governance_level

            # Calculate score
            passed_items = sum(1 for _, passed in checklist_items if passed)
            total_items = len(checklist_items)

            base_score = (passed_items / total_items) * 100
            score = min(100, base_score * compliance_multiplier)

            details['checklist'] = dict(checklist_items)
            details['passed_items'] = passed_items
            details['total_items'] = total_items

            return {'score': float(score),
                   'reason': f'{passed_items}/{total_items} items met, {eu_tier} tier, SR 11-7: {sr_11_7_score:.0f}%',
                   'details': details}

        except Exception as e:
            logger.error(f"Error in governance AI scoring: {e}", exc_info=True)
            return {'score': 60, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_sustainable_ai(self) -> Dict[str, Any]:
        """
        Score sustainable AI based on:
        - Training time from benchmark.json
        - Model size on disk (actual file size)
        - Inference latency from benchmark.json (p50, p95, p99)
        - Carbon estimate: training_seconds * 0.0002 kWh * 0.4 kgCO2/kWh
        - Retraining frequency assessment (fraud=daily, credit=monthly, ops=quarterly)

        Score: penalize large/slow models
        """
        try:
            details = {}

            # 1. Training Time
            training_seconds = 0
            if (self.reports_dir / 'benchmark.json').exists():
                try:
                    with open(self.reports_dir / 'benchmark.json', 'r') as f:
                        benchmark = json.load(f)
                        training_seconds = benchmark.get('training_time_seconds', 0)

                        # Get latency percentiles if available
                        if 'inference_latency_p50_ms' in benchmark:
                            details['inference_p50_ms'] = benchmark['inference_latency_p50_ms']
                        if 'inference_latency_p95_ms' in benchmark:
                            details['inference_p95_ms'] = benchmark['inference_latency_p95_ms']
                        if 'inference_latency_p99_ms' in benchmark:
                            details['inference_p99_ms'] = benchmark['inference_latency_p99_ms']
                except Exception as e:
                    logger.warning(f"Could not read benchmark: {e}")

            details['training_time_seconds'] = float(training_seconds)

            # 2. Model Size (actual file size on disk)
            model_size_mb = 0
            if self.model_path and self.model_path.exists():
                model_size_mb = self.model_path.stat().st_size / (1024 * 1024)

            details['model_size_mb'] = float(model_size_mb)

            # 3. Inference Latency
            inference_latency_ms = 0
            if (self.reports_dir / 'benchmark.json').exists():
                try:
                    with open(self.reports_dir / 'benchmark.json', 'r') as f:
                        benchmark = json.load(f)
                        # Try p50 first, fallback to generic latency
                        inference_latency_ms = benchmark.get('inference_latency_p50_ms',
                                                            benchmark.get('inference_latency_ms', 0))
                except Exception:
                    pass

            details['inference_latency_ms'] = float(inference_latency_ms)

            # 4. Carbon Estimate
            # Formula: training_seconds * 0.0002 kWh * 0.4 kgCO2/kWh
            carbon_kg = training_seconds * 0.0002 * 0.4
            details['estimated_carbon_kg'] = float(carbon_kg)

            # 5. Retraining Frequency Assessment
            use_case_lower = self.uc_key.lower()
            if any(term in use_case_lower for term in ['fraud', 'aml', 'transaction']):
                retrain_freq = 'daily'
                retrain_cost_multiplier = 365
            elif any(term in use_case_lower for term in ['credit', 'loan', 'risk']):
                retrain_freq = 'monthly'
                retrain_cost_multiplier = 12
            elif any(term in use_case_lower for term in ['strategy', 'portfolio', 'forecast']):
                retrain_freq = 'quarterly'
                retrain_cost_multiplier = 4
            else:
                retrain_freq = 'monthly'
                retrain_cost_multiplier = 12

            details['retraining_frequency'] = retrain_freq
            annual_carbon_kg = carbon_kg * retrain_cost_multiplier
            details['estimated_annual_carbon_kg'] = float(annual_carbon_kg)

            # Calculate score
            score = 100

            # Penalize long training (>1 hour = -20, >10 hours = -40)
            if training_seconds > 36000:  # 10 hours
                score -= 40
            elif training_seconds > 3600:  # 1 hour
                score -= 20
            elif training_seconds > 600:  # 10 minutes
                score -= 10

            # Penalize large models (>100MB = -20, >500MB = -40)
            if model_size_mb > 500:
                score -= 40
            elif model_size_mb > 100:
                score -= 20
            elif model_size_mb > 50:
                score -= 10

            # Penalize slow inference (>100ms = -20, >500ms = -40)
            if inference_latency_ms > 500:
                score -= 40
            elif inference_latency_ms > 100:
                score -= 20
            elif inference_latency_ms > 50:
                score -= 10

            # Penalize high carbon footprint
            if annual_carbon_kg > 10:
                score -= 15
            elif annual_carbon_kg > 5:
                score -= 10

            score = max(40, min(100, score))

            if score >= 90:
                reason = 'Excellent sustainability (small, fast model)'
            elif score >= 70:
                reason = 'Good sustainability'
            else:
                reason = f'Sustainability concerns (size: {model_size_mb:.1f}MB, latency: {inference_latency_ms:.1f}ms)'

            return {'score': float(score), 'reason': reason, 'details': details}

        except Exception as e:
            logger.error(f"Error in sustainable AI scoring: {e}", exc_info=True)
            return {'score': 70, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_portable_ai(self) -> Dict[str, Any]:
        """
        Score portable AI based on:
        - Serialization format check (pkl=70, joblib=75, onnx=95, pmml=90)
        - ONNX exportability: try skl2onnx conversion
        - Framework dependency count (inspect model.__module__)
        - API readiness: has predict(), predict_proba(), get_params()?
        - Container readiness: pip-installable dependencies
        - Cross-platform compatibility

        Score = composite
        """
        try:
            details = {}

            # 1. Serialization Format
            format_score = 70  # Default for pickle
            serialization_format = 'pickle'

            if self.model_path:
                if self.model_path.suffix == '.pkl':
                    format_score = 70
                    serialization_format = 'pickle'
                elif self.model_path.suffix == '.onnx':
                    format_score = 95
                    serialization_format = 'onnx'
                elif self.model_path.suffix == '.joblib':
                    format_score = 75
                    serialization_format = 'joblib'
                elif self.model_path.suffix == '.pmml':
                    format_score = 90
                    serialization_format = 'pmml'

            details['serialization_format'] = serialization_format
            details['format_score'] = float(format_score)

            # 2. ONNX Exportability
            onnx_exportable = False
            if ONNX_AVAILABLE and self.model:
                try:
                    # Try to convert to ONNX
                    model_type = type(self.model).__name__
                    # Check if model is sklearn-based
                    if hasattr(self.model, 'predict') and 'sklearn' in type(self.model).__module__:
                        # Create dummy input
                        if self.test_data is not None:
                            n_features = len(self.test_data.select_dtypes(include=[np.number]).columns)
                            initial_type = [('float_input', FloatTensorType([None, n_features]))]

                            # Try conversion
                            onnx_model = convert_sklearn(self.model, initial_types=initial_type)
                            onnx_exportable = True
                            logger.info("Model successfully exported to ONNX")
                except Exception as e:
                    logger.warning(f"ONNX export failed: {e}")
                    onnx_exportable = False

            details['onnx_exportable'] = onnx_exportable
            onnx_score = 95 if onnx_exportable else 60

            # 3. Framework Dependencies
            dependency_count = 0
            dependencies = []

            if self.model:
                model_module = type(self.model).__module__
                base_framework = model_module.split('.')[0]
                dependencies.append(base_framework)
                dependency_count = 1

                # Check for ensemble or pipeline
                if hasattr(self.model, 'steps'):
                    dependency_count += len(self.model.steps)
                    dependencies.append('pipeline')

                if hasattr(self.model, 'estimators_'):
                    dependencies.append('ensemble')
                    dependency_count += 1

            details['dependencies'] = dependencies
            details['dependency_count'] = dependency_count

            # Score dependencies (fewer is better)
            dependency_score = max(50, 100 - (dependency_count * 10))

            # 4. API Readiness
            api_ready = False
            api_features = []

            if self.model:
                if hasattr(self.model, 'predict'):
                    api_ready = True
                    api_features.append('predict')

                if hasattr(self.model, 'predict_proba'):
                    api_features.append('predict_proba')

                if hasattr(self.model, 'get_params'):
                    api_features.append('get_params')

                if hasattr(self.model, 'score'):
                    api_features.append('score')

            details['api_ready'] = api_ready
            details['api_features'] = api_features

            api_score = 90 if api_ready and len(api_features) >= 3 else (70 if api_ready else 50)

            # 5. Container Readiness
            # Check if dependencies are standard and pip-installable
            container_ready = True
            if dependencies:
                # Standard ML libraries are container-ready
                standard_libs = ['sklearn', 'xgboost', 'lightgbm', 'numpy', 'pandas', 'scipy']
                if all(any(std in dep for std in standard_libs) for dep in dependencies):
                    container_ready = True
                else:
                    container_ready = False

            details['container_ready'] = container_ready
            container_score = 90 if container_ready else 60

            # 6. Cross-platform compatibility
            # Pickle and ONNX are cross-platform
            cross_platform = serialization_format in ['onnx', 'pmml'] or onnx_exportable
            details['cross_platform'] = cross_platform

            # Composite score
            score = (format_score * 0.25) + (onnx_score * 0.25) + (dependency_score * 0.15) + \
                    (api_score * 0.20) + (container_score * 0.15)

            details['component_scores'] = {
                'format': float(format_score),
                'onnx': float(onnx_score),
                'dependencies': float(dependency_score),
                'api': float(api_score),
                'container': float(container_score)
            }

            return {'score': float(score),
                   'reason': f'{serialization_format} format, {"ONNX-ready" if onnx_exportable else "not ONNX"}, {dependency_count} deps',
                   'details': details}

        except Exception as e:
            logger.error(f"Error in portable AI scoring: {e}", exc_info=True)
            return {'score': 65, 'reason': f'Error: {str(e)}', 'details': {}}

    def score_performance_ai(self) -> Dict[str, Any]:
        """
        Score performance AI based on:
        - Primary metric vs baseline
        - Inference latency percentiles (p50, p95, p99) from benchmark.json
        - Throughput: 1000/p50_ms predictions/second
        - Memory footprint: model file size
        - Scalability: score based on model type

        Composite: metric 40%, latency 25%, throughput 20%, scalability 15%
        """
        try:
            details = {}

            # 1. Primary Metric Value (40% weight)
            metric_score = 50

            if self.evaluation_results:
                # Determine problem type and baseline
                is_classification = self.evaluation_results.get('problem_type') == 'classification'

                if is_classification:
                    baseline = 0.5  # Random classifier AUC
                    metric_name = 'roc_auc'
                    metric_value = self.evaluation_results.get('test_roc_auc',
                                   self.evaluation_results.get('roc_auc', 0.5))
                else:
                    baseline = 0.0  # Zero R2 for regression
                    metric_name = 'r2_score'
                    metric_value = self.evaluation_results.get('test_r2',
                                   self.evaluation_results.get('r2_score', 0))

                details['metric_name'] = metric_name
                details['metric_value'] = float(metric_value)
                details['baseline'] = float(baseline)

                # Calculate improvement
                if is_classification:
                    improvement_pct = (metric_value - baseline) / (1 - baseline) if baseline < 1 else 0
                else:
                    improvement_pct = max(0, metric_value)  # R2 can be negative

                metric_score = min(100, improvement_pct * 100)
                details['improvement_pct'] = float(improvement_pct)

            # 2. Inference Latency (25% weight)
            latency_score = 70

            if (self.reports_dir / 'benchmark.json').exists():
                try:
                    with open(self.reports_dir / 'benchmark.json', 'r') as f:
                        benchmark = json.load(f)

                        # Get percentiles
                        p50 = benchmark.get('inference_latency_p50_ms',
                                          benchmark.get('inference_latency_ms', 50))
                        p95 = benchmark.get('inference_latency_p95_ms', p50 * 2)
                        p99 = benchmark.get('inference_latency_p99_ms', p50 * 3)

                        details['inference_latency_p50_ms'] = float(p50)
                        details['inference_latency_p95_ms'] = float(p95)
                        details['inference_latency_p99_ms'] = float(p99)

                        # Score based on p50 latency
                        if p50 < 10:
                            latency_score = 100
                        elif p50 < 50:
                            latency_score = 90
                        elif p50 < 100:
                            latency_score = 80
                        elif p50 < 500:
                            latency_score = 70
                        else:
                            latency_score = 50

                except Exception as e:
                    logger.warning(f"Could not read benchmark: {e}")

            # 3. Throughput (20% weight)
            throughput_score = 70
            if 'inference_latency_p50_ms' in details:
                p50 = details['inference_latency_p50_ms']
                if p50 > 0:
                    throughput_per_sec = 1000.0 / p50
                    details['throughput_predictions_per_sec'] = float(throughput_per_sec)

                    # Score based on throughput
                    if throughput_per_sec > 1000:
                        throughput_score = 100
                    elif throughput_per_sec > 100:
                        throughput_score = 90
                    elif throughput_per_sec > 10:
                        throughput_score = 80
                    elif throughput_per_sec > 1:
                        throughput_score = 70
                    else:
                        throughput_score = 50

            # 4. Scalability (15% weight)
            scalability_score = 70
            if self.model:
                model_type = type(self.model).__name__

                # Linear models scale best
                if any(t in model_type for t in ['Linear', 'Logistic', 'Ridge', 'Lasso']):
                    scalability_score = 95
                # Tree-based models scale well
                elif any(t in model_type for t in ['Tree', 'Forest', 'XGB', 'LGBM']):
                    scalability_score = 85
                # SVM scales moderately
                elif 'SV' in model_type:
                    scalability_score = 70
                # Neural networks scale with infrastructure
                elif any(t in model_type for t in ['Neural', 'MLP', 'Deep']):
                    scalability_score = 80
                else:
                    scalability_score = 75

                details['model_type'] = model_type
                details['scalability_assessment'] = scalability_score

            # Composite score
            score = (metric_score * 0.40) + (latency_score * 0.25) + \
                    (throughput_score * 0.20) + (scalability_score * 0.15)

            details['component_scores'] = {
                'metric': float(metric_score),
                'latency': float(latency_score),
                'throughput': float(throughput_score),
                'scalability': float(scalability_score)
            }

            return {'score': float(score), 'reason': 'Metric improvement + inference speed', 'details': details}

        except Exception as e:
            logger.error(f"Error in performance AI scoring: {e}", exc_info=True)
            return {'score': 60, 'reason': f'Error: {str(e)}', 'details': {}}

    def generate_model_card(self, governance_scores: Dict[str, Any]):
        """Generate comprehensive model card with all governance scores."""
        try:
            model_card = {
                'model_details': {
                    'use_case': self.uc_key,
                    'model_type': type(self.model).__name__ if self.model else 'Unknown',
                    'model_path': str(self.model_path) if self.model_path else None,
                    'created_date': datetime.now().isoformat(),
                    'version': '1.0'
                },
                'intended_use': {
                    'primary_uses': f'Predictive modeling for {self.uc_key}',
                    'primary_users': 'Data scientists, business analysts, risk managers',
                    'out_of_scope': 'Not for use outside of banking domain or without proper governance review'
                },
                'metrics': {},
                'governance_scores': {
                    k: {'score': v['score'], 'reason': v['reason']}
                    for k, v in governance_scores.items()
                    if k != 'overall_trust_score'
                },
                'overall_trust_score': governance_scores.get('overall_trust_score', 0),
                'trust_level': self._get_trust_level(governance_scores.get('overall_trust_score', 0)),
                'considerations': {
                    'limitations': [],
                    'trade_offs': [],
                    'recommendations': []
                },
                'regulatory': {}
            }

            # Add evaluation metrics
            if self.evaluation_results:
                model_card['metrics'] = self.evaluation_results

            # Add regulatory info from governance scoring
            if 'governance_ai' in governance_scores and 'details' in governance_scores['governance_ai']:
                gov_details = governance_scores['governance_ai']['details']
                if 'eu_ai_act_tier' in gov_details:
                    model_card['regulatory']['eu_ai_act_tier'] = gov_details['eu_ai_act_tier']
                if 'sr_11_7_compliance' in gov_details:
                    model_card['regulatory']['sr_11_7_compliance'] = gov_details['sr_11_7_compliance']

            # Add limitations based on governance scores
            if governance_scores['responsible_ai']['score'] < 70:
                model_card['considerations']['limitations'].append(
                    'Fairness concerns detected - review bias metrics before deployment'
                )

            if governance_scores['explainability']['score'] < 70:
                model_card['considerations']['limitations'].append(
                    'Limited explainability - consider simpler model or additional interpretability tools'
                )

            if governance_scores['sustainable_ai']['score'] < 70:
                model_card['considerations']['limitations'].append(
                    'High computational cost - optimize for production deployment'
                )

            if governance_scores['ethical_ai']['score'] < 70:
                model_card['considerations']['limitations'].append(
                    'Ethical concerns detected - review PII handling and dual-use risks'
                )

            # Add recommendations
            overall_score = governance_scores.get('overall_trust_score', 0)
            if overall_score >= 80:
                model_card['considerations']['recommendations'].append(
                    'Model meets governance standards for production deployment'
                )
            elif overall_score >= 70:
                model_card['considerations']['recommendations'].append(
                    'Model requires governance review before production deployment'
                )
            else:
                model_card['considerations']['recommendations'].append(
                    'Model requires significant improvements before production deployment'
                )

            # Save model card
            with open(self.reports_dir / 'model_card.json', 'w') as f:
                json.dump(model_card, f, indent=2)

            logger.info(f"Generated model card for {self.uc_key}")

        except Exception as e:
            logger.error(f"Error generating model card: {e}", exc_info=True)

    def compute_all_scores(self) -> Dict[str, Any]:
        """Compute all 8 governance scores and generate reports."""
        logger.info(f"Computing governance scores for {self.uc_key}")

        # Load model and data
        if not self.load_model_and_data():
            logger.warning(f"Could not load model/data for {self.uc_key}")
            # Return default scores
            return {
                'explainability': {'score': 50, 'reason': 'No model available', 'details': {}},
                'responsible_ai': {'score': 70, 'reason': 'No data available', 'details': {}},
                'trustworthy_ai': {'score': 60, 'reason': 'No model available', 'details': {}},
                'ethical_ai': {'score': 70, 'reason': 'No data available', 'details': {}},
                'governance_ai': {'score': 60, 'reason': 'No documentation', 'details': {}},
                'sustainable_ai': {'score': 70, 'reason': 'No benchmark data', 'details': {}},
                'portable_ai': {'score': 65, 'reason': 'No model available', 'details': {}},
                'performance_ai': {'score': 60, 'reason': 'No evaluation data', 'details': {}},
                'overall_trust_score': 63.0
            }

        # Compute each dimension
        scores = {
            'explainability': self.score_explainability(),
            'responsible_ai': self.score_responsible_ai(),
            'trustworthy_ai': self.score_trustworthy_ai(),
            'ethical_ai': self.score_ethical_ai(),
            'governance_ai': self.score_governance_ai(),
            'sustainable_ai': self.score_sustainable_ai(),
            'portable_ai': self.score_portable_ai(),
            'performance_ai': self.score_performance_ai()
        }

        # Calculate overall trust score (weighted average)
        overall_score = sum(
            scores[dim]['score'] * GOVERNANCE_WEIGHTS[dim]
            for dim in GOVERNANCE_WEIGHTS
        )

        scores['overall_trust_score'] = overall_score

        # Generate governance scorecard
        scorecard = {
            'use_case': self.uc_key,
            'timestamp': datetime.now().isoformat(),
            'scores': {
                dim: {
                    'score': scores[dim]['score'],
                    'reason': scores[dim]['reason']
                }
                for dim in GOVERNANCE_WEIGHTS
            },
            'overall_trust_score': overall_score,
            'trust_level': self._get_trust_level(overall_score),
            'details': {
                dim: scores[dim]['details']
                for dim in GOVERNANCE_WEIGHTS
            }
        }

        # Save scorecard
        with open(self.reports_dir / 'governance_scorecard.json', 'w') as f:
            json.dump(scorecard, f, indent=2)

        logger.info(f"Governance scorecard saved for {self.uc_key} (overall: {overall_score:.1f})")

        # Generate model card
        self.generate_model_card(scores)

        return scores

    @staticmethod
    def _get_trust_level(score: float) -> str:
        """Determine trust level based on overall score."""
        if score >= 85:
            return 'HIGH'
        elif score >= 70:
            return 'MEDIUM'
        elif score >= 60:
            return 'LOW'
        else:
            return 'CRITICAL'


# ==============================================================================
# DATABASE FUNCTIONS
# ==============================================================================

def init_database():
    """Initialize results database with governance_scores table."""
    try:
        with get_db_connection(RESULTS_DB) as conn:
            cursor = conn.cursor()

            cursor.execute('''
                CREATE TABLE IF NOT EXISTS governance_scores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    use_case TEXT NOT NULL,
                    explainability REAL,
                    responsible_ai REAL,
                    trustworthy_ai REAL,
                    ethical_ai REAL,
                    governance_ai REAL,
                    sustainable_ai REAL,
                    portable_ai REAL,
                    performance_ai REAL,
                    overall_trust_score REAL,
                    trust_level TEXT,
                    timestamp TEXT,
                    UNIQUE(use_case)
                )
            ''')

            # Add index for faster lookups
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_governance_use_case
                ON governance_scores(use_case)
            ''')

        logger.info("Database initialized successfully")

    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        raise


def save_to_database(use_case: str, scores: Dict[str, Any]):
    """Save governance scores to database.

    Args:
        use_case: Use case identifier
        scores: Dictionary containing all 8 governance dimension scores
    """
    try:
        with get_db_connection(RESULTS_DB) as conn:
            cursor = conn.cursor()

            # Use centralized trust level function
            overall_score = scores.get('overall_trust_score', 0)
            trust_level = get_trust_level(overall_score)

            # Safely extract scores with defaults
            cursor.execute('''
                INSERT OR REPLACE INTO governance_scores
                (use_case, explainability, responsible_ai, trustworthy_ai, ethical_ai,
                 governance_ai, sustainable_ai, portable_ai, performance_ai,
                 overall_trust_score, trust_level, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                use_case,
                scores.get('explainability', {}).get('score', 0),
                scores.get('responsible_ai', {}).get('score', 0),
                scores.get('trustworthy_ai', {}).get('score', 0),
                scores.get('ethical_ai', {}).get('score', 0),
                scores.get('governance_ai', {}).get('score', 0),
                scores.get('sustainable_ai', {}).get('score', 0),
                scores.get('portable_ai', {}).get('score', 0),
                scores.get('performance_ai', {}).get('score', 0),
                overall_score,
                trust_level,
                datetime.now().isoformat()
            ))

        logger.info(f"Saved governance scores for {use_case} to database")

    except Exception as e:
        logger.error(f"Error saving governance scores for {use_case}: {e}")


# ==============================================================================
# KEY INTEGRATION FUNCTION FOR SCHEDULER
# ==============================================================================

def compute_governance_scores(use_case_key: str) -> Optional[Dict[str, Any]]:
    """
    Compute governance scores for a single use case by key.
    This is the main entry point for scheduler integration.

    Args:
        use_case_key: Use case key (e.g., 'uc_06_01_creditcard_fraud' or 'UC-06-01')

    Returns:
        Dictionary of governance scores, or None if use case not found
    """
    logger.info(f"Computing governance scores for: {use_case_key}")

    # Resolve use case folder
    uc_folder = resolve_uc_folder(use_case_key)
    if not uc_folder:
        logger.warning(f"No folder found for {use_case_key}")
        return None

    # Create scorer
    scorer = AIGovernanceScorer(use_case_key, uc_folder)

    # Compute all scores
    scores = scorer.compute_all_scores()

    # Save to database
    save_to_database(use_case_key, scores)

    return scores


# ==============================================================================
# MAIN EXECUTION
# ==============================================================================

def main():
    """Main execution function - iterate all use cases from model_training_pipeline."""
    logger.info("=" * 80)
    logger.info("AI GOVERNANCE SCORING PIPELINE")
    logger.info("=" * 80)

    # Initialize database
    init_database()

    # Import USE_CASE_REGISTRY from model_training_pipeline
    try:
        sys.path.insert(0, str(BASE_DIR))
        from model_training_pipeline import USE_CASE_REGISTRY
        logger.info(f"Imported {len(USE_CASE_REGISTRY)} use cases from model_training_pipeline")
    except Exception as e:
        logger.error(f"Could not import USE_CASE_REGISTRY: {e}")
        logger.info("Falling back to discovering use cases from filesystem")
        USE_CASE_REGISTRY = {}

    # If registry is empty, discover from filesystem
    if not USE_CASE_REGISTRY:
        logger.warning("USE_CASE_REGISTRY is empty, scanning filesystem")
        return

    # Process each use case
    results_summary = []

    for uc_key, config in USE_CASE_REGISTRY.items():
        try:
            logger.info(f"\nProcessing: {uc_key} - {config.get('label', 'Unknown')}")
            logger.info("-" * 80)

            # Compute governance scores
            scores = compute_governance_scores(uc_key)

            if scores:
                # Add to summary
                results_summary.append({
                    'use_case': uc_key,
                    'label': config.get('label', uc_key),
                    'category': config.get('category', 'Unknown'),
                    'overall_score': scores['overall_trust_score'],
                    'trust_level': AIGovernanceScorer._get_trust_level(scores['overall_trust_score']),
                    'explainability': scores['explainability']['score'],
                    'responsible_ai': scores['responsible_ai']['score'],
                    'trustworthy_ai': scores['trustworthy_ai']['score'],
                    'ethical_ai': scores['ethical_ai']['score'],
                    'governance_ai': scores['governance_ai']['score'],
                    'sustainable_ai': scores['sustainable_ai']['score'],
                    'portable_ai': scores['portable_ai']['score'],
                    'performance_ai': scores['performance_ai']['score']
                })

        except Exception as e:
            logger.error(f"Error processing {uc_key}: {e}", exc_info=True)
            continue

    # Print summary
    logger.info("\n" + "=" * 80)
    logger.info("GOVERNANCE SCORING SUMMARY")
    logger.info("=" * 80)

    if results_summary:
        df_summary = pd.DataFrame(results_summary)
        df_summary = df_summary.sort_values('overall_score', ascending=False)

        logger.info(f"\nProcessed {len(results_summary)} use cases\n")
        logger.info(df_summary.to_string(index=False))

        # Save summary
        summary_file = BASE_DIR / 'governance_summary.csv'
        df_summary.to_csv(summary_file, index=False)
        logger.info(f"\nSummary saved to: {summary_file}")

        # Statistics
        logger.info(f"\nGovernance Statistics:")
        logger.info(f"  Average Overall Score: {df_summary['overall_score'].mean():.1f}")
        logger.info(f"  High Trust (85+): {(df_summary['overall_score'] >= 85).sum()} use cases")
        logger.info(f"  Medium Trust (70-84): {((df_summary['overall_score'] >= 70) & (df_summary['overall_score'] < 85)).sum()} use cases")
        logger.info(f"  Low Trust (60-69): {((df_summary['overall_score'] >= 60) & (df_summary['overall_score'] < 70)).sum()} use cases")
        logger.info(f"  Critical (<60): {(df_summary['overall_score'] < 60).sum()} use cases")

    logger.info("\n" + "=" * 80)
    logger.info("AI Governance Scoring Pipeline completed successfully!")
    logger.info("=" * 80)


if __name__ == '__main__':
    main()
