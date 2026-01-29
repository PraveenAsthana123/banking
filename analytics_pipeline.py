#!/usr/bin/env python3
"""
Banking Analytics Pipeline
===========================
Comprehensive analytics module for banking use cases including:
- Statistical Analysis (descriptive, hypothesis testing, correlations)
- Monte Carlo Simulation (risk analysis, scenario modeling)
- Visualization (charts, plots, dashboards)

Usage:
    python3 analytics_pipeline.py --use-case UC_KEY [--analysis TYPE] [--output-dir DIR]
"""

import os
import sys
import json
import logging
import sqlite3
import warnings
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, asdict
from contextlib import contextmanager

import numpy as np
import pandas as pd
from scipy import stats
from scipy.stats import (
    norm, t, chi2, f, pearsonr, spearmanr, kendalltau,
    shapiro, normaltest, kstest, anderson,
    ttest_1samp, ttest_ind, ttest_rel,
    mannwhitneyu, wilcoxon, kruskal,
    f_oneway, chi2_contingency
)

# Add script directory to path for local imports
_SCRIPT_DIR = Path(__file__).resolve().parent
if str(_SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPT_DIR))

from config import (
    UNIFIED_DB, RESULTS_DB, OUTPUT_DIR, LOGS_DIR,
    LOG_LEVEL, LOG_FORMAT, get_db_connection, get_log_file
)

# Optional visualization imports
try:
    import matplotlib
    matplotlib.use('Agg')  # Non-interactive backend
    import matplotlib.pyplot as plt
    import seaborn as sns
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler(get_log_file('analytics_pipeline')),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Suppress specific warnings
warnings.filterwarnings('ignore', category=RuntimeWarning, message='divide by zero')
warnings.filterwarnings('ignore', category=RuntimeWarning, message='invalid value')


# =============================================================================
# STATISTICAL ANALYSIS MODULE
# =============================================================================

@dataclass
class DescriptiveStats:
    """Descriptive statistics for a numeric variable."""
    count: int
    mean: float
    std: float
    min: float
    q1: float
    median: float
    q3: float
    max: float
    skewness: float
    kurtosis: float
    iqr: float
    cv: float  # Coefficient of variation
    missing_count: int
    missing_pct: float


@dataclass
class HypothesisTestResult:
    """Result of a hypothesis test."""
    test_name: str
    statistic: float
    p_value: float
    effect_size: Optional[float]
    confidence_interval: Optional[Tuple[float, float]]
    interpretation: str
    reject_null: bool
    alpha: float = 0.05


@dataclass
class CorrelationResult:
    """Correlation analysis result."""
    var1: str
    var2: str
    pearson_r: float
    pearson_p: float
    spearman_rho: float
    spearman_p: float
    kendall_tau: float
    kendall_p: float
    strength: str  # weak, moderate, strong
    significant: bool


class StatisticalAnalyzer:
    """
    Comprehensive statistical analysis for banking data.

    Provides:
    - Descriptive statistics
    - Normality tests
    - Hypothesis testing (parametric & non-parametric)
    - Correlation analysis
    - Confidence intervals
    - Effect size calculations
    """

    def __init__(self, data: pd.DataFrame, target_col: Optional[str] = None):
        """
        Initialize analyzer with data.

        Args:
            data: DataFrame to analyze
            target_col: Optional target variable for supervised analysis
        """
        self.data = data
        self.target_col = target_col
        self.numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
        self.categorical_cols = data.select_dtypes(include=['object', 'category']).columns.tolist()
        logger.info(f"Initialized StatisticalAnalyzer: {len(self.numeric_cols)} numeric, "
                   f"{len(self.categorical_cols)} categorical columns")

    def descriptive_stats(self, column: str) -> Optional[DescriptiveStats]:
        """Calculate descriptive statistics for a column."""
        if column not in self.data.columns:
            logger.warning(f"Column {column} not found")
            return None

        series = pd.to_numeric(self.data[column], errors='coerce')
        valid = series.dropna()

        if len(valid) == 0:
            return None

        q1, median, q3 = valid.quantile([0.25, 0.5, 0.75])

        return DescriptiveStats(
            count=len(valid),
            mean=float(valid.mean()),
            std=float(valid.std()),
            min=float(valid.min()),
            q1=float(q1),
            median=float(median),
            q3=float(q3),
            max=float(valid.max()),
            skewness=float(valid.skew()),
            kurtosis=float(valid.kurtosis()),
            iqr=float(q3 - q1),
            cv=float(valid.std() / valid.mean()) if valid.mean() != 0 else 0,
            missing_count=int(series.isna().sum()),
            missing_pct=float(series.isna().sum() / len(series) * 100)
        )

    def all_descriptive_stats(self) -> Dict[str, DescriptiveStats]:
        """Calculate descriptive statistics for all numeric columns."""
        results = {}
        for col in self.numeric_cols:
            stats = self.descriptive_stats(col)
            if stats:
                results[col] = stats
        return results

    def normality_test(self, column: str, alpha: float = 0.05) -> Dict[str, Any]:
        """
        Test for normality using multiple methods.

        Args:
            column: Column to test
            alpha: Significance level

        Returns:
            Dictionary with test results
        """
        series = pd.to_numeric(self.data[column], errors='coerce').dropna()

        if len(series) < 8:
            return {'error': 'Insufficient data for normality test (need at least 8 samples)'}

        results = {'column': column, 'n': len(series), 'alpha': alpha}

        # Shapiro-Wilk (best for n < 5000)
        if len(series) <= 5000:
            try:
                stat, p = shapiro(series)
                results['shapiro_wilk'] = {
                    'statistic': float(stat),
                    'p_value': float(p),
                    'normal': p > alpha
                }
            except Exception as e:
                results['shapiro_wilk'] = {'error': str(e)}

        # D'Agostino-Pearson
        if len(series) >= 20:
            try:
                stat, p = normaltest(series)
                results['dagostino_pearson'] = {
                    'statistic': float(stat),
                    'p_value': float(p),
                    'normal': p > alpha
                }
            except Exception as e:
                results['dagostino_pearson'] = {'error': str(e)}

        # Kolmogorov-Smirnov
        try:
            stat, p = kstest(series, 'norm', args=(series.mean(), series.std()))
            results['kolmogorov_smirnov'] = {
                'statistic': float(stat),
                'p_value': float(p),
                'normal': p > alpha
            }
        except Exception as e:
            results['kolmogorov_smirnov'] = {'error': str(e)}

        # Anderson-Darling
        try:
            result = anderson(series, dist='norm')
            # Compare statistic to critical value at 5%
            idx = list(result.significance_level).index(5.0) if 5.0 in result.significance_level else 2
            results['anderson_darling'] = {
                'statistic': float(result.statistic),
                'critical_value_5pct': float(result.critical_values[idx]),
                'normal': result.statistic < result.critical_values[idx]
            }
        except Exception as e:
            results['anderson_darling'] = {'error': str(e)}

        # Overall conclusion
        normal_votes = sum(1 for test in ['shapiro_wilk', 'dagostino_pearson',
                                          'kolmogorov_smirnov', 'anderson_darling']
                         if test in results and results[test].get('normal', False))
        total_tests = sum(1 for test in ['shapiro_wilk', 'dagostino_pearson',
                                         'kolmogorov_smirnov', 'anderson_darling']
                         if test in results and 'normal' in results[test])

        results['conclusion'] = {
            'likely_normal': normal_votes > total_tests / 2,
            'votes_for_normal': normal_votes,
            'total_tests': total_tests
        }

        return results

    def t_test(self, column: str, mu: float = 0, alpha: float = 0.05) -> HypothesisTestResult:
        """
        One-sample t-test: test if mean differs from specified value.

        Args:
            column: Column to test
            mu: Hypothesized population mean
            alpha: Significance level
        """
        series = pd.to_numeric(self.data[column], errors='coerce').dropna()
        n = len(series)

        stat, p = ttest_1samp(series, mu)

        # Effect size (Cohen's d)
        d = (series.mean() - mu) / series.std()

        # Confidence interval
        se = series.std() / np.sqrt(n)
        t_crit = t.ppf(1 - alpha/2, n - 1)
        ci = (series.mean() - t_crit * se, series.mean() + t_crit * se)

        # Interpretation
        if abs(d) < 0.2:
            effect_interp = "negligible"
        elif abs(d) < 0.5:
            effect_interp = "small"
        elif abs(d) < 0.8:
            effect_interp = "medium"
        else:
            effect_interp = "large"

        reject = p < alpha
        interpretation = (f"Mean ({series.mean():.4f}) is {'significantly' if reject else 'not significantly'} "
                         f"different from {mu} (p={p:.4f}). Effect size: {effect_interp} (d={d:.4f})")

        return HypothesisTestResult(
            test_name="One-Sample T-Test",
            statistic=float(stat),
            p_value=float(p),
            effect_size=float(d),
            confidence_interval=ci,
            interpretation=interpretation,
            reject_null=reject,
            alpha=alpha
        )

    def two_sample_t_test(self, column: str, group_col: str,
                          alpha: float = 0.05) -> HypothesisTestResult:
        """
        Independent two-sample t-test.

        Args:
            column: Numeric column to compare
            group_col: Categorical column defining groups (must have exactly 2 groups)
            alpha: Significance level
        """
        groups = self.data[group_col].dropna().unique()
        if len(groups) != 2:
            raise ValueError(f"group_col must have exactly 2 groups, found {len(groups)}")

        group1 = pd.to_numeric(self.data[self.data[group_col] == groups[0]][column], errors='coerce').dropna()
        group2 = pd.to_numeric(self.data[self.data[group_col] == groups[1]][column], errors='coerce').dropna()

        stat, p = ttest_ind(group1, group2)

        # Effect size (Cohen's d)
        pooled_std = np.sqrt(((len(group1)-1)*group1.std()**2 + (len(group2)-1)*group2.std()**2) /
                            (len(group1) + len(group2) - 2))
        d = (group1.mean() - group2.mean()) / pooled_std if pooled_std > 0 else 0

        reject = p < alpha
        interpretation = (f"Groups {groups[0]} (mean={group1.mean():.4f}) and {groups[1]} (mean={group2.mean():.4f}) "
                         f"are {'significantly' if reject else 'not significantly'} different (p={p:.4f})")

        return HypothesisTestResult(
            test_name="Independent Two-Sample T-Test",
            statistic=float(stat),
            p_value=float(p),
            effect_size=float(d),
            confidence_interval=None,
            interpretation=interpretation,
            reject_null=reject,
            alpha=alpha
        )

    def mann_whitney_test(self, column: str, group_col: str,
                          alpha: float = 0.05) -> HypothesisTestResult:
        """
        Mann-Whitney U test (non-parametric alternative to t-test).
        """
        groups = self.data[group_col].dropna().unique()
        if len(groups) != 2:
            raise ValueError(f"group_col must have exactly 2 groups, found {len(groups)}")

        group1 = pd.to_numeric(self.data[self.data[group_col] == groups[0]][column], errors='coerce').dropna()
        group2 = pd.to_numeric(self.data[self.data[group_col] == groups[1]][column], errors='coerce').dropna()

        stat, p = mannwhitneyu(group1, group2, alternative='two-sided')

        # Effect size (rank-biserial correlation)
        n1, n2 = len(group1), len(group2)
        r = 1 - (2 * stat) / (n1 * n2)

        reject = p < alpha
        interpretation = (f"Distributions of groups {groups[0]} and {groups[1]} "
                         f"are {'significantly' if reject else 'not significantly'} different (p={p:.4f})")

        return HypothesisTestResult(
            test_name="Mann-Whitney U Test",
            statistic=float(stat),
            p_value=float(p),
            effect_size=float(r),
            confidence_interval=None,
            interpretation=interpretation,
            reject_null=reject,
            alpha=alpha
        )

    def chi_square_test(self, col1: str, col2: str, alpha: float = 0.05) -> HypothesisTestResult:
        """
        Chi-square test of independence for two categorical variables.
        """
        contingency = pd.crosstab(self.data[col1], self.data[col2])
        chi2_stat, p, dof, expected = chi2_contingency(contingency)

        # Effect size (Cramér's V)
        n = contingency.sum().sum()
        min_dim = min(contingency.shape[0] - 1, contingency.shape[1] - 1)
        cramers_v = np.sqrt(chi2_stat / (n * min_dim)) if min_dim > 0 else 0

        reject = p < alpha
        interpretation = (f"Variables {col1} and {col2} are "
                         f"{'significantly' if reject else 'not significantly'} associated "
                         f"(χ²={chi2_stat:.4f}, p={p:.4f}, Cramér's V={cramers_v:.4f})")

        return HypothesisTestResult(
            test_name="Chi-Square Test of Independence",
            statistic=float(chi2_stat),
            p_value=float(p),
            effect_size=float(cramers_v),
            confidence_interval=None,
            interpretation=interpretation,
            reject_null=reject,
            alpha=alpha
        )

    def anova_test(self, column: str, group_col: str, alpha: float = 0.05) -> HypothesisTestResult:
        """
        One-way ANOVA for comparing means across multiple groups.
        """
        groups = self.data[group_col].dropna().unique()
        group_data = [pd.to_numeric(self.data[self.data[group_col] == g][column], errors='coerce').dropna()
                     for g in groups]

        stat, p = f_oneway(*group_data)

        # Effect size (eta-squared)
        all_data = pd.concat(group_data)
        ss_between = sum(len(g) * (g.mean() - all_data.mean())**2 for g in group_data)
        ss_total = sum((all_data - all_data.mean())**2)
        eta_sq = ss_between / ss_total if ss_total > 0 else 0

        reject = p < alpha
        interpretation = (f"Means across {len(groups)} groups are "
                         f"{'significantly' if reject else 'not significantly'} different "
                         f"(F={stat:.4f}, p={p:.4f}, η²={eta_sq:.4f})")

        return HypothesisTestResult(
            test_name="One-Way ANOVA",
            statistic=float(stat),
            p_value=float(p),
            effect_size=float(eta_sq),
            confidence_interval=None,
            interpretation=interpretation,
            reject_null=reject,
            alpha=alpha
        )

    def correlation_analysis(self, col1: str, col2: str, alpha: float = 0.05) -> CorrelationResult:
        """
        Comprehensive correlation analysis between two variables.
        """
        x = pd.to_numeric(self.data[col1], errors='coerce')
        y = pd.to_numeric(self.data[col2], errors='coerce')

        # Drop pairs with missing values
        mask = ~(x.isna() | y.isna())
        x, y = x[mask], y[mask]

        # Pearson
        pearson_r, pearson_p = pearsonr(x, y)

        # Spearman
        spearman_rho, spearman_p = spearmanr(x, y)

        # Kendall
        kendall_tau, kendall_p = kendalltau(x, y)

        # Strength interpretation
        r_abs = abs(pearson_r)
        if r_abs < 0.3:
            strength = "weak"
        elif r_abs < 0.7:
            strength = "moderate"
        else:
            strength = "strong"

        return CorrelationResult(
            var1=col1,
            var2=col2,
            pearson_r=float(pearson_r),
            pearson_p=float(pearson_p),
            spearman_rho=float(spearman_rho),
            spearman_p=float(spearman_p),
            kendall_tau=float(kendall_tau),
            kendall_p=float(kendall_p),
            strength=strength,
            significant=pearson_p < alpha
        )

    def correlation_matrix(self, method: str = 'pearson') -> pd.DataFrame:
        """
        Calculate correlation matrix for all numeric columns.

        Args:
            method: 'pearson', 'spearman', or 'kendall'
        """
        return self.data[self.numeric_cols].corr(method=method)

    def generate_report(self) -> Dict[str, Any]:
        """Generate comprehensive statistical report."""
        report = {
            'generated_at': datetime.now().isoformat(),
            'data_shape': {'rows': len(self.data), 'columns': len(self.data.columns)},
            'numeric_columns': self.numeric_cols,
            'categorical_columns': self.categorical_cols,
            'descriptive_statistics': {},
            'normality_tests': {},
            'correlations': []
        }

        # Descriptive stats
        for col in self.numeric_cols:
            stats = self.descriptive_stats(col)
            if stats:
                report['descriptive_statistics'][col] = asdict(stats)

        # Normality tests for key columns
        for col in self.numeric_cols[:10]:  # Limit to first 10
            report['normality_tests'][col] = self.normality_test(col)

        # Correlation pairs for top correlations
        if len(self.numeric_cols) >= 2:
            corr_matrix = self.correlation_matrix()
            # Get top correlations
            for i, col1 in enumerate(self.numeric_cols):
                for col2 in self.numeric_cols[i+1:]:
                    corr_val = corr_matrix.loc[col1, col2]
                    if abs(corr_val) > 0.3:  # Only report moderate+ correlations
                        result = self.correlation_analysis(col1, col2)
                        report['correlations'].append(asdict(result))

        return report


# =============================================================================
# MONTE CARLO SIMULATION MODULE
# =============================================================================

class MonteCarloSimulator:
    """
    Monte Carlo simulation for risk analysis and scenario modeling.

    Supports:
    - Value at Risk (VaR) calculation
    - Expected Shortfall (CVaR)
    - Portfolio risk simulation
    - Scenario analysis
    - Sensitivity analysis
    """

    def __init__(self, data: pd.DataFrame, random_seed: int = 42):
        """
        Initialize simulator.

        Args:
            data: Historical data for simulation
            random_seed: Random seed for reproducibility
        """
        self.data = data
        self.random_seed = random_seed
        np.random.seed(random_seed)
        logger.info(f"Initialized MonteCarloSimulator with seed={random_seed}")

    def simulate_returns(self, column: str, n_simulations: int = 10000,
                        n_periods: int = 252, method: str = 'geometric') -> np.ndarray:
        """
        Simulate future returns based on historical data.

        Args:
            column: Column containing historical values
            n_simulations: Number of simulation paths
            n_periods: Number of periods to simulate
            method: 'geometric' (GBM) or 'arithmetic'

        Returns:
            Array of shape (n_simulations, n_periods) with simulated paths
        """
        series = pd.to_numeric(self.data[column], errors='coerce').dropna()

        # Calculate returns
        returns = series.pct_change().dropna()
        mu = returns.mean()
        sigma = returns.std()

        logger.info(f"Simulating {n_simulations} paths, {n_periods} periods "
                   f"(μ={mu:.6f}, σ={sigma:.6f})")

        # Generate random returns
        random_returns = np.random.normal(mu, sigma, (n_simulations, n_periods))

        if method == 'geometric':
            # Geometric Brownian Motion
            simulated_paths = series.iloc[-1] * np.cumprod(1 + random_returns, axis=1)
        else:
            # Arithmetic
            simulated_paths = series.iloc[-1] + np.cumsum(random_returns * series.iloc[-1], axis=1)

        return simulated_paths

    def value_at_risk(self, returns: Union[pd.Series, np.ndarray],
                      confidence_levels: List[float] = [0.95, 0.99]) -> Dict[str, float]:
        """
        Calculate Value at Risk (VaR) at specified confidence levels.

        Args:
            returns: Array of returns or simulated outcomes
            confidence_levels: List of confidence levels (e.g., [0.95, 0.99])

        Returns:
            Dictionary with VaR values for each confidence level
        """
        returns = np.asarray(returns).flatten()

        var_results = {}
        for level in confidence_levels:
            var = np.percentile(returns, (1 - level) * 100)
            var_results[f'VaR_{int(level*100)}'] = float(var)

        return var_results

    def expected_shortfall(self, returns: Union[pd.Series, np.ndarray],
                           confidence_levels: List[float] = [0.95, 0.99]) -> Dict[str, float]:
        """
        Calculate Expected Shortfall (CVaR/ES) - average loss beyond VaR.

        Args:
            returns: Array of returns
            confidence_levels: Confidence levels

        Returns:
            Dictionary with ES values
        """
        returns = np.asarray(returns).flatten()

        es_results = {}
        for level in confidence_levels:
            var = np.percentile(returns, (1 - level) * 100)
            es = returns[returns <= var].mean()
            es_results[f'ES_{int(level*100)}'] = float(es)

        return es_results

    def portfolio_simulation(self, columns: List[str], weights: List[float],
                            n_simulations: int = 10000,
                            n_periods: int = 252) -> Dict[str, Any]:
        """
        Simulate portfolio performance.

        Args:
            columns: List of asset columns
            weights: Portfolio weights (must sum to 1)
            n_simulations: Number of simulations
            n_periods: Number of periods

        Returns:
            Portfolio simulation results
        """
        weights = np.array(weights)
        if abs(weights.sum() - 1.0) > 0.01:
            weights = weights / weights.sum()
            logger.warning(f"Weights normalized to sum to 1: {weights}")

        # Get returns for each asset
        returns_data = pd.DataFrame()
        for col in columns:
            series = pd.to_numeric(self.data[col], errors='coerce').dropna()
            returns_data[col] = series.pct_change().dropna()

        # Calculate portfolio statistics
        mean_returns = returns_data.mean()
        cov_matrix = returns_data.cov()

        portfolio_return = np.sum(mean_returns * weights)
        portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

        # Simulate portfolio paths
        random_returns = np.random.multivariate_normal(
            mean_returns.values, cov_matrix.values, (n_simulations, n_periods)
        )
        portfolio_returns = np.sum(random_returns * weights, axis=2)

        # Calculate final values (starting at 1)
        final_values = np.prod(1 + portfolio_returns, axis=1)

        return {
            'expected_return': float(portfolio_return * n_periods),
            'annual_volatility': float(portfolio_volatility * np.sqrt(252)),
            'sharpe_ratio': float(portfolio_return / portfolio_volatility * np.sqrt(252)) if portfolio_volatility > 0 else 0,
            'var': self.value_at_risk(final_values - 1),
            'expected_shortfall': self.expected_shortfall(final_values - 1),
            'percentiles': {
                '5th': float(np.percentile(final_values, 5)),
                '25th': float(np.percentile(final_values, 25)),
                '50th': float(np.percentile(final_values, 50)),
                '75th': float(np.percentile(final_values, 75)),
                '95th': float(np.percentile(final_values, 95))
            },
            'probability_of_loss': float((final_values < 1).mean()),
            'weights': weights.tolist(),
            'n_simulations': n_simulations,
            'n_periods': n_periods
        }

    def scenario_analysis(self, column: str, scenarios: Dict[str, Dict[str, float]],
                         n_simulations: int = 10000) -> Dict[str, Any]:
        """
        Run scenario analysis with different parameter assumptions.

        Args:
            column: Column to analyze
            scenarios: Dict of scenario definitions, e.g.:
                {'base': {'mu': 0.05, 'sigma': 0.2},
                 'stress': {'mu': -0.1, 'sigma': 0.4}}
            n_simulations: Number of simulations per scenario

        Returns:
            Results for each scenario
        """
        series = pd.to_numeric(self.data[column], errors='coerce').dropna()
        initial_value = series.iloc[-1]

        results = {}
        for scenario_name, params in scenarios.items():
            mu = params.get('mu', series.pct_change().mean())
            sigma = params.get('sigma', series.pct_change().std())
            periods = params.get('periods', 252)

            # Simulate
            random_returns = np.random.normal(mu / 252, sigma / np.sqrt(252),
                                             (n_simulations, periods))
            final_values = initial_value * np.prod(1 + random_returns, axis=1)

            results[scenario_name] = {
                'parameters': params,
                'initial_value': float(initial_value),
                'expected_final': float(final_values.mean()),
                'std_final': float(final_values.std()),
                'var_95': float(np.percentile(final_values, 5)),
                'var_99': float(np.percentile(final_values, 1)),
                'probability_of_loss': float((final_values < initial_value).mean()),
                'max_gain': float(final_values.max() - initial_value),
                'max_loss': float(initial_value - final_values.min())
            }

        return results

    def sensitivity_analysis(self, column: str, parameter: str,
                            values: List[float], n_simulations: int = 5000) -> Dict[str, Any]:
        """
        Sensitivity analysis: how outcomes change with parameter variations.

        Args:
            column: Column to analyze
            parameter: 'mu' or 'sigma'
            values: List of parameter values to test
            n_simulations: Simulations per value

        Returns:
            Sensitivity results
        """
        series = pd.to_numeric(self.data[column], errors='coerce').dropna()
        base_mu = series.pct_change().mean()
        base_sigma = series.pct_change().std()
        initial = series.iloc[-1]

        results = {'parameter': parameter, 'values': [], 'outcomes': []}

        for val in values:
            if parameter == 'mu':
                mu, sigma = val, base_sigma
            else:
                mu, sigma = base_mu, val

            random_returns = np.random.normal(mu, sigma, (n_simulations, 252))
            final_values = initial * np.prod(1 + random_returns, axis=1)

            results['values'].append(float(val))
            results['outcomes'].append({
                'mean': float(final_values.mean()),
                'std': float(final_values.std()),
                'var_95': float(np.percentile(final_values, 5)),
                'median': float(np.percentile(final_values, 50))
            })

        return results


# =============================================================================
# VISUALIZATION MODULE
# =============================================================================

class DataVisualizer:
    """
    Visualization tools for banking data analysis.

    Generates:
    - Distribution plots
    - Correlation heatmaps
    - Time series charts
    - Box plots
    - Scatter plots
    - Monte Carlo fan charts
    """

    def __init__(self, output_dir: Path = None, style: str = 'seaborn-v0_8-whitegrid'):
        """
        Initialize visualizer.

        Args:
            output_dir: Directory to save plots
            style: Matplotlib style
        """
        if not MATPLOTLIB_AVAILABLE:
            raise ImportError("matplotlib and seaborn required for visualization")

        self.output_dir = output_dir or OUTPUT_DIR / 'plots'
        self.output_dir.mkdir(parents=True, exist_ok=True)

        try:
            plt.style.use(style)
        except Exception:
            plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn' in plt.style.available else 'ggplot')

        # Set default figure parameters
        plt.rcParams['figure.figsize'] = (10, 6)
        plt.rcParams['figure.dpi'] = 100
        plt.rcParams['savefig.dpi'] = 150
        plt.rcParams['font.size'] = 10

        logger.info(f"Initialized DataVisualizer, output: {self.output_dir}")

    def distribution_plot(self, data: pd.Series, title: str,
                         filename: str = None, show_stats: bool = True) -> str:
        """
        Create distribution plot with histogram and KDE.

        Args:
            data: Series to plot
            title: Plot title
            filename: Output filename (auto-generated if None)
            show_stats: Show statistics on plot

        Returns:
            Path to saved plot
        """
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # Histogram with KDE
        ax1 = axes[0]
        data_clean = data.dropna()
        sns.histplot(data_clean, kde=True, ax=ax1, color='steelblue')
        ax1.set_title(f'{title} - Distribution')
        ax1.set_xlabel(title)
        ax1.set_ylabel('Frequency')

        if show_stats:
            stats_text = (f'n={len(data_clean):,}\n'
                         f'μ={data_clean.mean():.4f}\n'
                         f'σ={data_clean.std():.4f}\n'
                         f'median={data_clean.median():.4f}')
            ax1.text(0.95, 0.95, stats_text, transform=ax1.transAxes,
                    fontsize=9, verticalalignment='top', horizontalalignment='right',
                    bbox=dict(boxstyle='round', facecolor='white', alpha=0.8))

        # Box plot
        ax2 = axes[1]
        sns.boxplot(x=data_clean, ax=ax2, color='steelblue')
        ax2.set_title(f'{title} - Box Plot')
        ax2.set_xlabel(title)

        plt.tight_layout()

        filename = filename or f"dist_{title.lower().replace(' ', '_')}.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved distribution plot: {filepath}")
        return str(filepath)

    def correlation_heatmap(self, data: pd.DataFrame, title: str = "Correlation Matrix",
                           filename: str = "correlation_heatmap.png",
                           method: str = 'pearson') -> str:
        """
        Create correlation heatmap.

        Args:
            data: DataFrame with numeric columns
            title: Plot title
            filename: Output filename
            method: Correlation method

        Returns:
            Path to saved plot
        """
        numeric_data = data.select_dtypes(include=[np.number])
        corr = numeric_data.corr(method=method)

        # Determine figure size based on number of variables
        n_vars = len(corr.columns)
        fig_size = max(8, n_vars * 0.5)

        fig, ax = plt.subplots(figsize=(fig_size, fig_size))

        mask = np.triu(np.ones_like(corr, dtype=bool))
        sns.heatmap(corr, mask=mask, cmap='RdBu_r', center=0,
                   annot=n_vars <= 15, fmt='.2f', square=True,
                   linewidths=0.5, ax=ax, vmin=-1, vmax=1,
                   cbar_kws={'shrink': 0.8})

        ax.set_title(title, fontsize=14)
        plt.xticks(rotation=45, ha='right')
        plt.yticks(rotation=0)

        plt.tight_layout()

        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved correlation heatmap: {filepath}")
        return str(filepath)

    def scatter_matrix(self, data: pd.DataFrame, columns: List[str] = None,
                       hue: str = None, filename: str = "scatter_matrix.png") -> str:
        """
        Create scatter plot matrix (pairplot).

        Args:
            data: DataFrame
            columns: Columns to include (max 6 recommended)
            hue: Column for color coding
            filename: Output filename

        Returns:
            Path to saved plot
        """
        if columns is None:
            numeric_cols = data.select_dtypes(include=[np.number]).columns[:6]
            columns = list(numeric_cols)

        plot_data = data[columns].copy()
        if hue and hue in data.columns:
            plot_data[hue] = data[hue]

        g = sns.pairplot(plot_data, hue=hue, diag_kind='kde',
                        plot_kws={'alpha': 0.6, 's': 30},
                        diag_kws={'alpha': 0.6})
        g.fig.suptitle('Scatter Matrix', y=1.02)

        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved scatter matrix: {filepath}")
        return str(filepath)

    def time_series_plot(self, data: pd.Series, title: str,
                        filename: str = None, show_trend: bool = True) -> str:
        """
        Create time series plot with optional trend line.

        Args:
            data: Time series data
            title: Plot title
            filename: Output filename
            show_trend: Show linear trend line

        Returns:
            Path to saved plot
        """
        fig, ax = plt.subplots(figsize=(12, 6))

        # Main line
        ax.plot(data.index, data.values, color='steelblue', linewidth=1, label='Data')

        # Moving average
        if len(data) > 20:
            ma = data.rolling(window=20).mean()
            ax.plot(data.index, ma.values, color='orange', linewidth=2,
                   label='20-period MA', alpha=0.8)

        # Trend line
        if show_trend and len(data) > 10:
            x = np.arange(len(data))
            z = np.polyfit(x, data.values, 1)
            p = np.poly1d(z)
            ax.plot(data.index, p(x), color='red', linestyle='--',
                   linewidth=1.5, label=f'Trend (slope={z[0]:.4f})')

        ax.set_title(title)
        ax.set_xlabel('Time')
        ax.set_ylabel('Value')
        ax.legend(loc='upper left')
        ax.grid(True, alpha=0.3)

        plt.tight_layout()

        filename = filename or f"ts_{title.lower().replace(' ', '_')}.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved time series plot: {filepath}")
        return str(filepath)

    def box_plot_comparison(self, data: pd.DataFrame, value_col: str,
                           group_col: str, title: str = None,
                           filename: str = None) -> str:
        """
        Create box plot comparing groups.

        Args:
            data: DataFrame
            value_col: Numeric column for values
            group_col: Categorical column for grouping
            title: Plot title
            filename: Output filename

        Returns:
            Path to saved plot
        """
        fig, ax = plt.subplots(figsize=(10, 6))

        sns.boxplot(x=group_col, y=value_col, data=data, ax=ax, palette='Set2')

        title = title or f'{value_col} by {group_col}'
        ax.set_title(title)
        ax.set_xlabel(group_col)
        ax.set_ylabel(value_col)

        # Rotate x labels if many categories
        n_categories = data[group_col].nunique()
        if n_categories > 5:
            plt.xticks(rotation=45, ha='right')

        plt.tight_layout()

        filename = filename or f"boxplot_{value_col}_by_{group_col}.png"
        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved box plot: {filepath}")
        return str(filepath)

    def monte_carlo_fan_chart(self, simulations: np.ndarray,
                              percentiles: List[int] = [5, 25, 50, 75, 95],
                              title: str = "Monte Carlo Simulation",
                              filename: str = "monte_carlo_fan.png") -> str:
        """
        Create fan chart from Monte Carlo simulations.

        Args:
            simulations: Array of shape (n_simulations, n_periods)
            percentiles: Percentile levels for bands
            title: Plot title
            filename: Output filename

        Returns:
            Path to saved plot
        """
        fig, ax = plt.subplots(figsize=(12, 6))

        n_periods = simulations.shape[1]
        x = np.arange(n_periods)

        # Calculate percentiles
        percentile_values = {p: np.percentile(simulations, p, axis=0) for p in percentiles}

        # Color palette for bands
        colors = plt.cm.Blues(np.linspace(0.2, 0.8, len(percentiles) // 2 + 1))

        # Plot bands (symmetric around median)
        for i, (low, high) in enumerate([(5, 95), (25, 75)]):
            if low in percentile_values and high in percentile_values:
                ax.fill_between(x, percentile_values[low], percentile_values[high],
                               color=colors[i], alpha=0.5,
                               label=f'{low}th-{high}th percentile')

        # Median line
        if 50 in percentile_values:
            ax.plot(x, percentile_values[50], color='darkblue', linewidth=2, label='Median')

        # Sample paths
        n_samples = min(100, simulations.shape[0])
        sample_idx = np.random.choice(simulations.shape[0], n_samples, replace=False)
        for idx in sample_idx:
            ax.plot(x, simulations[idx], color='gray', alpha=0.05, linewidth=0.5)

        ax.set_title(title)
        ax.set_xlabel('Time Period')
        ax.set_ylabel('Value')
        ax.legend(loc='upper left')
        ax.grid(True, alpha=0.3)

        plt.tight_layout()

        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved Monte Carlo fan chart: {filepath}")
        return str(filepath)

    def risk_metrics_dashboard(self, var_data: Dict, es_data: Dict,
                               title: str = "Risk Metrics Dashboard",
                               filename: str = "risk_dashboard.png") -> str:
        """
        Create dashboard showing VaR and ES metrics.

        Args:
            var_data: Value at Risk data
            es_data: Expected Shortfall data
            title: Dashboard title
            filename: Output filename

        Returns:
            Path to saved plot
        """
        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # VaR bar chart
        ax1 = axes[0]
        levels = list(var_data.keys())
        values = list(var_data.values())
        bars = ax1.bar(levels, values, color=['steelblue', 'darkblue'])
        ax1.set_title('Value at Risk (VaR)')
        ax1.set_ylabel('Loss')
        ax1.axhline(y=0, color='black', linestyle='-', linewidth=0.5)

        # Add value labels
        for bar, val in zip(bars, values):
            ax1.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                    f'{val:.4f}', ha='center', va='bottom', fontsize=10)

        # ES bar chart
        ax2 = axes[1]
        levels = list(es_data.keys())
        values = list(es_data.values())
        bars = ax2.bar(levels, values, color=['coral', 'darkred'])
        ax2.set_title('Expected Shortfall (CVaR)')
        ax2.set_ylabel('Average Loss Beyond VaR')
        ax2.axhline(y=0, color='black', linestyle='-', linewidth=0.5)

        for bar, val in zip(bars, values):
            ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height(),
                    f'{val:.4f}', ha='center', va='bottom', fontsize=10)

        fig.suptitle(title, fontsize=14, y=1.02)
        plt.tight_layout()

        filepath = self.output_dir / filename
        plt.savefig(filepath, bbox_inches='tight')
        plt.close()

        logger.info(f"Saved risk dashboard: {filepath}")
        return str(filepath)


# =============================================================================
# MAIN ANALYTICS PIPELINE
# =============================================================================

class AnalyticsPipeline:
    """
    Unified analytics pipeline combining statistical analysis,
    Monte Carlo simulation, and visualization.
    """

    def __init__(self, data: pd.DataFrame, output_dir: Path = None):
        """
        Initialize analytics pipeline.

        Args:
            data: DataFrame to analyze
            output_dir: Output directory for reports and plots
        """
        self.data = data
        self.output_dir = output_dir or OUTPUT_DIR / 'analytics'
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.stats_analyzer = StatisticalAnalyzer(data)
        self.mc_simulator = MonteCarloSimulator(data)

        if MATPLOTLIB_AVAILABLE:
            self.visualizer = DataVisualizer(self.output_dir / 'plots')
        else:
            self.visualizer = None
            logger.warning("Visualization not available (install matplotlib)")

        logger.info(f"Initialized AnalyticsPipeline for data shape {data.shape}")

    def run_full_analysis(self, target_col: str = None,
                         mc_column: str = None,
                         n_simulations: int = 10000) -> Dict[str, Any]:
        """
        Run complete analytics suite.

        Args:
            target_col: Target variable for supervised analysis
            mc_column: Column for Monte Carlo simulation
            n_simulations: Number of MC simulations

        Returns:
            Complete analysis report
        """
        report = {
            'generated_at': datetime.now().isoformat(),
            'data_info': {
                'rows': len(self.data),
                'columns': len(self.data.columns),
                'numeric_cols': len(self.stats_analyzer.numeric_cols),
                'categorical_cols': len(self.stats_analyzer.categorical_cols)
            },
            'statistical_analysis': {},
            'monte_carlo': {},
            'visualizations': []
        }

        # Statistical Analysis
        logger.info("Running statistical analysis...")
        report['statistical_analysis'] = self.stats_analyzer.generate_report()

        # Monte Carlo Simulation
        if mc_column and mc_column in self.data.columns:
            logger.info(f"Running Monte Carlo simulation on {mc_column}...")

            simulations = self.mc_simulator.simulate_returns(
                mc_column, n_simulations=n_simulations
            )

            returns = simulations[:, -1] / simulations[:, 0] - 1

            report['monte_carlo'] = {
                'column': mc_column,
                'n_simulations': n_simulations,
                'value_at_risk': self.mc_simulator.value_at_risk(returns),
                'expected_shortfall': self.mc_simulator.expected_shortfall(returns),
                'summary_stats': {
                    'mean_return': float(returns.mean()),
                    'std_return': float(returns.std()),
                    'min_return': float(returns.min()),
                    'max_return': float(returns.max()),
                    'probability_of_loss': float((returns < 0).mean())
                },
                'scenarios': self.mc_simulator.scenario_analysis(
                    mc_column,
                    scenarios={
                        'base': {'mu': 0.05, 'sigma': 0.15},
                        'optimistic': {'mu': 0.10, 'sigma': 0.12},
                        'pessimistic': {'mu': 0.02, 'sigma': 0.25},
                        'stress': {'mu': -0.10, 'sigma': 0.40}
                    }
                )
            }

            # Monte Carlo visualization
            if self.visualizer:
                plot_path = self.visualizer.monte_carlo_fan_chart(
                    simulations, title=f"Monte Carlo - {mc_column}"
                )
                report['visualizations'].append(plot_path)

                # Risk dashboard
                risk_path = self.visualizer.risk_metrics_dashboard(
                    report['monte_carlo']['value_at_risk'],
                    report['monte_carlo']['expected_shortfall']
                )
                report['visualizations'].append(risk_path)

        # Visualizations
        if self.visualizer:
            logger.info("Generating visualizations...")

            # Correlation heatmap
            corr_path = self.visualizer.correlation_heatmap(self.data)
            report['visualizations'].append(corr_path)

            # Distribution plots for key numeric columns
            for col in self.stats_analyzer.numeric_cols[:5]:
                try:
                    plot_path = self.visualizer.distribution_plot(
                        self.data[col], col
                    )
                    report['visualizations'].append(plot_path)
                except Exception as e:
                    logger.warning(f"Could not create distribution plot for {col}: {e}")

            # Scatter matrix
            if len(self.stats_analyzer.numeric_cols) >= 2:
                try:
                    scatter_path = self.visualizer.scatter_matrix(
                        self.data,
                        columns=self.stats_analyzer.numeric_cols[:5]
                    )
                    report['visualizations'].append(scatter_path)
                except Exception as e:
                    logger.warning(f"Could not create scatter matrix: {e}")

        # Save report
        report_path = self.output_dir / 'analytics_report.json'
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)

        logger.info(f"Analysis complete. Report saved to {report_path}")

        return report


# =============================================================================
# CLI INTERFACE
# =============================================================================

def main():
    """Main entry point for analytics pipeline."""
    import argparse

    parser = argparse.ArgumentParser(description='Banking Analytics Pipeline')
    parser.add_argument('--use-case', type=str, help='Use case key to analyze')
    parser.add_argument('--table', type=str, help='Database table name')
    parser.add_argument('--csv', type=str, help='CSV file path')
    parser.add_argument('--output-dir', type=str, default=str(OUTPUT_DIR / 'analytics'))
    parser.add_argument('--mc-column', type=str, help='Column for Monte Carlo simulation')
    parser.add_argument('--n-simulations', type=int, default=10000)
    parser.add_argument('--analysis', type=str, choices=['stats', 'mc', 'viz', 'all'],
                       default='all', help='Type of analysis to run')

    args = parser.parse_args()

    # Load data
    if args.csv:
        logger.info(f"Loading data from CSV: {args.csv}")
        data = pd.read_csv(args.csv)
    elif args.table:
        logger.info(f"Loading data from table: {args.table}")
        with get_db_connection(UNIFIED_DB) as conn:
            data = pd.read_sql(f"SELECT * FROM [{args.table}] LIMIT 100000", conn)
    elif args.use_case:
        logger.info(f"Loading data for use case: {args.use_case}")
        with get_db_connection(UNIFIED_DB) as conn:
            data = pd.read_sql(f"SELECT * FROM [{args.use_case}] LIMIT 100000", conn)
    else:
        logger.error("Must specify --use-case, --table, or --csv")
        sys.exit(1)

    logger.info(f"Loaded {len(data)} rows, {len(data.columns)} columns")

    # Initialize pipeline
    output_dir = Path(args.output_dir)
    pipeline = AnalyticsPipeline(data, output_dir)

    # Run analysis
    if args.analysis == 'all':
        report = pipeline.run_full_analysis(
            mc_column=args.mc_column,
            n_simulations=args.n_simulations
        )
    elif args.analysis == 'stats':
        report = pipeline.stats_analyzer.generate_report()
    elif args.analysis == 'mc' and args.mc_column:
        simulations = pipeline.mc_simulator.simulate_returns(
            args.mc_column, n_simulations=args.n_simulations
        )
        returns = simulations[:, -1] / simulations[:, 0] - 1
        report = {
            'value_at_risk': pipeline.mc_simulator.value_at_risk(returns),
            'expected_shortfall': pipeline.mc_simulator.expected_shortfall(returns)
        }
    elif args.analysis == 'viz' and pipeline.visualizer:
        report = {'visualizations': []}
        report['visualizations'].append(pipeline.visualizer.correlation_heatmap(data))
    else:
        report = pipeline.run_full_analysis()

    # Print summary
    logger.info("=" * 60)
    logger.info("ANALYTICS PIPELINE COMPLETE")
    logger.info(f"Output directory: {output_dir}")
    logger.info("=" * 60)

    return report


if __name__ == "__main__":
    main()
