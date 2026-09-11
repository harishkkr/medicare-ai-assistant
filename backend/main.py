from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine, SessionLocal
import models
from routes import ai_assistant, patients, vitals, medications, symptoms

app = FastAPI(
    title="MediCare AI",
    description="Personal health assistant API for tracking vitals, medications, "
    "symptoms, and chatting with an AI health assistant.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(vitals.router)
app.include_router(medications.router)
app.include_router(symptoms.router)
app.include_router(ai_assistant.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Ensure default user 1 exists
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.id == 1).first()
        if not user:
            default_user = models.User(
                id=1,
                name="Alex Chen",
                email="alex.chen@medicare.ai",
                age=32,
                sex="Male",
                height=175.0,
                weight=72.5,
                blood_type="O+",
                allergies="Penicillin, Sulfa drugs",
                chronic_conditions="Mild Seasonal Allergies, Borderline Hypertension",
                emergency_contact_name="Sarah Chen (Spouse)",
                emergency_contact_phone="+1 (555) 382-9912",
            )
            db.add(default_user)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "MediCare AI API",
        "version": "1.1.0",
        "ai_model": "gemini-3.6-flash",
    }