#!/usr/bin/env python3
"""
Department 14: Strategy / Transformation Office
Download public data and generate synthetic datasets for all 7 use cases.
Organizes into csv/ and text/ subfolders per use case.
"""

import os
import sys
import json
import random
import csv
import io
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")

np.random.seed(42)
random.seed(42)

# ---------------------------------------------------------------------------
# UC-ST-01: Enterprise Strategy Scenario Simulator
# Financial & KPI data for scenario simulation
# ---------------------------------------------------------------------------
def generate_uc_st_01():
    print("[UC-ST-01] Enterprise Strategy Scenario Simulator")
    n = 5000
    years = np.random.choice(range(2015, 2026), n)
    quarters = np.random.choice(["Q1", "Q2", "Q3", "Q4"], n)
    business_units = np.random.choice(["Retail Banking", "Corporate Banking", "Wealth Management",
                                        "Investment Banking", "Insurance", "Digital Banking"], n)
    scenarios = np.random.choice(["Base", "Optimistic", "Pessimistic", "Stress", "Growth"], n)

    revenue = np.round(np.random.lognormal(mean=8, sigma=0.8, size=n), 2)
    cost = np.round(revenue * np.random.uniform(0.4, 0.85, n), 2)
    profit = np.round(revenue - cost, 2)
    roi = np.round((profit / cost) * 100, 2)
    gdp_growth = np.round(np.random.normal(2.5, 1.5, n), 2)
    inflation = np.round(np.random.normal(3.0, 1.2, n), 2)
    interest_rate = np.round(np.random.uniform(0.5, 8.0, n), 2)
    customer_growth_pct = np.round(np.random.normal(5.0, 3.0, n), 2)
    digital_adoption_pct = np.round(np.random.uniform(20, 95, n), 2)
    nps_score = np.round(np.random.normal(45, 15, n), 1)
    employee_count = np.random.randint(500, 25000, n)
    cost_income_ratio = np.round(cost / revenue * 100, 2)
    market_share_pct = np.round(np.random.uniform(2, 25, n), 2)
    risk_weighted_assets = np.round(np.random.lognormal(10, 0.5, n), 2)
    capital_adequacy_ratio = np.round(np.random.uniform(10, 20, n), 2)

    df = pd.DataFrame({
        "year": years, "quarter": quarters, "business_unit": business_units,
        "scenario": scenarios, "revenue_millions": revenue, "cost_millions": cost,
        "profit_millions": profit, "roi_pct": roi, "gdp_growth_pct": gdp_growth,
        "inflation_pct": inflation, "interest_rate_pct": interest_rate,
        "customer_growth_pct": customer_growth_pct, "digital_adoption_pct": digital_adoption_pct,
        "nps_score": nps_score, "employee_count": employee_count,
        "cost_income_ratio": cost_income_ratio, "market_share_pct": market_share_pct,
        "risk_weighted_assets_millions": risk_weighted_assets,
        "capital_adequacy_ratio_pct": capital_adequacy_ratio,
    })
    path = os.path.join(DATA, "UC-ST-01", "csv", "strategy_scenarios_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows to {path}")
    return path, "uc_st_01_strategy_scenarios", len(df)


# ---------------------------------------------------------------------------
# UC-ST-02: AI Portfolio Prioritization & Value Scoring
# ---------------------------------------------------------------------------
def generate_uc_st_02():
    print("[UC-ST-02] AI Portfolio Prioritization & Value Scoring")
    n = 500
    initiative_ids = [f"AI-{i:04d}" for i in range(1, n + 1)]
    names = [f"Initiative_{i}" for i in range(1, n + 1)]
    departments = np.random.choice(["Fraud", "Credit Risk", "AML", "Operations", "Contact Center",
                                     "Collections", "HR", "Treasury", "Data Gov", "IT Ops"], n)
    ai_types = np.random.choice(["ML", "DL", "NLP", "RAG", "CV", "Hybrid", "Ensemble"], n)
    statuses = np.random.choice(["Ideation", "POC", "Pilot", "Production", "Scaling", "Retired"], n,
                                 p=[0.2, 0.15, 0.2, 0.25, 0.15, 0.05])
    priority_scores = np.round(np.random.uniform(1, 100, n), 1)
    revenue_impact = np.round(np.random.lognormal(3, 1.5, n), 2)
    cost_savings = np.round(np.random.lognormal(2.5, 1.2, n), 2)
    implementation_cost = np.round(np.random.lognormal(4, 1.0, n), 2)
    risk_score = np.round(np.random.uniform(1, 10, n), 1)
    strategic_alignment = np.round(np.random.uniform(1, 10, n), 1)
    data_readiness = np.round(np.random.uniform(1, 10, n), 1)
    talent_readiness = np.round(np.random.uniform(1, 10, n), 1)
    time_to_value_months = np.random.randint(1, 36, n)
    npv = np.round(revenue_impact + cost_savings - implementation_cost, 2)
    complexity = np.random.choice(["Low", "Medium", "High", "Very High"], n)
    regulatory_dependency = np.random.choice(["None", "Low", "Medium", "High"], n)

    df = pd.DataFrame({
        "initiative_id": initiative_ids, "initiative_name": names, "department": departments,
        "ai_type": ai_types, "status": statuses, "priority_score": priority_scores,
        "revenue_impact_k": revenue_impact, "cost_savings_k": cost_savings,
        "implementation_cost_k": implementation_cost, "risk_score": risk_score,
        "strategic_alignment_score": strategic_alignment, "data_readiness_score": data_readiness,
        "talent_readiness_score": talent_readiness, "time_to_value_months": time_to_value_months,
        "npv_k": npv, "complexity": complexity, "regulatory_dependency": regulatory_dependency,
    })
    path = os.path.join(DATA, "UC-ST-02", "csv", "ai_portfolio_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows to {path}")
    return path, "uc_st_02_ai_portfolio", len(df)


# ---------------------------------------------------------------------------
# UC-ST-03: Transformation ROI Tracking & Benefits Realization
# ---------------------------------------------------------------------------
def generate_uc_st_03():
    print("[UC-ST-03] Transformation ROI Tracking & Benefits Realization")
    n = 3000
    program_ids = np.random.choice([f"PGM-{i:03d}" for i in range(1, 51)], n)
    months = pd.date_range("2020-01-01", periods=60, freq="ME").strftime("%Y-%m").tolist()
    report_months = np.random.choice(months, n)
    categories = np.random.choice(["Revenue Uplift", "Cost Reduction", "Risk Reduction",
                                    "Productivity Gain", "Customer Experience"], n)
    planned_benefit_k = np.round(np.random.lognormal(5, 1.0, n), 2)
    actual_benefit_k = np.round(planned_benefit_k * np.random.uniform(0.3, 1.3, n), 2)
    realization_pct = np.round(actual_benefit_k / planned_benefit_k * 100, 2)
    budget_k = np.round(np.random.lognormal(4.5, 0.8, n), 2)
    spend_k = np.round(budget_k * np.random.uniform(0.5, 1.2, n), 2)
    budget_variance_pct = np.round((spend_k - budget_k) / budget_k * 100, 2)
    milestone_completion_pct = np.round(np.random.beta(5, 2, n) * 100, 1)
    risk_flag = np.random.choice(["Green", "Amber", "Red"], n, p=[0.5, 0.3, 0.2])
    blockers = np.random.randint(0, 8, n)
    fte_allocated = np.random.randint(1, 50, n)
    stakeholder_satisfaction = np.round(np.random.uniform(1, 10, n), 1)

    df = pd.DataFrame({
        "program_id": program_ids, "report_month": report_months, "benefit_category": categories,
        "planned_benefit_k": planned_benefit_k, "actual_benefit_k": actual_benefit_k,
        "realization_pct": realization_pct, "budget_k": budget_k, "spend_k": spend_k,
        "budget_variance_pct": budget_variance_pct, "milestone_completion_pct": milestone_completion_pct,
        "risk_flag": risk_flag, "active_blockers": blockers, "fte_allocated": fte_allocated,
        "stakeholder_satisfaction": stakeholder_satisfaction,
    })
    path = os.path.join(DATA, "UC-ST-03", "csv", "transformation_roi_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows to {path}")
    return path, "uc_st_03_transformation_roi", len(df)


# ---------------------------------------------------------------------------
# UC-ST-04: Transformation Risk & Dependency Monitoring
# ---------------------------------------------------------------------------
def generate_uc_st_04():
    print("[UC-ST-04] Transformation Risk & Dependency Monitoring")
    n = 2000
    project_ids = np.random.choice([f"PRJ-{i:04d}" for i in range(1, 201)], n)
    risk_ids = [f"RSK-{i:05d}" for i in range(1, n + 1)]
    risk_types = np.random.choice(["Technical", "Resource", "Scope", "Budget", "Regulatory",
                                    "Vendor", "Integration", "Data Quality", "Change Mgmt"], n)
    likelihood = np.random.choice(["Low", "Medium", "High", "Critical"], n, p=[0.3, 0.35, 0.25, 0.1])
    impact = np.random.choice(["Low", "Medium", "High", "Critical"], n, p=[0.2, 0.35, 0.3, 0.15])
    risk_score = np.round(np.random.uniform(1, 25, n), 1)
    dependency_count = np.random.randint(0, 15, n)
    blocking_dependencies = np.random.randint(0, 5, n)
    mitigation_status = np.random.choice(["Not Started", "In Progress", "Mitigated", "Accepted"], n)
    days_open = np.random.randint(1, 365, n)
    escalated = np.random.choice([0, 1], n, p=[0.7, 0.3])

    # Text descriptions for NLP
    risk_descriptions = []
    templates = [
        "Risk of {type} delay due to {reason}. Impact on {area} timeline estimated at {days} days.",
        "Dependency on {dept} team for {item} is blocking progress. Escalation required.",
        "{type} risk identified in {area}. Mitigation plan under review by steering committee.",
        "Budget overrun risk for {area} program. Current variance: {var}%. Needs CFO approval.",
        "Vendor {vendor} delivery delay impacting {area} integration milestone.",
    ]
    for i in range(n):
        t = random.choice(templates)
        desc = t.format(
            type=risk_types[i], reason=random.choice(["resource shortage", "tech complexity", "scope creep"]),
            area=random.choice(["Digital", "Core Banking", "Cloud Migration", "AI Platform"]),
            days=random.randint(5, 90), dept=random.choice(["IT", "Risk", "Compliance", "Data"]),
            item=random.choice(["API", "data feed", "approval", "testing"]),
            var=random.randint(5, 40), vendor=random.choice(["Vendor A", "Vendor B", "Vendor C"]),
        )
        risk_descriptions.append(desc)

    df = pd.DataFrame({
        "project_id": project_ids, "risk_id": risk_ids, "risk_type": risk_types,
        "likelihood": likelihood, "impact": impact, "risk_score": risk_score,
        "dependency_count": dependency_count, "blocking_dependencies": blocking_dependencies,
        "mitigation_status": mitigation_status, "days_open": days_open, "escalated": escalated,
        "risk_description": risk_descriptions,
    })
    path_csv = os.path.join(DATA, "UC-ST-04", "csv", "transformation_risks_unified.csv")
    df.to_csv(path_csv, index=False)

    # Save text descriptions separately
    path_text = os.path.join(DATA, "UC-ST-04", "text", "risk_descriptions.txt")
    with open(path_text, "w") as f:
        for desc in risk_descriptions:
            f.write(desc + "\n")

    print(f"  Saved {len(df)} rows to {path_csv}")
    return path_csv, "uc_st_04_transformation_risks", len(df)


# ---------------------------------------------------------------------------
# UC-ST-05: Transformation Playbook & Execution Copilot (RAG text data)
# ---------------------------------------------------------------------------
def generate_uc_st_05():
    print("[UC-ST-05] Transformation Playbook & Execution Copilot")
    playbook_sections = [
        {"title": "1. Transformation Vision & Strategy", "content": "Define the enterprise transformation vision aligned with 3-5 year strategic plan. Identify key value drivers: revenue growth, cost optimization, risk reduction, and customer experience improvement. Establish transformation governance with executive sponsor, steering committee, and program management office (PMO). Key deliverables: Vision document, strategic business case, transformation charter."},
        {"title": "2. Portfolio Prioritization Framework", "content": "Apply value-complexity scoring matrix to all transformation initiatives. Score each initiative on: strategic alignment (1-10), financial impact (NPV), time-to-value, risk profile, data readiness, talent availability. Use AI-driven prioritization to optimize portfolio allocation across waves. Recommended: Fund Wave 1 (quick wins + foundational), Wave 2 (scale), Wave 3 (innovate)."},
        {"title": "3. Operating Model Design", "content": "Design target operating model covering: people, process, technology, data, and governance dimensions. Establish Centers of Excellence (CoE) for AI/ML, Data Engineering, Cloud, and Agile. Define RACI matrices for cross-functional delivery. Implement hub-and-spoke model: central AI CoE + embedded teams in business units."},
        {"title": "4. Benefits Realization Management", "content": "Implement structured benefits tracking: planned vs actual, leading vs lagging indicators. Assign benefit owners at VP+ level. Monthly benefits realization reviews with CFO. Automated dashboards for real-time tracking. Key metrics: benefit realization rate (target >80%), time-to-value, cost avoidance, revenue uplift attribution."},
        {"title": "5. Risk & Dependency Management", "content": "Maintain enterprise risk register with AI-powered risk scoring. Monitor inter-program dependencies with automated alerts. Escalation framework: Green (PMO) → Amber (Steering Committee) → Red (ExCo/Board). Conduct monthly risk reviews and quarterly dependency mapping exercises. Integration with enterprise risk management (ERM) framework."},
        {"title": "6. Change Management & Communications", "content": "Stakeholder analysis and engagement plan for all affected groups. Training programs: digital literacy, AI awareness, new ways of working. Communications cadence: weekly team updates, bi-weekly leadership briefs, monthly town halls, quarterly board updates. Measure adoption: user engagement, process compliance, feedback scores."},
        {"title": "7. Technology & Data Foundation", "content": "Cloud migration strategy (hybrid/multi-cloud). Data platform modernization: data lake, data mesh, real-time streaming. API-first architecture for system integration. MLOps pipeline for AI model lifecycle management. Security by design: zero-trust, encryption, access controls."},
        {"title": "8. AI Governance & Ethics", "content": "AI risk classification framework aligned with ISO 42001. Model validation and monitoring processes. Bias detection and fairness metrics. Explainability requirements by use case tier. AI incident response and kill-switch procedures. Regulatory compliance mapping (EU AI Act, local regulations)."},
        {"title": "9. Measurement & KPI Framework", "content": "Transformation KPIs: cost-income ratio improvement, digital adoption rate, AI use case count in production, time-to-market reduction, NPS improvement, employee engagement score. OKR cascade: Board → ExCo → Department → Team → Individual. Automated KPI collection and anomaly detection."},
        {"title": "10. Board & Stakeholder Reporting", "content": "Quarterly transformation dashboard for board: progress vs plan, financial impact, risk status, strategic alignment assessment. Executive summary format: 1-page scorecard + detailed appendix. Key narratives: value created, risks managed, next quarter priorities, resource asks. Integration with investor relations for external communications."},
    ]

    path = os.path.join(DATA, "UC-ST-05", "text", "transformation_playbook.json")
    with open(path, "w") as f:
        json.dump(playbook_sections, f, indent=2)

    # Also generate Q&A pairs for RAG training
    qa_pairs = [
        {"question": "What is the transformation governance structure?", "answer": "Executive sponsor, steering committee, and PMO with RACI matrices."},
        {"question": "How should AI initiatives be prioritized?", "answer": "Use value-complexity scoring: strategic alignment, financial impact (NPV), time-to-value, risk, data readiness, talent."},
        {"question": "What is the target benefit realization rate?", "answer": "Target >80% benefit realization rate with monthly CFO reviews."},
        {"question": "How are transformation risks escalated?", "answer": "Green (PMO) → Amber (Steering Committee) → Red (ExCo/Board)."},
        {"question": "What AI governance framework should be used?", "answer": "AI risk classification aligned with ISO 42001, with model validation, bias detection, and kill-switch procedures."},
        {"question": "What are the key transformation KPIs?", "answer": "Cost-income ratio, digital adoption rate, AI use cases in production, time-to-market, NPS, employee engagement."},
        {"question": "How is the board updated on transformation?", "answer": "Quarterly dashboard: progress vs plan, financial impact, risk status, strategic alignment, 1-page scorecard."},
        {"question": "What is the recommended wave approach?", "answer": "Wave 1: quick wins + foundational. Wave 2: scale. Wave 3: innovate."},
    ]
    qa_path = os.path.join(DATA, "UC-ST-05", "text", "playbook_qa_pairs.json")
    with open(qa_path, "w") as f:
        json.dump(qa_pairs, f, indent=2)

    # Generate a CSV tracking document queries for ML component
    n = 1000
    query_df = pd.DataFrame({
        "query_id": range(1, n + 1),
        "query_text": [random.choice([q["question"] for q in qa_pairs]) + " " + random.choice(["for retail", "for corporate", "for Q3", "for 2025"]) for _ in range(n)],
        "section_retrieved": np.random.choice([s["title"] for s in playbook_sections], n),
        "relevance_score": np.round(np.random.uniform(0.3, 1.0, n), 3),
        "user_rating": np.random.choice([1, 2, 3, 4, 5], n, p=[0.05, 0.1, 0.2, 0.35, 0.3]),
        "response_time_ms": np.random.randint(50, 2000, n),
    })
    csv_path = os.path.join(DATA, "UC-ST-05", "csv", "copilot_usage_unified.csv")
    query_df.to_csv(csv_path, index=False)
    print(f"  Saved playbook ({len(playbook_sections)} sections), {len(qa_pairs)} QA pairs, {len(query_df)} usage rows")
    return csv_path, "uc_st_05_copilot_usage", len(query_df)


# ---------------------------------------------------------------------------
# UC-ST-06: Funding Wave & Roadmap Optimization
# ---------------------------------------------------------------------------
def generate_uc_st_06():
    print("[UC-ST-06] Funding Wave & Roadmap Optimization")
    n = 1500
    wave_ids = np.random.choice(["Wave-1", "Wave-2", "Wave-3", "Wave-4", "Backlog"], n,
                                 p=[0.25, 0.25, 0.2, 0.15, 0.15])
    initiative_ids = np.random.choice([f"INIT-{i:04d}" for i in range(1, 201)], n)
    funding_requested_k = np.round(np.random.lognormal(5, 1.0, n), 2)
    funding_approved_k = np.round(funding_requested_k * np.random.uniform(0.0, 1.0, n), 2)
    approval_rate = np.round(funding_approved_k / funding_requested_k * 100, 2)
    strategic_score = np.round(np.random.uniform(1, 100, n), 1)
    feasibility_score = np.round(np.random.uniform(1, 100, n), 1)
    urgency_score = np.round(np.random.uniform(1, 100, n), 1)
    composite_score = np.round((strategic_score * 0.4 + feasibility_score * 0.3 + urgency_score * 0.3), 1)
    resource_requirement_fte = np.random.randint(1, 30, n)
    duration_months = np.random.randint(1, 24, n)
    dependencies = np.random.randint(0, 10, n)
    constraint_budget = np.random.choice([0, 1], n, p=[0.6, 0.4])
    constraint_talent = np.random.choice([0, 1], n, p=[0.5, 0.5])
    constraint_regulatory = np.random.choice([0, 1], n, p=[0.7, 0.3])
    recommended_action = np.random.choice(["Fund Now", "Defer", "Descope", "Cancel", "Accelerate"], n)

    df = pd.DataFrame({
        "wave": wave_ids, "initiative_id": initiative_ids,
        "funding_requested_k": funding_requested_k, "funding_approved_k": funding_approved_k,
        "approval_rate_pct": approval_rate, "strategic_score": strategic_score,
        "feasibility_score": feasibility_score, "urgency_score": urgency_score,
        "composite_score": composite_score, "resource_fte": resource_requirement_fte,
        "duration_months": duration_months, "dependencies": dependencies,
        "budget_constrained": constraint_budget, "talent_constrained": constraint_talent,
        "regulatory_constrained": constraint_regulatory, "recommended_action": recommended_action,
    })
    path = os.path.join(DATA, "UC-ST-06", "csv", "funding_wave_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows to {path}")
    return path, "uc_st_06_funding_wave", len(df)


# ---------------------------------------------------------------------------
# UC-ST-07: Transformation KPI & Board Reporting Automation
# ---------------------------------------------------------------------------
def generate_uc_st_07():
    print("[UC-ST-07] Transformation KPI & Board Reporting Automation")
    n = 2400  # 200 KPIs x 12 months
    kpi_names = [
        "Cost-Income Ratio", "Digital Adoption Rate", "AI Use Cases in Prod", "NPS Score",
        "Time-to-Market (days)", "Revenue per Employee", "Customer Acquisition Cost",
        "Employee Engagement Score", "Regulatory Findings", "Model Accuracy (Avg)",
        "Data Quality Score", "Cloud Migration %", "Agile Team Velocity", "Automation Rate",
        "Customer Churn Rate", "Fraud Detection Rate", "Loan Default Rate", "AML Alert Rate",
        "Branch Footfall Index", "Contact Center AHT",
    ]
    months = pd.date_range("2024-01-01", periods=12, freq="ME").strftime("%Y-%m").tolist()

    rows = []
    for kpi in kpi_names:
        for m in months:
            target = round(random.uniform(50, 95), 1)
            actual = round(target * random.uniform(0.7, 1.2), 1)
            variance = round(actual - target, 1)
            status = "Green" if variance >= 0 else ("Amber" if variance > -5 else "Red")
            rows.append({
                "kpi_name": kpi, "report_month": m, "target_value": target,
                "actual_value": actual, "variance": variance, "status": status,
                "owner": random.choice(["CFO", "CTO", "CRO", "COO", "CDO", "CHRO"]),
                "department": random.choice(["Finance", "Technology", "Risk", "Operations", "Data", "HR"]),
                "commentary": f"{kpi} {'exceeded' if variance >= 0 else 'missed'} target by {abs(variance):.1f} in {m}.",
            })

    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATA, "UC-ST-07", "csv", "board_kpis_unified.csv")
    df.to_csv(csv_path, index=False)

    # Board narrative text samples
    narratives = [
        "Q4 2024 Board Report: Transformation program on track with 78% milestone completion. Revenue uplift initiatives delivering $12.3M against $15M target (82% realization). Three programs flagged Amber due to resource constraints in AI/ML talent pool. Recommended action: accelerate hiring in Data Science CoE.",
        "Quarterly Strategy Review: Digital adoption reached 67%, up from 54% last quarter. AI portfolio expanded to 23 use cases in production. Key risk: vendor dependency for cloud migration creating 6-week delay on Wave 2 initiatives. Mitigation plan approved by steering committee.",
        "Executive Summary: Cost-income ratio improved to 52.3% from 55.1% baseline. Primary drivers: process automation (40%), AI-driven decisioning (35%), cloud migration cost savings (25%). Employee engagement at 7.8/10. Board approval requested for $5M incremental AI platform investment.",
    ]
    text_path = os.path.join(DATA, "UC-ST-07", "text", "board_narratives.json")
    with open(text_path, "w") as f:
        json.dump(narratives, f, indent=2)

    print(f"  Saved {len(df)} rows to {csv_path}, {len(narratives)} board narratives")
    return csv_path, "uc_st_07_board_kpis", len(df)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    print("=" * 60)
    print("DEPT 14: Strategy / Transformation Office - Data Generation")
    print("=" * 60)

    results = []
    for gen_fn in [generate_uc_st_01, generate_uc_st_02, generate_uc_st_03,
                   generate_uc_st_04, generate_uc_st_05, generate_uc_st_06, generate_uc_st_07]:
        path, table, count = gen_fn()
        results.append({"path": path, "table": table, "count": count})

    print("\n" + "=" * 60)
    print(f"Generated {len(results)} datasets for Department 14")

    # Save manifest
    manifest_path = os.path.join(DATA, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Manifest: {manifest_path}")


if __name__ == "__main__":
    main()
