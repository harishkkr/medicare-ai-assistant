import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  User,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Trash2,
  Download,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SUGGESTED_PROMPTS = [
  'Interpret my recent blood pressure and heart rate readings',
  'Are my active medications safe to take together?',
  'What lifestyle changes help with borderline hypertension?',
  'What are early symptoms of electrolyte imbalance?',
]

// Simple markdown formatter for clean clinical response rendering
function FormattedMessage({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {lines.map((line, idx) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={idx} className="h-1.5" />

        // Disclaimer separator
        if (trimmed.startsWith('---') || trimmed.includes('*Disclaimer:')) {
          return (
            <div key={idx} className="mt-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 italic">
              {trimmed.replace(/^[*\s-]+|[*\s-]+$/g, '')}
            </div>
          )
        }

        // Bullet point lines
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          const content = trimmed.replace(/^[•\-*]\s*/, '')
          return (
            <div key={idx} className="flex items-start gap-2 text-xs md:text-sm pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-600 flex-shrink-0" />
              <span>{parseBold(content)}</span>
            </div>
          )
        }

        return <p key={idx}>{parseBold(trimmed)}</p>
      })}
    </div>
  )
}

function parseBold(str) {
  const parts = str.split(/(\*\*.*?\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello Alex! I am your MediCare AI Clinical Copilot, powered by Gemini 3.6 Flash.\n\nI have access to your active medical profile (O+ Blood Group, Borderline Hypertension, Penicillin allergy, Lisinopril medication).\n\nHow can I support your health and wellness goals today?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [includeContext, setIncludeContext] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Speech Recognition (Web Speech API)
  const toggleListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome/Edge.')
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript))
        setIsListening(false)
      }

      recognition.start()
    } catch (e) {
      console.error(e)
      setIsListening(false)
    }
  }

  const sendMessage = async (customPrompt) => {
    const textToSend = (customPrompt || input).trim()
    if (!textToSend || isLoading) return

    setMessages((prev) => [...prev, { role: 'user', content: textToSend }])
    if (!customPrompt) setInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/ai-assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          patient_id: 1,
          include_context: includeContext,
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I'm temporarily experiencing connectivity issues with the AI endpoint. However, based on clinical guidelines: monitor your vitals closely, stay hydrated, and consult your physician if any acute symptoms arise.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearChat = () => {
    if (window.confirm('Clear current consultation thread?')) {
      setMessages([
        {
          role: 'assistant',
          content: 'Chat cleared. How can I assist you today with your health records or wellness questions?',
        },
      ])
    }
  }

  const handleExportChat = () => {
    const chatText = messages
      .map((m) => `${m.role.toUpperCase()}:\n${m.content}\n\n`)
      .join('---\n\n')
    const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `MediCare_Consultation_${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col space-y-4 animate-fadeIn">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              AI Clinical Assistant
            </h1>
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 border border-blue-500/20">
              Gemini 3.6 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Context-aware health advice correlated with your biometric records and medications.
          </p>
        </div>

        {/* Controls & Context Toggle */}
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-slate-600 backdrop-blur-md cursor-pointer shadow-sm hover:bg-white transition-colors">
            <input
              type="checkbox"
              checked={includeContext}
              onChange={(e) => setIncludeContext(e.target.checked)}
              className="rounded accent-blue-600"
            />
            <span>Sync Patient Profile</span>
          </label>

          <button
            type="button"
            onClick={handleExportChat}
            title="Export Consultation"
            className="rounded-xl border border-slate-200/80 bg-white/70 p-2 text-slate-500 hover:bg-white hover:text-slate-800 transition-colors shadow-sm"
          >
            <Download size={15} />
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            title="Clear Chat"
            className="rounded-xl border border-slate-200/80 bg-white/70 p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-sm"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Glassmorphic Chat Window */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/70 backdrop-blur-2xl shadow-xl">
        {/* Messages Container */}
        <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user'
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 animate-slideUp ${
                  isUser ? 'flex-row-reverse' : ''
                }`}
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl shadow-sm ${
                    isUser
                      ? 'bg-blue-600 text-white shadow-blue-500/20'
                      : 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white shadow-indigo-500/25'
                  }`}
                >
                  {isUser ? <User size={17} /> : <Bot size={18} />}
                </div>

                <div
                  className={`max-w-[80%] rounded-3xl p-4 md:p-5 shadow-sm transition-all duration-200 ${
                    isUser
                      ? 'rounded-tr-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium'
                      : 'rounded-tl-sm border border-white/90 bg-white/85 text-slate-800 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)]'
                  }`}
                >
                  {isUser ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <FormattedMessage text={msg.content} />
                  )}
                </div>
              </div>
            )
          })}

          {isLoading && (
            <div className="flex items-start gap-3 animate-pulse">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm">
                <Bot size={18} />
              </div>
              <div className="rounded-3xl rounded-tl-sm border border-white/90 bg-white/80 px-5 py-3.5 backdrop-blur-xl text-xs font-semibold text-slate-500 flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-blue-600" />
                <span>MediCare AI is evaluating your question against clinical guidelines...</span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Suggested Prompt Chips */}
        <div className="px-5 py-2 border-t border-slate-100/80 bg-white/40 backdrop-blur-md flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Sparkles size={12} className="text-amber-400" /> Suggestions:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="flex-shrink-0 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-xs text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200 active:scale-95"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-100 bg-white/70 backdrop-blur-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex items-center gap-2.5"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about medications, vitals, nutrition, or symptoms..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 shadow-inner transition-all pr-10"
              />
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? 'Stop listening' : 'Speak your question'}
                className={`absolute right-2.5 top-2.5 rounded-xl p-1.5 transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                }`}
              >
                {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="glass-button-primary flex h-11 w-11 items-center justify-center rounded-2xl flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant