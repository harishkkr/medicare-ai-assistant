from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/vitals", tags=["Vitals"])


def evaluate_vital_status(vital_type: str, value_str: str) -> tuple[str, str]:
    """
    Evaluates vital readings according to clinical reference guidelines.
    Returns (status, unit).
    status can be 'normal', 'elevated', 'warning', 'critical'.
    """
    vt = vital_type.lower()
    val = value_str.strip()

    if vt in ["blood_pressure", "bp"]:
        unit = "mmHg"
        try:
            parts = val.split("/")
            systolic = int(parts[0].strip())
            diastolic = int(parts[1].strip())
            if systolic < 120 and diastolic < 80:
                return "normal", unit
            elif systolic <= 129 and diastolic < 80:
                return "elevated", unit
            elif systolic <= 139 or diastolic <= 89:
                return "warning", unit
            else:
                return "critical", unit
        except Exception:
            return "normal", unit

    elif vt in ["heart_rate", "pulse", "hr"]:
        unit = "bpm"
        try:
            hr = float(val)
            if 60 <= hr <= 100:
                return "normal", unit
            elif (55 <= hr < 60) or (100 < hr <= 110):
                return "elevated", unit
            else:
                return "warning", unit
        except Exception:
            return "normal", unit

    elif vt in ["glucose", "blood_sugar", "sugar"]:
        unit = "mg/dL"
        try:
            g = float(val)
            if 70 <= g <= 99:
                return "normal", unit
            elif 100 <= g <= 140:
                return "elevated", unit
            else:
                return "warning", unit
        except Exception:
            return "normal", unit

    elif vt in ["spo2", "oxygen", "oxygen_saturation"]:
        unit = "%"
        try:
            o2 = float(val.replace("%", ""))
            if o2 >= 95:
                return "normal", unit
            elif 90 <= o2 < 95:
                return "warning", unit
            else:
                return "critical", unit
        except Exception:
            return "normal", unit

    elif vt in ["temperature", "temp"]:
        unit = "°F"
        try:
            t = float(val)
            if 97.0 <= t <= 99.0:
                return "normal", unit
            elif 99.1 <= t <= 100.4:
                return "elevated", unit
            else:
                return "warning", unit
        except Exception:
            return "normal", unit

    elif vt in ["weight"]:
        unit = "kg"
        return "normal", unit

    return "normal", ""


@router.post("/", response_model=schemas.VitalResponse)
def create_vital(vital: schemas.VitalCreate, db: Session = Depends(get_db)):
    """Log a new vital sign with automated clinical status classification."""
    patient = db.query(models.User).filter(models.User.id == vital.user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    vital_dict = vital.model_dump()
    calculated_status, default_unit = evaluate_vital_status(vital.type, vital.value)
    vital_dict["status"] = vital_dict.get("status") or calculated_status
    vital_dict["unit"] = vital_dict.get("unit") or default_unit

    db_vital = models.Vital(**vital_dict)
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    return db_vital


@router.get("/user/{user_id}", response_model=List[schemas.VitalResponse])
def get_vitals_for_user(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List vital signs recorded for a specific user, newest first."""
    patient = db.query(models.User).filter(models.User.id == user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    return (
        db.query(models.Vital)
        .filter(models.Vital.user_id == user_id)
        .order_by(models.Vital.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/user/{user_id}/analytics")
def get_vitals_analytics(user_id: int, db: Session = Depends(get_db)):
    """Get aggregated vital metrics and latest readings formatted for charts."""
    patient = db.query(models.User).filter(models.User.id == user_id).first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    all_vitals = (
        db.query(models.Vital)
        .filter(models.Vital.user_id == user_id)
        .order_by(models.Vital.timestamp.asc())
        .all()
    )

    by_type: Dict[str, List[Dict[str, Any]]] = {}
    latest: Dict[str, Dict[str, Any]] = {}

    for v in all_vitals:
        item = {
            "id": v.id,
            "type": v.type,
            "value": v.value,
            "unit": v.unit,
            "status": v.status,
            "timestamp": v.timestamp.isoformat(),
        }
        by_type.setdefault(v.type, []).append(item)
        latest[v.type] = item

    return {
        "latest": latest,
        "history_by_type": by_type,
        "total_records": len(all_vitals),
    }