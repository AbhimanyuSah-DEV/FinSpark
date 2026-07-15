import React, { useState, useRef, useEffect } from 'react'
import {
  MessageSquare, X, Send, Loader2, BrainCircuit,
  ChevronDown, Sparkles, AlertCircle,
} from 'lucide-react'
import { adminChat } from '../../api/admin.api'
import type { ChatMessage } from '../../api/admin.api'

interface AIChatProps {
  incidentId?: string   // pre-load incident context
}

const STARTER_PROMPTS = [
  'Why is this transaction suspicious?',
  'Should I block this account?',
  'What does the HNDL warning mean?',
  'Summarise the key risk signals',
  'What immediate action should I take?',
]

const AIChat: React.FC<AIChatProps> = ({ incidentId }) => {
  const [open, setOpen]           = useState(false)
  const [input, setInput]         = useState('')
  const [history, setHistory]     = useState<ChatMessage[]>([])
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const bottomRef                 = useRef<HTMLDivElement>(null)
  const inputRef                  = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom whenever history changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: ChatMessage = { role: 'user', content: text.trim() }
    setHistory(h => [...h, userMsg])
    setInput('')
    setLoading(true)
    setError(null)
    try {
      const { reply } = await adminChat(text.trim(), incidentId, [...history, userMsg])
      setHistory(h => [...h, { role: 'assistant', content: reply }])
    } catch {
      setError('Failed to reach BankShield AI. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* "Discuss this incident" label — shown when incident context is active */}
      {!open && incidentId && (
        <div className="fixed bottom-8 right-24 z-50 flex items-center gap-2 bg-surface border border-gold/30 rounded-full px-3 py-1.5 shadow-lg animate-in slide-in-from-right-4 fade-in duration-300">
          <MessageSquare size={11} className="text-gold" />
          <span className="text-xs font-semibold text-gold whitespace-nowrap">Discuss this incident</span>
          <span className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-full shadow-2xl
          flex items-center justify-center
          transition-all duration-300
          ${open
            ? 'bg-surface border-2 border-gold/40 text-gold rotate-0'
            : 'bg-gold text-background hover:bg-gold-dark hover:scale-105'
          }
        `}
        title="BankShield AI Chat"
      >
        {open
          ? <ChevronDown size={22} />
          : <MessageSquare size={22} />
        }
        {/* Pulsing notification dot (when closed + has context) */}
        {!open && incidentId && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-danger rounded-full border-2 border-background animate-pulse" />
        )}
      </button>

      {/* ── Chat panel ──────────────────────────────────────────── */}
      {open && (
        <div className={`
          fixed bottom-24 right-6 z-50
          w-[380px] max-h-[560px] flex flex-col
          bg-surface border border-border rounded-2xl shadow-2xl
          overflow-hidden
          animate-in slide-in-from-bottom-4 fade-in duration-200
        `}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 bg-surface border-b border-border flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center">
                <BrainCircuit size={15} className="text-gold" />
              </div>
              <div>
                <p className="text-sm font-bold text-text">BankShield AI</p>
                <p className="text-[10px] text-success font-medium">● Online · SOC Analyst Mode</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {incidentId && (
                <span className="text-[10px] font-mono bg-gold/10 border border-gold/25 text-gold px-2 py-0.5 rounded-full">
                  {incidentId}
                </span>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-muted hover:text-text transition-colors p-1 rounded"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {history.length === 0 && !loading && (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles size={11} className="text-gold" />
                  </div>
                  <div className="bg-surface-2 border border-border rounded-xl rounded-tl-sm px-3.5 py-2.5 text-sm text-text leading-relaxed">
                    {incidentId
                      ? `I have full context on ${incidentId}. Ask me anything — why it's suspicious, what action to take, quantum risk, or anything else.`
                      : `I'm your BankShield AI analyst. Select an incident from the queue to load context, or ask me a general security question.`
                    }
                  </div>
                </div>

                {/* Starter prompts */}
                <div className="space-y-1.5 ml-8">
                  {STARTER_PROMPTS.map(p => (
                    <button
                      key={p}
                      onClick={() => sendMessage(p)}
                      className="block w-full text-left text-xs text-muted border border-border hover:border-gold/40 hover:text-gold hover:bg-gold/5 rounded-lg px-3 py-2 transition-all duration-150"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {history.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  msg.role === 'user'
                    ? 'bg-gold text-background'
                    : 'bg-gold/15 border border-gold/25'
                }`}>
                  {msg.role === 'user'
                    ? <span className="text-[9px] font-bold">YOU</span>
                    : <Sparkles size={11} className="text-gold" />
                  }
                </div>
                <div className={`max-w-[82%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold/10 border border-gold/20 text-text rounded-tr-sm'
                    : 'bg-surface-2 border border-border text-text rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={11} className="text-gold animate-pulse" />
                </div>
                <div className="bg-surface-2 border border-border rounded-xl rounded-tl-sm px-3.5 py-3 flex items-center gap-2">
                  <Loader2 size={13} className="text-gold animate-spin" />
                  <span className="text-xs text-muted">Analysing…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-xs text-danger bg-danger/10 border border-danger/25 rounded-lg px-3 py-2">
                <AlertCircle size={12} />
                {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex-shrink-0 border-t border-border px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about this incident… (Enter to send)"
                rows={1}
                className="flex-1 resize-none bg-surface-2 border border-border rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-colors max-h-28 overflow-y-auto"
                style={{ minHeight: 42 }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-xl bg-gold text-background flex items-center justify-center hover:bg-gold-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send size={15} />
              </button>
            </div>
            <p className="text-[10px] text-muted/40 text-center mt-2">
              Powered by Gemini · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AIChat
