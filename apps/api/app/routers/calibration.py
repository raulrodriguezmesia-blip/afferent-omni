from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.material_calibration import calibrate

router = APIRouter(prefix="/api/v1", tags=["Material Calibration"])

class CalibrateReq(BaseModel):
    object_label: str
    probe_count: Optional[int] = 5

@router.post("/calibrate-material")
async def calibrate_material(payload: CalibrateReq):
    result = calibrate(payload.object_label, payload.probe_count or 5)
    return result
