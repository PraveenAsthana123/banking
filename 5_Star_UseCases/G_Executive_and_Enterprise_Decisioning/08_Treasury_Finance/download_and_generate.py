#!/usr/bin/env python3
"""Department 8: Treasury & Finance - Generate synthetic datasets for UC-TF-01 to UC-TF-07."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(8); random.seed(8)

def gen_uc_tf_01():
    """Liquidity Forecasting & ALM Optimization"""
    print("[UC-TF-01] Liquidity Forecasting")
    dates = pd.date_range("2018-01-01", periods=365*6, freq="D")
    rows = []
    for d in dates:
        rows.append({"date": d.strftime("%Y-%m-%d"),
            "total_deposits_m": round(random.uniform(50000, 120000), 2),
            "total_loans_m": round(random.uniform(40000, 100000), 2),
            "net_liquidity_m": round(random.uniform(5000, 30000), 2),
            "inflow_m": round(random.uniform(1000, 8000), 2),
            "outflow_m": round(random.uniform(800, 7500), 2),
            "overnight_rate_pct": round(random.uniform(0.1, 6.0), 3),
            "lcr_pct": round(random.uniform(100, 180), 1),
            "nsfr_pct": round(random.uniform(100, 150), 1),
            "hqla_m": round(random.uniform(10000, 40000), 2),
            "stress_buffer_m": round(random.uniform(2000, 10000), 2)})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-TF-01", "csv", "liquidity_forecast_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_01_liquidity", len(df)

def gen_uc_tf_02():
    """Capital Allocation Optimization"""
    print("[UC-TF-02] Capital Allocation")
    n = 2000
    df = pd.DataFrame({
        "business_unit": np.random.choice(["Retail", "Corporate", "Investment", "Wealth", "Insurance", "Digital"], n),
        "quarter": np.random.choice([f"{y}Q{q}" for y in range(2020, 2026) for q in range(1, 5)], n),
        "allocated_capital_m": np.round(np.random.lognormal(7, 1, n), 2),
        "risk_weighted_assets_m": np.round(np.random.lognormal(8, 1, n), 2),
        "revenue_m": np.round(np.random.lognormal(6, 1.5, n), 2),
        "net_income_m": np.round(np.random.normal(50, 30, n), 2),
        "roe_pct": np.round(np.random.normal(12, 5, n), 2),
        "raroc_pct": np.round(np.random.normal(15, 6, n), 2),
        "economic_capital_m": np.round(np.random.lognormal(7, 0.8, n), 2),
        "excess_capital_m": np.round(np.random.normal(20, 15, n), 2),
        "recommended_action": np.random.choice(["Increase", "Maintain", "Reduce", "Rebalance"], n),
    })
    p = os.path.join(DATA, "UC-TF-02", "csv", "capital_allocation_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_02_capital", len(df)

def gen_uc_tf_03():
    """Regulatory Ratio Monitoring"""
    print("[UC-TF-03] Regulatory Ratio Monitoring")
    dates = pd.date_range("2020-01-01", periods=60, freq="ME")
    rows = []
    for d in dates:
        rows.append({"month": d.strftime("%Y-%m"),
            "cet1_ratio_pct": round(random.uniform(10, 16), 2),
            "tier1_ratio_pct": round(random.uniform(11, 17), 2),
            "total_capital_ratio_pct": round(random.uniform(13, 20), 2),
            "leverage_ratio_pct": round(random.uniform(4, 8), 2),
            "lcr_pct": round(random.uniform(110, 170), 1),
            "nsfr_pct": round(random.uniform(105, 140), 1),
            "large_exposure_pct": round(random.uniform(5, 20), 1),
            "rwa_m": round(random.uniform(50000, 150000), 2),
            "breach_flag": int(random.random() < 0.05),
            "amber_flag": int(random.random() < 0.15),
            "regulatory_minimum_cet1": 4.5,
            "buffer_over_minimum_pct": round(random.uniform(3, 10), 2)})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-TF-03", "csv", "regulatory_ratios_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_03_ratios", len(df)

def gen_uc_tf_04():
    """Stress Testing & Scenario Simulation"""
    print("[UC-TF-04] Stress Testing")
    n = 3000
    df = pd.DataFrame({
        "scenario_id": [f"STRESS-{i:04d}" for i in range(n)],
        "scenario_type": np.random.choice(["Base", "Adverse", "Severely Adverse", "Climate", "Pandemic", "Geopolitical"], n),
        "gdp_shock_pct": np.round(np.random.normal(-2, 3, n), 2),
        "unemployment_shock_pct": np.round(np.random.normal(2, 2, n), 2),
        "interest_rate_shock_bps": np.round(np.random.normal(0, 200, n), 0),
        "equity_shock_pct": np.round(np.random.normal(-15, 15, n), 2),
        "credit_loss_m": np.round(np.random.lognormal(7, 1.5, n), 2),
        "market_loss_m": np.round(np.random.lognormal(6, 2, n), 2),
        "operational_loss_m": np.round(np.random.lognormal(5, 1.5, n), 2),
        "total_loss_m": np.round(np.random.lognormal(8, 1, n), 2),
        "post_stress_cet1_pct": np.round(np.random.uniform(5, 14, n), 2),
        "passes_threshold": np.random.choice([0, 1], n, p=[0.15, 0.85]),
    })
    p = os.path.join(DATA, "UC-TF-04", "csv", "stress_testing_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_04_stress", len(df)

def gen_uc_tf_05():
    """Treasury Policy Copilot"""
    print("[UC-TF-05] Treasury Policy Copilot")
    policies = [
        {"id": "TP-001", "title": "Liquidity Risk Policy", "content": "Maintain LCR >110%, NSFR >100%. HQLA minimum 15% of total assets. Stress test liquidity monthly. Contingency Funding Plan reviewed quarterly. Board reporting: monthly LCR, quarterly NSFR."},
        {"id": "TP-002", "title": "Interest Rate Risk", "content": "NII sensitivity limits: +/-100bps parallel shift <10% of NII. EVE sensitivity: <15% of Tier 1 capital. Hedging instruments: IRS, caps, floors. Duration gap target: <2 years."},
        {"id": "TP-003", "title": "Capital Management", "content": "CET1 target: 12%. Total Capital target: 16%. ICAAP submission annually. Dividend policy: max 50% of net income when CET1 >11%. Capital conservation buffer: 2.5%."},
    ]
    tp = os.path.join(DATA, "UC-TF-05", "text", "treasury_policies.json")
    with open(tp, "w") as f: json.dump(policies, f, indent=2)
    n = 1500
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["What is LCR minimum?", "Interest rate risk limits?",
            "Capital dividend policy?", "Stress test frequency?", "HQLA requirement?"]) for _ in range(n)],
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.02,0.05,0.13,0.4,0.4]),
        "response_time_ms": np.random.randint(80, 2000, n)})
    p = os.path.join(DATA, "UC-TF-05", "csv", "treasury_copilot_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_05_copilot", len(df)

def gen_uc_tf_06():
    """Funding Mix Decision Engine"""
    print("[UC-TF-06] Funding Mix Decision")
    n = 2000
    df = pd.DataFrame({
        "decision_id": [f"FND-{i:04d}" for i in range(n)],
        "funding_need_m": np.round(np.random.lognormal(7, 1, n), 2),
        "tenor_months": np.random.choice([1, 3, 6, 12, 24, 36, 60, 120], n),
        "deposits_rate_pct": np.round(np.random.uniform(1, 5, n), 3),
        "wholesale_rate_pct": np.round(np.random.uniform(2, 6, n), 3),
        "repo_rate_pct": np.round(np.random.uniform(0.5, 4, n), 3),
        "bond_rate_pct": np.round(np.random.uniform(3, 7, n), 3),
        "recommended_mix_deposits_pct": np.round(np.random.uniform(40, 80, n), 1),
        "recommended_mix_wholesale_pct": np.round(np.random.uniform(10, 30, n), 1),
        "recommended_mix_repo_pct": np.round(np.random.uniform(5, 20, n), 1),
        "blended_cost_pct": np.round(np.random.uniform(1.5, 4.5, n), 3),
        "nsfr_impact_pct": np.round(np.random.normal(0, 2, n), 2),
    })
    p = os.path.join(DATA, "UC-TF-06", "csv", "funding_mix_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_06_funding_mix", len(df)

def gen_uc_tf_07():
    """Cash Pooling & Liquidity Sweeping"""
    print("[UC-TF-07] Cash Pooling")
    n = 10000
    df = pd.DataFrame({
        "sweep_id": [f"SWP-{i:06d}" for i in range(n)],
        "entity": np.random.choice([f"ENT-{i:03d}" for i in range(50)], n),
        "date": np.random.choice(pd.date_range("2023-01-01", periods=365, freq="D").strftime("%Y-%m-%d"), n),
        "opening_balance_m": np.round(np.random.normal(50, 30, n), 2),
        "target_balance_m": np.round(np.random.uniform(5, 20, n), 2),
        "sweep_amount_m": np.round(np.random.normal(20, 15, n), 2),
        "sweep_direction": np.random.choice(["To Pool", "From Pool"], n, p=[0.55, 0.45]),
        "interest_saving_daily": np.round(np.abs(np.random.normal(0.5, 0.3, n)), 4),
        "fx_conversion_needed": np.random.choice([0, 1], n, p=[0.7, 0.3]),
        "execution_status": np.random.choice(["Executed", "Pending", "Failed", "Skipped"], n, p=[0.85,0.05,0.03,0.07]),
    })
    p = os.path.join(DATA, "UC-TF-07", "csv", "cash_pooling_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_tf_07_cash_pool", len(df)

def main():
    print("=" * 60); print("DEPT 8: Treasury & Finance - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_tf_01, gen_uc_tf_02, gen_uc_tf_03, gen_uc_tf_04, gen_uc_tf_05, gen_uc_tf_06, gen_uc_tf_07]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 8")

if __name__ == "__main__": main()
