import { useState, useEffect } from 'react'
import {
  User,
  Save,
  CheckCircle2,
  Printer,
  Shield,
  Heart,
  Scale,
  Phone,
  AlertCircle,
  FileText,
  X,
  Sparkles,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']
const SEX_OPTIONS = ['Female', 'Male', 'Other', 'Prefer not to say']

function Profile() {
  const [formData, setFormData] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@medicare.ai',
    age: 32,
    sex: 'Male',
    height: 175,
    weight: 72.5,
    blood_type: 'O+',
    allergies: 'Penicillin, Sulfa drugs',
    chronic_conditions: 'Mild Seasonal Allergies, Borderline Hypertension',
    emergency_contact_name: 'Sarah Chen (Spouse)',
    emergency_contact_phone: '+1 (555) 382-9912',
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [summaryData, setSummaryData] = useState(null)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/patients/1`)
        if (res.ok) {
          const data = await res.json()
          setFormData((prev) => ({
            ...prev,
            ...data,
          }))
        }
        const sRes = await fetch(`${API_URL}/patients/1/summary`)
        if (sRes.ok) {
          setSummaryData(await sRes.json())
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setSavedSuccess(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSavedSuccess(false)

    try {
      const res = await fetch(`${API_URL}/patients/1`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          age: parseInt(formData.age) || undefined,
          sex: formData.sex,
          height: parseFloat(formData.height) || undefined,
          weight: parseFloat(formData.weight) || undefined,
          blood_type: formData.blood_type,
          allergies: formData.allergies,
          chronic_conditions: formData.chronic_conditions,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
        }),
      })

      if (res.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setIsSaving(false)
    }
  }

  // Calculated biometrics
  const heightM = (parseFloat(formData.height) || 175) / 100
  const weightKg = parseFloat(formData.weight) || 72
  const bmi = (weightKg / (heightM * heightM)).toFixed(1)

  const getBmiCategory = (val) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-amber-600 bg-amber-50 border-amber-200' }
    if (val < 25) return { label: 'Normal weight', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' }
    if (val < 30) return { label: 'Overweight', color: 'text-amber-600 bg-amber-50 border-amber-200' }
    return { label: 'Obese', color: 'text-rose-600 bg-rose-50 border-rose-200' }
  }

  const bmiCat = getBmiCategory(bmi)

  // Ideal weight range based on normal BMI 18.5 - 24.9
  const minIdeal = (18.5 * heightM * heightM).toFixed(1)
  const maxIdeal = (24.9 * heightM * heightM).toFixed(1)

  // Basal Metabolic Rate (Mifflin-St Jeor Formula approx)
  const bmr = Math.round(
    10 * weightKg + 6.25 * (heightM * 100) - 5 * (parseInt(formData.age) || 30) + (formData.sex === 'Female' ? -161 : 5)
  )

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Health Profile & Records
          </h1>
          <p className="text-sm text-slate-500">
            Keep your clinical baselines, emergency contacts, and allergies up to date.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowReportModal(true)}
          className="group flex items-center gap-2 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-4 py-2.5 text-xs md:text-sm font-bold text-blue-700 shadow-sm backdrop-blur-md transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 active:scale-95"
        >
          <FileText size={16} className="text-blue-600" />
          <span>Export Medical Report Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Details (8 Cols) */}
        <div className="lg:col-span-8">
          <form
            onSubmit={handleSubmit}
            className="glass-panel p-6 md:p-8 border border-white/80 bg-white/75 backdrop-blur-xl shadow-lg space-y-6"
          >
            {/* Personal Details Section */}
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={handleChange('name')}
                    placeholder="e.g. Alex Chen"
                    className="glass-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={handleChange('email')}
                    placeholder="alex@example.com"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={formData.age || ''}
                    onChange={handleChange('age')}
                    placeholder="e.g. 34"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Biological Sex
                  </label>
                  <select
                    value={formData.sex || ''}
                    onChange={handleChange('sex')}
                    className="glass-input w-full"
                  >
                    {SEX_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Anthropometrics Section */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <Scale size={16} className="text-indigo-600" />
                Physical Metrics & Blood
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.height || ''}
                    onChange={handleChange('height')}
                    placeholder="e.g. 178"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={handleChange('weight')}
                    placeholder="e.g. 74.0"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Blood Type
                  </label>
                  <select
                    value={formData.blood_type || ''}
                    onChange={handleChange('blood_type')}
                    className="glass-input w-full"
                  >
                    {BLOOD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Clinical Conditions & Allergies */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <Shield size={16} className="text-rose-600" />
                Allergies & Medical History
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Known Drug & Food Allergies
                  </label>
                  <input
                    type="text"
                    value={formData.allergies || ''}
                    onChange={handleChange('allergies')}
                    placeholder="e.g. Penicillin, Peanuts, Sulfa drugs (comma separated)"
                    className="glass-input w-full"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Used by AI assistant to check for contraindicated prescriptions.
                  </span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Chronic Medical Conditions
                  </label>
                  <input
                    type="text"
                    value={formData.chronic_conditions || ''}
                    onChange={handleChange('chronic_conditions')}
                    placeholder="e.g. Borderline Hypertension, Seasonal Asthma, Type 2 Diabetes"
                    className="glass-input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
                <Phone size={16} className="text-emerald-600" />
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Contact Name & Relation
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact_name || ''}
                    onChange={handleChange('emergency_contact_name')}
                    placeholder="e.g. Sarah Chen (Spouse)"
                    className="glass-input w-full"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Emergency Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_contact_phone || ''}
                    onChange={handleChange('emergency_contact_phone')}
                    placeholder="+1 (555) 382-9912"
                    className="glass-input w-full"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {savedSuccess ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                  <CheckCircle2 size={16} />
                  <span>Profile records updated successfully!</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">
                  All changes are automatically synced to MediCare database.
                </span>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="glass-button-primary flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Dynamic Health Calculators (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Biometrics Gauge Card */}
          <div className="glass-panel p-6 border border-white/80 bg-white/75 backdrop-blur-xl shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Scale size={16} className="text-blue-600" />
              Biometric Analysis
            </h3>

            <div className="space-y-4">
              {/* BMI Card */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Calculated BMI
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${bmiCat.color}`}>
                    {bmiCat.label}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    {bmi}
                  </span>
                  <span className="text-xs text-slate-400">kg/m²</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Ideal weight range for {formData.height} cm: <strong className="text-slate-700">{minIdeal} - {maxIdeal} kg</strong>
                </p>
              </div>

              {/* BMR Estimation */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Est. Basal Metabolic Rate (BMR)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
                    {bmr}
                  </span>
                  <span className="text-xs text-slate-400">kcal/day</span>
                </div>
                <p className="mt-2 text-[11px] text-slate-500">
                  Resting calories required to sustain vital metabolic functions.
                </p>
              </div>

              {/* Blood Compatibility Info */}
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Blood Group Profile
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-rose-600">
                    {formData.blood_type || 'O+'}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    Universal RBC Recipient / Donor Match
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Medical Health Report Card Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/80 bg-white p-6 md:p-8 shadow-2xl animate-slideUp max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowReportModal(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors print:hidden"
            >
              <X size={18} />
            </button>

            {/* Document Header */}
            <div className="border-b border-slate-200 pb-5 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-bold text-lg shadow-md shadow-blue-500/25">
                  M
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">MediCare AI Health Summary</h2>
                  <p className="text-xs text-slate-500">
                    Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => window.print()}
                className="print:hidden flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <Printer size={15} /> Print / PDF
              </button>
            </div>

            {/* Patient Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl p-4 mb-5 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Patient</span>
                <span className="font-bold text-slate-800 text-sm">{formData.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Demographics</span>
                <span className="font-bold text-slate-800">{formData.age} yrs • {formData.sex}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">Blood Type</span>
                <span className="font-bold text-rose-600 text-sm">{formData.blood_type}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">BMI Score</span>
                <span className="font-bold text-slate-800">{bmi} kg/m² ({bmiCat.label})</span>
              </div>
            </div>

            {/* Clinical Summary Sections */}
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Recorded Allergies & Intolerances
                </span>
                <p className="text-slate-800 font-medium">{formData.allergies || 'None recorded'}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Chronic Diagnoses & Health Notes
                </span>
                <p className="text-slate-800 font-medium">{formData.chronic_conditions || 'None recorded'}</p>
              </div>

              {summaryData?.active_medications && (
                <div className="p-3.5 rounded-xl border border-slate-200">
                  <span className="font-bold uppercase tracking-wider text-slate-500 block mb-2">
                    Active Prescriptions & Dosages
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {summaryData.active_medications.map((m) => (
                      <div key={m.id} className="rounded-lg bg-slate-50 p-2 border border-slate-100">
                        <span className="font-bold text-slate-800 block">{m.name} ({m.dosage})</span>
                        <span className="text-[11px] text-slate-500">{m.frequency} • {m.timing}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold uppercase tracking-wider text-slate-500 block text-[10px]">
                    Emergency Contact
                  </span>
                  <span className="font-bold text-slate-800">{formData.emergency_contact_name}</span>
                </div>
                <span className="font-bold text-blue-600">{formData.emergency_contact_phone}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              This summary is produced for informational healthcare review purposes by MediCare AI.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile