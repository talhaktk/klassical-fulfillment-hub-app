'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

export default function AIChat({ onClose }: { onClose: () => void }) {
  const { stats, orders, inventory } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! I\'m your Klassical warehouse AI. Ask me anything about orders, inventory, billing, or get operational insights.' }
  ])
  const [input, setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    try {
      const contextNote = `[Context: ${stats.pendingOrders} pending orders, ${stats.lowStockAlerts} low-stock SKUs, ${stats.overdueInvoices} overdue invoices, £${stats.totalCash.toFixed(2)} cash]`
      const apiMessages = [
        { role: 'user', content: contextNote },
        ...next.map(m => ({ role: m.role, content: m.content })),
      ]
      const res  = await fetch('/api/openai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: data.reply ?? 'Sorry, I couldn\'t respond.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }])
    }
    setLoading(false)
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
      style={{ width: 360, height: 480, background: '#0E2040', border: '1.5px solid rgba(200,151,26,.4)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: 'rgba(200,151,26,.12)', borderBottom: '1px solid rgba(200,151,26,.2)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">🤖</span>
          <div>
            <div className="text-sm font-bold text-white">Klassical AI</div>
            <div className="text-[10px]" style={{ color: 'rgba(255,255,255,.4)' }}>Warehouse Intelligence</div>
          </div>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white text-lg">×</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[85%] px-3 py-2 rounded-xl text-sm"
              style={{
                background: m.role === 'user' ? 'rgba(200,151,26,.25)' : 'rgba(255,255,255,.07)',
                color:      m.role === 'user' ? '#F5D060' : 'rgba(255,255,255,.85)',
                borderBottomRightRadius: m.role === 'user'      ? 2 : undefined,
                borderBottomLeftRadius:  m.role === 'assistant' ? 2 : undefined,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)' }}>
              <span className="animate-pulse">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 pb-3 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
            style={{ background: 'rgba(255,255,255,.07)', color: 'white', border: '1px solid rgba(255,255,255,.12)' }}
            placeholder="Ask about orders, stock, billing…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-3 py-2 rounded-lg text-sm font-semibold transition-opacity"
            style={{ background: '#C8971A', color: '#0E2040', opacity: (!input.trim() || loading) ? 0.4 : 1 }}
          >↑</button>
        </div>
      </div>
    </div>
  )
}
