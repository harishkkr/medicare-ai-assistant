import { useState } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'

const TIPS = [
  {
    title: 'Hydration & Vitals',
    text: 'Drinking 2-3 liters of water daily helps stabilize blood viscosity and reduces pulse pressure fluctuations.',
  },
  {
    title: 'Post-Meal Walking',
    text: 'A light 10-minute walk after meals blunts postprandial glucose spikes by up to 22%.',
  },
  {
    title: 'Sleep & Immune Health',
    text: 'Consistent 7+ hours of quality sleep enhances natural T-cell response and regulates circadian cortisol.',
  },
  {
    title: 'Mindful Breathing',
    text: '4-7-8 deep breathing activates the vagus nerve, rapidly lowering sympathetic resting heart rate.',
  },
]

function HealthTip() {
  const [index, setIndex] = useState(0)

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % TIPS.length)
  }

  const tip = TIPS[index]

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-white/60 p-3.5 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-blue-700">
          <Sparkles size={15} className="text-blue-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">
            {tip.title}
          </span>
        </div>
        <button
          type="button"
          onClick={handleNext}
          title="Next tip"
          className="rounded-lg p-1 text-slate-400 hover:bg-white/80 hover:text-blue-600 transition-colors"
        >
          <RefreshCw size={12} className="transition-transform group-hover:rotate-45" />
        </button>
      </div>
      <p className="text-xs leading-relaxed text-slate-600 font-normal">
        {tip.text}
      </p>
    </div>
  )
}

export default HealthTip