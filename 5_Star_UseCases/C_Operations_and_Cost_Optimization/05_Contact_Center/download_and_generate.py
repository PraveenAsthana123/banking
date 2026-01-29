#!/usr/bin/env python3
"""Department 5: Contact Center - Generate synthetic datasets for UC-CC-01 to UC-CC-07."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(5); random.seed(5)

def gen_uc_cc_01():
    """Call / Chat Volume Forecasting"""
    print("[UC-CC-01] Call Volume Forecasting")
    dates = pd.date_range("2020-01-01", periods=365*4, freq="D")
    rows = []
    for d in dates:
        base = 5000 + 2000 * np.sin(d.dayofyear / 365 * 2 * np.pi)
        dow_factor = 1.2 if d.dayofweek < 5 else 0.5
        calls = max(100, int(base * dow_factor + np.random.normal(0, 500)))
        chats = int(calls * np.random.uniform(0.3, 0.7))
        emails = int(calls * np.random.uniform(0.1, 0.3))
        avg_wait_s = max(5, int(np.random.normal(120, 60)))
        aht_s = max(60, int(np.random.normal(360, 120)))
        abandon_rate = round(np.random.beta(2, 10) * 100, 2)
        fcr_rate = round(np.random.beta(7, 3) * 100, 2)
        rows.append({"date": d.strftime("%Y-%m-%d"), "call_volume": calls, "chat_volume": chats,
            "email_volume": emails, "avg_wait_seconds": avg_wait_s, "avg_handle_time_seconds": aht_s,
            "abandon_rate_pct": abandon_rate, "fcr_rate_pct": fcr_rate,
            "day_of_week": d.day_name(), "is_holiday": int(d.month == 12 and d.day == 25)})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-CC-01", "csv", "call_volume_forecast_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_01_volume_forecast", len(df)

def gen_uc_cc_02():
    """Agent Assist Copilot"""
    print("[UC-CC-02] Agent Assist Copilot")
    faqs = [
        {"id": "FAQ-001", "topic": "Account Balance", "answer": "You can check your balance via mobile app, online banking, ATM, or by calling this number. For real-time balance, use the mobile app."},
        {"id": "FAQ-002", "topic": "Card Replacement", "answer": "Lost/stolen card: blocked immediately, replacement in 5-7 business days, express 2 days ($25). Damaged: free replacement in 7-10 days."},
        {"id": "FAQ-003", "topic": "Wire Transfer", "answer": "Domestic wire: $25 fee, same-day if before 3pm ET. International: $45, 1-3 business days. SWIFT code required for international."},
        {"id": "FAQ-004", "topic": "Dispute Resolution", "answer": "File dispute within 60 days of statement. Provisional credit in 10 business days. Investigation completes in 45-90 days. Track via online banking."},
    ]
    tp = os.path.join(DATA, "UC-CC-02", "text", "agent_faqs.json")
    with open(tp, "w") as f: json.dump(faqs, f, indent=2)
    n = 3000
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["Customer asking about balance", "Card lost what to do?",
            "How to send wire?", "Customer wants to dispute charge", "Account locked help"]) for _ in range(n)],
        "faq_retrieved": np.random.choice([f["id"] for f in faqs], n),
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "agent_adopted": np.random.choice([0, 1], n, p=[0.2, 0.8]),
        "handle_time_reduction_pct": np.round(np.random.uniform(0, 40, n), 1),
        "csat_score": np.random.choice([1,2,3,4,5], n, p=[0.03,0.07,0.15,0.4,0.35])})
    p = os.path.join(DATA, "UC-CC-02", "csv", "agent_assist_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_02_agent_assist", len(df)

def gen_uc_cc_03():
    """Next Best Offer / Action"""
    print("[UC-CC-03] Next Best Offer")
    n = 20000
    df = pd.DataFrame({
        "customer_id": [f"CUS-{i:06d}" for i in range(n)],
        "segment": np.random.choice(["Mass", "Affluent", "HNW", "Ultra-HNW"], n, p=[0.5,0.3,0.15,0.05]),
        "tenure_months": np.random.randint(1, 360, n),
        "products_held": np.random.randint(1, 8, n),
        "monthly_balance_avg": np.round(np.random.lognormal(8, 2, n), 2),
        "last_interaction_days": np.random.randint(0, 365, n),
        "churn_risk_score": np.round(np.random.beta(2, 5, n) * 100, 1),
        "cross_sell_propensity": np.round(np.random.beta(3, 4, n) * 100, 1),
        "recommended_offer": np.random.choice(["Credit Card Upgrade", "Personal Loan", "Investment Product",
            "Insurance", "Savings Account", "No Offer"], n),
        "offer_presented": np.random.choice([0, 1], n, p=[0.4, 0.6]),
        "offer_accepted": np.random.choice([0, 1], n, p=[0.7, 0.3]),
    })
    p = os.path.join(DATA, "UC-CC-03", "csv", "next_best_offer_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_03_nbo", len(df)

def gen_uc_cc_04():
    """Intelligent Call Routing"""
    print("[UC-CC-04] Intelligent Call Routing")
    n = 15000
    intents = ["balance_inquiry", "card_lost", "transfer_money", "dispute", "loan_inquiry",
               "account_closure", "fraud_report", "payment_issue", "general_inquiry", "complaint"]
    df = pd.DataFrame({
        "call_id": [f"CALL-{i:06d}" for i in range(n)],
        "detected_intent": np.random.choice(intents, n),
        "intent_confidence": np.round(np.random.beta(7, 2, n), 3),
        "customer_segment": np.random.choice(["Mass", "Affluent", "HNW"], n, p=[0.6,0.3,0.1]),
        "customer_sentiment": np.random.choice(["Positive", "Neutral", "Negative"], n, p=[0.2,0.5,0.3]),
        "routed_to": np.random.choice(["General", "Cards", "Loans", "Fraud", "Retention", "VIP"], n),
        "correct_routing": np.random.choice([0, 1], n, p=[0.12, 0.88]),
        "transfer_count": np.random.choice([0, 1, 2, 3], n, p=[0.6,0.25,0.1,0.05]),
        "resolution_time_s": np.random.randint(30, 1200, n),
        "csat": np.random.choice([1,2,3,4,5], n, p=[0.05,0.1,0.2,0.35,0.3]),
    })
    p = os.path.join(DATA, "UC-CC-04", "csv", "call_routing_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_04_routing", len(df)

def gen_uc_cc_05():
    """QA & Compliance Monitoring"""
    print("[UC-CC-05] QA & Compliance Monitoring")
    n = 8000
    df = pd.DataFrame({
        "interaction_id": [f"INT-{i:06d}" for i in range(n)],
        "channel": np.random.choice(["Phone", "Chat", "Email"], n, p=[0.5,0.35,0.15]),
        "agent_id": np.random.choice([f"AGT-{i:03d}" for i in range(200)], n),
        "qa_score": np.round(np.random.beta(7, 2, n) * 100, 1),
        "compliance_score": np.round(np.random.beta(8, 1.5, n) * 100, 1),
        "greeting_proper": np.random.choice([0, 1], n, p=[0.05, 0.95]),
        "identity_verified": np.random.choice([0, 1], n, p=[0.03, 0.97]),
        "disclosure_provided": np.random.choice([0, 1], n, p=[0.07, 0.93]),
        "customer_sentiment": np.random.choice(["Positive", "Neutral", "Negative"], n, p=[0.3,0.45,0.25]),
        "escalation_needed": np.random.choice([0, 1], n, p=[0.85, 0.15]),
        "violation_type": np.random.choice(["None", "Disclosure Miss", "Identity Skip", "Tone Issue", "Other"], n, p=[0.8,0.06,0.04,0.05,0.05]),
    })
    p = os.path.join(DATA, "UC-CC-05", "csv", "qa_compliance_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_05_qa", len(df)

def gen_uc_cc_06():
    """Speech-to-Text & Conversation Analytics"""
    print("[UC-CC-06] Speech Analytics")
    n = 5000
    df = pd.DataFrame({
        "call_id": [f"STT-{i:06d}" for i in range(n)],
        "duration_seconds": np.random.randint(30, 1800, n),
        "word_count": np.random.randint(50, 5000, n),
        "speaker_turns": np.random.randint(5, 100, n),
        "silence_pct": np.round(np.random.beta(2, 8, n) * 100, 1),
        "talk_over_count": np.random.randint(0, 20, n),
        "agent_talk_ratio": np.round(np.random.beta(5, 5, n), 2),
        "sentiment_score": np.round(np.random.normal(0, 0.5, n), 3),
        "key_phrases_count": np.random.randint(1, 30, n),
        "intent_detected": np.random.choice(["Inquiry", "Complaint", "Request", "Feedback", "Escalation"], n),
        "transcription_confidence": np.round(np.random.beta(8, 2, n), 3),
    })
    p = os.path.join(DATA, "UC-CC-06", "csv", "speech_analytics_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_06_speech", len(df)

def gen_uc_cc_07():
    """Retention / Escalation Decision Engine"""
    print("[UC-CC-07] Retention Decision Engine")
    n = 10000
    df = pd.DataFrame({
        "customer_id": [f"RET-{i:06d}" for i in range(n)],
        "churn_score": np.round(np.random.beta(3, 5, n) * 100, 1),
        "lifetime_value": np.round(np.random.lognormal(7, 1.5, n), 2),
        "tenure_months": np.random.randint(1, 360, n),
        "complaint_count_12m": np.random.randint(0, 10, n),
        "nps_score": np.random.randint(-100, 101, n),
        "products_held": np.random.randint(1, 8, n),
        "monthly_revenue": np.round(np.random.lognormal(4, 1.5, n), 2),
        "retention_offer": np.random.choice(["Fee Waiver", "Rate Discount", "Bonus Points", "Upgrade", "None"], n),
        "escalate_to_manager": np.random.choice([0, 1], n, p=[0.8, 0.2]),
        "outcome": np.random.choice(["Retained", "Churned", "Pending"], n, p=[0.6,0.25,0.15]),
    })
    p = os.path.join(DATA, "UC-CC-07", "csv", "retention_engine_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cc_07_retention", len(df)

def main():
    print("=" * 60); print("DEPT 5: Contact Center - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_cc_01, gen_uc_cc_02, gen_uc_cc_03, gen_uc_cc_04, gen_uc_cc_05, gen_uc_cc_06, gen_uc_cc_07]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 5")

if __name__ == "__main__": main()
