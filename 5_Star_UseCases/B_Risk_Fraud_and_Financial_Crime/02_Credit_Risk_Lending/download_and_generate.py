#!/usr/bin/env python3
"""Department 2: Credit Risk & Lending - Generate synthetic datasets for UC-CR-01 to UC-CR-07."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(2); random.seed(2)

def gen_uc_cr_01():
    """Credit Scoring (PD Model)"""
    print("[UC-CR-01] Credit Scoring (PD Model)")
    n = 30000
    age = np.random.randint(21, 70, n)
    annual_income = np.round(np.random.lognormal(10.5, 0.7, n), 2)
    employment_years = np.random.randint(0, 40, n)
    home_ownership = np.random.choice(["Own", "Mortgage", "Rent"], n, p=[0.2, 0.45, 0.35])
    loan_amount = np.round(np.random.lognormal(9.5, 0.8, n), 2)
    interest_rate = np.round(np.random.uniform(3, 25, n), 2)
    dti = np.round(np.random.uniform(0, 50, n), 2)
    credit_score = np.random.randint(300, 850, n)
    delinquencies_2yr = np.random.choice(range(10), n, p=[0.6,0.15,0.1,0.05,0.03,0.02,0.02,0.01,0.01,0.01])
    open_accounts = np.random.randint(1, 30, n)
    revolving_util = np.round(np.random.beta(3, 3, n) * 100, 1)
    total_credit_lines = np.random.randint(1, 50, n)
    pub_records = np.random.choice([0, 0, 0, 0, 1, 2], n)
    purpose = np.random.choice(["Debt Consolidation", "Home Improvement", "Business", "Medical", "Auto", "Education", "Other"], n)
    default = np.random.choice([0, 1], n, p=[0.85, 0.15])
    df = pd.DataFrame({"applicant_id": [f"APP-{i:06d}" for i in range(n)], "age": age,
        "annual_income": annual_income, "employment_years": employment_years,
        "home_ownership": home_ownership, "loan_amount": loan_amount, "interest_rate": interest_rate,
        "dti": dti, "credit_score": credit_score, "delinquencies_2yr": delinquencies_2yr,
        "open_accounts": open_accounts, "revolving_utilization_pct": revolving_util,
        "total_credit_lines": total_credit_lines, "public_records": pub_records,
        "loan_purpose": purpose, "default": default})
    p = os.path.join(DATA, "UC-CR-01", "csv", "credit_scoring_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_01_credit_scoring", len(df)

def gen_uc_cr_02():
    """Alternative Data Credit Scoring"""
    print("[UC-CR-02] Alternative Data Credit Scoring")
    n = 20000
    applicant_id = [f"ALT-{i:06d}" for i in range(n)]
    bureau_score = np.random.randint(300, 850, n)
    mobile_txn_count_30d = np.random.randint(0, 500, n)
    utility_payment_ontime_pct = np.round(np.random.beta(8, 2, n) * 100, 1)
    social_media_score = np.round(np.random.uniform(0, 100, n), 1)
    ecommerce_spend_30d = np.round(np.random.lognormal(5, 1.5, n), 2)
    rent_payment_history = np.random.choice(["Excellent", "Good", "Fair", "Poor", "No Data"], n, p=[0.3,0.3,0.2,0.1,0.1])
    device_age_months = np.random.randint(1, 60, n)
    location_stability_score = np.round(np.random.beta(5, 2, n) * 100, 1)
    income_proxy = np.round(np.random.lognormal(10, 0.8, n), 2)
    default = np.random.choice([0, 1], n, p=[0.88, 0.12])
    df = pd.DataFrame({"applicant_id": applicant_id, "bureau_score": bureau_score,
        "mobile_txn_count_30d": mobile_txn_count_30d, "utility_ontime_pct": utility_payment_ontime_pct,
        "social_media_score": social_media_score, "ecommerce_spend_30d": ecommerce_spend_30d,
        "rent_payment_history": rent_payment_history, "device_age_months": device_age_months,
        "location_stability_score": location_stability_score, "income_proxy": income_proxy,
        "default": default})
    p = os.path.join(DATA, "UC-CR-02", "csv", "alt_credit_scoring_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_02_alt_scoring", len(df)

def gen_uc_cr_03():
    """Credit Approval Optimization"""
    print("[UC-CR-03] Credit Approval Optimization")
    n = 25000
    credit_score = np.random.randint(300, 850, n)
    dti = np.round(np.random.uniform(0, 60, n), 2)
    loan_amount = np.round(np.random.lognormal(9.5, 0.8, n), 2)
    income = np.round(np.random.lognormal(10.5, 0.7, n), 2)
    lti = np.round(loan_amount / income, 2)
    employment_stable = np.random.choice([0, 1], n, p=[0.3, 0.7])
    pd_score = np.round(np.random.beta(2, 8, n), 4)
    policy_pass = ((credit_score > 620) & (dti < 43)).astype(int)
    model_approve = (pd_score < 0.15).astype(int)
    final_decision = np.where((policy_pass == 1) & (model_approve == 1), "Approve",
                     np.where((policy_pass == 1) | (model_approve == 1), "Manual Review", "Decline"))
    approved_rate = np.round(np.random.uniform(3, 25, n), 2)
    expected_loss = np.round(pd_score * loan_amount * np.random.uniform(0.3, 0.6, n), 2)
    df = pd.DataFrame({"credit_score": credit_score, "dti": dti, "loan_amount": loan_amount,
        "annual_income": income, "lti_ratio": lti, "employment_stable": employment_stable,
        "pd_score": pd_score, "policy_pass": policy_pass, "model_approve": model_approve,
        "final_decision": final_decision, "approved_rate_pct": approved_rate, "expected_loss": expected_loss})
    p = os.path.join(DATA, "UC-CR-03", "csv", "credit_approval_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_03_approval", len(df)

def gen_uc_cr_04():
    """Risk-Based Loan Pricing"""
    print("[UC-CR-04] Risk-Based Loan Pricing")
    n = 20000
    risk_grade = np.random.choice(["A", "B", "C", "D", "E", "F", "G"], n, p=[0.15,0.2,0.2,0.15,0.12,0.1,0.08])
    pd_score = np.round(np.random.beta(2, 8, n), 4)
    lgd = np.round(np.random.beta(3, 7, n), 4)
    ead = np.round(np.random.lognormal(9.5, 0.8, n), 2)
    expected_loss = np.round(pd_score * lgd * ead, 2)
    base_rate = np.round(np.random.uniform(3, 5, n), 2)
    risk_premium = np.round(pd_score * 20, 2)
    offered_rate = np.round(base_rate + risk_premium, 2)
    competitor_rate = np.round(offered_rate + np.random.normal(0, 1, n), 2)
    margin = np.round(offered_rate - base_rate - expected_loss / ead * 100, 2)
    loan_taken = np.random.choice([0, 1], n, p=[0.35, 0.65])
    df = pd.DataFrame({"risk_grade": risk_grade, "pd_score": pd_score, "lgd": lgd,
        "ead": ead, "expected_loss": expected_loss, "base_rate": base_rate,
        "risk_premium": risk_premium, "offered_rate_pct": offered_rate,
        "competitor_rate_pct": competitor_rate, "margin_bps": margin, "loan_taken": loan_taken})
    p = os.path.join(DATA, "UC-CR-04", "csv", "risk_pricing_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_04_pricing", len(df)

def gen_uc_cr_05():
    """Underwriter Assist Copilot"""
    print("[UC-CR-05] Underwriter Assist Copilot")
    policies = [
        {"id": "CP-001", "title": "DTI Policy", "content": "Maximum DTI ratio 43% for conforming loans. Exception up to 50% with compensating factors: 6+ months reserves, FICO 720+, LTV <80%."},
        {"id": "CP-002", "title": "Employment Verification", "content": "2 years continuous employment required. Self-employed: 2 years tax returns. Gaps >3 months require written explanation."},
        {"id": "CP-003", "title": "Collateral Requirements", "content": "Appraisal required for all secured lending >$250K. LTV limits: Primary residence 95%, Investment 80%, Commercial 75%."},
    ]
    tp = os.path.join(DATA, "UC-CR-05", "text", "credit_policies.json")
    with open(tp, "w") as f: json.dump(policies, f, indent=2)
    n = 1500
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["What is max DTI?", "Employment gap rules?", "LTV for investment?",
            "Compensating factors?", "Self-employed docs needed?"]) for _ in range(n)],
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.02,0.05,0.13,0.4,0.4]),
        "response_time_ms": np.random.randint(80, 2000, n)})
    p = os.path.join(DATA, "UC-CR-05", "csv", "underwriter_copilot_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_05_copilot", len(df)

def gen_uc_cr_06():
    """Credit Portfolio Risk Monitoring"""
    print("[UC-CR-06] Credit Portfolio Risk Monitoring")
    n = 2400
    segments = ["Prime", "Near-Prime", "Subprime", "Super-Prime"]
    products = ["Mortgage", "Auto", "Personal", "Credit Card", "HELOC", "Student"]
    months = pd.date_range("2020-01-01", periods=48, freq="ME")
    rows = []
    for seg in segments:
        for prod in products:
            for m in months:
                rows.append({"segment": seg, "product": prod, "month": m.strftime("%Y-%m"),
                    "outstanding_balance_m": round(random.uniform(100, 5000), 2),
                    "dpd_30_pct": round(random.uniform(0.5, 8), 2),
                    "dpd_60_pct": round(random.uniform(0.2, 4), 2),
                    "dpd_90_pct": round(random.uniform(0.1, 3), 2),
                    "nco_rate_pct": round(random.uniform(0.05, 2), 2),
                    "provision_coverage_pct": round(random.uniform(80, 150), 1),
                    "weighted_avg_fico": random.randint(620, 780)})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-CR-06", "csv", "portfolio_monitoring_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_06_portfolio", len(df)

def gen_uc_cr_07():
    """Credit Portfolio Strategy Simulator"""
    print("[UC-CR-07] Credit Portfolio Strategy Simulator")
    n = 2000
    scenario = np.random.choice(["Base", "Optimistic", "Stress", "Severe Stress"], n)
    segment = np.random.choice(["Prime", "Near-Prime", "Subprime", "Super-Prime"], n)
    product = np.random.choice(["Mortgage", "Auto", "Personal", "Cards"], n)
    origination_volume_m = np.round(np.random.lognormal(6, 1, n), 2)
    expected_pd = np.round(np.random.beta(2, 10, n), 4)
    expected_lgd = np.round(np.random.beta(3, 7, n), 4)
    expected_loss_m = np.round(origination_volume_m * expected_pd * expected_lgd, 2)
    net_interest_margin = np.round(np.random.uniform(1, 5, n), 2)
    risk_weighted_assets_m = np.round(origination_volume_m * np.random.uniform(0.2, 1.5, n), 2)
    roe_pct = np.round(np.random.normal(12, 5, n), 2)
    capital_required_m = np.round(risk_weighted_assets_m * np.random.uniform(0.08, 0.15, n), 2)
    df = pd.DataFrame({"scenario": scenario, "segment": segment, "product": product,
        "origination_volume_m": origination_volume_m, "expected_pd": expected_pd,
        "expected_lgd": expected_lgd, "expected_loss_m": expected_loss_m,
        "net_interest_margin_pct": net_interest_margin, "rwa_m": risk_weighted_assets_m,
        "roe_pct": roe_pct, "capital_required_m": capital_required_m})
    p = os.path.join(DATA, "UC-CR-07", "csv", "portfolio_simulator_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_cr_07_simulator", len(df)

def main():
    print("=" * 60); print("DEPT 2: Credit Risk & Lending - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_cr_01, gen_uc_cr_02, gen_uc_cr_03, gen_uc_cr_04, gen_uc_cr_05, gen_uc_cr_06, gen_uc_cr_07]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 2")

if __name__ == "__main__": main()
