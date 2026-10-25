from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictTactileRequest
from app.services.afferent_engine import AfferentEngine
from app.services.validator import validate_against_schema

router = APIRouter(prefix="/api/v1", tags=["inference"])
engine = AfferentEngine()

@router.post("/predict-tactile")
async def predict_tactile(payload: PredictTactileRequest):
    try:
        result = await engine.infer(
            object_label=payload.object_label,
            image_base64=payload.image_base64
        )
        validate_against_schema(result)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=f"Schema validation failed: {ve}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Afferent inference error: {e}")
