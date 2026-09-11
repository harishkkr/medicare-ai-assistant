from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import json

from database import get_db
import models
import schemas
from services.llm_service import analyze_symptoms_ai

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])


@router.post("/triage", response_model=schemas.SymptomTriageResponse)
async def triage_symptoms(req: schemas.SymptomTriageRequest, db: Session = Depends(get_db)):
    """Run AI clinical triage on patient symptoms with urgency scoring."""
    patient_context = {}
    if req.patient_id:
        patient = db.query(models.User).filter(models.User.id == req.patient_id).first()
        if patient:
            patient_context = {
                "age": patient.age,
                "chronic_conditions": patient.chronic_conditions,
                "medications": ", ".join([m.name for m in patient.medications if m.is_active]),
            }

    triage_result = await analyze_symptoms_ai(
        symptoms=req.symptoms,
        description=req.description or "",
        severity=req.severity or "moderate",
        duration=req.duration or "1-3 days",
        patient_context=patient_context,
    )

    return schemas.SymptomTriageResponse(**triage_result)


@router.post("/", response_model=schemas.SymptomLogResponse)
def log_symptoms(symptom_data: schemas.SymptomLogCreate, db: Session = Depends(get_db)):
    """Save a symptom assessment to the user's permanent medical history."""
    patient = db.query(models.User).filter(models.User.id == symptom_data.user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    db_symptom = models.SymptomLog(**symptom_data.model_dump())
    db.add(db_symptom)
    db.commit()
    db.refresh(db_symptom)
    return db_symptom


@router.get("/user/{user_id}", response_model=List[schemas.SymptomLogResponse])
def get_user_symptoms(user_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """List recent symptom logs for a patient."""
    patient = db.query(models.User).filter(models.User.id == user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return (
        db.query(models.SymptomLog)
        .filter(models.SymptomLog.user_id == user_id)
        .order_by(models.SymptomLog.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
