import { useState } from 'react'
import { X, Activity, Heart, Droplet, Wind, Thermometer, Scale, CheckCircle2, AlertTriangle } from 'lucide-react'

const VITAL_TYPES = [
  { id: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: Activity, placeholder: 'e.g. 120/80' },
  { id: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Heart, placeholder: 'e.g. 72' },
  { id: 'glucose', label: 'Blood Sugar', unit: 'mg/dL', icon: Droplet, placeholder: 'e.g. 95' },
  { id: 'spo2', label: 'Oxygen Saturation', unit: '%', icon: Wind, placeholder: 'e.g. 98' },
  { id: 'temperature', label: 'Body Temperature', unit: '°F', icon: Thermometer, placeholder: 'e.g. 98.6' },
  { id: 'weight', label: 'Weight', unit: 'kg', icon: Scale, placeholder: 'e.g. 72.5' },
]

function VitalModal({ isOpen, onClose, onVitalAdded }) {
  const [selectedType, setSelectedType] = useState('blood_pressure')
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const activeVital = VITAL_TYPES.find((v) => v.id === selectedType) || VITAL_TYPES[0]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!value.trim()) {
      setError('Please enter a reading value')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${API_URL}/vitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          type: selectedType,
          value: value.trim(),
          unit: activeVital.unit,
          notes: notes.trim() || undefined,
        }),
      })

      if (!res.ok) throw new Error('Failed to save vital')

      const savedVital = await res.json()
      onVitalAdded(savedVital)
      setValue('')
      setNotes('')
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to record vital sign. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/80 bg-white/85 p-6 md:p-8 backdrop-blur-2xl shadow-2xl animate-slideUp">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Title */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-600 border border-blue-500/20 shadow-sm">
            <Activity size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Log Vital Sign</h2>
            <p className="text-xs text-slate-500">Record a new biometric measurement</p>
          </div>
        </div>

        {/* Vital Selector Pills */}
        <div className="mb-6">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Metric
          </label>
          <div className="grid grid-cols-3 gap-2">
            {VITAL_TYPES.map((v) => {
              const Icon = v.icon
              const isSelected = selectedType === v.id
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(v.id)
                    setValue('')
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl p-2.5 text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                      : 'border border-slate-200/80 bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm'
                  }`}
                >
                  <Icon size={17} className={isSelected ? 'text-white' : 'text-blue-600'} />
                  <span className="truncate max-w-[90px]">{v.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
              <span>Reading Value ({activeVital.unit})</span>
              <span className="text-[11px] font-normal text-blue-600">Target Range: Standard</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={activeVital.placeholder}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-semibold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-inner transition-all"
                autoFocus
              />
              <span className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400">
                {activeVital.unit}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Clinical Context / Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Taken post-exercise, morning fasting, resting"
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200/80 p-3 text-xs text-rose-700">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !value.trim()}
              className="glass-button-primary flex items-center gap-2 px-6 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={16} />
              <span>{isSubmitting ? 'Recording...' : 'Save Reading'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default VitalModal
