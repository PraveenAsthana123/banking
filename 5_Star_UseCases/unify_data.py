#!/usr/bin/env python3
"""
Unify all Banking AI POC datasets:
- Add US state + city location fields
- Add realistic human names (first_name, last_name)
- Normalize existing location fields to US
- Output: unified CSV per use case in the same data folder
"""

import os
import csv
import gzip
import random
import json
import sys
from pathlib import Path

# Add parent directory to path for config imports
_PARENT_DIR = Path(__file__).resolve().parent.parent
if str(_PARENT_DIR) not in sys.path:
    sys.path.insert(0, str(_PARENT_DIR))

from config import USE_CASES_DIR

# Lazy import faker
from faker import Faker
from faker.providers import person, address

fake = Faker('en_US')
Faker.seed(42)
random.seed(42)

BASE = str(USE_CASES_DIR)

# US States with population-weighted cities
US_STATES = {
    "CA": {"name": "California", "cities": ["Los Angeles", "San Francisco", "San Diego", "San Jose", "Sacramento", "Fresno", "Oakland", "Long Beach"]},
    "TX": {"name": "Texas", "cities": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "El Paso", "Arlington", "Plano"]},
    "NY": {"name": "New York", "cities": ["New York", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers", "White Plains"]},
    "FL": {"name": "Florida", "cities": ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "St. Petersburg", "Tallahassee"]},
    "IL": {"name": "Illinois", "cities": ["Chicago", "Aurora", "Naperville", "Rockford", "Springfield", "Joliet", "Peoria"]},
    "PA": {"name": "Pennsylvania", "cities": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton", "Bethlehem"]},
    "OH": {"name": "Ohio", "cities": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton", "Canton"]},
    "GA": {"name": "Georgia", "cities": ["Atlanta", "Augusta", "Savannah", "Athens", "Macon", "Roswell", "Albany"]},
    "NC": {"name": "North Carolina", "cities": ["Charlotte", "Raleigh", "Durham", "Greensboro", "Winston-Salem", "Fayetteville", "Cary"]},
    "MI": {"name": "Michigan", "cities": ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing", "Flint", "Dearborn", "Kalamazoo"]},
    "NJ": {"name": "New Jersey", "cities": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Trenton", "Camden", "Clifton"]},
    "VA": {"name": "Virginia", "cities": ["Virginia Beach", "Norfolk", "Richmond", "Arlington", "Alexandria", "Chesapeake", "Newport News"]},
    "WA": {"name": "Washington", "cities": ["Seattle", "Tacoma", "Spokane", "Vancouver", "Bellevue", "Kent", "Everett"]},
    "AZ": {"name": "Arizona", "cities": ["Phoenix", "Tucson", "Mesa", "Scottsdale", "Chandler", "Tempe", "Gilbert"]},
    "MA": {"name": "Massachusetts", "cities": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton", "New Bedford"]},
    "TN": {"name": "Tennessee", "cities": ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville", "Murfreesboro"]},
    "IN": {"name": "Indiana", "cities": ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel", "Fishers"]},
    "MO": {"name": "Missouri", "cities": ["Kansas City", "St. Louis", "Springfield", "Columbia", "Independence", "Jefferson City"]},
    "MD": {"name": "Maryland", "cities": ["Baltimore", "Rockville", "Frederick", "Gaithersburg", "Bowie", "Annapolis"]},
    "WI": {"name": "Wisconsin", "cities": ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine", "Appleton"]},
    "CO": {"name": "Colorado", "cities": ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Boulder", "Lakewood"]},
    "MN": {"name": "Minnesota", "cities": ["Minneapolis", "St. Paul", "Rochester", "Duluth", "Bloomington", "Brooklyn Park"]},
    "SC": {"name": "South Carolina", "cities": ["Charleston", "Columbia", "Greenville", "Myrtle Beach", "Rock Hill"]},
    "AL": {"name": "Alabama", "cities": ["Birmingham", "Montgomery", "Huntsville", "Mobile", "Tuscaloosa"]},
    "LA": {"name": "Louisiana", "cities": ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"]},
    "KY": {"name": "Kentucky", "cities": ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"]},
    "OR": {"name": "Oregon", "cities": ["Portland", "Salem", "Eugene", "Bend", "Medford", "Corvallis"]},
    "OK": {"name": "Oklahoma", "cities": ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Edmond"]},
    "CT": {"name": "Connecticut", "cities": ["Bridgeport", "New Haven", "Hartford", "Stamford", "Waterbury"]},
    "UT": {"name": "Utah", "cities": ["Salt Lake City", "Provo", "West Valley City", "Orem", "Sandy"]},
    "NV": {"name": "Nevada", "cities": ["Las Vegas", "Reno", "Henderson", "North Las Vegas", "Sparks"]},
    "IA": {"name": "Iowa", "cities": ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"]},
    "AR": {"name": "Arkansas", "cities": ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"]},
    "MS": {"name": "Mississippi", "cities": ["Jackson", "Gulfport", "Hattiesburg", "Biloxi", "Meridian"]},
    "KS": {"name": "Kansas", "cities": ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe"]},
    "NM": {"name": "New Mexico", "cities": ["Albuquerque", "Santa Fe", "Las Cruces", "Rio Rancho", "Roswell"]},
    "NE": {"name": "Nebraska", "cities": ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"]},
    "ID": {"name": "Idaho", "cities": ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"]},
    "WV": {"name": "West Virginia", "cities": ["Charleston", "Huntington", "Morgantown", "Parkersburg", "Wheeling"]},
    "HI": {"name": "Hawaii", "cities": ["Honolulu", "Hilo", "Kailua", "Pearl City", "Waipahu"]},
    "NH": {"name": "New Hampshire", "cities": ["Manchester", "Nashua", "Concord", "Dover", "Rochester"]},
    "ME": {"name": "Maine", "cities": ["Portland", "Lewiston", "Bangor", "Auburn", "Biddeford"]},
    "MT": {"name": "Montana", "cities": ["Billings", "Missoula", "Great Falls", "Bozeman", "Helena"]},
    "RI": {"name": "Rhode Island", "cities": ["Providence", "Warwick", "Cranston", "Pawtucket", "Newport"]},
    "DE": {"name": "Delaware", "cities": ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"]},
    "SD": {"name": "South Dakota", "cities": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"]},
    "ND": {"name": "North Dakota", "cities": ["Fargo", "Bismarck", "Grand Forks", "Minot", "Williston"]},
    "AK": {"name": "Alaska", "cities": ["Anchorage", "Juneau", "Fairbanks", "Sitka", "Ketchikan"]},
    "VT": {"name": "Vermont", "cities": ["Burlington", "Montpelier", "Rutland", "Barre", "Bennington"]},
    "WY": {"name": "Wyoming", "cities": ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"]},
    "DC": {"name": "District of Columbia", "cities": ["Washington"]},
}

# Population-weighted state codes for realistic distribution
STATE_WEIGHTS = [
    ("CA", 12), ("TX", 9), ("FL", 7), ("NY", 6), ("PA", 4), ("IL", 4),
    ("OH", 4), ("GA", 3), ("NC", 3), ("MI", 3), ("NJ", 3), ("VA", 3),
    ("WA", 2), ("AZ", 2), ("MA", 2), ("TN", 2), ("IN", 2), ("MO", 2),
    ("MD", 2), ("WI", 2), ("CO", 2), ("MN", 2), ("SC", 2), ("AL", 1),
    ("LA", 1), ("KY", 1), ("OR", 1), ("OK", 1), ("CT", 1), ("UT", 1),
    ("NV", 1), ("IA", 1), ("AR", 1), ("MS", 1), ("KS", 1), ("NM", 1),
    ("NE", 1), ("ID", 1), ("WV", 1), ("HI", 1), ("NH", 1), ("ME", 1),
    ("MT", 1), ("RI", 1), ("DE", 1), ("SD", 1), ("ND", 1), ("AK", 1),
    ("VT", 1), ("WY", 1), ("DC", 1),
]
WEIGHTED_STATES = []
for code, weight in STATE_WEIGHTS:
    WEIGHTED_STATES.extend([code] * weight)


def random_location():
    """Return (state_code, state_name, city)"""
    sc = random.choice(WEIGHTED_STATES)
    info = US_STATES[sc]
    city = random.choice(info["cities"])
    return sc, info["name"], city


def random_name():
    """Return (first_name, last_name)"""
    return fake.first_name(), fake.last_name()


# ---- Name cache for consistent IDs ----
_name_cache = {}
_loc_cache = {}

def name_for_id(entity_id):
    if entity_id not in _name_cache:
        _name_cache[entity_id] = random_name()
    return _name_cache[entity_id]

def loc_for_id(entity_id):
    if entity_id not in _loc_cache:
        _loc_cache[entity_id] = random_location()
    return _loc_cache[entity_id]


def process_csv(input_path, output_path, transform_fn, max_rows=None, delimiter=',', encoding='utf-8'):
    """Generic CSV processor with transform function."""
    print(f"  Processing: {os.path.basename(input_path)}")
    count = 0
    errors = 0

    open_fn = gzip.open if input_path.endswith('.gz') else open
    open_kwargs = {'mode': 'rt', 'encoding': encoding, 'errors': 'replace'}

    with open_fn(input_path, **open_kwargs) as fin:
        reader = csv.DictReader(fin, delimiter=delimiter)
        if not reader.fieldnames:
            print(f"    SKIP: no headers found")
            return 0

        new_fields = transform_fn(None, None, get_fields=True)
        out_fields = list(reader.fieldnames) + new_fields

        with open(output_path, 'w', newline='', encoding='utf-8') as fout:
            writer = csv.DictWriter(fout, fieldnames=out_fields, extrasaction='ignore')
            writer.writeheader()

            for row in reader:
                try:
                    row = transform_fn(row, count)
                    writer.writerow(row)
                    count += 1
                    if max_rows and count >= max_rows:
                        break
                    if count % 500000 == 0:
                        print(f"    ... {count:,} rows")
                except Exception as e:
                    errors += 1
                    if errors <= 3:
                        print(f"    WARN row {count}: {e}")

    print(f"    Done: {count:,} rows -> {output_path}")
    return count


# =====================================================================
# TRANSFORM FUNCTIONS (one per use case)
# =====================================================================

def uc_06_01_transform(row, idx, get_fields=False):
    """Credit Card Fraud - fully anonymized, add everything"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state", "us_state_name", "us_city"]
    fn, ln = random_name()
    sc, sn, city = random_location()
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    row["us_state"] = sc
    row["us_state_name"] = sn
    row["us_city"] = city
    return row


def uc_06_04_transform(row, idx, get_fields=False):
    """RBA Login - has Country/Region/City, remap to US"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state", "us_state_name", "us_city"]
    uid = row.get("User ID", str(idx))
    fn, ln = name_for_id(uid)
    sc, sn, city = loc_for_id(uid)
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    row["Country"] = "US"
    row["Region"] = sn
    row["City"] = city
    row["us_state"] = sc
    row["us_state_name"] = sn
    row["us_city"] = city
    return row


def uc_07_02_transform(row, idx, get_fields=False):
    """LendingClub Accepted - has zip_code, addr_state; add names"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state_name", "us_city"]
    mid = row.get("member_id", str(idx))
    fn, ln = name_for_id(mid)
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    # Normalize state
    st = row.get("addr_state", "").strip()
    if st in US_STATES:
        sc, sn, city = loc_for_id(mid)
        row["us_state_name"] = US_STATES[st]["name"]
        row["us_city"] = random.choice(US_STATES[st]["cities"])
    else:
        sc, sn, city = loc_for_id(mid)
        row["addr_state"] = sc
        row["us_state_name"] = sn
        row["us_city"] = city
    return row


def uc_07_03_transform(row, idx, get_fields=False):
    """Loan Data 2007-2014 - similar to LendingClub"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state", "us_state_name", "us_city"]
    mid = row.get("member_id", str(idx))
    fn, ln = name_for_id(mid)
    sc, sn, city = loc_for_id(mid)
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    row["us_state"] = sc
    row["us_state_name"] = sn
    row["us_city"] = city
    return row


def uc_08_01_transform(row, idx, get_fields=False):
    """PaySim - has nameOrig/nameDest, add location"""
    if get_fields:
        return ["orig_first_name", "orig_last_name", "orig_us_state", "orig_us_city",
                "dest_first_name", "dest_last_name", "dest_us_state", "dest_us_city"]
    no = row.get("nameOrig", str(idx))
    nd = row.get("nameDest", str(idx) + "_d")
    fn1, ln1 = name_for_id(no)
    fn2, ln2 = name_for_id(nd)
    sc1, _, c1 = loc_for_id(no)
    sc2, _, c2 = loc_for_id(nd)
    row["orig_first_name"] = fn1
    row["orig_last_name"] = ln1
    row["orig_us_state"] = sc1
    row["orig_us_city"] = c1
    row["dest_first_name"] = fn2
    row["dest_last_name"] = ln2
    row["dest_us_state"] = sc2
    row["dest_us_city"] = c2
    return row


def uc_08_03_transform(row, idx, get_fields=False):
    """AML Synthetic - has bank locations, remap to US"""
    if get_fields:
        return ["sender_first_name", "sender_last_name", "sender_us_state", "sender_us_city",
                "receiver_first_name", "receiver_last_name", "receiver_us_state", "receiver_us_city"]
    sa = row.get("Sender_account", str(idx))
    ra = row.get("Receiver_account", str(idx) + "_r")
    fn1, ln1 = name_for_id(sa)
    fn2, ln2 = name_for_id(ra)
    sc1, sn1, c1 = loc_for_id(sa)
    sc2, sn2, c2 = loc_for_id(ra)
    row["sender_first_name"] = fn1
    row["sender_last_name"] = ln1
    row["Sender_bank_location"] = f"{c1}, {sc1}"
    row["sender_us_state"] = sc1
    row["sender_us_city"] = c1
    row["receiver_first_name"] = fn2
    row["receiver_last_name"] = ln2
    row["Receiver_bank_location"] = f"{c2}, {sc2}"
    row["receiver_us_state"] = sc2
    row["receiver_us_city"] = c2
    row["Payment_currency"] = "US Dollar"
    row["Received_currency"] = "US Dollar"
    return row


def uc_09_01_transform(row, idx, get_fields=False):
    """UCI Credit Card Default - no location, no names"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state", "us_state_name", "us_city"]
    cid = row.get("ID", str(idx))
    fn, ln = name_for_id(cid)
    sc, sn, city = loc_for_id(cid)
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    row["us_state"] = sc
    row["us_state_name"] = sn
    row["us_city"] = city
    return row


def uc_11_03_transform(row, idx, get_fields=False):
    """Bank Transactions - has CustLocation, remap to US"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state", "us_state_name", "us_city"]
    cid = row.get("CustomerID", str(idx))
    fn, ln = name_for_id(cid)
    sc, sn, city = loc_for_id(cid)
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    row["CustLocation"] = f"{city}, {sc}"
    row["us_state"] = sc
    row["us_state_name"] = sn
    row["us_city"] = city
    return row


def uc_12_02_transform(row, idx, get_fields=False):
    """Twitter Customer Support - has author_id"""
    if get_fields:
        return ["customer_first_name", "customer_last_name", "us_state", "us_city"]
    aid = row.get("author_id", str(idx))
    fn, ln = name_for_id(aid)
    sc, _, city = loc_for_id(aid)
    row["customer_first_name"] = fn
    row["customer_last_name"] = ln
    row["us_state"] = sc
    row["us_city"] = city
    return row


def uc_16_01_transform(row, idx, get_fields=False):
    """Bank Customer Segmentation (same data as UC-11-03)"""
    return uc_11_03_transform(row, idx, get_fields=get_fields)


def uc_32_01_transform(row, idx, get_fields=False):
    """Federal Reserve Rates - macro data, just add US context"""
    if get_fields:
        return ["country"]
    row["country"] = "United States"
    return row


# =====================================================================
# MAIN EXECUTION
# =====================================================================

JOBS = [
    {
        "uc": "UC-06-01",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-01/creditcard.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-01/creditcard_unified.csv",
        "transform": uc_06_01_transform,
        "max_rows": None,
    },
    {
        "uc": "UC-06-04",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-04/rba-dataset.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/06_Fraud_Management/data/UC-06-04/rba_dataset_unified.csv",
        "transform": uc_06_04_transform,
        "max_rows": 500000,  # Cap at 500K (original is 31M)
    },
    {
        "uc": "UC-07-02",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-02/accepted_2007_to_2018q4.csv/accepted_2007_to_2018Q4.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-02/lending_club_unified.csv",
        "transform": uc_07_02_transform,
        "max_rows": 500000,
    },
    {
        "uc": "UC-07-03",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-03/loan_data_2007_2014/loan_data_2007_2014.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/07_Credit_Risk_Management/data/UC-07-03/loan_data_unified.csv",
        "transform": uc_07_03_transform,
        "max_rows": None,
    },
    {
        "uc": "UC-08-01",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-01/PS_20174392719_1491204439457_log.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-01/paysim_unified.csv",
        "transform": uc_08_01_transform,
        "max_rows": 1000000,
    },
    {
        "uc": "UC-08-03",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-03/SAML-D.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/08_AML_Financial_Crime/data/UC-08-03/aml_synthetic_unified.csv",
        "transform": uc_08_03_transform,
        "max_rows": 1000000,
    },
    {
        "uc": "UC-09-01",
        "input": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-01/UCI_Credit_Card.csv",
        "output": f"{BASE}/B_Risk_Fraud_and_Financial_Crime/09_Collections_and_Recovery/data/UC-09-01/credit_card_default_unified.csv",
        "transform": uc_09_01_transform,
        "max_rows": None,
    },
    {
        "uc": "UC-11-03",
        "input": f"{BASE}/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-03/bank_transactions.csv",
        "output": f"{BASE}/C_Operations_and_Cost_Optimization/11_Branch_Operations/data/UC-11-03/bank_transactions_unified.csv",
        "transform": uc_11_03_transform,
        "max_rows": None,
    },
    {
        "uc": "UC-12-02",
        "input": f"{BASE}/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-02/twcs/twcs.csv",
        "output": f"{BASE}/C_Operations_and_Cost_Optimization/12_Contact_Center_Operations/data/UC-12-02/twcs_unified.csv",
        "transform": uc_12_02_transform,
        "max_rows": 500000,
    },
    {
        "uc": "UC-16-01",
        "input": f"{BASE}/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-01/bank_transactions.csv",
        "output": f"{BASE}/D_Data_Governance_and_Platform/16_Data_Governance_and_Quality/data/UC-16-01/bank_transactions_unified.csv",
        "transform": uc_16_01_transform,
        "max_rows": None,
    },
    {
        "uc": "UC-32-01",
        "input": f"{BASE}/G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-01/index.csv",
        "output": f"{BASE}/G_Executive_and_Enterprise_Decisioning/32_Treasury/data/UC-32-01/fed_rates_unified.csv",
        "transform": uc_32_01_transform,
        "max_rows": None,
    },
]


def main():
    print("=" * 60)
    print("BANKING DATA UNIFICATION")
    print("Location: US States & Cities | Names: Realistic US Names")
    print("=" * 60)

    results = []

    for job in JOBS:
        uc = job["uc"]
        inp = job["input"]
        out = job["output"]

        print(f"\n[{uc}]")

        if not os.path.exists(inp):
            print(f"  SKIP: input not found: {inp}")
            results.append({"uc": uc, "status": "skipped", "rows": 0})
            continue

        try:
            _name_cache.clear()
            _loc_cache.clear()
            rows = process_csv(
                inp, out,
                transform_fn=job["transform"],
                max_rows=job.get("max_rows"),
            )
            results.append({"uc": uc, "status": "ok", "rows": rows})
        except Exception as e:
            print(f"  ERROR: {e}")
            results.append({"uc": uc, "status": "error", "rows": 0, "error": str(e)})

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    total_rows = 0
    for r in results:
        status = r["status"].upper()
        rows = r["rows"]
        total_rows += rows
        print(f"  {r['uc']}: {status} ({rows:,} rows)")
    print(f"\n  TOTAL: {total_rows:,} rows unified")
    print("=" * 60)


if __name__ == "__main__":
    main()
