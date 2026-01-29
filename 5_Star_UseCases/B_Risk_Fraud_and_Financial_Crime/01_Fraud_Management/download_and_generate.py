#!/usr/bin/env python3
"""Department 1: Fraud Management - Generate synthetic datasets for UC-FR-01 to UC-FR-07."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(1); random.seed(1)

def gen_uc_fr_01():
    """Real-Time Transaction Fraud Scoring"""
    print("[UC-FR-01] Real-Time Transaction Fraud Scoring")
    n = 50000
    amount = np.round(np.random.lognormal(4, 1.5, n), 2)
    hour = np.random.randint(0, 24, n)
    day_of_week = np.random.randint(0, 7, n)
    mcc = np.random.choice([5411, 5812, 5999, 4111, 5311, 5912, 7011, 5541, 5200, 6011], n)
    channel = np.random.choice(["POS", "Online", "ATM", "Mobile", "Contactless"], n)
    country = np.random.choice(["US", "UK", "CA", "DE", "FR", "BR", "IN", "NG", "RU", "CN"], n, p=[0.5,0.1,0.05,0.05,0.05,0.05,0.05,0.05,0.05,0.05])
    distance_from_home = np.round(np.random.lognormal(2, 2, n), 1)
    velocity_1h = np.random.randint(0, 20, n)
    velocity_24h = np.random.randint(0, 50, n)
    avg_txn_amount = np.round(amount * np.random.uniform(0.5, 2.0, n), 2)
    card_age_days = np.random.randint(1, 3650, n)
    is_fraud = np.random.choice([0, 1], n, p=[0.985, 0.015])
    fraud_score = np.round(np.where(is_fraud == 1, np.random.uniform(0.6, 1.0, n), np.random.uniform(0.0, 0.4, n)), 4)
    df = pd.DataFrame({"transaction_id": [f"TXN-{i:06d}" for i in range(n)], "amount": amount,
        "hour": hour, "day_of_week": day_of_week, "mcc_code": mcc, "channel": channel,
        "country": country, "distance_from_home_km": distance_from_home, "velocity_1h": velocity_1h,
        "velocity_24h": velocity_24h, "avg_txn_amount": avg_txn_amount, "card_age_days": card_age_days,
        "fraud_score": fraud_score, "is_fraud": is_fraud})
    p = os.path.join(DATA, "UC-FR-01", "csv", "fraud_scoring_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows"); return p, "uc_fr_01_fraud_scoring", len(df)

def gen_uc_fr_02():
    """Sequential / Behavioral Fraud Detection"""
    print("[UC-FR-02] Sequential Fraud Detection")
    n = 30000
    session_id = np.random.choice([f"SES-{i:05d}" for i in range(5000)], n)
    seq_num = np.random.randint(1, 20, n)
    amount = np.round(np.random.lognormal(3.5, 1.5, n), 2)
    time_since_last_s = np.round(np.random.lognormal(3, 2, n), 1)
    device_change = np.random.choice([0, 1], n, p=[0.9, 0.1])
    ip_change = np.random.choice([0, 1], n, p=[0.85, 0.15])
    geo_velocity_kmh = np.round(np.random.lognormal(2, 2, n), 1)
    merchant_category = np.random.choice(["Retail", "Travel", "Food", "Electronics", "ATM", "Transfer"], n)
    is_fraud_sequence = np.random.choice([0, 1], n, p=[0.98, 0.02])
    df = pd.DataFrame({"session_id": session_id, "sequence_num": seq_num, "amount": amount,
        "time_since_last_seconds": time_since_last_s, "device_change": device_change,
        "ip_change": ip_change, "geo_velocity_kmh": geo_velocity_kmh,
        "merchant_category": merchant_category, "is_fraud_sequence": is_fraud_sequence})
    p = os.path.join(DATA, "UC-FR-02", "csv", "sequential_fraud_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows"); return p, "uc_fr_02_sequential_fraud", len(df)

def gen_uc_fr_03():
    """Merchant / Device Fraud Pattern Detection"""
    print("[UC-FR-03] Merchant/Device Fraud Patterns")
    n = 20000
    entity_id = np.random.choice([f"MER-{i:05d}" for i in range(2000)] + [f"DEV-{i:05d}" for i in range(3000)], n)
    entity_type = np.where([e.startswith("MER") for e in entity_id], "Merchant", "Device")
    total_txns = np.random.randint(10, 10000, n)
    total_amount = np.round(np.random.lognormal(8, 2, n), 2)
    fraud_txns = np.random.randint(0, np.maximum(1, total_txns // 10), n)
    fraud_rate = np.round(fraud_txns / total_txns * 100, 2)
    avg_txn_amount = np.round(total_amount / total_txns, 2)
    unique_cards = np.random.randint(1, 5000, n)
    unique_countries = np.random.randint(1, 30, n)
    chargeback_rate = np.round(np.random.beta(1, 20, n) * 100, 3)
    risk_score = np.round(np.random.uniform(0, 100, n), 1)
    is_flagged = (risk_score > 80).astype(int)
    df = pd.DataFrame({"entity_id": entity_id, "entity_type": entity_type, "total_transactions": total_txns,
        "total_amount": total_amount, "fraud_transactions": fraud_txns, "fraud_rate_pct": fraud_rate,
        "avg_transaction_amount": avg_txn_amount, "unique_cards": unique_cards,
        "unique_countries": unique_countries, "chargeback_rate_pct": chargeback_rate,
        "risk_score": risk_score, "is_flagged": is_flagged})
    p = os.path.join(DATA, "UC-FR-03", "csv", "merchant_device_fraud_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows"); return p, "uc_fr_03_merchant_device", len(df)

def gen_uc_fr_04():
    """Fraud Investigation Copilot (RAG)"""
    print("[UC-FR-04] Fraud Investigation Copilot")
    cases = [
        {"id": "CASE-001", "text": "Customer reported unauthorized online purchase of $2,345 from electronics merchant. IP trace shows access from Nigeria while customer confirmed US location. Card was not reported lost."},
        {"id": "CASE-002", "text": "Multiple ATM withdrawals totaling $4,800 in 3 hours across 5 different ATMs. Customer's card was cloned at a gas station POS terminal. Skimming device recovered."},
        {"id": "CASE-003", "text": "Account takeover via SIM swap. Fraudster changed password, email, and phone number. Three wire transfers totaling $15,000 to offshore accounts within 2 hours."},
    ]
    tp = os.path.join(DATA, "UC-FR-04", "text", "investigation_cases.json")
    with open(tp, "w") as f: json.dump(cases, f, indent=2)
    n = 2000
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["How to investigate card-not-present fraud?", "SIM swap investigation steps?",
            "ATM skimming evidence collection?", "Wire fraud recovery process?", "Account takeover indicators?"]) for _ in range(n)],
        "relevance_score": np.round(np.random.uniform(0.4, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.03,0.07,0.15,0.4,0.35]),
        "response_time_ms": np.random.randint(100, 3000, n)})
    p = os.path.join(DATA, "UC-FR-04", "csv", "fraud_copilot_usage_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows + {len(cases)} cases"); return p, "uc_fr_04_copilot_usage", len(df)

def gen_uc_fr_05():
    """Fraud Risk Exposure Monitoring"""
    print("[UC-FR-05] Fraud Risk Exposure Monitoring")
    n = 3600  # daily for ~10 years
    dates = pd.date_range("2015-01-01", periods=n, freq="D")
    fraud_count = np.random.poisson(50, n)
    fraud_amount = np.round(np.random.lognormal(10, 1, n), 2)
    total_txn_count = np.random.randint(100000, 500000, n)
    total_txn_amount = np.round(np.random.lognormal(15, 0.5, n), 2)
    fraud_rate_bps = np.round(fraud_amount / total_txn_amount * 10000, 2)
    channel_online_pct = np.round(np.random.uniform(30, 70, n), 1)
    channel_pos_pct = np.round(100 - channel_online_pct - np.random.uniform(5, 20, n), 1)
    loss_amount = np.round(fraud_amount * np.random.uniform(0.3, 0.8, n), 2)
    recovery_amount = np.round(fraud_amount * np.random.uniform(0.05, 0.3, n), 2)
    net_loss = np.round(loss_amount - recovery_amount, 2)
    df = pd.DataFrame({"date": dates.strftime("%Y-%m-%d"), "fraud_count": fraud_count,
        "fraud_amount": fraud_amount, "total_txn_count": total_txn_count,
        "total_txn_amount": total_txn_amount, "fraud_rate_bps": fraud_rate_bps,
        "channel_online_pct": channel_online_pct, "channel_pos_pct": channel_pos_pct,
        "gross_loss": loss_amount, "recovery_amount": recovery_amount, "net_loss": net_loss})
    p = os.path.join(DATA, "UC-FR-05", "csv", "fraud_exposure_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows"); return p, "uc_fr_05_fraud_exposure", len(df)

def gen_uc_fr_06():
    """Fraud Decision Optimization (Block / Review / Allow)"""
    print("[UC-FR-06] Fraud Decision Optimization")
    n = 30000
    fraud_score = np.round(np.random.beta(2, 5, n), 4)
    amount = np.round(np.random.lognormal(4, 1.5, n), 2)
    channel = np.random.choice(["POS", "Online", "ATM", "Mobile"], n)
    velocity_flag = np.random.choice([0, 1], n, p=[0.85, 0.15])
    geo_flag = np.random.choice([0, 1], n, p=[0.9, 0.1])
    device_flag = np.random.choice([0, 1], n, p=[0.92, 0.08])
    decision = np.where(fraud_score > 0.7, "Block", np.where(fraud_score > 0.3, "Review", "Allow"))
    actual_fraud = np.random.choice([0, 1], n, p=[0.985, 0.015])
    false_positive = ((decision == "Block") & (actual_fraud == 0)).astype(int)
    customer_impact = np.where(false_positive == 1, "High", np.where(decision == "Review", "Medium", "Low"))
    df = pd.DataFrame({"fraud_score": fraud_score, "amount": amount, "channel": channel,
        "velocity_flag": velocity_flag, "geo_anomaly_flag": geo_flag, "device_anomaly_flag": device_flag,
        "decision": decision, "actual_fraud": actual_fraud, "false_positive": false_positive,
        "customer_impact": customer_impact})
    p = os.path.join(DATA, "UC-FR-06", "csv", "fraud_decision_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows"); return p, "uc_fr_06_fraud_decision", len(df)

def gen_uc_fr_07():
    """False Positive Reduction Engine"""
    print("[UC-FR-07] False Positive Reduction")
    n = 40000
    alert_id = [f"ALT-{i:06d}" for i in range(n)]
    fraud_score = np.round(np.random.beta(2, 5, n), 4)
    amount = np.round(np.random.lognormal(4, 1.5, n), 2)
    customer_tenure_years = np.round(np.random.uniform(0.1, 30, n), 1)
    historical_fraud_count = np.random.choice([0, 0, 0, 0, 1, 2, 3], n)
    avg_monthly_spend = np.round(np.random.lognormal(6, 1, n), 2)
    merchant_risk_score = np.round(np.random.uniform(0, 100, n), 1)
    is_true_fraud = np.random.choice([0, 1], n, p=[0.95, 0.05])
    model_v1_decision = np.where(fraud_score > 0.3, "Alert", "Pass")
    model_v2_decision = np.where(fraud_score > 0.5, "Alert", "Pass")
    v1_fp = ((model_v1_decision == "Alert") & (is_true_fraud == 0)).astype(int)
    v2_fp = ((model_v2_decision == "Alert") & (is_true_fraud == 0)).astype(int)
    df = pd.DataFrame({"alert_id": alert_id, "fraud_score": fraud_score, "amount": amount,
        "customer_tenure_years": customer_tenure_years, "historical_fraud_count": historical_fraud_count,
        "avg_monthly_spend": avg_monthly_spend, "merchant_risk_score": merchant_risk_score,
        "is_true_fraud": is_true_fraud, "model_v1_decision": model_v1_decision,
        "model_v2_decision": model_v2_decision, "v1_false_positive": v1_fp, "v2_false_positive": v2_fp})
    p = os.path.join(DATA, "UC-FR-07", "csv", "false_positive_unified.csv")
    df.to_csv(p, index=False)
    print(f"  {len(df)} rows"); return p, "uc_fr_07_false_positive", len(df)

def main():
    print("=" * 60); print("DEPT 1: Fraud Management - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_fr_01, gen_uc_fr_02, gen_uc_fr_03, gen_uc_fr_04, gen_uc_fr_05, gen_uc_fr_06, gen_uc_fr_07]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 1")

if __name__ == "__main__": main()
