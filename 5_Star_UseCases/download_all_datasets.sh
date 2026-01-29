#!/usr/bin/env bash
# Download all missing datasets for Banking AI Use Cases
# Requires: kaggle CLI (authenticated), wget, git, unzip
set -uo pipefail

BASE="/mnt/deepa/Banking/5_Star_UseCases"
LOG="/mnt/deepa/Banking/logs/download.log"
mkdir -p /mnt/deepa/Banking/logs

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG"; }

download_kaggle_dataset() {
    local dest="$1" slug="$2"
    if [ -n "$(find "$dest" -maxdepth 1 -name '*.csv' -o -name '*.json' 2>/dev/null | head -1)" ]; then
        log "SKIP $slug (already has data in $dest)"
        return 0
    fi
    log "DOWNLOADING kaggle dataset: $slug -> $dest"
    mkdir -p "$dest"
    kaggle datasets download -d "$slug" -p "$dest" --unzip 2>&1 | tee -a "$LOG"
    log "DONE $slug"
}

download_kaggle_competition() {
    local dest="$1" slug="$2"
    if [ -n "$(find "$dest" -maxdepth 1 -name '*.csv' -o -name '*.json' 2>/dev/null | head -1)" ]; then
        log "SKIP $slug (already has data)"
        return 0
    fi
    log "DOWNLOADING kaggle competition: $slug -> $dest"
    mkdir -p "$dest"
    kaggle competitions download -c "$slug" -p "$dest" 2>&1 | tee -a "$LOG"
    # Unzip if needed
    for z in "$dest"/*.zip; do [ -f "$z" ] && unzip -o "$z" -d "$dest" && rm "$z"; done
    log "DONE $slug"
}

download_git_repo() {
    local dest="$1" url="$2"
    if [ -d "$dest/.git" ] || [ -n "$(find "$dest" -maxdepth 2 -name '*.csv' -o -name '*.json' -o -name '*.py' 2>/dev/null | head -1)" ]; then
        log "SKIP $url (already cloned)"
        return 0
    fi
    log "CLONING $url -> $dest"
    mkdir -p "$dest"
    git clone --depth 1 "$url" "$dest/repo" 2>&1 | tee -a "$LOG"
    log "DONE $url"
}

download_wget() {
    local dest="$1" url="$2" fname="$3"
    if [ -f "$dest/$fname" ]; then
        log "SKIP $fname (already exists)"
        return 0
    fi
    log "WGET $url -> $dest/$fname"
    mkdir -p "$dest"
    wget -q --show-progress -O "$dest/$fname" "$url" 2>&1 | tee -a "$LOG"
    log "DONE $fname"
}

log "=========================================="
log "BANKING DATASET DOWNLOAD - START"
log "=========================================="

# =============================================
# PILLAR B: Risk, Fraud & Financial Crime
# =============================================

# UC-06-01: Credit Card Fraud (already downloaded)
# download_kaggle_dataset "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-01" "mlg-ulb/creditcardfraud"

# UC-06-02: IEEE Fraud Detection (competition)
download_kaggle_competition "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-02" "ieee-fraud-detection"

# UC-06-03: CFPB Consumer Finance Complaints (NLP - fraud complaints)
download_kaggle_dataset "$BASE/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-03" "cfpb/us-consumer-finance-complaints"

# UC-06-04: RBA dataset (already downloaded)

# UC-07-01: Home Credit Default Risk
download_kaggle_competition "$BASE/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-01" "home-credit-default-risk"

# UC-07-02: Lending Club (already downloaded)
# UC-07-03: Loan Data (already downloaded)

# UC-08-01: PaySim (already downloaded)

# UC-08-02: Elliptic Bitcoin Dataset (graph AML)
download_kaggle_dataset "$BASE/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-02" "ellipticco/elliptic-data-set"

# UC-08-03: SAML-D (already downloaded)
# UC-08-04: OpenSanctions (already downloaded)

# UC-09-01: UCI Credit Card (already downloaded)

# UC-09-02: Loan Default Prediction
download_kaggle_dataset "$BASE/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-02" "yasserh/loan-default-dataset"

# UC-09-03: CFPB Complaints (debt collection subset)
download_kaggle_dataset "$BASE/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-03" "cfpb/us-consumer-finance-complaints"

# =============================================
# PILLAR C: Operations & Cost Optimization
# =============================================

# UC-11-01: Store Sales Time Series Forecasting
download_kaggle_competition "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-01" "store-sales-time-series-forecasting"

# UC-11-02: Time Series with Prophet
download_kaggle_dataset "$BASE/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-02" "arashnic/time-series-forecasting-with-prophet"

# UC-11-03: Bank Transactions (already downloaded)

# UC-12-01: PolyAI Banking Intent (GitHub)
download_git_repo "$BASE/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-01" "https://github.com/PolyAI-LDN/task-specific-datasets"

# UC-12-02: Twitter Customer Support (already downloaded)

# UC-12-03: Banking77 (GitHub - chatbot intents, proxy for speech)
download_git_repo "$BASE/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-03" "https://github.com/PolyAI-LDN/banking77"

# UC-13-01: Hourly Energy Consumption (proxy for cash demand)
download_kaggle_dataset "$BASE/C_Operations_and_Cost_Optimization/13_ATM_and_Cash_Operations/data/UC-13-01" "robikscube/hourly-energy-consumption"

# UC-13-02: Electricity Load Diagrams
download_kaggle_dataset "$BASE/C_Operations_and_Cost_Optimization/13_ATM_and_Cash_Operations/data/UC-13-02" "uciml/electric-power-consumption-data-set"

# UC-14-01: IBM HR Attrition
download_kaggle_dataset "$BASE/C_Operations_and_Cost_Optimization/14_Workforce_Management/data/UC-14-01" "pavansubhasht/ibm-hr-analytics-attrition-dataset"

# UC-14-03: Resume Dataset
download_kaggle_dataset "$BASE/C_Operations_and_Cost_Optimization/14_Workforce_Management/data/UC-14-03" "snehaanbhawal/resume-dataset"

# UC-15-01: Dispute/Chargeback (ecommerce data as proxy)
download_kaggle_dataset "$BASE/C_Operations_and_Cost_Optimization/15_Dispute_and_Chargeback_Operations/data/UC-15-01" "carrie1/ecommerce-data"

# =============================================
# PILLAR D: Data Governance
# =============================================

# UC-16-01: Bank Transactions (already downloaded)
# UC-16-03: German Credit (already downloaded)

# =============================================
# PILLAR E: Technology & IT
# =============================================

# UC-21-01: Loghub (incident logs)
download_kaggle_dataset "$BASE/E_Technology_IT_and_Resilience/21_IT_Operations_AIOps/data/UC-21-01" "omduggineni/loghub"

# UC-21-03: Loghub GitHub repo
download_git_repo "$BASE/E_Technology_IT_and_Resilience/21_IT_Operations_AIOps/data/UC-21-03" "https://github.com/logpai/loghub"

# =============================================
# PILLAR F: ESG & Regulatory
# =============================================

# UC-26-01: ESG Data
download_kaggle_dataset "$BASE/F_ESG_Regulatory_and_Strategic/26_ESG_Reporting_and_Disclosure/data/UC-26-01" "alistairking/esg-data"

# =============================================
# PILLAR G: Executive & Enterprise
# =============================================

# UC-32-01: FRED Rates (already downloaded)

# UC-34-01: World Bank indicators (wget CSV)
download_wget "$BASE/G_Executive_and_Enterprise_Decisioning/34_Enterprise_Risk_Management/data/UC-34-01" \
    "https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv" "world_gdp.csv"

# UC-31-01: World Bank portfolio data
download_wget "$BASE/G_Executive_and_Enterprise_Decisioning/31_Strategy_and_Board_Office/data/UC-31-01" \
    "https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv" "world_gdp.csv"

log ""
log "=========================================="
log "BANKING DATASET DOWNLOAD - COMPLETE"
log "=========================================="

# Print summary
log ""
log "SUMMARY: Data files per UC folder:"
for d in $(find "$BASE" -type d -name "UC-*" | sort); do
    count=$(find "$d" -maxdepth 2 -type f \( -name "*.csv" -o -name "*.json" -o -name "*.data" -o -name "*.gz" -o -name "*.parquet" \) 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        status="OK ($count files)"
    else
        status="EMPTY"
    fi
    echo "  $(basename $d): $status" | tee -a "$LOG"
done
