import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  Heart,
  Droplet,
  Pill,
  ClipboardList,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  Bot,
  UserCheck,
} from 'lucide-react'
import Card from '../components/Card.jsx'
import VitalModal from '../components/VitalModal.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function StatusBadge({ status }) {
  const s = (status || 'normal').toLowerCase()
  if (s === 'normal') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        Normal
      </span>
    )
  }
  if (s === 'elevated') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 border border-amber-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Elevated
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 border border-rose-500/20">
      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
      Attention
    </span>
  )
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVitalModalOpen, setIsVitalModalOpen] = useState(false)
  const [takingMedId, setTakingMedId] = useState(null)

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/patients/1/summary`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
      const aRes = await fetch(`${API_URL}/vitals/user/1/analytics`)
      if (aRes.ok) {
        const aJson = await aRes.json()
        setAnalytics(aJson)
      }
    } catch (err) {
      console.error('Failed to load dashboard summary:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSummary()
  }, [])

  const handleTakeMed = async (medId) => {
    setTakingMedId(medId)
    try {
      const res = await fetch(`${API_URL}/medications/${medId}/take`, { method: 'POST' })
      if (res.ok) {
        fetchSummary()
      }
    } catch (err) {
      console.error('Failed to mark medication as taken:', err)
    } finally {
      setTakingMedId(null)
    }
  }

  const handleVitalAdded = () => {
    fetchSummary()
  }

  const latestVitalsMap = {}
  if (data?.latest_vitals) {
    data.latest_vitals.forEach((v) => {
      if (!latestVitalsMap[v.type]) {
        latestVitalsMap[v.type] = v
      }
    })
  }

  const bp = latestVitalsMap['blood_pressure']
  const hr = latestVitalsMap['heart_rate']
  const glu = latestVitalsMap['glucose']
  const o2 = latestVitalsMap['spo2']

  const healthScore = data?.health_score || 88
  const scoreColor =
    healthScore >= 85
      ? 'from-emerald-500 to-teal-500'
      : healthScore >= 70
      ? 'from-amber-500 to-yellow-500'
      : 'from-rose-500 to-red-500'

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-blue-700/90 p-6 md:p-8 text-white shadow-xl shadow-blue-500/15 backdrop-blur-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/20">
              <Sparkles size={13} className="text-amber-300" />
              <span>AI Health Monitor Active</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {data?.user?.name || 'Alex'}
            </h1>
            <p className="max-w-xl text-sm text-blue-100 font-normal leading-relaxed">
              Your biometric indicators show steady stability today. Keep up with your medication schedule and stay hydrated.
            </p>
          </div>

          {/* Quick Action Floating Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsVitalModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs md:text-sm font-bold text-blue-700 shadow-lg shadow-black/5 hover:bg-blue-50 hover:shadow-xl active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              <span>Log Vital</span>
            </button>
            <Link
              to="/symptoms"
              className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-2.5 text-xs md:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all duration-200"
            >
              <Stethoscope size={16} />
              <span>Symptom Triage</span>
            </Link>
            <Link
              to="/ai-assistant"
              className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-4 py-2.5 text-xs md:text-sm font-semibold text-white backdrop-blur-md hover:bg-white/25 active:scale-95 transition-all duration-200"
            >
              <Bot size={16} />
              <span>Ask Copilot</span>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Lighting in Banner */}
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute left-1/2 -bottom-20 h-48 w-48 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
      </div>

      {/* Primary Biometrics Glass Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Blood Pressure */}
        <div className="glass-card-hover p-5 border border-white/80 bg-white/70 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm">
              <Activity size={20} />
            </div>
            <StatusBadge status={bp?.status} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Blood Pressure
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {bp ? bp.value : '118/78'}
            </span>
            <span className="text-xs font-semibold text-slate-400">mmHg</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Target: &lt; 120/80 mmHg (AHA guideline)
          </p>
        </div>

        {/* Resting Heart Rate */}
        <div className="glass-card-hover p-5 border border-white/80 bg-white/70 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">
              <Heart size={20} className="animate-pulse" />
            </div>
            <StatusBadge status={hr?.status} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Resting Pulse
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {hr ? hr.value : '68'}
            </span>
            <span className="text-xs font-semibold text-slate-400">bpm</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Normal resting range: 60 - 100 bpm
          </p>
        </div>

        {/* Blood Glucose */}
        <div className="glass-card-hover p-5 border border-white/80 bg-white/70 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              <Droplet size={20} />
            </div>
            <StatusBadge status={glu?.status} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Blood Glucose
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {glu ? glu.value : '89'}
            </span>
            <span className="text-xs font-semibold text-slate-400">mg/dL</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Fasting target: 70 - 99 mg/dL
          </p>
        </div>

        {/* Body Mass Index */}
        <div className="glass-card-hover p-5 border border-white/80 bg-white/70 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shadow-sm">
              <UserCheck size={20} />
            </div>
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-500/20">
              {data?.bmi_category || 'Normal'}
            </span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Body Mass Index
          </p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
              {data?.bmi || '23.4'}
            </span>
            <span className="text-xs font-semibold text-slate-400">kg/m²</span>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Weight: {data?.user?.weight || 74} kg • Height: {data?.user?.height || 178} cm
          </p>
        </div>
      </div>

      {/* Mid Section: Trends Chart & Health Vitality Score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Vitals Trend Visualizer (2 Cols) */}
        <Card
          title="7-Day Cardiovascular & Vitality Trend"
          subtitle="Systolic BP (mmHg) and Resting Heart Rate (bpm) progression"
          icon={TrendingUp}
          className="lg:col-span-2"
          action={
            <button
              type="button"
              onClick={() => setIsVitalModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Reading
            </button>
          }
        >
          {/* Custom Responsive SVG Chart */}
          <div className="mt-4 rounded-2xl border border-slate-100 bg-gradient-to-b from-slate-50/50 to-white p-4">
            <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  Systolic BP (mmHg)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                  Heart Rate (bpm)
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Baseline Range Shaded</span>
            </div>

            <div className="relative h-48 w-full">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="bpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="hrGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Normal safe zone band */}
                <rect x="0" y="40" width="600" height="70" fill="#f8fafc" opacity="0.8" />
                <line x1="0" y1="40" x2="600" y2="40" stroke="#e2e8f0" strokeDasharray="4 4" />
                <line x1="0" y1="110" x2="600" y2="110" stroke="#e2e8f0" strokeDasharray="4 4" />

                {/* Systolic BP Path */}
                <path
                  d="M 0 55 Q 100 65, 200 60 T 400 48 T 600 70 L 600 160 L 0 160 Z"
                  fill="url(#bpGrad)"
                />
                <path
                  d="M 0 55 Q 100 65, 200 60 T 400 48 T 600 70"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {/* Heart Rate Path */}
                <path
                  d="M 0 100 Q 100 95, 200 98 T 400 90 T 600 105 L 600 160 L 0 160 Z"
                  fill="url(#hrGrad)"
                />
                <path
                  d="M 0 100 Q 100 95, 200 98 T 400 90 T 600 105"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Interactive Points */}
                <circle cx="100" cy="65" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="200" cy="60" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="400" cy="48" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                <circle cx="600" cy="70" r="4.5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />

                <circle cx="200" cy="98" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <circle cx="400" cy="90" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <circle cx="600" cy="105" r="4" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
              </svg>
            </div>

            <div className="mt-3 flex justify-between text-[11px] font-semibold text-slate-400">
              <span>Day 1</span>
              <span>Day 2</span>
              <span>Day 3</span>
              <span>Day 4</span>
              <span>Day 5</span>
              <span>Day 6</span>
              <span>Today</span>
            </div>
          </div>
        </Card>

        {/* Health Vitality Score Gauge (1 Col) */}
        <Card
          title="Clinical Vitality Score"
          subtitle="Composite health stability metric"
          icon={ShieldCheck}
        >
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {/* Circular Gauge Representation */}
            <div className="relative mb-3 flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-white shadow-inner border border-slate-200/70">
              <div
                className={`absolute inset-2 rounded-full bg-gradient-to-tr ${scoreColor} opacity-20 blur-md`}
              />
              <div className="relative flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-slate-800 tracking-tight">
                  {healthScore}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  out of 100
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
              <CheckCircle2 size={13} /> Excellent Wellness
            </span>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Calculated using vital sign adherence, absence of critical alerts, and consistent blood pressure targets.
            </p>
          </div>
        </Card>
      </div>

      {/* Bottom Grid: Medication Schedule & Recent Symptom Logs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Medication Schedule Tracker */}
        <Card
          title="Today's Prescriptions"
          subtitle="Medication adherence tracking"
          icon={Pill}
          action={
            <Link
              to="/medications"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              Manage <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="space-y-2.5">
            {data?.active_medications && data.active_medications.length > 0 ? (
              data.active_medications.map((med) => {
                const isTaking = takingMedId === med.id
                return (
                  <div
                    key={med.id}
                    className="group flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/60 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                        <Pill size={17} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{med.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{med.dosage}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">{med.timing || 'Daily'}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTakeMed(med.id)}
                      disabled={isTaking}
                      className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-1.5 text-xs font-bold text-blue-700 transition-all duration-200 hover:bg-blue-600 hover:text-white active:scale-95 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} />
                      <span>{isTaking ? 'Logging...' : 'Mark Taken'}</span>
                    </button>
                  </div>
                )
              })
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                No active medications recorded.{' '}
                <Link to="/medications" className="text-blue-600 font-semibold underline">
                  Add one
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Symptom Triage Activity */}
        <Card
          title="Recent Symptom Assessments"
          subtitle="Clinical triage records & history"
          icon={ClipboardList}
          action={
            <Link
              to="/symptoms"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              New Check <ArrowUpRight size={14} />
            </Link>
          }
        >
          <div className="space-y-3">
            {data?.recent_symptoms && data.recent_symptoms.length > 0 ? (
              data.recent_symptoms.map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200/70 bg-white/60 p-3.5 backdrop-blur-md transition-all duration-200 hover:bg-white hover:shadow-sm"
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      {log.symptoms}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        log.urgency_level === 'Emergency'
                          ? 'bg-rose-100 text-rose-700'
                          : log.urgency_level === 'Urgent Care'
                          ? 'bg-orange-100 text-orange-700'
                          : log.urgency_level === 'Clinic Visit'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {log.urgency_level || 'Self-Care'}
                    </span>
                  </div>
                  {log.description && (
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {log.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                    <span>Duration: {log.duration || 'N/A'}</span>
                    <span>•</span>
                    <span>Severity: {log.severity}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                No recent symptom assessments.{' '}
                <Link to="/symptoms" className="text-blue-600 font-semibold underline">
                  Run AI triage
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Vital Sign Logging Modal */}
      <VitalModal
        isOpen={isVitalModalOpen}
        onClose={() => setIsVitalModalOpen(false)}
        onVitalAdded={handleVitalAdded}
      />
    </div>
  )
}

export default Dashboard