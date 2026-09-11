import { useState, useEffect } from 'react'
import {
  Pill,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Trash2,
  Sparkles,
  Info,
  Calendar,
  X,
  RotateCw,
} from 'lucide-react'
import Card from '../components/Card.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TIMING_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Night']
const FREQUENCY_OPTIONS = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly']

function Medications() {
  const [medications, setMedications] = useState([])
  const [filterTiming, setFilterTiming] = useState('All')
  const [isLoading, setIsLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCheckingInteractions, setIsCheckingInteractions] = useState(false)
  const [interactionResult, setInteractionResult] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    timing: 'Morning',
    instructions: 'Take after food',
  })
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMedications = async () => {
    try {
      const res = await fetch(`${API_URL}/medications/user/1`)
      if (res.ok) {
        const data = await res.json()
        setMedications(data)
      }
    } catch (err) {
      console.error('Failed to fetch medications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [])

  const handleTakeDose = async (medId) => {
    try {
      const res = await fetch(`${API_URL}/medications/${medId}/take`, { method: 'POST' })
      if (res.ok) {
        fetchMedications()
      }
    } catch (err) {
      console.error('Failed to log dose:', err)
    }
  }

  const handleDeleteMed = async (medId) => {
    if (!window.confirm('Remove this prescription?')) return
    try {
      const res = await fetch(`${API_URL}/medications/${medId}`, { method: 'DELETE' })
      if (res.ok) {
        fetchMedications()
      }
    } catch (err) {
      console.error('Failed to delete medication:', err)
    }
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.dosage.trim()) {
      setFormError('Medication name and dosage are required')
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const res = await fetch(`${API_URL}/medications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          name: formData.name.trim(),
          dosage: formData.dosage.trim(),
          frequency: formData.frequency,
          timing: formData.timing,
          instructions: formData.instructions.trim() || 'Take after meals',
        }),
      })

      if (!res.ok) throw new Error('Failed to create medication')

      fetchMedications()
      setFormData({
        name: '',
        dosage: '',
        frequency: 'Once daily',
        timing: 'Morning',
        instructions: 'Take after food',
      })
      setIsAddModalOpen(false)
    } catch (err) {
      console.error(err)
      setFormError('Error saving medication. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCheckInteractions = async () => {
    setIsCheckingInteractions(true)
    setInteractionResult(null)
    try {
      const res = await fetch(`${API_URL}/medications/check-interactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: 1,
        }),
      })
      if (res.ok) {
        const result = await res.json()
        setInteractionResult(result)
      }
    } catch (err) {
      console.error('Failed to check interactions:', err)
    } finally {
      setIsCheckingInteractions(false)
    }
  }

  const filteredMeds = medications.filter((m) => {
    if (filterTiming === 'All') return true
    return m.timing === filterTiming
  })

  // Calculate today's adherence rate
  const takenCount = medications.filter(
    (m) => m.last_taken && new Date().toDateString() === new Date(m.last_taken).toDateString()
  ).length
  const adherencePercent =
    medications.length > 0 ? Math.round((takenCount / medications.length) * 100) : 0

  return (
    <div className="space-y-7 animate-fadeIn">
      {/* Page Header & Adherence Summary */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              Medication Management
            </h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-500/20">
              {medications.length} Prescriptions Active
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Track daily dosages, schedules, and verify drug interaction safety with AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleCheckInteractions}
            disabled={isCheckingInteractions || medications.length === 0}
            className="group flex items-center gap-2 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/80 to-blue-50/80 px-4 py-2.5 text-xs md:text-sm font-bold text-indigo-700 backdrop-blur-md shadow-sm transition-all duration-200 hover:from-indigo-100 hover:to-blue-100 hover:shadow active:scale-95 disabled:opacity-50"
          >
            {isCheckingInteractions ? (
              <RotateCw size={16} className="animate-spin text-indigo-600" />
            ) : (
              <Sparkles size={16} className="text-indigo-600 group-hover:rotate-12 transition-transform" />
            )}
            <span>{isCheckingInteractions ? 'Analyzing...' : 'AI Safety & Interaction Check'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="glass-button-primary flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm"
          >
            <Plus size={16} />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Adherence Progress Bar Card */}
      <div className="glass-panel p-5 border border-white/80 bg-white/70 backdrop-blur-xl">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-600">
          <span className="flex items-center gap-2">
            <Clock size={15} className="text-blue-600" />
            Today's Adherence Schedule
          </span>
          <span className="text-blue-600 font-bold">
            {takenCount} of {medications.length} doses logged ({adherencePercent}%)
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-200/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${adherencePercent}%` }}
          />
        </div>
      </div>

      {/* AI Drug Interaction Result Card (when triggered) */}
      {interactionResult && (
        <div className="animate-slideUp rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-white/80 to-blue-50/70 p-6 backdrop-blur-2xl shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
                <Sparkles size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  AI Medication Safety & Cross-Reactivity Report
                </h3>
                <p className="text-xs text-slate-500">
                  Evaluated against active prescriptions, allergies, and chronic conditions
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                interactionResult.safe
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}
            >
              {interactionResult.status}
            </span>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-slate-700 font-medium">
            {interactionResult.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
              <span className="font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Safety Notes & Precautions
              </span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                {interactionResult.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm">
              <span className="font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Clinical Recommendations
              </span>
              <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                {interactionResult.recommendations.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Timing Schedule Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['All', ...TIMING_OPTIONS].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilterTiming(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition-all duration-200 ${
              filterTiming === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'border border-slate-200/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Prescriptions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeds.map((med) => {
          const isTakenToday =
            med.last_taken &&
            new Date().toDateString() === new Date(med.last_taken).toDateString()

          return (
            <div
              key={med.id}
              className="glass-card p-5 border border-white/80 bg-white/75 backdrop-blur-xl relative overflow-hidden group hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-500/15 to-indigo-500/15 text-blue-600 border border-blue-500/20 shadow-sm flex-shrink-0">
                    <Pill size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{med.name}</h3>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {med.dosage}
                      </span>
                      <span>•</span>
                      <span>{med.frequency}</span>
                    </div>
                    {med.instructions && (
                      <p className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <Info size={13} className="text-slate-400 flex-shrink-0" />
                        <span>{med.instructions}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeleteMed(med.id)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete Prescription"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Action Bar inside Card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={13} />
                  <span>Scheduled: {med.timing || 'Daily'}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTakeDose(med.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isTakenToday
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700'
                  }`}
                >
                  <CheckCircle2 size={14} />
                  <span>{isTakenToday ? 'Taken Today' : 'Log Dose'}</span>
                </button>
              </div>
            </div>
          )
        })}

        {filteredMeds.length === 0 && (
          <div className="col-span-full py-12 text-center rounded-3xl border border-dashed border-slate-300 bg-white/40 p-8">
            <Pill size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No medications found in this category</p>
            <p className="text-xs text-slate-400 mt-1">Add a new prescription or switch tabs to view others</p>
          </div>
        )}
      </div>

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-white/90 p-6 md:p-8 backdrop-blur-2xl shadow-2xl animate-slideUp">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 border border-blue-500/20 shadow-sm">
                <Pill size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Add Prescription</h2>
                <p className="text-xs text-slate-500">Record a new medicine to your schedule</p>
              </div>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lisinopril, Metformin, Amoxicillin"
                  className="glass-input w-full"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Dosage *
                  </label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                    placeholder="e.g. 10mg, 500mg"
                    className="glass-input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="glass-input w-full"
                  >
                    {FREQUENCY_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Scheduled Time
                  </label>
                  <select
                    value={formData.timing}
                    onChange={(e) => setFormData({ ...formData, timing: e.target.value })}
                    className="glass-input w-full"
                  >
                    {TIMING_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="e.g. Take with water"
                    className="glass-input w-full"
                  />
                </div>
              </div>

              {formError && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                  <AlertTriangle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="glass-button-primary flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50"
                >
                  <CheckCircle2 size={16} />
                  <span>{isSubmitting ? 'Saving...' : 'Save Prescription'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Medications
