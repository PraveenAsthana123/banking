#!/usr/bin/env python3
"""
Department 12: Workforce / HR Management
Generate synthetic datasets for all 7 use cases (UC-HR-01 to UC-HR-07).
"""

import os
import json
import random
import numpy as np
import pandas as pd

BASE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(BASE, "data")
np.random.seed(12)
random.seed(12)


def generate_uc_hr_01():
    """UC-HR-01: Employee Attrition Prediction"""
    print("[UC-HR-01] Employee Attrition Prediction")
    n = 5000
    age = np.random.randint(22, 62, n)
    gender = np.random.choice(["Male", "Female", "Non-Binary"], n, p=[0.48, 0.48, 0.04])
    department = np.random.choice(["IT", "Operations", "Risk", "Finance", "HR", "Marketing",
                                    "Compliance", "Sales", "Data Science", "Customer Service"], n)
    job_level = np.random.choice([1, 2, 3, 4, 5], n, p=[0.3, 0.3, 0.2, 0.12, 0.08])
    years_at_company = np.random.randint(0, 35, n)
    years_in_role = np.minimum(years_at_company, np.random.randint(0, 15, n))
    monthly_income = np.round(3000 + job_level * 2500 + np.random.normal(0, 1500, n), 2)
    monthly_income = np.maximum(monthly_income, 2500)
    overtime = np.random.choice(["Yes", "No"], n, p=[0.3, 0.7])
    distance_from_home = np.random.randint(1, 50, n)
    education = np.random.choice([1, 2, 3, 4, 5], n)
    environment_satisfaction = np.random.choice([1, 2, 3, 4], n)
    job_satisfaction = np.random.choice([1, 2, 3, 4], n)
    work_life_balance = np.random.choice([1, 2, 3, 4], n)
    relationship_satisfaction = np.random.choice([1, 2, 3, 4], n)
    performance_rating = np.random.choice([1, 2, 3, 4], n, p=[0.05, 0.15, 0.5, 0.3])
    training_times_last_year = np.random.randint(0, 7, n)
    num_companies_worked = np.random.randint(0, 10, n)
    stock_option_level = np.random.choice([0, 1, 2, 3], n)
    total_working_years = np.maximum(years_at_company, np.random.randint(0, 40, n))
    # Attrition more likely with low satisfaction, overtime, low income
    attrition_prob = 0.1 + 0.1 * (overtime == "Yes") + 0.05 * (job_satisfaction <= 2) + \
                     0.05 * (environment_satisfaction <= 2) - 0.03 * (job_level >= 3)
    attrition = (np.random.random(n) < attrition_prob).astype(int)

    df = pd.DataFrame({
        "employee_id": [f"EMP-{i:05d}" for i in range(1, n + 1)],
        "age": age, "gender": gender, "department": department, "job_level": job_level,
        "years_at_company": years_at_company, "years_in_role": years_in_role,
        "monthly_income": monthly_income, "overtime": overtime,
        "distance_from_home_km": distance_from_home, "education": education,
        "environment_satisfaction": environment_satisfaction,
        "job_satisfaction": job_satisfaction, "work_life_balance": work_life_balance,
        "relationship_satisfaction": relationship_satisfaction,
        "performance_rating": performance_rating,
        "training_times_last_year": training_times_last_year,
        "num_companies_worked": num_companies_worked,
        "stock_option_level": stock_option_level,
        "total_working_years": total_working_years,
        "attrition": attrition,
    })
    path = os.path.join(DATA, "UC-HR-01", "csv", "employee_attrition_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows (attrition rate: {attrition.mean():.1%})")
    return path, "uc_hr_01_attrition", len(df)


def generate_uc_hr_02():
    """UC-HR-02: Workforce Demand Forecasting"""
    print("[UC-HR-02] Workforce Demand Forecasting")
    departments = ["IT", "Operations", "Risk", "Finance", "HR", "Sales", "Customer Service", "Data Science"]
    months = pd.date_range("2020-01-01", "2025-12-01", freq="MS")
    rows = []
    for dept in departments:
        base = random.randint(200, 2000)
        for i, m in enumerate(months):
            headcount = max(50, int(base + 10 * np.sin(i / 6 * np.pi) + np.random.normal(0, 20)))
            demand = max(50, int(headcount * np.random.uniform(0.9, 1.2)))
            gap = demand - headcount
            attrition_rate = round(np.random.uniform(0.05, 0.25), 3)
            hiring_pipeline = max(0, int(gap * np.random.uniform(0.3, 1.0)))
            avg_time_to_fill = round(np.random.uniform(15, 90), 1)
            overtime_hours = round(max(0, gap) * np.random.uniform(5, 20), 1)
            contractor_count = max(0, int(gap * np.random.uniform(0, 0.5)))
            rows.append({
                "department": dept, "month": m.strftime("%Y-%m"),
                "current_headcount": headcount, "demand_headcount": demand, "gap": gap,
                "attrition_rate": attrition_rate, "hiring_pipeline": hiring_pipeline,
                "avg_time_to_fill_days": avg_time_to_fill,
                "overtime_hours": overtime_hours, "contractor_count": contractor_count,
            })
    df = pd.DataFrame(rows)
    path = os.path.join(DATA, "UC-HR-02", "csv", "workforce_demand_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_hr_02_workforce_demand", len(df)


def generate_uc_hr_03():
    """UC-HR-03: Hiring & Internal Mobility Recommendation"""
    print("[UC-HR-03] Hiring & Internal Mobility Recommendation")
    n = 3000
    candidate_ids = [f"CAN-{i:05d}" for i in range(1, n + 1)]
    source = np.random.choice(["External", "Internal Transfer", "Internal Promotion",
                                "Referral", "Campus"], n, p=[0.4, 0.15, 0.1, 0.2, 0.15])
    role_applied = np.random.choice(["Data Scientist", "Software Engineer", "Risk Analyst",
                                      "Ops Manager", "Compliance Officer", "Product Manager",
                                      "Business Analyst", "ML Engineer"], n)
    experience_years = np.random.randint(0, 25, n)
    education_level = np.random.choice(["Bachelor", "Master", "PhD", "Diploma"], n, p=[0.4, 0.35, 0.1, 0.15])
    skills_match_score = np.round(np.random.beta(5, 2, n) * 100, 1)
    culture_fit_score = np.round(np.random.beta(4, 2, n) * 100, 1)
    interview_score = np.round(np.random.beta(5, 3, n) * 100, 1)
    assessment_score = np.round(np.random.beta(5, 2.5, n) * 100, 1)
    composite_score = np.round(skills_match_score * 0.3 + culture_fit_score * 0.2 +
                                interview_score * 0.3 + assessment_score * 0.2, 1)
    recommendation = np.where(composite_score > 70, "Hire",
                     np.where(composite_score > 50, "Consider", "Reject"))
    time_to_decision_days = np.random.randint(3, 60, n)
    offer_accepted = np.where(recommendation == "Hire",
                              np.random.choice([0, 1], n, p=[0.2, 0.8]),
                              np.zeros(n, dtype=int))

    df = pd.DataFrame({
        "candidate_id": candidate_ids, "source": source, "role_applied": role_applied,
        "experience_years": experience_years, "education_level": education_level,
        "skills_match_score": skills_match_score, "culture_fit_score": culture_fit_score,
        "interview_score": interview_score, "assessment_score": assessment_score,
        "composite_score": composite_score, "recommendation": recommendation,
        "time_to_decision_days": time_to_decision_days, "offer_accepted": offer_accepted,
    })
    path = os.path.join(DATA, "UC-HR-03", "csv", "hiring_mobility_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_hr_03_hiring", len(df)


def generate_uc_hr_04():
    """UC-HR-04: HR Policy & Employee FAQ Copilot (RAG)"""
    print("[UC-HR-04] HR Policy Copilot")
    policies = [
        {"id": "HR-001", "title": "Leave Policy", "content": "Annual leave: 25 days. Sick leave: 10 days. Parental leave: 16 weeks primary, 4 weeks secondary. Carryover: max 5 days. Approval: manager + HR for >5 consecutive days."},
        {"id": "HR-002", "title": "Remote Work Policy", "content": "Hybrid model: 3 office / 2 remote. Full remote by exception with VP approval. Equipment stipend: $500/year. Core hours: 10am-3pm local. VPN mandatory for remote access."},
        {"id": "HR-003", "title": "Compensation & Benefits", "content": "Annual review cycle in March. Merit increase: 3-8% based on performance. Bonus: 10-30% of base by level. Benefits: health, dental, vision, 401k (6% match), ESPP (15% discount), wellness allowance ($1200/year)."},
        {"id": "HR-004", "title": "Performance Management", "content": "Quarterly check-ins with manager. Annual review with calibration. Rating scale: 1 (needs improvement) to 5 (exceptional). PIP process: 60-day plan with weekly check-ins. Promotion criteria: sustained high performance + readiness assessment."},
        {"id": "HR-005", "title": "Code of Conduct", "content": "Zero tolerance for harassment, discrimination, retaliation. Mandatory ethics training annually. Whistleblower protection. Conflict of interest disclosure required. Gift policy: max $50 value from external parties."},
        {"id": "HR-006", "title": "Learning & Development", "content": "Training budget: $2000/year per employee. Certification reimbursement: 100% for role-relevant. Internal mobility: eligible after 12 months in role. Mentorship program: opt-in quarterly. Leadership development: by nomination."},
    ]
    text_path = os.path.join(DATA, "UC-HR-04", "text", "hr_policies.json")
    with open(text_path, "w") as f:
        json.dump(policies, f, indent=2)

    n = 2000
    df = pd.DataFrame({
        "query_id": range(1, n + 1),
        "query_text": [random.choice([
            "How many vacation days do I get?",
            "What is the remote work policy?",
            "When is the annual review?",
            "What is the 401k match?",
            "How do I report harassment?",
            "Can I get certification reimbursement?",
            "What is the parental leave policy?",
            "How does the bonus work?",
        ]) for _ in range(n)],
        "policy_retrieved": np.random.choice([p["id"] for p in policies], n),
        "relevance_score": np.round(np.random.uniform(0.5, 1.0, n), 3),
        "user_satisfaction": np.random.choice([1, 2, 3, 4, 5], n, p=[0.02, 0.05, 0.13, 0.4, 0.4]),
        "response_time_ms": np.random.randint(50, 2000, n),
    })
    csv_path = os.path.join(DATA, "UC-HR-04", "csv", "hr_copilot_usage_unified.csv")
    df.to_csv(csv_path, index=False)
    print(f"  Saved {len(policies)} policies, {len(df)} usage rows")
    return csv_path, "uc_hr_04_copilot_usage", len(df)


def generate_uc_hr_05():
    """UC-HR-05: Performance & Bias Monitoring"""
    print("[UC-HR-05] Performance & Bias Monitoring")
    n = 5000
    employee_ids = [f"EMP-{i:05d}" for i in range(1, n + 1)]
    gender = np.random.choice(["Male", "Female", "Non-Binary"], n, p=[0.48, 0.48, 0.04])
    ethnicity = np.random.choice(["White", "Asian", "Black", "Hispanic", "Other"], n, p=[0.4, 0.2, 0.15, 0.15, 0.1])
    age_group = np.random.choice(["22-30", "31-40", "41-50", "51-60", "60+"], n)
    department = np.random.choice(["IT", "Operations", "Risk", "Finance", "HR", "Sales"], n)
    job_level = np.random.choice([1, 2, 3, 4, 5], n, p=[0.3, 0.3, 0.2, 0.12, 0.08])
    performance_score = np.round(np.random.beta(5, 2, n) * 5, 1)
    promotion_flag = np.random.choice([0, 1], n, p=[0.85, 0.15])
    salary_increase_pct = np.round(np.random.uniform(0, 10, n), 2)
    bonus_pct = np.round(np.random.uniform(0, 30, n), 2)
    training_hours = np.random.randint(0, 80, n)
    engagement_score = np.round(np.random.beta(5, 2, n) * 10, 1)
    retention_risk = np.random.choice(["Low", "Medium", "High"], n, p=[0.6, 0.25, 0.15])
    fairness_flag = np.random.choice([0, 1], n, p=[0.92, 0.08])

    df = pd.DataFrame({
        "employee_id": employee_ids, "gender": gender, "ethnicity": ethnicity,
        "age_group": age_group, "department": department, "job_level": job_level,
        "performance_score": performance_score, "promotion_flag": promotion_flag,
        "salary_increase_pct": salary_increase_pct, "bonus_pct": bonus_pct,
        "training_hours": training_hours, "engagement_score": engagement_score,
        "retention_risk": retention_risk, "fairness_flag": fairness_flag,
    })
    path = os.path.join(DATA, "UC-HR-05", "csv", "performance_bias_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_hr_05_performance_bias", len(df)


def generate_uc_hr_06():
    """UC-HR-06: Resume Screening & Skills Extraction (NLP)"""
    print("[UC-HR-06] Resume Screening & Skills Extraction")
    n = 2000
    skills_pool = ["Python", "SQL", "Java", "Machine Learning", "Deep Learning", "NLP",
                    "Cloud (AWS)", "Cloud (Azure)", "Kubernetes", "Spark", "Tableau",
                    "Risk Management", "Financial Modeling", "Agile", "Project Management",
                    "Communication", "Leadership", "Data Engineering", "React", "Node.js"]

    rows = []
    for i in range(n):
        n_skills = random.randint(3, 12)
        skills = random.sample(skills_pool, n_skills)
        rows.append({
            "resume_id": f"RES-{i + 1:05d}",
            "role_applied": random.choice(["Data Scientist", "ML Engineer", "Software Engineer",
                                            "Risk Analyst", "Product Manager", "Business Analyst"]),
            "experience_years": random.randint(0, 20),
            "education": random.choice(["Bachelor", "Master", "PhD", "Diploma"]),
            "skills_extracted": "; ".join(skills),
            "skill_count": n_skills,
            "skills_match_pct": round(random.uniform(20, 100), 1),
            "resume_quality_score": round(random.uniform(30, 100), 1),
            "screening_result": random.choice(["Shortlisted", "Rejected", "Waitlisted"]),
        })

    df = pd.DataFrame(rows)
    csv_path = os.path.join(DATA, "UC-HR-06", "csv", "resume_screening_unified.csv")
    df.to_csv(csv_path, index=False)

    # Sample resume texts
    resume_samples = [
        {"id": "RES-00001", "text": "Experienced Data Scientist with 5 years in banking. Expert in Python, ML, and NLP. Built fraud detection models reducing false positives by 40%. MS in Computer Science from MIT."},
        {"id": "RES-00002", "text": "Risk Analyst with 8 years in financial services. Strong in SAS, SQL, and Basel III compliance. Led credit model validation team. CFA Level 2 candidate."},
        {"id": "RES-00003", "text": "Full-stack developer with 3 years experience. Proficient in React, Node.js, Python. Built customer-facing banking applications handling 10M+ transactions/day."},
    ]
    text_path = os.path.join(DATA, "UC-HR-06", "text", "resume_samples.json")
    with open(text_path, "w") as f:
        json.dump(resume_samples, f, indent=2)

    print(f"  Saved {len(df)} rows + {len(resume_samples)} sample resumes")
    return csv_path, "uc_hr_06_resume_screening", len(df)


def generate_uc_hr_07():
    """UC-HR-07: Workforce Strategy Simulator"""
    print("[UC-HR-07] Workforce Strategy Simulator")
    n = 2000
    scenarios = np.random.choice(["Base", "Growth", "Recession", "Digital Transform", "AI Scale-up"], n)
    departments = np.random.choice(["IT", "Operations", "Risk", "Finance", "HR",
                                     "Sales", "Data", "Compliance"], n)
    years = np.random.choice(range(2024, 2031), n)
    current_fte = np.random.randint(100, 5000, n)
    projected_fte = np.round(current_fte * np.random.uniform(0.7, 1.5, n)).astype(int)
    automation_impact_pct = np.round(np.random.uniform(0, 40, n), 1)
    reskilling_need_pct = np.round(np.random.uniform(5, 60, n), 1)
    hiring_cost_k = np.round(np.random.lognormal(3, 0.8, n), 2)
    attrition_savings_k = np.round(np.random.lognormal(2.5, 1.0, n), 2)
    productivity_index = np.round(np.random.uniform(60, 120, n), 1)
    ai_augmented_roles_pct = np.round(np.random.uniform(5, 80, n), 1)
    total_workforce_cost_m = np.round(current_fte * np.random.uniform(0.08, 0.15, n), 2)

    df = pd.DataFrame({
        "scenario": scenarios, "department": departments, "year": years,
        "current_fte": current_fte, "projected_fte": projected_fte,
        "automation_impact_pct": automation_impact_pct, "reskilling_need_pct": reskilling_need_pct,
        "hiring_cost_k": hiring_cost_k, "attrition_savings_k": attrition_savings_k,
        "productivity_index": productivity_index, "ai_augmented_roles_pct": ai_augmented_roles_pct,
        "total_workforce_cost_m": total_workforce_cost_m,
    })
    path = os.path.join(DATA, "UC-HR-07", "csv", "workforce_simulator_unified.csv")
    df.to_csv(path, index=False)
    print(f"  Saved {len(df)} rows")
    return path, "uc_hr_07_workforce_sim", len(df)


def main():
    print("=" * 60)
    print("DEPT 12: Workforce / HR Management - Data Generation")
    print("=" * 60)
    results = []
    for fn in [generate_uc_hr_01, generate_uc_hr_02, generate_uc_hr_03,
               generate_uc_hr_04, generate_uc_hr_05, generate_uc_hr_06, generate_uc_hr_07]:
        path, table, count = fn()
        results.append({"path": path, "table": table, "count": count})
    manifest_path = os.path.join(DATA, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"\nGenerated {len(results)} datasets for Department 12")


if __name__ == "__main__":
    main()
