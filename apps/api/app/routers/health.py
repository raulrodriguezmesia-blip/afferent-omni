from fastapi import APIRouter

router = APIRouter(tags=["health"])

@router.get("/health")
def health_check():
    return {"status": "online", "engine": "Afferent-v2", "gating": "Sim2Real Safety Shield Active"}
