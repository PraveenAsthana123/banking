# Flowcharts - Banking ML Pipeline

## 1. Main Pipeline Flow

```mermaid
flowchart TB
    subgraph Input["INPUT LAYER"]
        A1[File Upload] --> V1{Validate Format}
        A2[Database Query] --> V1
        A3[API Request] --> V1
        V1 -->|Valid| D1[Data Ingestion]
        V1 -->|Invalid| E1[Return Error]
    end

    subgraph Process["PROCESSING LAYER"]
        D1 --> P1[Data Validation]
        P1 -->|Pass| P2[Feature Engineering]
        P1 -->|Fail| E2[Log & Alert]
        P2 --> P3[Data Preprocessing]
        P3 --> P4{Model Type?}
        P4 -->|Training| T1[Train Model]
        P4 -->|Inference| I1[Load Model]
        T1 --> T2[Validate Model]
        T2 -->|Pass| T3[Save Model]
        T2 -->|Fail| T4[Retry/Alert]
        I1 --> I2[Generate Predictions]
        T3 --> G1[Governance Scoring]
        I2 --> G1
    end

    subgraph Output["OUTPUT LAYER"]
        G1 --> O1[Format Results]
        O1 --> O2[Save to Database]
        O2 --> O3[Generate Report]
        O3 --> O4[Send Notifications]
        O4 --> O5[Update Dashboard]
    end
```

## 2. Data Preprocessing Flow

```mermaid
flowchart LR
    subgraph Load["Data Loading"]
        L1[Read Source] --> L2{Source Type?}
        L2 -->|CSV| L3[pd.read_csv]
        L2 -->|JSON| L4[pd.read_json]
        L2 -->|DB| L5[SQL Query]
        L2 -->|API| L6[API Fetch]
        L3 --> L7[Raw DataFrame]
        L4 --> L7
        L5 --> L7
        L6 --> L7
    end

    subgraph Validate["Data Validation"]
        L7 --> V1{Schema Valid?}
        V1 -->|No| V2[Schema Error]
        V1 -->|Yes| V3{Missing > 5%?}
        V3 -->|Yes| V4[Quality Warning]
        V3 -->|No| V5[Continue]
        V4 --> V5
    end

    subgraph Clean["Data Cleaning"]
        V5 --> C1[Remove Duplicates]
        C1 --> C2[Handle Outliers]
        C2 --> C3{Missing Values}
        C3 -->|Numeric| C4[Impute Mean/Median]
        C3 -->|Categorical| C5[Impute Mode]
        C3 -->|Drop| C6[Remove Rows]
        C4 --> C7[Clean DataFrame]
        C5 --> C7
        C6 --> C7
    end

    subgraph Transform["Feature Engineering"]
        C7 --> T1[Encode Categoricals]
        T1 --> T2[Scale Numerics]
        T2 --> T3[Create Derived Features]
        T3 --> T4[Feature Selection]
        T4 --> T5[Final Features]
    end
```

## 3. Model Training Flow

```mermaid
flowchart TB
    subgraph DataPrep["Data Preparation"]
        D1[Load Processed Data] --> D2[Split Train/Val/Test]
        D2 --> D3[80% Train]
        D2 --> D4[10% Validation]
        D2 --> D5[10% Test]
    end

    subgraph Training["Model Training"]
        D3 --> T1{Algorithm Selection}
        T1 -->|Classification| T2[XGBoost/RF/LR]
        T1 -->|Regression| T3[XGBoost/RF/Linear]
        T1 -->|Clustering| T4[KMeans/DBSCAN]

        T2 --> CV1[5-Fold Cross Validation]
        T3 --> CV1
        T4 --> CV2[Silhouette Scoring]

        CV1 --> H1[Hyperparameter Tuning]
        CV2 --> H1
        H1 --> M1[Train Final Model]
    end

    subgraph Validation["Model Validation"]
        M1 --> V1[Validate on Val Set]
        D4 --> V1
        V1 --> V2{Metrics OK?}
        V2 -->|No| V3[Adjust & Retrain]
        V3 --> H1
        V2 -->|Yes| V4[Test on Test Set]
        D5 --> V4
    end

    subgraph Deployment["Model Deployment"]
        V4 --> V5{Test Metrics OK?}
        V5 -->|No| V6[Flag for Review]
        V5 -->|Yes| V7[Register Model]
        V7 --> V8[Version Model]
        V8 --> V9[Deploy to Production]
    end
```

## 4. Inference Flow

```mermaid
flowchart LR
    subgraph Request["Request Handling"]
        R1[Receive Request] --> R2{Authenticated?}
        R2 -->|No| R3[401 Unauthorized]
        R2 -->|Yes| R4{Valid Schema?}
        R4 -->|No| R5[400 Bad Request]
        R4 -->|Yes| R6[Extract Features]
    end

    subgraph Inference["Model Inference"]
        R6 --> I1[Load/Cache Model]
        I1 --> I2[Preprocess Input]
        I2 --> I3[Generate Prediction]
        I3 --> I4[Calculate Confidence]
        I4 --> I5{Explain?}
        I5 -->|Yes| I6[SHAP Values]
        I5 -->|No| I7[Skip]
        I6 --> I8[Build Response]
        I7 --> I8
    end

    subgraph Response["Response Handling"]
        I8 --> O1[Apply Business Rules]
        O1 --> O2[Format Output]
        O2 --> O3[Log Prediction]
        O3 --> O4[Return Response]
    end
```

## 5. Governance Scoring Flow

```mermaid
flowchart TB
    subgraph Input["Input Data"]
        I1[Load Model] --> I2[Load Test Data]
        I2 --> I3[Load Predictions]
    end

    subgraph Explainability["Explainability Score"]
        I3 --> E1[Feature Importance]
        E1 --> E2[SHAP Analysis]
        E2 --> E3[Concentration Ratio]
        E3 --> E4{Score > 80%?}
        E4 -->|Yes| E5[Excellent]
        E4 -->|No| E6{Score > 60%?}
        E6 -->|Yes| E7[Good]
        E6 -->|No| E8[Needs Improvement]
    end

    subgraph Fairness["Fairness Score"]
        I3 --> F1[Demographic Parity]
        F1 --> F2[Equal Opportunity]
        F2 --> F3[Disparate Impact]
        F3 --> F4[Protected Attributes]
        F4 --> F5[Fairness Score]
    end

    subgraph Robustness["Robustness Score"]
        I3 --> R1[CV Stability]
        R1 --> R2[Perturbation Test]
        R2 --> R3[Noise Sensitivity]
        R3 --> R4[Robustness Score]
    end

    subgraph Privacy["Privacy Score"]
        I3 --> P1[PII Detection]
        P1 --> P2[Data Minimization]
        P2 --> P3[Encryption Check]
        P3 --> P4[Privacy Score]
    end

    subgraph Overall["Overall Assessment"]
        E5 --> O1[Aggregate Scores]
        E7 --> O1
        E8 --> O1
        F5 --> O1
        R4 --> O1
        P4 --> O1
        O1 --> O2{Overall > 80?}
        O2 -->|Yes| O3[HIGH Trust]
        O2 -->|No| O4{Overall > 60?}
        O4 -->|Yes| O5[MEDIUM Trust]
        O4 -->|No| O6[LOW Trust]
    end
```

## 6. Error Handling Flow

```mermaid
flowchart TB
    subgraph Detection["Error Detection"]
        E1[Execute Step] --> E2{Success?}
        E2 -->|Yes| E3[Continue]
        E2 -->|No| E4[Catch Exception]
    end

    subgraph Classification["Error Classification"]
        E4 --> C1{Error Type?}
        C1 -->|Data Error| C2[DataValidationError]
        C1 -->|Model Error| C3[ModelExecutionError]
        C1 -->|System Error| C4[SystemError]
        C1 -->|Timeout| C5[TimeoutError]
    end

    subgraph Recovery["Recovery Strategy"]
        C2 --> R1[Log Error Details]
        C3 --> R1
        C4 --> R1
        C5 --> R1

        R1 --> R2{Retryable?}
        R2 -->|Yes| R3{Retry Count < 3?}
        R3 -->|Yes| R4[Retry with Backoff]
        R3 -->|No| R5[Mark Failed]
        R2 -->|No| R5
        R4 --> E1
    end

    subgraph Notification["Notification"]
        R5 --> N1[Update Job Status]
        N1 --> N2[Send Alert]
        N2 --> N3[Email Notification]
        N2 --> N4[Dashboard Alert]
        N2 --> N5[Log to Monitoring]
    end
```

## 7. Batch vs Real-time Processing

```mermaid
flowchart TB
    subgraph Request["Incoming Request"]
        R1[Request] --> R2{Request Type?}
    end

    subgraph Batch["Batch Processing"]
        R2 -->|Batch| B1[Queue Job]
        B1 --> B2[Load Full Dataset]
        B2 --> B3[Process in Chunks]
        B3 --> B4[Aggregate Results]
        B4 --> B5[Save to Database]
        B5 --> B6[Generate Report]
    end

    subgraph Realtime["Real-time Processing"]
        R2 -->|Real-time| RT1[Validate Input]
        RT1 --> RT2[Load Cached Model]
        RT2 --> RT3[Single Prediction]
        RT3 --> RT4[Return Immediately]
    end

    subgraph Streaming["Near Real-time"]
        R2 -->|Streaming| S1[Buffer Events]
        S1 --> S2{Buffer Full?}
        S2 -->|Yes| S3[Micro-batch Process]
        S2 -->|No| S1
        S3 --> S4[Update Results]
    end
```
