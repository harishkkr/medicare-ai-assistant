from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True, default="Alex Chen")
    email = Column(String, nullable=True, default="alex.chen@medicare.ai")
    age = Column(Integer, nullable=True, default=32)
    sex = Column(String, nullable=True, default="Male")
    height = Column(Float, nullable=True, default=175.0)  # in cm
    weight = Column(Float, nullable=True, default=72.5)   # in kg
    blood_type = Column(String, nullable=True, default="O+")
    allergies = Column(String, nullable=True, default="Penicillin, Sulfa drugs")
    chronic_conditions = Column(String, nullable=True, default="Mild Seasonal Allergies, Borderline Hypertension")
    emergency_contact_name = Column(String, nullable=True, default="Sarah Chen (Spouse)")
    emergency_contact_phone = Column(String, nullable=True, default="+1 (555) 382-9912")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    vitals = relationship("Vital", back_populates="user", cascade="all, delete-orphan", order_by="desc(Vital.timestamp)")
    medications = relationship("Medication", back_populates="user", cascade="all, delete-orphan")
    symptom_logs = relationship("SymptomLog", back_populates="user", cascade="all, delete-orphan", order_by="desc(SymptomLog.timestamp)")


class Vital(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # "blood_pressure", "heart_rate", "glucose", "spo2", "temperature", "weight"
    value = Column(String, nullable=False)  # e.g. "120/80" or "72"
    unit = Column(String, nullable=True)    # "mmHg", "bpm", "mg/dL", "%", "°F", "kg"
    status = Column(String, nullable=True, default="normal")  # "normal", "elevated", "warning", "critical"
    notes = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="vitals")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)           # e.g. "10mg"
    frequency = Column(String, nullable=True, default="Once daily") # e.g. "Once daily", "Twice daily", "As needed"
    timing = Column(String, nullable=True, default="Morning")       # "Morning", "Afternoon", "Evening", "Night"
    instructions = Column(String, nullable=True, default="Take after food")
    is_active = Column(Boolean, default=True, nullable=False)
    last_taken = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="medications")


class SymptomLog(Base):
    __tablename__ = "symptom_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symptoms = Column(String, nullable=False)        # comma-separated tags e.g. "Headache, Fatigue"
    severity = Column(String, nullable=False)        # "mild", "moderate", "severe"
    duration = Column(String, nullable=True)         # "1-3 days"
    description = Column(String, nullable=True)      # free text notes
    urgency_level = Column(String, nullable=True, default="Self-Care") # "Self-Care", "Clinic Visit", "Urgent Care", "Emergency"
    ai_triage_result = Column(String, nullable=True) # Full structured response or markdown summary
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="symptom_logs")