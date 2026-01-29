# Architecture Diagrams

## Overview

Technical diagrams documenting the Banking ML Pipeline architecture, data flows, and processes.

## Diagram Index

| Document | Description | Diagrams |
|----------|-------------|----------|
| [C4 Model](../architecture/c4_model.md) | System architecture using C4 methodology | 5 |
| [Sequence Diagrams](./sequence_diagrams.md) | Process flows and interactions | 6 |
| [Flowcharts](./flowcharts.md) | Decision trees and process flows | 7 |
| [Data Flow](./data_flow.md) | Data movement through the system | 7 |

## Diagram Summary

### C4 Model Diagrams

1. **Level 1: System Context** - External systems and users
2. **Level 2: Container Diagram** - Application components
3. **Level 3: Component Diagram** - Internal structure
4. **Level 4: Code Diagram** - Class-level design
5. **Deployment Diagram** - Infrastructure layout

### Sequence Diagrams

1. **Manual Pipeline Execution** - User-triggered workflows
2. **Model Training Pipeline** - Training process flow
3. **Real-time Inference** - Prediction request handling
4. **RAG Pipeline Query** - Document retrieval and generation
5. **Automated Pipeline Scheduling** - Scheduled job execution
6. **AI Governance Scoring** - Model governance assessment

### Flowcharts

1. **Main Pipeline Flow** - End-to-end processing
2. **Data Preprocessing Flow** - Data cleaning and transformation
3. **Model Training Flow** - Training and validation
4. **Inference Flow** - Prediction handling
5. **Governance Scoring Flow** - Trust score calculation
6. **Error Handling Flow** - Exception management
7. **Batch vs Real-time Processing** - Processing mode selection

### Data Flow Diagrams

1. **Overall Data Flow** - System-wide data movement
2. **Department-wise Data Flow** - Per-department processing
3. **Feature Engineering Data Flow** - Feature transformation
4. **Model Pipeline Data Flow** - ML pipeline stages
5. **Real-time Inference Data Flow** - Live prediction flow
6. **RAG Pipeline Data Flow** - Document processing
7. **Analytics Data Flow** - Statistical analysis flow

## Viewing Diagrams

All diagrams use **Mermaid** syntax and can be viewed in:

- GitHub (native Mermaid rendering)
- VS Code with Mermaid extension
- Mermaid Live Editor (https://mermaid.live)
- Documentation platforms (GitBook, Notion, etc.)

## Diagram Conventions

### Colors

| Color | Meaning |
|-------|---------|
| Blue | Core system components |
| Green | Data storage |
| Orange | External systems |
| Purple | Processing pipelines |
| Gray | Supporting services |

### Shapes

| Shape | Meaning |
|-------|---------|
| Rectangle | Process/Component |
| Cylinder | Database/Storage |
| Diamond | Decision point |
| Parallelogram | Input/Output |
| Rounded | Start/End |

### Line Styles

| Style | Meaning |
|-------|---------|
| Solid | Primary flow |
| Dashed | Optional/Conditional |
| Dotted | Async communication |
