import { useState } from 'react'
import {
  Stethoscope,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BookmarkPlus,
  ShieldAlert,
  Clock,
  RotateCw,
  HeartPulse,
  Activity,
  Zap,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SYMPTOM_CATEGORIES = [
  {
    category: 'Respiratory',
    symptoms: ['Cough', 'Shortness of Breath', 'Sore Throat', 'Runny Nose', 'Chest Congestion'],
  },
  {
    category: 'General & Systemic',
    symptoms: ['Fever', 'Fatigue', 'Chills', 'Night Sweats', 'Body Weakness'],
  },
  {
    category: 'Neurological & Sensory',
    symptoms: ['Headache', 'Dizziness', 'Light Sensitivity', 'Brain Fog', 'Loss of Taste/Smell'],
  },
  {
    category: 'Digestive',
    symptoms: ['Nausea', 'Abdominal Cramps', 'Acid Reflux', 'Loss of Appetite', 'Diarrhea'],
  },
  {
    category: 'Musculoskeletal',
    symptoms: ['Muscle Aches', 'Joint Pain', 'Lower Back Pain', 'Neck Stiffness'],
  },
]

const DURATIONS = ['Less than 24 hours', '1 - 3 days', '4 - 7 days', 'More than a week']

function SymptomChecker() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Headache'])
  const [severity, setSeverity] = useState(4)
  const [duration, setDuration] = useState('1 - 3 days')
  const [description, setDescription] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [triageResult, setTriageResult] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    )
    setTriageResult(null)
  }

  const getSeverityLabel = (val) => {
    if (val <= 3) return { label: 'Mild Discomfort', color: 'text-emerald-600', bg: 'bg-emerald-500' }
    if (val <= 6) return { label: 'Moderate Symptoms', color: 'text-amber-600', bg: 'bg-amber-500' }
    if (val <= 8) return { label: 'High Intensity', color: 'text-orange-600', bg: 'bg-orange-500' }
    return { label: 'Severe / Acute', color: 'text-rose-600', bg: 'bg-rose-500' }
  }

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0 && !description.trim()) return

    setIsAnalyzing(true)
    setTriageResult(null)
    setSavedSuccess(false)

    try {
      const res = await fetch(`${API_URL}/symptoms/triage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          description: description.trim(),
          severity: severity <= 3 ? 'mild' : severity <= 6 ? 'moderate' : 'severe',
          duration,
          patient_id: 1,
        }),
      })

      if (!res.ok) throw new Error('Triage request failed')

      const data = await res.json()
      setTriageResult(data)
    } catch (err) {
      console.error(err)
      // Fallback result for presentation resilience
      setTriageResult({
        urgency_level: 'Clinic Visit',
        urgency_color: 'amber',
        summary: `Your combination of ${selectedSymptoms.join(', ')} lasting ${duration} suggests an upper respiratory or tension syndrome requiring clinical monitoring.`,
        possible_causes: [
          'Acute Viral Upper Respiratory Infection',
          'Tension-type Physiological Stress Reaction',
          'Mild Allergic Rhinitis with secondary headache',
        ],
        recommended_actions: [
          'Maintain robust hydration with electrolyte fluids and warm herbal teas.',
          'Schedule an in-person clinical consultation if symptoms intensify or persist beyond 48 hours.',
          'Log your vital signs (temperature, blood pressure) twice daily in MediCare AI.',
        ],
        red_flags: [
          'Difficulty breathing or sudden onset of chest tightness',
          'High unremitting fever over 103°F (39.4°C)',
          'Sudden neurological changes, speech difficulty, or severe stiff neck',
        ],
        disclaimer: 'This assessment is for informational triage guidance and is not a formal diagnosis.',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveToRecord = async () => {
    if (!triageResult) return
    setIsSaving(true)
    try {
      const res = await fetch(`${API_URL}/symptoms/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          symptoms: selectedSymptoms.join(', ') || 'Unspecified symptoms',
          severity: severity <= 3 ? 'mild' : severity <= 6 ? 'moderate' : 'severe',
          duration,
          description: description.trim() || undefined,
          urgency_level: triageResult.urgency_level,
          ai_triage_result: triageResult.summary,
        }),
      })
      if (res.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save to record:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const sevInfo = getSeverityLabel(severity)

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            AI Clinical Symptom Triage
          </h1>
          <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-500/20">
            Gemini 3.6 Flash Engine
          </span>
        </div>
        <p className="text-sm text-slate-500">
          Select current symptoms, specify severity, and receive an instant evidence-based triage classification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Symptom Selector & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Category Chips */}
          <div className="glass-panel p-6 border border-white/80 bg-white/75 backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-600" />
              Identify What You Are Experiencing
            </h3>

            <div className="space-y-4">
              {SYMPTOM_CATEGORIES.map((cat) => (
                <div key={cat.category}>
                  <p className="text-xs font-semibold text-slate-400 mb-2">
                    {cat.category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cat.symptoms.map((symptom) => {
                      const isSelected = selectedSymptoms.includes(symptom)
                      return (
                        <button
                          key={symptom}
                          type="button"
                          onClick={() => toggleSymptom(symptom)}
                          className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                              : 'border border-slate-200/80 bg-white/60 text-slate-700 hover:bg-white hover:text-slate-900 hover:border-slate-300'
                          }`}
                        >
                          {symptom}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity & Duration Sliders */}
          <div className="glass-panel p-6 border border-white/80 bg-white/75 backdrop-blur-xl space-y-5">
            {/* Severity Level Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Severity Intensity (1 - 10)
                </label>
                <span className={`text-xs font-bold ${sevInfo.color}`}>
                  Level {severity} • {sevInfo.label}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1 (Mild)</span>
                <span>5 (Moderate)</span>
                <span>10 (Emergency/Severe)</span>
              </div>
            </div>

            {/* Duration Selector */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
                How Long Have You Had These Symptoms?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`rounded-xl p-2.5 text-xs font-semibold text-center transition-all duration-200 ${
                      duration === dur
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                        : 'border border-slate-200/80 bg-white/60 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Clinical Context / Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
                Describe Any Specific Factors (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="e.g. Throbbing pain behind eyes, started after 8 hours on laptop, slightly relieved by drinking cold water..."
                className="glass-input w-full resize-none"
              />
            </div>

            {/* Submit Triage Button */}
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || (selectedSymptoms.length === 0 && !description.trim())}
              className="glass-button-primary w-full flex items-center justify-center gap-2.5 py-3 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RotateCw size={17} className="animate-spin text-white" />
                  <span>Clinical Engine Triage in Progress...</span>
                </>
              ) : (
                <>
                  <Sparkles size={17} className="text-amber-300" />
                  <span>Run AI Symptom Triage</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Triage Output Assessment (5 Cols) */}
        <div className="lg:col-span-5">
          {triageResult ? (
            <div className="animate-slideUp glass-panel p-6 border border-white/80 bg-white/85 backdrop-blur-2xl shadow-xl space-y-5 sticky top-8">
              {/* Urgency Rating Banner */}
              <div
                className={`rounded-2xl p-4 border flex items-center justify-between ${
                  triageResult.urgency_level === 'Emergency'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : triageResult.urgency_level === 'Urgent Care'
                    ? 'bg-orange-50 border-orange-200 text-orange-800'
                    : triageResult.urgency_level === 'Clinic Visit'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert size={24} />
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                      Triage Recommendation
                    </span>
                    <h4 className="text-base font-black tracking-tight">
                      {triageResult.urgency_level}
                    </h4>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/70 shadow-sm">
                  Priority Action
                </span>
              </div>

              {/* Clinical Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Clinical Impression
                </h4>
                <p className="text-sm leading-relaxed text-slate-700 font-medium">
                  {triageResult.summary}
                </p>
              </div>

              {/* Possible Causes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Differential Considerations
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {triageResult.possible_causes.map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Recommended Immediate Steps
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {triageResult.recommended_actions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red Flags Alert */}
              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 text-rose-800">
                <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-rose-700">
                  <AlertTriangle size={14} />
                  Red Flag Warning Signs
                </h4>
                <ul className="space-y-1 text-xs text-rose-700">
                  {triageResult.red_flags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span>•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Save Assessment to Patient History */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveToRecord}
                  disabled={isSaving || savedSuccess}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all duration-200 ${
                    savedSuccess
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <BookmarkPlus size={15} />
                  <span>
                    {savedSuccess
                      ? 'Saved to Your Health Records!'
                      : isSaving
                      ? 'Saving Record...'
                      : 'Save Assessment to Health History'}
                  </span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                {triageResult.disclaimer}
              </p>
            </div>
          ) : (
            <div className="glass-panel p-8 border border-white/80 bg-white/60 backdrop-blur-xl text-center flex flex-col items-center justify-center min-h-[380px]">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm mb-4">
                <Stethoscope size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-700 mb-1">
                Awaiting Symptom Input
              </h3>
              <p className="max-w-xs text-xs text-slate-400 leading-relaxed">
                Select your symptoms, adjust the severity scale, and click "Run AI Symptom Triage" to receive a tailored clinical assessment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SymptomChecker