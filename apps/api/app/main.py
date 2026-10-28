from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from app.routers import health, infer, stream, chat, replay, anomaly, calibration, grasp, compliance, compliance_pdf

app = FastAPI(
    title="Afferent Somatosensory API",
    description="Causal Vision-to-Touch Prior | Tactile Spatial Grid + Sim2Real Safety Shield + TactoEval + Closed-Loop WS Streaming",
    version="3.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(infer.router)
app.include_router(stream.router)
app.include_router(chat.router)
app.include_router(replay.router)
app.include_router(anomaly.router)
app.include_router(calibration.router)
app.include_router(grasp.router)
app.include_router(compliance.router)
app.include_router(compliance_pdf.router)

@app.get("/")
def root():
    return {"name": "Afferent", "tagline": "Robots see, but do not feel. Afferent gives them the intuition of touch.", "docs": "/docs"}
