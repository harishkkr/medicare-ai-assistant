from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from schemas import ChatRequest, ChatResponse
from services.llm_service import generate_medical_response

router = APIRouter(prefix="/ai-assistant", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """Send a user message to the AI assistant with patient health context and return response."""
    patient_context = None

    if request.include_context and request.patient_id:
        patient = db.query(models.User).filter(models.User.id == request.patient_id).first()
        if patient:
            # Gather latest vitals
            vitals = (
                db.query(models.Vital)
                .filter(models.Vital.user_id == patient.id)
                .order_by(models.Vital.timestamp.desc())
                .limit(5)
                .all()
            )
            vitals_str = ", ".join([f"{v.type}: {v.value} {v.unit or ''} ({v.status})" for v in vitals]) or "None"

            # Gather active medications
            meds = (
                db.query(models.Medication)
                .filter(models.Medication.user_id == patient.id, models.Medication.is_active == True)
                .all()
            )
            meds_str = ", ".join([f"{m.name} {m.dosage} ({m.frequency})" for m in meds]) or "None"

            # Calculate BMI
            bmi_val = "N/A"
            if patient.height and patient.weight and patient.height > 0:
                h_m = patient.height / 100.0
                bmi_val = f"{round(patient.weight / (h_m * h_m), 1)}"

            patient_context = {
                "name": patient.name,
                "age": patient.age,
                "sex": patient.sex,
                "height": patient.height,
                "weight": patient.weight,
                "bmi": bmi_val,
                "allergies": patient.allergies,
                "chronic_conditions": patient.chronic_conditions,
                "medications": meds_str,
                "latest_vitals": vitals_str,
            }

    try:
        ai_response = await generate_medical_response(request.message, patient_context)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(response=ai_response)