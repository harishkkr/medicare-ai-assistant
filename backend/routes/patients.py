from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/patients", tags=["Patients"])


def calculate_bmi_info(height_cm: Optional[float], weight_kg: Optional[float]) -> tuple[float, str]:
    """Calculate BMI and WHO category."""
    if not height_cm or not weight_kg or height_cm <= 0:
        return 22.0, "Normal weight"
    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m * height_m), 1)
    if bmi < 18.5:
        cat = "Underweight"
    elif bmi < 25.0:
        cat = "Normal weight"
    elif bmi < 30.0:
        cat = "Overweight"
    else:
        cat = "Obese"
    return bmi, cat


def calculate_health_score(vitals: List[models.Vital], medications: List[models.Medication]) -> int:
    """Calculate a holistic health score (0-100) based on vitals stability and medication adherence."""
    score = 88
    warning_count = sum(1 for v in vitals[:10] if v.status in ["warning", "critical"])
    score -= min(warning_count * 7, 35)

    elevated_count = sum(1 for v in vitals[:10] if v.status == "elevated")
    score -= min(elevated_count * 3, 15)

    # Active medications bonus for adherence
    if medications:
        taken_count = sum(1 for m in medications if m.last_taken and (datetime.utcnow() - m.last_taken).total_seconds() < 86400)
        adherence_ratio = taken_count / len(medications)
        if adherence_ratio > 0.7:
            score += 5

    return max(40, min(98, score))


@router.post("/", response_model=schemas.UserResponse)
def create_patient(patient: schemas.UserCreate, db: Session = Depends(get_db)):
    """Create a new patient profile."""
    db_patient = models.User(**patient.model_dump())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/", response_model=List[schemas.UserResponse])
def get_patients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List patient profiles."""
    return db.query(models.User).offset(skip).limit(limit).all()


@router.get("/{patient_id}", response_model=schemas.UserResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get a single patient profile by ID. Auto-creates default profile if id=1 and db is empty."""
    db_patient = db.query(models.User).filter(models.User.id == patient_id).first()
    if db_patient is None:
        if patient_id == 1:
            # Auto initialize default user
            db_patient = models.User(
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
            db.add(db_patient)
            db.commit()
            db.refresh(db_patient)
        else:
            raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient


@router.put("/{patient_id}", response_model=schemas.UserResponse)
def update_patient(patient_id: int, update_data: schemas.UserUpdate, db: Session = Depends(get_db)):
    """Update patient personal and clinical details."""
    db_patient = db.query(models.User).filter(models.User.id == patient_id).first()
    if db_patient is None:
        if patient_id == 1:
            db_patient = models.User()
            db.add(db_patient)
        else:
            raise HTTPException(status_code=404, detail="Patient not found")

    data = update_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_patient, key, value)

    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/{patient_id}/summary", response_model=schemas.DashboardSummaryResponse)
def get_patient_summary(patient_id: int, db: Session = Depends(get_db)):
    """Get complete clinical summary for dashboard: vitals, meds, symptoms, BMI, and score."""
    patient = db.query(models.User).filter(models.User.id == patient_id).first()
    if patient is None:
        # Seed or default user 1
        patient = models.User(id=1)
        db.add(patient)
        db.commit()
        db.refresh(patient)

    vitals = (
        db.query(models.Vital)
        .filter(models.Vital.user_id == patient_id)
        .order_by(models.Vital.timestamp.desc())
        .limit(20)
        .all()
    )

    medications = (
        db.query(models.Medication)
        .filter(models.Medication.user_id == patient_id, models.Medication.is_active == True)
        .all()
    )

    symptoms = (
        db.query(models.SymptomLog)
        .filter(models.SymptomLog.user_id == patient_id)
        .order_by(models.SymptomLog.timestamp.desc())
        .limit(5)
        .all()
    )

    bmi, bmi_category = calculate_bmi_info(patient.height, patient.weight)
    score = calculate_health_score(vitals, medications)

    return schemas.DashboardSummaryResponse(
        user=schemas.UserResponse.model_validate(patient),
        latest_vitals=[schemas.VitalResponse.model_validate(v) for v in vitals],
        active_medications=[schemas.MedicationResponse.model_validate(m) for m in medications],
        recent_symptoms=[schemas.SymptomLogResponse.model_validate(s) for s in symptoms],
        health_score=score,
        bmi=bmi,
        bmi_category=bmi_category,
    )


@router.post("/seed-demo")
def seed_demo_data(db: Session = Depends(get_db)):
    """Populate realistic sample patient, 7-day vitals, medications, and symptoms for demo."""
    # Find or create user 1
    patient = db.query(models.User).filter(models.User.id == 1).first()
    if not patient:
        patient = models.User(id=1)
        db.add(patient)

    patient.name = "Alex Chen"
    patient.email = "alex.chen@medicare.ai"
    patient.age = 34
    patient.sex = "Male"
    patient.height = 178.0
    patient.weight = 74.0
    patient.blood_type = "O+"
    patient.allergies = "Penicillin, Tree nuts"
    patient.chronic_conditions = "Borderline Hypertension, Seasonal Allergic Rhinitis"
    patient.emergency_contact_name = "Sarah Chen (Spouse)"
    patient.emergency_contact_phone = "+1 (555) 382-9912"
    db.commit()

    # Clear existing demo records for clean state
    db.query(models.Vital).filter(models.Vital.user_id == 1).delete()
    db.query(models.Medication).filter(models.Medication.user_id == 1).delete()
    db.query(models.SymptomLog).filter(models.SymptomLog.user_id == 1).delete()

    now = datetime.utcnow()

    # Seed 7 days of realistic vitals
    vitals_data = [
        ("blood_pressure", "124/82", "mmHg", "elevated", now - timedelta(days=6, hours=2)),
        ("heart_rate", "72", "bpm", "normal", now - timedelta(days=6, hours=1)),
        ("glucose", "95", "mg/dL", "normal", now - timedelta(days=6)),
        
        ("blood_pressure", "122/80", "mmHg", "elevated", now - timedelta(days=4, hours=4)),
        ("heart_rate", "74", "bpm", "normal", now - timedelta(days=4, hours=2)),
        ("glucose", "92", "mg/dL", "normal", now - timedelta(days=4)),
        
        ("blood_pressure", "128/84", "mmHg", "elevated", now - timedelta(days=2, hours=3)),
        ("heart_rate", "78", "bpm", "normal", now - timedelta(days=2, hours=1)),
        ("spo2", "98", "%", "normal", now - timedelta(days=2)),

        ("blood_pressure", "118/78", "mmHg", "normal", now - timedelta(hours=8)),
        ("heart_rate", "68", "bpm", "normal", now - timedelta(hours=6)),
        ("glucose", "89", "mg/dL", "normal", now - timedelta(hours=4)),
        ("spo2", "99", "%", "normal", now - timedelta(hours=3)),
        ("temperature", "98.4", "°F", "normal", now - timedelta(hours=2)),
        ("weight", "74.0", "kg", "normal", now - timedelta(hours=1)),
    ]

    for v_type, val, unit, stat, ts in vitals_data:
        db.add(models.Vital(user_id=1, type=v_type, value=val, unit=unit, status=stat, timestamp=ts))

    # Seed Active Medications
    meds_data = [
        ("Lisinopril", "10mg", "Once daily", "Morning", "Take with water before breakfast", True, now - timedelta(hours=5)),
        ("Cetirizine (Zyrtec)", "10mg", "Once daily", "Evening", "For seasonal allergy symptoms", True, now - timedelta(hours=18)),
        ("Omega-3 Fish Oil", "1000mg", "Once daily", "Morning", "Cardiovascular support supplement", True, now - timedelta(hours=5)),
        ("Vitamin D3", "2000 IU", "Once daily", "Morning", "Take with morning meal", True, now - timedelta(hours=5)),
    ]

    for name, dose, freq, timing, instr, active, last_tk in meds_data:
        db.add(models.Medication(
            user_id=1, name=name, dosage=dose, frequency=freq, timing=timing,
            instructions=instr, is_active=active, last_taken=last_tk
        ))

    # Seed Symptom logs
    symp_data = [
        (
            "Mild Headache, Eye Strain",
            "mild",
            "1 day",
            "Frontal dull headache after long screen hours. Improved after rest.",
            "Self-Care",
            "Tension headache likely secondary to prolonged visual display exposure. Rest and hydration recommended.",
            now - timedelta(days=2)
        ),
        (
            "Sneezing, Runny Nose",
            "moderate",
            "3 days",
            "Seasonal pollen flared up symptoms during spring park run.",
            "Self-Care",
            "Allergic rhinitis flare-up. Continue antihistamine regimen as prescribed.",
            now - timedelta(days=5)
        )
    ]

    for symps, sev, dur, desc, urg, triage, ts in symp_data:
        db.add(models.SymptomLog(
            user_id=1, symptoms=symps, severity=sev, duration=dur,
            description=desc, urgency_level=urg, ai_triage_result=triage, timestamp=ts
        ))

    db.commit()
    return {"status": "success", "message": "Demo data populated successfully for Alex Chen"}