#!/usr/bin/env python3
"""Department 4: Collections & Recovery - Generate synthetic datasets for UC-COL-01 to UC-COL-06."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(4); random.seed(4)

def gen_uc_col_01():
    """Delinquency / Default Prediction"""
    print("[UC-COL-01] Delinquency / Default Prediction")
    n = 25000
    df = pd.DataFrame({
        "account_id": [f"COL-{i:06d}" for i in range(n)],
        "credit_score": np.random.randint(300, 850, n),
        "outstanding_balance": np.round(np.random.lognormal(8, 1.5, n), 2),
        "months_since_last_payment": np.random.randint(0, 12, n),
        "payment_to_balance_ratio": np.round(np.random.beta(3, 5, n), 4),
        "dpd_current": np.random.choice([0, 30, 60, 90, 120, 150, 180], n, p=[0.5,0.15,0.1,0.08,0.07,0.05,0.05]),
        "times_30dpd_12m": np.random.randint(0, 8, n),
        "times_60dpd_12m": np.random.randint(0, 5, n),
        "income_to_debt_ratio": np.round(np.random.uniform(0.1, 5.0, n), 2),
        "employment_status": np.random.choice(["Employed", "Self-Employed", "Unemployed", "Retired"], n, p=[0.6,0.2,0.1,0.1]),
        "loan_purpose": np.random.choice(["Mortgage", "Auto", "Personal", "Credit Card", "Student"], n),
        "loan_age_months": np.random.randint(1, 360, n),
        "will_default_6m": np.random.choice([0, 1], n, p=[0.82, 0.18]),
    })
    p = os.path.join(DATA, "UC-COL-01", "csv", "delinquency_prediction_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_col_01_delinquency", len(df)

def gen_uc_col_02():
    """Recovery Likelihood Scoring"""
    print("[UC-COL-02] Recovery Likelihood Scoring")
    n = 20000
    df = pd.DataFrame({
        "account_id": [f"REC-{i:06d}" for i in range(n)],
        "outstanding_balance": np.round(np.random.lognormal(8, 1.5, n), 2),
        "dpd_bucket": np.random.choice(["30", "60", "90", "120", "150", "180+"], n),
        "prior_promises_kept": np.random.randint(0, 10, n),
        "prior_promises_broken": np.random.randint(0, 8, n),
        "contact_attempts": np.random.randint(0, 30, n),
        "successful_contacts": np.random.randint(0, 15, n),
        "last_payment_amount": np.round(np.random.lognormal(5, 2, n), 2),
        "customer_tenure_months": np.random.randint(1, 240, n),
        "income_estimate": np.round(np.random.lognormal(10, 0.8, n), 2),
        "recovery_score": np.round(np.random.beta(3, 4, n) * 100, 1),
        "actual_recovered": np.random.choice([0, 1], n, p=[0.45, 0.55]),
    })
    p = os.path.join(DATA, "UC-COL-02", "csv", "recovery_scoring_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_col_02_recovery", len(df)

def gen_uc_col_03():
    """Best Next Action"""
    print("[UC-COL-03] Best Next Action")
    n = 15000
    df = pd.DataFrame({
        "account_id": [f"BNA-{i:06d}" for i in range(n)],
        "dpd_bucket": np.random.choice(["30", "60", "90", "120", "180+"], n),
        "recovery_score": np.round(np.random.beta(3, 4, n) * 100, 1),
        "preferred_channel": np.random.choice(["Phone", "SMS", "Email", "Letter", "App Push"], n),
        "best_time_to_contact": np.random.choice(["Morning", "Afternoon", "Evening"], n),
        "offer_type": np.random.choice(["Full Payment", "Settlement", "Payment Plan", "Forbearance", "Restructure"], n),
        "discount_pct": np.round(np.random.uniform(0, 30, n), 1),
        "recommended_action": np.random.choice(["Call", "SMS Reminder", "Settlement Offer", "Legal Notice", "Write-off Review"], n),
        "action_taken": np.random.choice(["Call", "SMS", "Email", "Skip", "Legal"], n),
        "outcome": np.random.choice(["Paid", "Promise to Pay", "No Contact", "Refused", "Partial Payment"], n, p=[0.2,0.25,0.3,0.15,0.1]),
    })
    p = os.path.join(DATA, "UC-COL-03", "csv", "best_next_action_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_col_03_next_action", len(df)

def gen_uc_col_04():
    """Collections Agent Assist Copilot"""
    print("[UC-COL-04] Collections Agent Copilot")
    scripts = [
        {"id": "SCR-001", "title": "Opening Script", "content": "Good [morning/afternoon], this is [Agent] from [Bank] Collections. I'm calling regarding your account ending in [XXXX]. We've noticed your payment of $[amount] due on [date] has not been received. I'd like to help find a solution."},
        {"id": "SCR-002", "title": "Hardship Script", "content": "I understand times can be difficult. We have several options: payment plan (up to 12 months), forbearance (3 months), or settlement. Which would you like to explore?"},
        {"id": "SCR-003", "title": "Compliance Warning", "content": "This is an attempt to collect a debt. Any information obtained will be used for that purpose. This communication is from a debt collector."},
    ]
    tp = os.path.join(DATA, "UC-COL-04", "text", "collection_scripts.json")
    with open(tp, "w") as f: json.dump(scripts, f, indent=2)
    n = 2000
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["Customer says they lost their job", "How to offer settlement?",
            "Customer requesting hardship", "Compliance requirements for calls?", "Payment plan options?"]) for _ in range(n)],
        "script_retrieved": np.random.choice([s["id"] for s in scripts], n),
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.02,0.05,0.13,0.4,0.4]),
        "response_time_ms": np.random.randint(80, 2000, n)})
    p = os.path.join(DATA, "UC-COL-04", "csv", "collection_copilot_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_col_04_copilot", len(df)

def gen_uc_col_05():
    """Roll-rate & Portfolio Monitoring"""
    print("[UC-COL-05] Roll-rate Portfolio Monitoring")
    months = pd.date_range("2020-01-01", periods=60, freq="ME")
    products = ["Mortgage", "Auto", "Personal", "Credit Card"]
    rows = []
    for prod in products:
        for m in months:
            current = random.randint(80, 95)
            rows.append({"product": prod, "month": m.strftime("%Y-%m"),
                "current_pct": current,
                "dpd30_pct": round(random.uniform(2, 8), 2),
                "dpd60_pct": round(random.uniform(1, 5), 2),
                "dpd90_pct": round(random.uniform(0.5, 3), 2),
                "dpd120_pct": round(random.uniform(0.3, 2), 2),
                "dpd180_plus_pct": round(random.uniform(0.1, 1.5), 2),
                "roll_rate_30_to_60": round(random.uniform(20, 50), 1),
                "roll_rate_60_to_90": round(random.uniform(30, 60), 1),
                "roll_rate_90_to_120": round(random.uniform(40, 70), 1),
                "cure_rate_30": round(random.uniform(30, 60), 1),
                "nco_rate_pct": round(random.uniform(0.1, 2), 2),
                "total_outstanding_m": round(random.uniform(100, 5000), 2)})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-COL-05", "csv", "roll_rate_monitoring_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_col_05_roll_rate", len(df)

def gen_uc_col_06():
    """Script Compliance & Sentiment Monitoring"""
    print("[UC-COL-06] Script Compliance & Sentiment")
    n = 5000
    df = pd.DataFrame({
        "call_id": [f"CALL-{i:06d}" for i in range(n)],
        "agent_id": np.random.choice([f"AGT-{i:03d}" for i in range(100)], n),
        "call_duration_seconds": np.random.randint(30, 1200, n),
        "compliance_score": np.round(np.random.beta(8, 2, n) * 100, 1),
        "mini_miranda_delivered": np.random.choice([0, 1], n, p=[0.05, 0.95]),
        "customer_sentiment": np.random.choice(["Positive", "Neutral", "Negative", "Hostile"], n, p=[0.15,0.35,0.35,0.15]),
        "agent_sentiment": np.random.choice(["Professional", "Empathetic", "Frustrated", "Neutral"], n, p=[0.4,0.3,0.05,0.25]),
        "escalation_triggered": np.random.choice([0, 1], n, p=[0.85, 0.15]),
        "promise_to_pay": np.random.choice([0, 1], n, p=[0.65, 0.35]),
        "call_outcome": np.random.choice(["Payment", "Promise", "No Contact", "Refused", "Callback"], n),
    })
    p = os.path.join(DATA, "UC-COL-06", "csv", "compliance_sentiment_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_col_06_compliance", len(df)

def main():
    print("=" * 60); print("DEPT 4: Collections & Recovery - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_col_01, gen_uc_col_02, gen_uc_col_03, gen_uc_col_04, gen_uc_col_05, gen_uc_col_06]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 4")

if __name__ == "__main__": main()
