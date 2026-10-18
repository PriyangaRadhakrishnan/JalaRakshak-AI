"""
JalaRakshak AI — Phase 3 API Test Suite
Automated verification of health, predictions, metrics, and SQLite community reports.
"""

import json
import urllib.request
import urllib.error
import sys

BASE_URL = "http://127.0.0.1:5000"

def request_json(url, method="GET", data=None):
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))


def run_all_tests():
    print("=" * 70)
    print("JalaRakshak AI -- Phase 3 Automated API Test Suite")
    print("=" * 70)

    # 1. Test GET /api/health
    print("\n[TEST 1] GET /api/health")
    code, data = request_json(f"{BASE_URL}/api/health")
    print(f"Status Code: {code}")
    print(f"Response: {json.dumps(data, indent=2)}")
    assert code == 200, f"Expected 200, got {code}"
    assert data["status"] == "healthy", f"Expected healthy, got {data['status']}"
    assert data["modules"]["database"] == "active"
    assert data["modules"]["ml_risk_predictor"] == "active"
    print("[PASS] TEST 1 PASSED")

    # 2. Test GET /api/metrics
    print("\n[TEST 2] GET /api/metrics")
    code, data = request_json(f"{BASE_URL}/api/metrics")
    print(f"Status Code: {code}")
    print(f"Accuracy: {data['evaluation_metrics']['accuracy']}")
    print(f"Recall:   {data['evaluation_metrics']['recall']}")
    print(f"F1-Score: {data['evaluation_metrics']['f1_score']}")
    print(f"Confusion Matrix: {data['evaluation_metrics']['confusion_matrix']}")
    print(f"Top Feature: {data['feature_importances'][0]['feature']} (perm_imp: {data['feature_importances'][0]['permutation_importance_mean']})")
    assert code == 200, f"Expected 200, got {code}"
    assert data["status"] == "available"
    assert "evaluation_metrics" in data
    print("[PASS] TEST 2 PASSED")

    # 3. Test POST /api/predict (Valid Payload)
    print("\n[TEST 3] POST /api/predict (Valid Storm Input)")
    valid_pred_input = {
        "rainfall_3h_mm": 90.0,
        "rainfall_24h_mm": 170.0,
        "soil_saturation_pct": 85.0,
        "drainage_capacity_pct": 30.0,
        "elevation_m": 5.0,
        "tide_level_m": 2.5,
        "impervious_surface_pct": 80.0
    }
    code, data = request_json(f"{BASE_URL}/api/predict", method="POST", data=valid_pred_input)
    print(f"Status Code: {code}")
    print(f"Prediction: {data['prediction']['risk_level']} (Prob: {data['prediction']['flood_probability']})")
    print(f"Top Factor: {data['influential_factors'][0]['summary']}")
    print(f"Disclaimer: {data['demo_disclaimer'][:60]}...")
    assert code == 200, f"Expected 200, got {code}"
    assert data["status"] == "success"
    assert data["is_demo_only"] is True
    assert "influential_factors" in data
    print("[PASS] TEST 3 PASSED")

    # 4. Test POST /api/predict (Validation Error Handling)
    print("\n[TEST 4] POST /api/predict (Invalid Out-of-Range Input)")
    invalid_pred_input = {
        "rainfall_3h_mm": 450.0,  # Max allowed is 300.0
        "rainfall_24h_mm": 100.0,
        "soil_saturation_pct": 120.0, # Max allowed is 100.0
        "drainage_capacity_pct": 50.0,
        "elevation_m": 10.0,
        "tide_level_m": 1.0,
        "impervious_surface_pct": 60.0
    }
    code, data = request_json(f"{BASE_URL}/api/predict", method="POST", data=invalid_pred_input)
    print(f"Status Code: {code}")
    print(f"Errors returned: {data.get('errors')}")
    assert code == 400, f"Expected 400, got {code}"
    assert data["status"] == "validation_error"
    assert len(data["errors"]) >= 2
    print("[PASS] TEST 4 PASSED")

    # 5. Test GET /api/reports (Read seeded reports from SQLite)
    print("\n[TEST 5] GET /api/reports")
    code, data = request_json(f"{BASE_URL}/api/reports")
    print(f"Status Code: {code}")
    print(f"Total Reports Stored: {data['count']}")
    for r in data["reports"][:2]:
        print(f"  - [{r['id']}] ({r['severity']}) {r['location_description']}: {r['description'][:50]}...")
    assert code == 200, f"Expected 200, got {code}"
    assert data["status"] == "success"
    assert data["count"] >= 3
    print("[PASS] TEST 5 PASSED")

    # 6. Test POST /api/reports (Insert New Citizen Report)
    print("\n[TEST 6] POST /api/reports (Submit New Incident)")
    new_report = {
        "location_description": "Sector 5 Cross Road - Main Storm Culvert",
        "severity": "Critical",
        "description": "Culvert completely choked with fallen branches and urban debris. Water depth approx 50cm across lanes.",
        "water_depth_cm": 50.0,
        "drain_blocked": 1,
        "latitude": 13.0855,
        "longitude": 80.2790
    }
    code, data = request_json(f"{BASE_URL}/api/reports", method="POST", data=new_report)
    print(f"Status Code: {code}")
    print(f"Created Report ID: {data['report']['id']}")
    print(f"Saved Severity:    {data['report']['severity']}")
    print(f"Saved Timestamp:   {data['report']['timestamp']}")
    created_id = data["report"]["id"]
    assert code == 201, f"Expected 201, got {code}"
    assert data["status"] == "success"
    assert data["report"]["location_description"] == new_report["location_description"]
    print("[PASS] TEST 6 PASSED")

    # 7. Test GET /api/reports/<id>
    print(f"\n[TEST 7] GET /api/reports/{created_id}")
    code, data = request_json(f"{BASE_URL}/api/reports/{created_id}")
    print(f"Status Code: {code}")
    print(f"Fetched Report: {data['report']['id']} - {data['report']['location_description']}")
    assert code == 200, f"Expected 200, got {code}"
    assert data["report"]["id"] == created_id
    print("[PASS] TEST 7 PASSED")

    # 8. Test POST /api/reports (Validation Error: Invalid Coordinates)
    print("\n[TEST 8] POST /api/reports (Validation: Invalid Coordinates & Missing Location)")
    invalid_report = {
        "severity": "UnknownLevel", # Invalid severity
        "description": "Some description",
        "latitude": 145.0,  # Invalid latitude > 90
        "longitude": 80.0
    }
    code, data = request_json(f"{BASE_URL}/api/reports", method="POST", data=invalid_report)
    print(f"Status Code: {code}")
    print(f"Errors returned: {data.get('errors')}")
    assert code == 400, f"Expected 400, got {code}"
    assert data["status"] == "validation_error"
    assert len(data["errors"]) >= 3
    print("[PASS] TEST 8 PASSED")

    # 9. Test GET /api/reports with filter
    print("\n[TEST 9] GET /api/reports?severity=Critical")
    code, data = request_json(f"{BASE_URL}/api/reports?severity=Critical")
    print(f"Status Code: {code}")
    print(f"Filtered Count (Critical only): {data['count']}")
    assert code == 200, f"Expected 200, got {code}"
    assert all(r["severity"] == "Critical" for r in data["reports"])
    print("[PASS] TEST 9 PASSED")

    print("\n" + "=" * 70)
    print("ALL 9 PHASE 3 API TESTS PASSED SUCCESSFULLY! [PASS]")
    print("=" * 70)

if __name__ == "__main__":
    run_all_tests()
