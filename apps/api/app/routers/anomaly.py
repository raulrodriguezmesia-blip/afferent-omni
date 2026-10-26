from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from app.services.anomaly_detector import detect_anomalies
from app.services.session_store import get_session

router = APIRouter(prefix="/api/v1", tags=["Anomaly Detection"])

class AnomalyCheckReq(BaseModel):
    frames: List[Dict[str, Any]]

@router.post("/anomaly-check")
async def check_anomalies(payload: AnomalyCheckReq):
    result = detect_anomalies(payload.frames)
    return result

@router.get("/sessions/{session_id}/anomalies")
async def session_anomalies(session_id: str):
    s = get_session(session_id)
    if not s:
        raise HTTPException(status_code=404, detail="Session not found")
    result = detect_anomalies(s["frames"])
    return result
