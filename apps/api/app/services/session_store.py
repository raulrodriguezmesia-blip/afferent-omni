"""Persistent session store backed by SQLite.

Stores telemetry frames captured during live streaming so they can be replayed,
exported, and analyzed post-session. Survives backend restarts.
"""
import json
import sqlite3
import time
import uuid
import os
from typing import Dict, List, Any, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "data", "sessions.db")
MAX_FRAMES_PER_SESSION = 5000
MAX_SESSIONS = 50


def _get_conn() -> sqlite3.Connection:
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db():
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            object_label TEXT NOT NULL,
            created_at REAL NOT NULL,
            metadata TEXT DEFAULT '{}'
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS frames (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            frame_index INTEGER NOT NULL,
            frame_data TEXT NOT NULL,
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        )
    """)
    conn.execute("CREATE INDEX IF NOT EXISTS idx_frames_session ON frames(session_id)")
    conn.commit()
    conn.close()


_init_db()


def create_session(object_label: str = "unknown") -> str:
    sid = str(uuid.uuid4())[:12]
    conn = _get_conn()
    # Evict oldest if over limit
    count = conn.execute("SELECT COUNT(*) FROM sessions").fetchone()[0]
    if count >= MAX_SESSIONS:
        oldest = conn.execute("SELECT id FROM sessions ORDER BY created_at ASC LIMIT 1").fetchone()
        if oldest:
            conn.execute("DELETE FROM frames WHERE session_id = ?", (oldest["id"],))
            conn.execute("DELETE FROM sessions WHERE id = ?", (oldest["id"],))
    conn.execute(
        "INSERT INTO sessions (id, object_label, created_at, metadata) VALUES (?, ?, ?, ?)",
        (sid, object_label, time.time(), "{}"),
    )
    conn.commit()
    conn.close()
    return sid


def append_frame(session_id: str, frame: Dict[str, Any]) -> bool:
    conn = _get_conn()
    row = conn.execute("SELECT id FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not row:
        conn.close()
        return False
    count = conn.execute("SELECT COUNT(*) FROM frames WHERE session_id = ?", (session_id,)).fetchone()[0]
    if count >= MAX_FRAMES_PER_SESSION:
        conn.close()
        return False
    conn.execute(
        "INSERT INTO frames (session_id, frame_index, frame_data) VALUES (?, ?, ?)",
        (session_id, count, json.dumps(frame)),
    )
    conn.commit()
    conn.close()
    return True


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = _get_conn()
    row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    if not row:
        conn.close()
        return None
    frames = conn.execute(
        "SELECT frame_data FROM frames WHERE session_id = ? ORDER BY frame_index ASC", (session_id,)
    ).fetchall()
    conn.close()
    return {
        "id": row["id"],
        "object_label": row["object_label"],
        "created_at": row["created_at"],
        "metadata": json.loads(row["metadata"] or "{}"),
        "frames": [json.loads(f["frame_data"]) for f in frames],
    }


def list_sessions() -> List[Dict[str, Any]]:
    conn = _get_conn()
    rows = conn.execute(
        "SELECT s.id, s.object_label, s.created_at, COUNT(f.id) as frame_count "
        "FROM sessions s LEFT JOIN frames f ON s.id = f.session_id "
        "GROUP BY s.id ORDER BY s.created_at DESC"
    ).fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "object_label": r["object_label"],
            "created_at": r["created_at"],
            "frame_count": r["frame_count"],
        }
        for r in rows
    ]


def delete_session(session_id: str) -> bool:
    conn = _get_conn()
    conn.execute("DELETE FROM frames WHERE session_id = ?", (session_id,))
    cur = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    deleted = cur.rowcount > 0
    conn.close()
    return deleted


def get_frame(session_id: str, index: int) -> Optional[Dict[str, Any]]:
    conn = _get_conn()
    row = conn.execute(
        "SELECT frame_data FROM frames WHERE session_id = ? AND frame_index = ?",
        (session_id, index),
    ).fetchone()
    conn.close()
    if not row:
        return None
    return json.loads(row["frame_data"])


def export_session(session_id: str) -> Optional[Dict[str, Any]]:
    s = get_session(session_id)
    if not s:
        return None
    return {
        "id": s["id"],
        "object_label": s["object_label"],
        "created_at": s["created_at"],
        "frame_count": len(s["frames"]),
        "frames": s["frames"],
    }
