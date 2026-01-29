# Data Flow Diagrams - Banking ML Pipeline

## 1. Overall Data Flow

```mermaid
flowchart LR
    subgraph Sources["Data Sources"]
        S1[(Core Banking DB)]
        S2[(Credit Bureau API)]
        S3[(Market Data Feed)]
        S4[(Transaction System)]
        S5[File Uploads]
    end

    subgraph Ingestion["Data Ingestion Layer"]
        I1[ETL Jobs]
        I2[API Connectors]
        I3[File Processors]
    end

    subgraph Storage["Data Storage Layer"]
        D1[(Raw Data Lake)]
        D2[(Processed Data)]
        D3[(Feature Store)]
        D4[(Model Registry)]
        D5[(Vector Store)]
    end

    subgraph Processing["Processing Layer"]
        P1[Preprocessing Pipeline]
        P2[Feature Engineering]
        P3[Model Training]
        P4[Model Inference]
        P5[RAG Pipeline]
    end

    subgraph Output["Output Layer"]
        O1[Predictions DB]
        O2[Reports]
        O3[Dashboards]
        O4[API Responses]
        O5[Alerts]
    end

    S1 --> I1
    S2 --> I2
    S3 --> I2
    S4 --> I1
    S5 --> I3

    I1 --> D1
    I2 --> D1
    I3 --> D1

    D1 --> P1
    P1 --> D2
    D2 --> P2
    P2 --> D3
    D3 --> P3
    D3 --> P4
    P3 --> D4
    D4 --> P4
    D2 --> P5
    P5 --> D5

    P4 --> O1
    O1 --> O2
    O1 --> O3
    P4 --> O4
    P4 --> O5
```

## 2. Department-wise Data Flow

```mermaid
flowchart TB
    subgraph Central["Central Data Hub"]
        CDH[(Enterprise Data Lake)]
    end

    subgraph Risk["Risk Management"]
        R1[Credit Risk Data]
        R2[Market Risk Data]
        R3[Operational Risk Data]
        RM[Risk Models]
        R1 --> RM
        R2 --> RM
        R3 --> RM
    end

    subgraph Credit["Credit Analysis"]
        C1[Loan Application Data]
        C2[Payment History]
        C3[Credit Bureau Data]
        CM[Credit Models]
        C1 --> CM
        C2 --> CM
        C3 --> CM
    end

    subgraph Fraud["Fraud Detection"]
        F1[Transaction Data]
        F2[Device Data]
        F3[Behavioral Data]
        FM[Fraud Models]
        F1 --> FM
        F2 --> FM
        F3 --> FM
    end

    subgraph Customer["Customer Analytics"]
        CU1[Customer Profile]
        CU2[Interaction Data]
        CU3[Product Holdings]
        CUM[Customer Models]
        CU1 --> CUM
        CU2 --> CUM
        CU3 --> CUM
    end

    subgraph Compliance["Compliance"]
        CO1[KYC Data]
        CO2[Transaction Records]
        CO3[Sanctions Lists]
        COM[Compliance Models]
        CO1 --> COM
        CO2 --> COM
        CO3 --> COM
    end

    CDH --> R1
    CDH --> R2
    CDH --> R3
    CDH --> C1
    CDH --> C2
    CDH --> F1
    CDH --> F2
    CDH --> CU1
    CDH --> CU2
    CDH --> CO1
    CDH --> CO2

    RM --> CDH
    CM --> CDH
    FM --> CDH
    CUM --> CDH
    COM --> CDH
```

## 3. Feature Engineering Data Flow

```mermaid
flowchart LR
    subgraph Raw["Raw Features"]
        R1[Numeric Raw]
        R2[Categorical Raw]
        R3[DateTime Raw]
        R4[Text Raw]
    end

    subgraph Transform["Transformations"]
        T1[Scaling/Normalization]
        T2[One-Hot Encoding]
        T3[Date Extraction]
        T4[Text Vectorization]
    end

    subgraph Derived["Derived Features"]
        D1[Ratios & Aggregates]
        D2[Rolling Statistics]
        D3[Lag Features]
        D4[Interaction Features]
    end

    subgraph Selection["Feature Selection"]
        S1[Correlation Filter]
        S2[Importance Ranking]
        S3[Variance Threshold]
    end

    subgraph Final["Final Feature Set"]
        F1[Selected Features]
        F2[Feature Metadata]
    end

    R1 --> T1
    R2 --> T2
    R3 --> T3
    R4 --> T4

    T1 --> D1
    T1 --> D2
    T1 --> D3
    T2 --> D4
    T3 --> D2
    T3 --> D3

    D1 --> S1
    D2 --> S1
    D3 --> S2
    D4 --> S2

    S1 --> S3
    S2 --> S3

    S3 --> F1
    S3 --> F2
```

## 4. Model Pipeline Data Flow

```mermaid
flowchart TB
    subgraph Input["Input Stage"]
        I1[Training Data]
        I2[Validation Data]
        I3[Test Data]
        I4[Config Params]
    end

    subgraph Preprocessing["Preprocessing Stage"]
        P1[Data Validation]
        P2[Missing Value Handler]
        P3[Outlier Detection]
        P4[Feature Transformer]
    end

    subgraph Training["Training Stage"]
        T1[Model Selection]
        T2[Hyperparameter Tuning]
        T3[Cross Validation]
        T4[Model Fitting]
    end

    subgraph Evaluation["Evaluation Stage"]
        E1[Metrics Calculation]
        E2[Confusion Matrix]
        E3[ROC/AUC Analysis]
        E4[Feature Importance]
    end

    subgraph Output["Output Stage"]
        O1[Trained Model]
        O2[Model Metrics]
        O3[Feature Metadata]
        O4[Validation Report]
    end

    I1 --> P1
    I2 --> P1
    I3 --> P1
    I4 --> T1

    P1 --> P2 --> P3 --> P4

    P4 --> T1
    T1 --> T2 --> T3 --> T4

    T4 --> E1
    E1 --> E2 --> E3 --> E4

    E4 --> O1
    E4 --> O2
    E4 --> O3
    E4 --> O4
```

## 5. Real-time Inference Data Flow

```mermaid
flowchart LR
    subgraph Request["Request"]
        REQ[API Request]
        REQ --> AUTH[Authentication]
        AUTH --> VAL[Validation]
    end

    subgraph Cache["Model Cache"]
        MC[(Model Cache)]
        FC[(Feature Cache)]
    end

    subgraph Process["Processing"]
        VAL --> FE[Feature Extraction]
        FE --> FC
        FC --> PP[Preprocessing]
        PP --> MC
        MC --> INF[Inference]
        INF --> POST[Post-processing]
    end

    subgraph Explain["Explainability"]
        POST --> SHAP[SHAP Calculation]
        SHAP --> TOP[Top Features]
    end

    subgraph Response["Response"]
        TOP --> FMT[Format Response]
        FMT --> LOG[Log Prediction]
        LOG --> RES[Return Response]
    end

    subgraph Async["Async Operations"]
        LOG --> STORE[(Predictions DB)]
        LOG --> MONITOR[Monitoring]
        LOG --> ALERT{Alert?}
        ALERT -->|Yes| NOTIFY[Notification]
    end
```

## 6. RAG Pipeline Data Flow

```mermaid
flowchart TB
    subgraph Documents["Document Ingestion"]
        D1[PDF Documents]
        D2[Text Files]
        D3[Web Pages]
        D4[Database Records]
    end

    subgraph Processing["Document Processing"]
        P1[Text Extraction]
        P2[Chunking]
        P3[Cleaning]
        P4[Metadata Extraction]
    end

    subgraph Embedding["Embedding Generation"]
        E1[Embedding Model]
        E2[Vector Generation]
        E3[Dimension Reduction]
    end

    subgraph Storage["Vector Storage"]
        V1[(ChromaDB)]
        V2[Index Building]
        V3[Metadata Store]
    end

    subgraph Query["Query Processing"]
        Q1[User Query]
        Q2[Query Embedding]
        Q3[Similarity Search]
        Q4[Context Building]
    end

    subgraph Generation["Response Generation"]
        G1[Prompt Construction]
        G2[LLM Generation]
        G3[Response Formatting]
        G4[Source Attribution]
    end

    D1 --> P1
    D2 --> P1
    D3 --> P1
    D4 --> P1

    P1 --> P2 --> P3 --> P4

    P4 --> E1 --> E2 --> E3

    E3 --> V1
    E3 --> V2
    P4 --> V3

    Q1 --> Q2 --> Q3
    V1 --> Q3
    Q3 --> Q4

    Q4 --> G1 --> G2 --> G3 --> G4
```

## 7. Analytics Data Flow

```mermaid
flowchart LR
    subgraph Input["Data Input"]
        I1[Historical Data]
        I2[Real-time Data]
        I3[Model Outputs]
    end

    subgraph Statistical["Statistical Analysis"]
        S1[Descriptive Stats]
        S2[Hypothesis Testing]
        S3[Correlation Analysis]
        S4[Distribution Fitting]
    end

    subgraph MonteCarlo["Monte Carlo Simulation"]
        M1[Parameter Setup]
        M2[Random Sampling]
        M3[Simulation Runs]
        M4[Result Aggregation]
    end

    subgraph Risk["Risk Metrics"]
        R1[VaR Calculation]
        R2[Expected Shortfall]
        R3[Stress Testing]
        R4[Scenario Analysis]
    end

    subgraph Output["Output"]
        O1[Statistical Reports]
        O2[Risk Reports]
        O3[Visualizations]
        O4[Dashboards]
    end

    I1 --> S1
    I1 --> S2
    I2 --> S3
    I3 --> S4

    S1 --> M1
    S4 --> M1
    M1 --> M2 --> M3 --> M4

    M4 --> R1
    M4 --> R2
    I1 --> R3
    I3 --> R4

    S1 --> O1
    S2 --> O1
    R1 --> O2
    R2 --> O2
    R3 --> O2
    R4 --> O2

    O1 --> O3
    O2 --> O3
    O3 --> O4
```
