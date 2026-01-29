#!/usr/bin/env python3
"""Department 3: AML / Financial Crime - Generate synthetic datasets for UC-AML-01 to UC-AML-06."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(3); random.seed(3)

def gen_uc_aml_01():
    """AML Alert Prioritization"""
    print("[UC-AML-01] AML Alert Prioritization")
    n = 20000
    alert_id = [f"AML-ALT-{i:06d}" for i in range(n)]
    customer_risk = np.random.choice(["Low", "Medium", "High", "Very High"], n, p=[0.4,0.3,0.2,0.1])
    txn_amount = np.round(np.random.lognormal(8, 2, n), 2)
    txn_count_30d = np.random.randint(1, 500, n)
    country_risk = np.random.choice(["Low", "Medium", "High", "Sanctioned"], n, p=[0.5,0.25,0.15,0.1])
    structuring_flag = np.random.choice([0, 1], n, p=[0.85, 0.15])
    rapid_movement_flag = np.random.choice([0, 1], n, p=[0.8, 0.2])
    pep_flag = np.random.choice([0, 1], n, p=[0.95, 0.05])
    adverse_media_flag = np.random.choice([0, 1], n, p=[0.92, 0.08])
    alert_score = np.round(np.random.beta(2, 5, n) * 100, 1)
    disposition = np.random.choice(["Close - No Issue", "Escalate to L2", "File SAR", "Enhanced Due Diligence"], n, p=[0.5,0.25,0.15,0.1])
    investigation_hours = np.round(np.random.lognormal(1.5, 1, n), 1)
    is_true_positive = np.random.choice([0, 1], n, p=[0.7, 0.3])
    df = pd.DataFrame({"alert_id": alert_id, "customer_risk_rating": customer_risk,
        "transaction_amount": txn_amount, "txn_count_30d": txn_count_30d, "country_risk": country_risk,
        "structuring_flag": structuring_flag, "rapid_movement_flag": rapid_movement_flag,
        "pep_flag": pep_flag, "adverse_media_flag": adverse_media_flag, "alert_score": alert_score,
        "disposition": disposition, "investigation_hours": investigation_hours, "is_true_positive": is_true_positive})
    p = os.path.join(DATA, "UC-AML-01", "csv", "aml_alert_priority_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_aml_01_alert_priority", len(df)

def gen_uc_aml_02():
    """Network-Based Money Laundering Detection"""
    print("[UC-AML-02] Network Laundering Detection")
    n = 30000
    edge_id = [f"EDGE-{i:06d}" for i in range(n)]
    source = np.random.choice([f"ACC-{i:05d}" for i in range(5000)], n)
    target = np.random.choice([f"ACC-{i:05d}" for i in range(5000)], n)
    amount = np.round(np.random.lognormal(7, 2, n), 2)
    timestamp = pd.date_range("2023-01-01", periods=n, freq="3min").strftime("%Y-%m-%d %H:%M:%S")[:n]
    source_degree = np.random.randint(1, 100, n)
    target_degree = np.random.randint(1, 100, n)
    is_cross_border = np.random.choice([0, 1], n, p=[0.7, 0.3])
    is_round_amount = np.random.choice([0, 1], n, p=[0.85, 0.15])
    layer_depth = np.random.choice([1, 2, 3, 4, 5], n, p=[0.4, 0.25, 0.2, 0.1, 0.05])
    is_laundering = np.random.choice([0, 1], n, p=[0.95, 0.05])
    laundering_typology = np.where(is_laundering == 1,
        np.random.choice(["Layering", "Structuring", "Trade-Based", "Shell Company", "Crypto"], n), "None")
    df = pd.DataFrame({"edge_id": edge_id, "source_account": source, "target_account": target,
        "amount": amount, "timestamp": timestamp, "source_degree": source_degree,
        "target_degree": target_degree, "is_cross_border": is_cross_border,
        "is_round_amount": is_round_amount, "layer_depth": layer_depth,
        "is_laundering": is_laundering, "laundering_typology": laundering_typology})
    p = os.path.join(DATA, "UC-AML-02", "csv", "network_laundering_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_aml_02_network", len(df)

def gen_uc_aml_03():
    """SAR Narrative Drafting"""
    print("[UC-AML-03] SAR Narrative Drafting")
    n = 1500
    sar_templates = [
        "Subject {name} conducted {count} transactions totaling ${amount:,.2f} over {days} days. Transactions showed pattern consistent with {typology}. Multiple cash deposits below $10,000 reporting threshold observed. Funds subsequently wire-transferred to {country}.",
        "Investigation initiated based on adverse media screening. Subject {name} linked to {typology} activity per open-source intelligence. Account activity shows {count} high-risk transactions totaling ${amount:,.2f}. Unusual account behavior: {behavior}.",
        "Automated alert triggered for {name} due to rapid movement of funds. ${amount:,.2f} received from {count} different accounts within {days} days. Funds layered through multiple accounts before wire transfer to {country}.",
    ]
    rows = []
    for i in range(n):
        t = random.choice(sar_templates)
        narrative = t.format(name=f"Customer-{random.randint(1,9999):04d}", count=random.randint(5,100),
            amount=random.uniform(10000, 500000), days=random.randint(7, 90),
            typology=random.choice(["structuring", "layering", "trade-based ML", "shell company operations"]),
            country=random.choice(["Cayman Islands", "Panama", "Cyprus", "Hong Kong", "UAE"]),
            behavior=random.choice(["dormant account reactivated", "no legitimate business purpose", "multiple beneficiaries"]))
        rows.append({"sar_id": f"SAR-{i+1:05d}", "narrative": narrative,
            "risk_tier": random.choice(["High", "Critical"]),
            "word_count": len(narrative.split()),
            "auto_generated": random.choice([0, 1])})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-AML-03", "csv", "sar_narratives_unified.csv")
    df.to_csv(p, index=False)
    tp = os.path.join(DATA, "UC-AML-03", "text", "sar_samples.json")
    with open(tp, "w") as f: json.dump(rows[:20], f, indent=2, default=str)
    print(f"  {len(df)} rows"); return p, "uc_aml_03_sar_narratives", len(df)

def gen_uc_aml_04():
    """AML Investigator Copilot"""
    print("[UC-AML-04] AML Investigator Copilot")
    typologies = [
        {"id": "TYP-001", "title": "Trade-Based Money Laundering", "content": "Over/under-invoicing of goods. Multiple invoices for same shipment. Shell companies as intermediaries. Look for: invoice amount >> market value, circular trade patterns, no physical goods movement."},
        {"id": "TYP-002", "title": "Structuring / Smurfing", "content": "Multiple deposits below reporting threshold ($10K). Same beneficiary, different accounts/branches. Look for: deposits of $9,500-$9,999, same-day multiple branches, new account rapid deposits."},
        {"id": "TYP-003", "title": "Shell Company Layering", "content": "Funds routed through companies with no legitimate business. Multiple layers of transfers. Look for: nominee directors, registered agent addresses, no employees, circular fund flows."},
    ]
    tp = os.path.join(DATA, "UC-AML-04", "text", "aml_typologies.json")
    with open(tp, "w") as f: json.dump(typologies, f, indent=2)
    n = 2000
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["How to detect trade-based ML?", "Structuring red flags?",
            "Shell company indicators?", "Cross-border wire investigation steps?",
            "PEP enhanced due diligence requirements?"]) for _ in range(n)],
        "typology_retrieved": np.random.choice([t["id"] for t in typologies], n),
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.02,0.05,0.13,0.4,0.4]),
        "response_time_ms": np.random.randint(100, 3000, n)})
    p = os.path.join(DATA, "UC-AML-04", "csv", "aml_copilot_usage_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_aml_04_copilot", len(df)

def gen_uc_aml_05():
    """Alert Disposition Recommendation"""
    print("[UC-AML-05] Alert Disposition Recommendation")
    n = 15000
    alert_score = np.round(np.random.beta(2, 5, n) * 100, 1)
    customer_risk = np.random.choice(["Low", "Medium", "High", "Very High"], n, p=[0.4,0.3,0.2,0.1])
    txn_volume_flag = np.random.choice([0, 1], n, p=[0.75, 0.25])
    geo_risk_flag = np.random.choice([0, 1], n, p=[0.8, 0.2])
    pep_sanction_flag = np.random.choice([0, 1], n, p=[0.92, 0.08])
    prior_sars = np.random.choice([0, 1, 2, 3], n, p=[0.7, 0.15, 0.1, 0.05])
    recommended_action = np.random.choice(["Close", "Escalate L2", "File SAR", "EDD"], n, p=[0.45,0.25,0.2,0.1])
    analyst_agreed = np.random.choice([0, 1], n, p=[0.15, 0.85])
    final_disposition = np.where(analyst_agreed == 1, recommended_action,
        np.random.choice(["Close", "Escalate L2", "File SAR", "EDD"], n))
    df = pd.DataFrame({"alert_score": alert_score, "customer_risk": customer_risk,
        "txn_volume_flag": txn_volume_flag, "geo_risk_flag": geo_risk_flag,
        "pep_sanction_flag": pep_sanction_flag, "prior_sars": prior_sars,
        "recommended_action": recommended_action, "analyst_agreed": analyst_agreed,
        "final_disposition": final_disposition})
    p = os.path.join(DATA, "UC-AML-05", "csv", "disposition_recommendation_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_aml_05_disposition", len(df)

def gen_uc_aml_06():
    """AML Risk Exposure Dashboard"""
    print("[UC-AML-06] AML Risk Exposure Dashboard")
    n = 2400
    months = pd.date_range("2020-01-01", periods=48, freq="ME")
    regions = ["North America", "Europe", "Asia Pacific", "LATAM", "Middle East", "Africa"]
    rows = []
    for region in regions:
        for m in months:
            rows.append({"region": region, "month": m.strftime("%Y-%m"),
                "total_alerts": random.randint(100, 5000),
                "true_positives": random.randint(10, 500),
                "false_positives": random.randint(50, 4000),
                "sars_filed": random.randint(5, 200),
                "avg_investigation_hours": round(random.uniform(2, 20), 1),
                "backlog_count": random.randint(0, 1000),
                "regulatory_findings": random.randint(0, 5),
                "risk_exposure_m": round(random.uniform(10, 500), 2)})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-AML-06", "csv", "aml_risk_exposure_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_aml_06_exposure", len(df)

def main():
    print("=" * 60); print("DEPT 3: AML / Financial Crime - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_aml_01, gen_uc_aml_02, gen_uc_aml_03, gen_uc_aml_04, gen_uc_aml_05, gen_uc_aml_06]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 3")

if __name__ == "__main__": main()
