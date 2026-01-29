#!/usr/bin/env python3
"""Department 6: Branch Operations - Generate synthetic datasets for UC-BO-01 to UC-BO-06."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(6); random.seed(6)

def gen_uc_bo_01():
    """Branch Staffing Optimization"""
    print("[UC-BO-01] Branch Staffing Optimization")
    branches = [f"BR-{i:03d}" for i in range(50)]
    dates = pd.date_range("2022-01-01", periods=730, freq="D")
    rows = []
    for br in branches:
        base = random.randint(200, 800)
        for d in dates:
            dow_f = 1.2 if d.dayofweek < 5 else 0.4
            month_f = 1 + 0.2 * np.sin(d.month / 12 * 2 * np.pi)
            footfall = max(20, int(base * dow_f * month_f + np.random.normal(0, 50)))
            tellers_needed = max(2, footfall // 80)
            advisors_needed = max(1, footfall // 200)
            actual_tellers = tellers_needed + random.choice([-1, 0, 0, 0, 1])
            actual_advisors = advisors_needed + random.choice([-1, 0, 0, 1])
            avg_wait_min = max(1, round(np.random.gamma(2, 3) * (tellers_needed / max(actual_tellers, 1)), 1))
            sla_met = int(avg_wait_min <= 10)
            rows.append({"branch_id": br, "date": d.strftime("%Y-%m-%d"), "footfall": footfall,
                "tellers_needed": tellers_needed, "advisors_needed": advisors_needed,
                "actual_tellers": max(1, actual_tellers), "actual_advisors": max(1, actual_advisors),
                "avg_wait_minutes": avg_wait_min, "sla_met": sla_met,
                "day_of_week": d.day_name()})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-BO-01", "csv", "branch_staffing_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_bo_01_staffing", len(df)

def gen_uc_bo_02():
    """Queue Time Prediction"""
    print("[UC-BO-02] Queue Time Prediction")
    n = 20000
    df = pd.DataFrame({
        "branch_id": np.random.choice([f"BR-{i:03d}" for i in range(50)], n),
        "timestamp": pd.date_range("2023-01-01", periods=n, freq="15min").strftime("%Y-%m-%d %H:%M"),
        "queue_length": np.random.poisson(5, n),
        "active_counters": np.random.randint(2, 10, n),
        "avg_service_time_min": np.round(np.random.gamma(3, 3, n), 1),
        "predicted_wait_min": np.round(np.random.gamma(2, 4, n), 1),
        "actual_wait_min": np.round(np.random.gamma(2, 4.5, n), 1),
        "sla_breach": np.random.choice([0, 1], n, p=[0.8, 0.2]),
        "customer_segment": np.random.choice(["Walk-in", "Appointment", "VIP"], n, p=[0.6,0.3,0.1]),
    })
    p = os.path.join(DATA, "UC-BO-02", "csv", "queue_prediction_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_bo_02_queue", len(df)

def gen_uc_bo_03():
    """Footfall & Capacity Analytics"""
    print("[UC-BO-03] Footfall Analytics")
    n = 15000
    df = pd.DataFrame({
        "branch_id": np.random.choice([f"BR-{i:03d}" for i in range(50)], n),
        "timestamp": pd.date_range("2023-01-01", periods=n, freq="H").strftime("%Y-%m-%d %H:%M"),
        "footfall_count": np.random.poisson(30, n),
        "capacity": np.random.choice([50, 75, 100, 150], n),
        "occupancy_pct": np.round(np.random.beta(3, 3, n) * 100, 1),
        "peak_flag": np.random.choice([0, 1], n, p=[0.7, 0.3]),
        "zone_lobby": np.random.poisson(10, n),
        "zone_teller": np.random.poisson(8, n),
        "zone_advisor": np.random.poisson(5, n),
        "dwell_time_avg_min": np.round(np.random.gamma(3, 5, n), 1),
    })
    p = os.path.join(DATA, "UC-BO-03", "csv", "footfall_analytics_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_bo_03_footfall", len(df)

def gen_uc_bo_04():
    """Branch Customer Churn Risk"""
    print("[UC-BO-04] Branch Customer Churn")
    n = 15000
    df = pd.DataFrame({
        "customer_id": [f"BCH-{i:06d}" for i in range(n)],
        "branch_id": np.random.choice([f"BR-{i:03d}" for i in range(50)], n),
        "tenure_months": np.random.randint(1, 300, n),
        "products_held": np.random.randint(1, 7, n),
        "monthly_visits": np.random.poisson(2, n),
        "digital_adoption": np.random.choice([0, 1], n, p=[0.35, 0.65]),
        "avg_balance": np.round(np.random.lognormal(8, 2, n), 2),
        "complaints_12m": np.random.randint(0, 5, n),
        "nps_score": np.random.randint(-100, 101, n),
        "churn_risk_score": np.round(np.random.beta(2, 5, n) * 100, 1),
        "churned": np.random.choice([0, 1], n, p=[0.88, 0.12]),
    })
    p = os.path.join(DATA, "UC-BO-04", "csv", "branch_churn_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_bo_04_churn", len(df)

def gen_uc_bo_05():
    """Branch Ops Copilot"""
    print("[UC-BO-05] Branch Ops Copilot")
    sops = [
        {"id": "SOP-001", "title": "Cash Handling", "content": "Dual control for vault access. Daily reconciliation by 4pm. Teller difference >$50 requires supervisor review. Cash shipment verification within 30 minutes of arrival."},
        {"id": "SOP-002", "title": "Customer Complaint", "content": "Acknowledge within 2 minutes. Escalate to manager if unresolved in 10 minutes. Log in CRM within 1 hour. Follow up within 48 hours. Resolution target: 5 business days."},
        {"id": "SOP-003", "title": "Security Procedures", "content": "Branch opening: 2-person rule, alarm deactivation, vault inspection. Closing: safe check, alarm activation, building sweep. Suspicious activity: do not confront, alert manager, press silent alarm if needed."},
    ]
    tp = os.path.join(DATA, "UC-BO-05", "text", "branch_sops.json")
    with open(tp, "w") as f: json.dump(sops, f, indent=2)
    n = 1500
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["Cash handling procedure?", "Customer complaint steps?",
            "Branch opening protocol?", "Vault access rules?", "Teller difference limit?"]) for _ in range(n)],
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.02,0.05,0.13,0.4,0.4]),
        "response_time_ms": np.random.randint(80, 2000, n)})
    p = os.path.join(DATA, "UC-BO-05", "csv", "branch_copilot_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_bo_05_copilot", len(df)

def gen_uc_bo_06():
    """Dynamic Counter Allocation"""
    print("[UC-BO-06] Dynamic Counter Allocation")
    n = 10000
    df = pd.DataFrame({
        "branch_id": np.random.choice([f"BR-{i:03d}" for i in range(50)], n),
        "time_slot": np.random.choice(["9-10", "10-11", "11-12", "12-1", "1-2", "2-3", "3-4", "4-5"], n),
        "forecasted_footfall": np.random.poisson(40, n),
        "teller_txn_pct": np.round(np.random.beta(5, 3, n) * 100, 1),
        "advisor_txn_pct": np.round(np.random.beta(3, 5, n) * 100, 1),
        "recommended_tellers": np.random.randint(2, 8, n),
        "recommended_advisors": np.random.randint(1, 4, n),
        "actual_allocation_tellers": np.random.randint(2, 8, n),
        "actual_allocation_advisors": np.random.randint(1, 4, n),
        "wait_time_result_min": np.round(np.random.gamma(2, 3, n), 1),
        "allocation_optimal": np.random.choice([0, 1], n, p=[0.25, 0.75]),
    })
    p = os.path.join(DATA, "UC-BO-06", "csv", "counter_allocation_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_bo_06_allocation", len(df)

def main():
    print("=" * 60); print("DEPT 6: Branch Operations - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_bo_01, gen_uc_bo_02, gen_uc_bo_03, gen_uc_bo_04, gen_uc_bo_05, gen_uc_bo_06]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 6")

if __name__ == "__main__": main()
