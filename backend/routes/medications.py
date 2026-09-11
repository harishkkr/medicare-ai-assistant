from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
import models
import schemas
from services.llm_service import check_medication_interactions_ai

router = APIRouter(prefix="/medications", tags=["Medications"])


@router.post("/", response_model=schemas.MedicationResponse)
def create_medication(med: schemas.MedicationCreate, db: Session = Depends(get_db)):
    patient = db.query(models.User).filter(models.User.id == med.user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    db_med = models.Medication(**med.model_dump())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med


@router.get("/user/{user_id}", response_model=List[schemas.MedicationResponse])
def get_medications_for_user(user_id: int, active_only: bool = False, db: Session = Depends(get_db)):
    patient = db.query(models.User).filter(models.User.id == user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    query = db.query(models.Medication).filter(models.Medication.user_id == user_id)
    if active_only:
        query = query.filter(models.Medication.is_active == True)
    return query.order_by(models.Medication.created_at.desc()).all()


@router.put("/{med_id}", response_model=schemas.MedicationResponse)
def update_medication(med_id: int, med_update: schemas.MedicationUpdate, db: Session = Depends(get_db)):
    db_med = db.query(models.Medication).filter(models.Medication.id == med_id).first()
    if db_med is None:
        raise HTTPException(status_code=404, detail="Medication not found")

    update_data = med_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_med, key, value)

    db.commit()
    db.refresh(db_med)
    return db_med


@router.post("/{med_id}/take", response_model=schemas.MedicationResponse)
def log_medication_taken(med_id: int, db: Session = Depends(get_db)):
    db_med = db.query(models.Medication).filter(models.Medication.id == med_id).first()
    if db_med is None:
        raise HTTPException(status_code=404, detail="Medication not found")

    db_med.last_taken = datetime.utcnow()
    db.commit()
    db.refresh(db_med)
    return db_med


@router.delete("/{med_id}")
def delete_medication(med_id: int, db: Session = Depends(get_db)):
    db_med = db.query(models.Medication).filter(models.Medication.id == med_id).first()
    if db_med is None:
        raise HTTPException(status_code=404, detail="Medication not found")

    db.delete(db_med)
    db.commit()
    return {"status": "success", "message": f"Medication {med_id} deleted"}


@router.post("/check-interactions", response_model=schemas.MedicationInteractionResponse)
async def check_interactions(req: schemas.MedicationInteractionRequest, db: Session = Depends(get_db)):
    med_names = req.medications or []
    allergies = ""
    conditions = ""

    if req.patient_id:
        patient = db.query(models.User).filter(models.User.id == req.patient_id).first()
        if patient:
            allergies = patient.allergies or ""
            conditions = patient.chronic_conditions or ""
            if not med_names:
                med_names = [m.name for m in patient.medications if m.is_active]

    res = await check_medication_interactions_ai(med_names, allergies, conditions)
    return schemas.MedicationInteractionResponse(**res)
