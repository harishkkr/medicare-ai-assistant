
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AIAssistant from './pages/AIAssistant.jsx'
import SymptomChecker from './pages/SymptomChecker.jsx'
import Medications from './pages/Medications.jsx'
import Profile from './pages/Profile.jsx'

function App() {
  return (
    <BrowserRouter>
      <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50/70">
        {/* Ambient decorative glowing mesh orbs for true frosted glass refraction */}
        <div className="pointer-events-none fixed -top-40 -left-40 h-96 w-96 rounded-full bg-blue-400/25 blur-3xl" />
        <div className="pointer-events-none fixed top-1/4 right-0 h-96 w-96 rounded-full bg-indigo-400/20 blur-3xl" />
        <div className="pointer-events-none fixed -bottom-20 left-1/3 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none fixed bottom-10 right-1/4 h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl" />

        {/* Glassmorphic Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="relative flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl animate-fadeIn">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/symptoms" element={<SymptomChecker />} />
              <Route path="/medications" element={<Medications />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App