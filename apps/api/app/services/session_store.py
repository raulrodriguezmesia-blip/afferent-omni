"""In-memory session store for telemetry replay and data logging.

Stores frames captured during live streaming so they can be replayed,
exported, and analyzed post-session.
"""
import time
import uuid
from typing import Dict, List, Any, Optional
from collections import deque

# Maximum frames per session to avoid memory blowup
MAX_FRAMES_PER_SESSION = 5000
MAX_SESSIONS = 50

_sessions: Dict[str, Dict[str, Any]] = {}
_session_order: deque = deque(maxlen=MAX_SESSIONS)


def create_session(object_label: str = "unknown") -> str:
    sid = str(uuid.uuid4())[:12]
    _sessions[sid] = {
        "id": sid,
        "object_label": object_label,
        "created_at": time.time(),
        "frames": [],
        "metadata": {},
    }
    _session_order.append(sid)
    # Evict oldest if over limit
    while len(_sessions) > MAX_SESSIONS:
        old = _session_order.popleft() if _session_order else None
        if old and old in _sessions:
            del _sessions[old]
    return sid


def append_frame(session_id: str, frame: Dict[str, Any]) -> bool:
    s = _sessions.get(session_id)
    if not s:
        return False
    if len(s["frames"]) >= MAX_FRAMES_PER_SESSION:
        return False
    s["frames"].append(frame)
    return True


def get_session(session_id: str) -> Optional[Dict[str, Any]]:
    return _sessions.get(session_id)


def list_sessions() -> List[Dict[str, Any]]:
    out = []
    for sid in list(_session_order):
        s = _sessions.get(sid)
        if s:
            out.append({
                "id": s["id"],
                "object_label": s["object_label"],
                "created_at": s["created_at"],
                "frame_count": len(s["frames"]),
            })
    return out[::-1]


def delete_session(session_id: str) -> bool:
    if session_id in _sessions:
        del _sessions[session_id]
        return True
    return False


def get_frame(session_id: str, index: int) -> Optional[Dict[str, Any]]:
    s = _sessions.get(session_id)
    if not s or index < 0 or index >= len(s["frames"]):
        return None
    return s["frames"][index]


def export_session(session_id: str) -> Optional[Dict[str, Any]]:
    s = _sessions.get(session_id)
    if not s:
        return None
    return {
        "id": s["id"],
        "object_label": s["object_label"],
        "created_at": s["created_at"],
        "frame_count": len(s["frames"]),
        "frames": s["frames"],
    }
