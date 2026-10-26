from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from app.services.session_store import (
    create_session, append_frame, get_session, list_sessions,
    delete_session, get_frame, export_session,
)

router = APIRouter(prefix="/api/v1", tags=["Session Replay & Data Logging"])

from pydantic import BaseModel

class CreateSessionReq(BaseModel):
    object_label: str = "unknown"

class AppendFrameReq(BaseModel):
    frame: Dict[str, Any]

@router.post("/sessions")
async def create_new_session(payload: CreateSessionReq):
    sid = create_session(payload.object_label)
    return {"session_id": sid, "status": "created"}

@router.get("/sessions")
async def list_all_sessions():
    return {"sessions": list_sessions()}

@router.get("/sessions/{session_id}")
async def get_session_info(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "id": s["id"],
        "object_label": s["object_label"],
        "created_at": s["created_at"],
        "frame_count": len(s["frames"]),
    }

@router.post("/sessions/{session_id}/frames")
async def append_session_frame(session_id: str, payload: AppendFrameReq):
    ok = append_frame(session_id, payload.frame)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found or full")
    return {"status": "appended"}

@router.get("/sessions/{session_id}/frame/{index}")
async def get_session_frame(session_id: str, index: int):
    f = get_frame(session_id, index)
    if f is None:
        raise HTTPException(status_code=404, detail="Frame not found")
    return f

@router.get("/sessions/{session_id}/export")
async def export_session_data(session_id: str):
    data = export_session(session_id)
    if not data:
        raise HTTPException(status_code=404, detail="Session not found")
    return data

@router.delete("/sessions/{session_id}")
async def delete_session_data(session_id: str):
    ok = delete_session(session_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted"}
