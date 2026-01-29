#!/usr/bin/env python3
"""Department 7: ATM & Cash Operations - Generate synthetic datasets for UC-ATM-01 to UC-ATM-06."""
import os, json, random
import numpy as np, pandas as pd
BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(7); random.seed(7)

def gen_uc_atm_01():
    """ATM Cash Demand Forecasting"""
    print("[UC-ATM-01] Cash Demand Forecasting")
    atms = [f"ATM-{i:04d}" for i in range(200)]
    dates = pd.date_range("2022-01-01", periods=730, freq="D")
    rows = []
    for atm in atms[:50]:  # 50 ATMs x 730 days
        base = random.randint(5000, 50000)
        for d in dates:
            dow_f = 1.3 if d.dayofweek == 4 else (0.7 if d.dayofweek == 6 else 1.0)
            payday_f = 1.5 if d.day in [1, 15, 30] else 1.0
            withdrawal = max(500, int(base * dow_f * payday_f + np.random.normal(0, base * 0.2)))
            deposit = int(withdrawal * np.random.uniform(0.1, 0.4))
            txn_count = max(10, int(withdrawal / np.random.uniform(50, 200)))
            rows.append({"atm_id": atm, "date": d.strftime("%Y-%m-%d"),
                "withdrawal_amount": withdrawal, "deposit_amount": deposit,
                "transaction_count": txn_count, "cash_level_pct": round(np.random.uniform(10, 95), 1),
                "stockout_event": int(np.random.random() < 0.02),
                "day_of_week": d.day_name(), "is_payday": int(d.day in [1, 15, 30])})
    df = pd.DataFrame(rows)
    p = os.path.join(DATA, "UC-ATM-01", "csv", "cash_demand_forecast_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_atm_01_cash_demand", len(df)

def gen_uc_atm_02():
    """Cash Replenishment Route Optimization"""
    print("[UC-ATM-02] Route Optimization")
    n = 5000
    df = pd.DataFrame({
        "route_id": [f"RT-{i:05d}" for i in range(n)],
        "date": np.random.choice(pd.date_range("2023-01-01", periods=365, freq="D").strftime("%Y-%m-%d"), n),
        "vehicle_id": np.random.choice([f"VEH-{i:03d}" for i in range(20)], n),
        "atm_count_in_route": np.random.randint(3, 15, n),
        "total_distance_km": np.round(np.random.uniform(20, 200, n), 1),
        "total_cash_loaded_k": np.round(np.random.lognormal(5, 1, n), 2),
        "route_time_hours": np.round(np.random.uniform(2, 8, n), 1),
        "fuel_cost": np.round(np.random.uniform(20, 100, n), 2),
        "labor_cost": np.round(np.random.uniform(50, 200, n), 2),
        "optimized": np.random.choice([0, 1], n, p=[0.4, 0.6]),
        "distance_saved_pct": np.round(np.random.uniform(0, 25, n), 1),
    })
    p = os.path.join(DATA, "UC-ATM-02", "csv", "route_optimization_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_atm_02_routes", len(df)

def gen_uc_atm_03():
    """ATM Health & Downtime Prediction"""
    print("[UC-ATM-03] ATM Health Prediction")
    n = 20000
    df = pd.DataFrame({
        "atm_id": np.random.choice([f"ATM-{i:04d}" for i in range(200)], n),
        "timestamp": pd.date_range("2023-01-01", periods=n, freq="H").strftime("%Y-%m-%d %H:%M"),
        "cpu_usage_pct": np.round(np.random.beta(3, 5, n) * 100, 1),
        "memory_usage_pct": np.round(np.random.beta(4, 4, n) * 100, 1),
        "disk_usage_pct": np.round(np.random.beta(5, 3, n) * 100, 1),
        "network_latency_ms": np.round(np.random.lognormal(3, 1, n), 1),
        "error_count_1h": np.random.poisson(1, n),
        "card_reader_status": np.random.choice(["OK", "Degraded", "Failed"], n, p=[0.9,0.07,0.03]),
        "cash_dispenser_status": np.random.choice(["OK", "Degraded", "Failed"], n, p=[0.88,0.08,0.04]),
        "receipt_printer_status": np.random.choice(["OK", "Degraded", "Failed"], n, p=[0.85,0.1,0.05]),
        "predicted_downtime_hours": np.round(np.random.exponential(2, n), 1),
        "actual_downtime_event": np.random.choice([0, 1], n, p=[0.95, 0.05]),
    })
    p = os.path.join(DATA, "UC-ATM-03", "csv", "atm_health_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_atm_03_health", len(df)

def gen_uc_atm_04():
    """ATM Surveillance & Tampering (metadata - no actual images)"""
    print("[UC-ATM-04] Surveillance Metadata")
    n = 10000
    df = pd.DataFrame({
        "event_id": [f"CAM-{i:06d}" for i in range(n)],
        "atm_id": np.random.choice([f"ATM-{i:04d}" for i in range(200)], n),
        "timestamp": pd.date_range("2023-01-01", periods=n, freq="30min").strftime("%Y-%m-%d %H:%M"),
        "camera_id": np.random.choice(["CAM-FRONT", "CAM-SIDE", "CAM-KEYPAD"], n),
        "motion_detected": np.random.choice([0, 1], n, p=[0.4, 0.6]),
        "person_count": np.random.poisson(1, n),
        "loitering_detected": np.random.choice([0, 1], n, p=[0.95, 0.05]),
        "skimmer_confidence": np.round(np.random.beta(1, 20, n), 4),
        "shoulder_surfing_flag": np.random.choice([0, 1], n, p=[0.97, 0.03]),
        "alert_generated": np.random.choice([0, 1], n, p=[0.92, 0.08]),
        "alert_type": np.random.choice(["None", "Tampering", "Loitering", "Unusual Activity", "Skimmer"], n, p=[0.85,0.04,0.04,0.04,0.03]),
    })
    p = os.path.join(DATA, "UC-ATM-04", "csv", "surveillance_metadata_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_atm_04_surveillance", len(df)

def gen_uc_atm_05():
    """ATM Ops Copilot"""
    print("[UC-ATM-05] ATM Ops Copilot")
    runbooks = [
        {"id": "RB-001", "title": "Cash Dispenser Jam", "content": "1. Check error code on screen. 2. Open dispenser module. 3. Remove jammed notes. 4. Run test dispense. 5. If persistent, call L2 support."},
        {"id": "RB-002", "title": "Network Connectivity Loss", "content": "1. Check modem lights. 2. Restart network module. 3. Verify VPN tunnel status. 4. If offline >15 min, switch to backup SIM. 5. Escalate to NOC."},
        {"id": "RB-003", "title": "Card Reader Error", "content": "1. Clean card reader with cleaning card. 2. Check for foreign objects. 3. Restart card reader module. 4. Test with test card. 5. Replace unit if error persists."},
    ]
    tp = os.path.join(DATA, "UC-ATM-05", "text", "atm_runbooks.json")
    with open(tp, "w") as f: json.dump(runbooks, f, indent=2)
    n = 1500
    df = pd.DataFrame({"query_id": range(1, n+1),
        "query_text": [random.choice(["Cash jam fix steps?", "ATM offline troubleshoot?",
            "Card reader not working?", "Receipt printer error?", "How to restart ATM?"]) for _ in range(n)],
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_rating": np.random.choice([1,2,3,4,5], n, p=[0.02,0.05,0.13,0.4,0.4]),
        "response_time_ms": np.random.randint(80, 2000, n)})
    p = os.path.join(DATA, "UC-ATM-05", "csv", "atm_copilot_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_atm_05_copilot", len(df)

def gen_uc_atm_06():
    """Dynamic Replenishment Decision Engine"""
    print("[UC-ATM-06] Replenishment Decision Engine")
    n = 10000
    df = pd.DataFrame({
        "atm_id": np.random.choice([f"ATM-{i:04d}" for i in range(200)], n),
        "date": np.random.choice(pd.date_range("2023-01-01", periods=365, freq="D").strftime("%Y-%m-%d"), n),
        "current_cash_level_pct": np.round(np.random.beta(3, 3, n) * 100, 1),
        "forecasted_demand_24h": np.round(np.random.lognormal(9, 1, n), 2),
        "forecasted_demand_48h": np.round(np.random.lognormal(9.5, 1, n), 2),
        "days_until_stockout": np.random.randint(0, 10, n),
        "replenish_cost": np.round(np.random.uniform(50, 300, n), 2),
        "idle_cash_cost_daily": np.round(np.random.uniform(5, 50, n), 2),
        "recommended_action": np.random.choice(["Replenish Now", "Replenish Tomorrow", "No Action", "Reduce Cash"], n, p=[0.25,0.2,0.4,0.15]),
        "optimal_load_amount": np.round(np.random.lognormal(10, 0.5, n), 2),
    })
    p = os.path.join(DATA, "UC-ATM-06", "csv", "replenishment_decision_unified.csv")
    df.to_csv(p, index=False); print(f"  {len(df)} rows"); return p, "uc_atm_06_replenishment", len(df)

def main():
    print("=" * 60); print("DEPT 7: ATM & Cash Operations - Data Generation"); print("=" * 60)
    results = []
    for fn in [gen_uc_atm_01, gen_uc_atm_02, gen_uc_atm_03, gen_uc_atm_04, gen_uc_atm_05, gen_uc_atm_06]:
        p, t, c = fn(); results.append({"path": p, "table": t, "count": c})
    with open(os.path.join(DATA, "manifest.json"), "w") as f: json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Dept 7")

if __name__ == "__main__": main()
