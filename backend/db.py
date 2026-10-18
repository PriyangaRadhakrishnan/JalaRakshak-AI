"""
JalaRakshak AI — Phase 3: SQLite Database Layer
Handles database initialization, schema migration, and community report persistence.

DISCLAIMER: DEMO ONLY
Citizen crowdsourcing and local hazard reporting storage.
"""

from datetime import datetime, timezone
import os
from pathlib import Path
import sqlite3
from typing import Any, Dict, List, Optional, Tuple
import uuid

# Database path in backend/database/jalarakshak.db
BASE_DIR = Path(__file__).resolve().parent
DB_DIR = BASE_DIR / "database"
DB_PATH = DB_DIR / "jalarakshak.db"

# Allowed severity levels
VALID_SEVERITIES = {"Low", "Moderate", "High", "Critical"}

# Allowed verification statuses
VALID_VERIFICATION_STATUSES = {
    "unverified",
    "community_verified",
    "municipal_verified",
    "resolved",
    "flagged"
}


def get_db_connection() -> sqlite3.Connection:
    """
    Creates and returns a SQLite connection with Row factory and WAL mode enabled.
    """
    DB_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn


def init_db() -> None:
    """
    Initializes the SQLite database tables and indexes automatically.
    Called when the backend application starts.
    """
    DB_DIR.mkdir(parents=True, exist_ok=True)

    with get_db_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS community_reports (
                id TEXT PRIMARY KEY,
                location_description TEXT NOT NULL,
                latitude REAL,
                longitude REAL,
                severity TEXT NOT NULL,
                description TEXT NOT NULL,
                water_depth_cm REAL,
                drain_blocked INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL,
                verification_status TEXT NOT NULL DEFAULT 'unverified',
                upvotes INTEGER DEFAULT 0
            );
        """)

        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_reports_timestamp 
            ON community_reports (timestamp DESC);
        """)

        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_reports_severity 
            ON community_reports (severity);
        """)

        # Check if table is empty; if so, populate initial baseline demonstration reports
        cursor = conn.execute("SELECT COUNT(*) AS cnt FROM community_reports;")
        count = cursor.fetchone()["cnt"]

        if count == 0:
            print("[*] Seeding initial demonstration community reports...")
            initial_reports = [
                (
                    "REP-W14-SUBWAY",
                    "Ward 14 - Metro Subway Underpass (North Exit)",
                    13.0836,
                    80.2825,
                    "Critical",
                    "Water depth approximately 45 cm. Stalled vehicles reported. Storm drain grate visibly choked with plastic waste.",
                    45.0,
                    1,
                    "2026-10-17T18:30:00Z",
                    "community_verified",
                    14
                ),
                (
                    "REP-W08-CANAL",
                    "Ward 8 - North Canal Road near Culvert 4",
                    13.0921,
                    80.2710,
                    "Moderate",
                    "Water ponding along pedestrian pathway (approx 15 cm). Downstream sluice gate open and draining slowly.",
                    15.0,
                    0,
                    "2026-10-17T19:15:00Z",
                    "unverified",
                    5
                ),
                (
                    "REP-W22-MARKET",
                    "Ward 22 - Central Wholesale Market Basin",
                    13.0780,
                    80.2640,
                    "High",
                    "Surface runoff overflowing curb barriers into shopfront entrances. Storm culvert partially blocked by silt.",
                    30.0,
                    1,
                    "2026-10-17T20:00:00Z",
                    "community_verified",
                    9
                )
            ]

            conn.executemany("""
                INSERT INTO community_reports (
                    id, location_description, latitude, longitude, severity,
                    description, water_depth_cm, drain_blocked, timestamp,
                    verification_status, upvotes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, initial_reports)

    print(f"[+] SQLite database initialized successfully at: {DB_PATH}")


def check_db_health() -> bool:
    """
    Executes a lightweight query to verify database accessibility.
    """
    try:
        with get_db_connection() as conn:
            cursor = conn.execute("SELECT 1 AS probe;")
            row = cursor.fetchone()
            return row is not None and row["probe"] == 1
    except Exception as e:
        print(f"[!] Database health probe failed: {e}")
        return False


def validate_report_payload(payload: Dict[str, Any]) -> Tuple[bool, List[str], Dict[str, Any]]:
    """
    Validates community hazard report submission payload.
    Requirements:
    - location_description: non-empty string
    - severity: must be one of Low, Moderate, High, Critical
    - description: non-empty string
    - latitude & longitude: optional, but if provided must be valid geographic coordinates
    """
    errors = []
    clean_data = {}

    if not isinstance(payload, dict):
        return False, ["Payload must be a JSON object."], {}

    # 1. location_description (Required)
    loc = payload.get("location_description")
    if not loc or not isinstance(loc, str) or not loc.strip():
        errors.append("Field 'location_description' is required and must be a non-empty string.")
    else:
        clean_data["location_description"] = loc.strip()

    # 2. severity (Required)
    sev = payload.get("severity")
    if not sev or not isinstance(sev, str):
        errors.append(f"Field 'severity' is required. Allowed values: {sorted(list(VALID_SEVERITIES))}.")
    else:
        normalized_sev = sev.strip().capitalize()
        if normalized_sev not in VALID_SEVERITIES:
            errors.append(
                f"Invalid severity '{sev}'. Must be one of: {sorted(list(VALID_SEVERITIES))}."
            )
        else:
            clean_data["severity"] = normalized_sev

    # 3. description (Required)
    desc = payload.get("description")
    if not desc or not isinstance(desc, str) or not desc.strip():
        errors.append("Field 'description' is required and must be a non-empty string.")
    else:
        clean_data["description"] = desc.strip()

    # 4. Optional Latitude & Longitude validation
    lat_raw = payload.get("latitude")
    lon_raw = payload.get("longitude")

    if lat_raw is not None or lon_raw is not None:
        if lat_raw is None or lon_raw is None:
            errors.append("Both 'latitude' and 'longitude' must be provided together if coordinates are included.")
        else:
            try:
                lat = float(lat_raw)
                if lat < -90.0 or lat > 90.0:
                    errors.append(f"Latitude {lat} is out of valid range [-90.0, 90.0].")
                else:
                    clean_data["latitude"] = round(lat, 6)
            except (ValueError, TypeError):
                errors.append(f"Latitude must be a valid floating-point number (received: {lat_raw!r}).")

            try:
                lon = float(lon_raw)
                if lon < -180.0 or lon > 180.0:
                    errors.append(f"Longitude {lon} is out of valid range [-180.0, 180.0].")
                else:
                    clean_data["longitude"] = round(lon, 6)
            except (ValueError, TypeError):
                errors.append(f"Longitude must be a valid floating-point number (received: {lon_raw!r}).")
    else:
        clean_data["latitude"] = None
        clean_data["longitude"] = None

    # 5. Optional water_depth_cm
    depth_raw = payload.get("water_depth_cm")
    if depth_raw is not None:
        try:
            depth = float(depth_raw)
            if depth < 0.0 or depth > 500.0:
                errors.append(f"Water depth {depth} cm is outside realistic range [0.0, 500.0].")
            else:
                clean_data["water_depth_cm"] = round(depth, 1)
        except (ValueError, TypeError):
            errors.append(f"Water depth must be numeric (received: {depth_raw!r}).")
    else:
        clean_data["water_depth_cm"] = None

    # 6. Optional drain_blocked
    drain_raw = payload.get("drain_blocked")
    if drain_raw is not None:
        clean_data["drain_blocked"] = 1 if bool(drain_raw) else 0
    else:
        clean_data["drain_blocked"] = 0

    # 7. Optional custom ID or auto-generated
    custom_id = payload.get("id")
    if custom_id and isinstance(custom_id, str) and custom_id.strip():
        clean_data["id"] = custom_id.strip()
    else:
        clean_data["id"] = f"REP-{uuid.uuid4().hex[:8].upper()}"

    # 8. Optional timestamp (defaults to current UTC ISO 8601)
    ts_raw = payload.get("timestamp")
    if ts_raw and isinstance(ts_raw, str) and ts_raw.strip():
        clean_data["timestamp"] = ts_raw.strip()
    else:
        clean_data["timestamp"] = datetime.now(timezone.utc).isoformat()

    # 9. Verification status (defaults to 'unverified')
    status_raw = payload.get("verification_status", "unverified")
    if isinstance(status_raw, str) and status_raw.strip().lower() in VALID_VERIFICATION_STATUSES:
        clean_data["verification_status"] = status_raw.strip().lower()
    else:
        clean_data["verification_status"] = "unverified"

    # 10. Upvotes
    upvotes_raw = payload.get("upvotes", 0)
    try:
        clean_data["upvotes"] = max(0, int(upvotes_raw))
    except (ValueError, TypeError):
        clean_data["upvotes"] = 0

    is_valid = len(errors) == 0
    return is_valid, errors, clean_data


def create_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Inserts a validated report into the SQLite community_reports table.
    """
    with get_db_connection() as conn:
        conn.execute("""
            INSERT INTO community_reports (
                id, location_description, latitude, longitude, severity,
                description, water_depth_cm, drain_blocked, timestamp,
                verification_status, upvotes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        """, (
            report_data["id"],
            report_data["location_description"],
            report_data["latitude"],
            report_data["longitude"],
            report_data["severity"],
            report_data["description"],
            report_data["water_depth_cm"],
            report_data["drain_blocked"],
            report_data["timestamp"],
            report_data["verification_status"],
            report_data["upvotes"],
        ))

    return get_report_by_id(report_data["id"])


def get_all_reports(severity: Optional[str] = None, limit: int = 50) -> List[Dict[str, Any]]:
    """
    Fetches all community hazard reports, sorted newest first.
    Optional filtering by severity.
    """
    query = "SELECT * FROM community_reports"
    params = []

    if severity:
        query += " WHERE LOWER(severity) = LOWER(?)"
        params.append(severity)

    query += " ORDER BY timestamp DESC LIMIT ?;"
    params.append(limit)

    with get_db_connection() as conn:
        cursor = conn.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single report by its ID.
    """
    with get_db_connection() as conn:
        cursor = conn.execute("SELECT * FROM community_reports WHERE id = ?;", (report_id,))
        row = cursor.fetchone()
        return dict(row) if row else None
