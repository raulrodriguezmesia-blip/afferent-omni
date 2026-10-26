from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from app.services.grasp_planner import plan_grasp

router = APIRouter(prefix="/api/v1", tags=["Zero-Shot Grasp Planning"])

class GraspPlanReq(BaseModel):
    object_label: str
    mask_bbox: Optional[List[float]] = None

@router.post("/plan-grasp")
async def plan_grasp_endpoint(payload: GraspPlanReq):
    result = plan_grasp(payload.object_label, payload.mask_bbox)
    return result
