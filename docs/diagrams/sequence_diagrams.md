# Sequence Diagrams - Banking ML Pipeline

## 1. Manual Pipeline Execution

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant WebUI as React Web UI
    participant API as Flask API
    participant Scheduler as Job Scheduler
    participant Preproc as Preprocessing
    participant Training as Model Training
    participant Inference as Inference Engine
    participant Governance as AI Governance
    participant DB as Database

    User->>WebUI: Select Use Case
    User->>WebUI: Upload Data / Configure
    User->>WebUI: Click "Run Process"

    WebUI->>API: POST /api/pipeline/run
    API->>Scheduler: create_job(use_case_key)
    Scheduler->>DB: INSERT job_status (pending)
    Scheduler-->>API: job_id
    API-->>WebUI: {job_id, status: "pending"}
    WebUI-->>User: Show "Processing..."

    Scheduler->>Preproc: run_preprocessing()
    Preproc->>DB: UPDATE status = "preprocessing"
    Preproc->>Preproc: load_data()
    Preproc->>Preproc: validate_data()
    Preproc->>Preproc: engineer_features()
    Preproc->>DB: save_processed_data()
    Preproc-->>Scheduler: preprocessing_complete

    Scheduler->>Inference: run_inference()
    Inference->>DB: UPDATE status = "inferencing"
    Inference->>Inference: load_model()
    Inference->>Inference: generate_predictions()
    Inference->>DB: save_predictions()
    Inference-->>Scheduler: inference_complete

    Scheduler->>Governance: calculate_scores()
    Governance->>Governance: explainability_score()
    Governance->>Governance: fairness_score()
    Governance->>DB: save_governance_scores()
    Governance-->>Scheduler: governance_complete

    Scheduler->>DB: UPDATE status = "completed"

    loop Poll Status
        WebUI->>API: GET /api/pipeline/status/{job_id}
        API->>DB: SELECT status
        API-->>WebUI: {status, progress}
    end

    WebUI-->>User: Show Results
```

## 2. Model Training Pipeline

```mermaid
sequenceDiagram
    autonumber
    participant Scheduler as Job Scheduler
    participant Training as Training Pipeline
    participant DataLoader as Data Loader
    participant FeatureEng as Feature Engineering
    participant ModelTrain as Model Trainer
    participant Validator as Model Validator
    participant Registry as Model Registry
    participant DB as Database

    Scheduler->>Training: start_training(use_case_key)
    Training->>DB: UPDATE status = "training"

    Training->>DataLoader: load_training_data()
    DataLoader->>DB: SELECT from processed_data
    DataLoader-->>Training: raw_data

    Training->>FeatureEng: engineer_features(raw_data)
    FeatureEng->>FeatureEng: handle_missing_values()
    FeatureEng->>FeatureEng: encode_categoricals()
    FeatureEng->>FeatureEng: scale_numerics()
    FeatureEng->>FeatureEng: create_derived_features()
    FeatureEng-->>Training: X_train, X_test, y_train, y_test

    Training->>ModelTrain: train_model(X_train, y_train)

    loop Cross Validation
        ModelTrain->>ModelTrain: fit_fold(X_fold, y_fold)
        ModelTrain->>ModelTrain: evaluate_fold()
    end

    ModelTrain->>ModelTrain: fit_final_model()
    ModelTrain-->>Training: trained_model

    Training->>Validator: validate_model(model, X_test, y_test)
    Validator->>Validator: calculate_accuracy()
    Validator->>Validator: calculate_precision()
    Validator->>Validator: calculate_recall()
    Validator->>Validator: calculate_f1()
    Validator->>Validator: calculate_auc_roc()
    Validator-->>Training: validation_metrics

    alt Metrics Pass Threshold
        Training->>Registry: register_model(model, metrics)
        Registry->>DB: INSERT model_metadata
        Registry->>Registry: save_model_file()
        Registry-->>Training: model_version
        Training->>DB: UPDATE status = "completed"
    else Metrics Fail
        Training->>DB: UPDATE status = "failed"
        Training->>DB: INSERT error_log
    end

    Training-->>Scheduler: training_result
```

## 3. Real-time Inference

```mermaid
sequenceDiagram
    autonumber
    participant Client as External Client
    participant API as Flask API
    participant Auth as Authentication
    participant Inference as Inference Engine
    participant ModelCache as Model Cache
    participant Explainer as SHAP Explainer
    participant DB as Database

    Client->>API: POST /api/v1/predict
    API->>Auth: validate_api_key()
    Auth-->>API: authenticated

    API->>API: validate_request_schema()
    API->>Inference: predict(features)

    Inference->>ModelCache: get_model(use_case_key)

    alt Model in Cache
        ModelCache-->>Inference: cached_model
    else Model Not Cached
        ModelCache->>DB: load_model_metadata()
        ModelCache->>ModelCache: load_model_file()
        ModelCache-->>Inference: loaded_model
    end

    Inference->>Inference: preprocess_input(features)
    Inference->>Inference: model.predict(X)
    Inference->>Inference: model.predict_proba(X)

    opt Generate Explanations
        Inference->>Explainer: explain(model, X)
        Explainer->>Explainer: calculate_shap_values()
        Explainer-->>Inference: feature_contributions
    end

    Inference->>Inference: apply_business_rules()
    Inference->>DB: log_prediction()
    Inference-->>API: prediction_result

    API-->>Client: {prediction, confidence, explanations}
```

## 4. RAG Pipeline Query

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant WebUI as React Web UI
    participant API as Flask API
    participant RAG as RAG Pipeline
    participant VectorDB as ChromaDB
    participant Embedder as Embedding Model
    participant LLM as Ollama LLM
    participant DB as Database

    User->>WebUI: Enter question
    WebUI->>API: POST /api/rag/query
    API->>RAG: query(question, use_case_key)

    RAG->>Embedder: embed(question)
    Embedder-->>RAG: question_embedding

    RAG->>VectorDB: similarity_search(embedding, k=5)
    VectorDB-->>RAG: relevant_documents

    RAG->>RAG: build_context(documents)
    RAG->>RAG: create_prompt(question, context)

    RAG->>LLM: generate(prompt)
    LLM-->>RAG: response

    RAG->>RAG: extract_answer(response)
    RAG->>DB: log_query(question, answer)
    RAG-->>API: {answer, sources, confidence}

    API-->>WebUI: response
    WebUI-->>User: Display answer with sources
```

## 5. Automated Pipeline Scheduling

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Cron Scheduler
    participant Scheduler as Job Scheduler
    participant Queue as Job Queue
    participant Worker as Worker Pool
    participant Pipeline as Pipeline Runner
    participant Monitor as Health Monitor
    participant Notifier as Notification Service
    participant DB as Database

    loop Every Minute
        Cron->>Scheduler: check_scheduled_jobs()
        Scheduler->>DB: SELECT due_jobs

        loop For Each Due Job
            Scheduler->>Queue: enqueue(job)
        end
    end

    loop Worker Processing
        Worker->>Queue: dequeue()
        Queue-->>Worker: job
        Worker->>DB: UPDATE status = "running"

        Worker->>Pipeline: execute(job)
        Pipeline->>Pipeline: run_steps()

        alt Success
            Pipeline-->>Worker: result
            Worker->>DB: UPDATE status = "completed"
        else Failure
            Pipeline-->>Worker: error
            Worker->>DB: UPDATE status = "failed"
            Worker->>Notifier: send_alert(error)
        end
    end

    loop Health Check
        Monitor->>DB: check_stuck_jobs()
        Monitor->>Monitor: check_resource_usage()

        alt Issues Detected
            Monitor->>Notifier: send_alert()
            Monitor->>Scheduler: restart_stuck_jobs()
        end
    end
```

## 6. AI Governance Scoring

```mermaid
sequenceDiagram
    autonumber
    participant Scheduler as Job Scheduler
    participant Governance as AI Governance Scorer
    participant Explainer as Explainability Module
    participant Fairness as Fairness Module
    participant Robustness as Robustness Module
    participant Privacy as Privacy Module
    participant DB as Database

    Scheduler->>Governance: calculate_scores(use_case_key)
    Governance->>DB: load_model_and_data()

    par Calculate All Scores
        Governance->>Explainer: calculate_explainability()
        Explainer->>Explainer: feature_importance()
        Explainer->>Explainer: shap_analysis()
        Explainer->>Explainer: concentration_ratio()
        Explainer-->>Governance: explainability_score

        Governance->>Fairness: calculate_fairness()
        Fairness->>Fairness: demographic_parity()
        Fairness->>Fairness: equal_opportunity()
        Fairness->>Fairness: disparate_impact()
        Fairness-->>Governance: fairness_score

        Governance->>Robustness: calculate_robustness()
        Robustness->>Robustness: cross_validation_stability()
        Robustness->>Robustness: feature_perturbation()
        Robustness->>Robustness: noise_sensitivity()
        Robustness-->>Governance: robustness_score

        Governance->>Privacy: calculate_privacy()
        Privacy->>Privacy: pii_detection()
        Privacy->>Privacy: data_minimization_check()
        Privacy->>Privacy: encryption_audit()
        Privacy-->>Governance: privacy_score
    end

    Governance->>Governance: calculate_overall_score()
    Governance->>Governance: determine_trust_level()
    Governance->>Governance: generate_recommendations()

    Governance->>DB: save_governance_scores()
    Governance-->>Scheduler: governance_result
```
