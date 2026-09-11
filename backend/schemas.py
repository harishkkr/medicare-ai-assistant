from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# User / Patient
# ---------------------------------------------------------------------------

class UserBase(BaseModel):
    name: Optional[str] = "Alex Chen"
    email: Optional[str] = "alex.chen@medicare.ai"
    age: Optional[int] = 32
    sex: Optional[str] = "Male"
    height: Optional[float] = 175.0
    weight: Optional[float] = 72.5
    blood_type: Optional[str] = "O+"
    allergies: Optional[str] = "Penicillin, Sulfa drugs"
    chronic_conditions: Optional[str] = "Mild Seasonal Allergies, Borderline Hypertension"
    emergency_contact_name: Optional[str] = "Sarah Chen (Spouse)"
    emergency_contact_phone: Optional[str] = "+1 (555) 382-9912"


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    sex: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    chronic_conditions: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# Vital
# ---------------------------------------------------------------------------

class VitalBase(BaseModel):
    type: str
    value: str
    unit: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class VitalCreate(VitalBase):
    user_id: int


class VitalResponse(VitalBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    timestamp: datetime


# ---------------------------------------------------------------------------
# Medication
# ---------------------------------------------------------------------------

class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: Optional[str] = "Once daily"
    timing: Optional[str] = "Morning"
    instructions: Optional[str] = "Take after food"
    is_active: Optional[bool] = True


class MedicationCreate(MedicationBase):
    user_id: int


class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    timing: Optional[str] = None
    instructions: Optional[str] = None
    is_active: Optional[bool] = None
    last_taken: Optional[datetime] = None


class MedicationResponse(MedicationBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    last_taken: Optional[datetime] = None
    created_at: Optional[datetime] = None


# ---------------------------------------------------------------------------
# SymptomLog
# ---------------------------------------------------------------------------

class SymptomLogBase(BaseModel):
    symptoms: str
    severity: str
    duration: Optional[str] = None
    description: Optional[str] = None
    urgency_level: Optional[str] = "Self-Care"
    ai_triage_result: Optional[str] = None


class SymptomLogCreate(SymptomLogBase):
    user_id: int


class SymptomLogResponse(SymptomLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    timestamp: datetime


# ---------------------------------------------------------------------------
# AI Assistant & Clinical Endpoints
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    message: str
    patient_id: Optional[int] = 1
    include_context: Optional[bool] = True


class ChatResponse(BaseModel):
    response: str


class SymptomTriageRequest(BaseModel):
    symptoms: List[str]
    description: Optional[str] = ""
    severity: Optional[str] = "moderate"
    duration: Optional[str] = "1-3 days"
    patient_id: Optional[int] = 1


class SymptomTriageResponse(BaseModel):
    urgency_level: str  # "Self-Care", "Clinic Visit", "Urgent Care", "Emergency"
    urgency_color: str  # "emerald", "amber", "orange", "rose"
    summary: str
    possible_causes: List[str]
    recommended_actions: List[str]
    red_flags: List[str]
    disclaimer: str


class MedicationInteractionRequest(BaseModel):
    medications: Optional[List[str]] = None
    patient_id: Optional[int] = 1


class MedicationInteractionResponse(BaseModel):
    safe: bool
    status: str
    warnings: List[str]
    recommendations: List[str]
    summary: str


class DashboardSummaryResponse(BaseModel):
    user: Optional[UserResponse] = None
    latest_vitals: List[VitalResponse] = []
    active_medications: List[MedicationResponse] = []
    recent_symptoms: List[SymptomLogResponse] = []
    health_score: int = 85
    bmi: float = 23.7
    bmi_category: str = "Normal weight"