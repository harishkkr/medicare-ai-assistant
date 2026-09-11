import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Bot,
  Stethoscope,
  Pill,
  User,
  Sparkles,
  HeartPulse,
  RotateCw,
  ShieldCheck,
} from 'lucide-react'
import HealthTip from './HealthTip.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Bot, badge: 'Gemini 3.6' },
  { name: 'Symptom Triage', path: '/symptoms', icon: Stethoscope },
  { name: 'Medications', path: '/medications', icon: Pill },
  { name: 'Health Profile', path: '/profile', icon: User },
]

function Sidebar() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedStatus, setSeedStatus] = useState(null)

  const handleSeedDemo = async () => {
    setIsSeeding(true)
    setSeedStatus(null)
    try {
      const res = await fetch(`${API_URL}/patients/seed-demo`, { method: 'POST' })
      if (!res.ok) throw new Error('Seeding failed')
      setSeedStatus('Demo Loaded!')
      setTimeout(() => {
        setSeedStatus(null)
        window.location.reload()
      }, 800)
    } catch (err) {
      console.error(err)
      setSeedStatus('Error')
      setTimeout(() => setSeedStatus(null), 2000)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <aside className="relative flex h-screen w-64 md:w-72 flex-col justify-between border-r border-white/60 bg-white/70 backdrop-blur-2xl px-4 py-6 shadow-[4px_0_30px_rgba(0,0,0,0.03)] z-20">
      <div>
        {/* Brand Header */}
        <div className="mb-7 flex items-center gap-3 px-2">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/25">
            <HeartPulse size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-800">
                MediCare <span className="text-blue-600">AI</span>
              </span>
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Clinical Copilot
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ name, path, icon: Icon, badge }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 translate-x-1'
                    : 'text-slate-600 hover:bg-white/80 hover:text-slate-900 hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-blue-600 transition-colors'
                      }
                    />
                    <span>{name}</span>
                  </div>
                  {badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-50 text-blue-600 border border-blue-200/50'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-3">
        {/* 1-Click Hackathon Demo Mode Seed Button */}
        <button
          type="button"
          onClick={handleSeedDemo}
          disabled={isSeeding}
          className="group relative flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200/70 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 px-3.5 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition-all duration-200 hover:from-blue-100 hover:to-indigo-100 hover:shadow active:scale-[0.98] disabled:opacity-50"
        >
          {isSeeding ? (
            <RotateCw size={14} className="animate-spin text-blue-600" />
          ) : (
            <Sparkles size={14} className="text-blue-600 transition-transform group-hover:rotate-12" />
          )}
          <span>{seedStatus || (isSeeding ? 'Populating Demo...' : 'Load Demo Health Data')}</span>
        </button>

        {/* Dynamic Health Tip Widget */}
        <HealthTip />

        {/* System Medical Disclaimer Note */}
        <div className="flex items-center gap-2 px-2 text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">Informational clinical assistant</span>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar