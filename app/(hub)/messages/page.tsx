'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/store'
import { fmtDate } from '@/lib/utils'
import { getSupabaseClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { Message } from '@/types/database'

export default function MessagesPage() {
  const { messages, sellers, loadMessages } = useStore()
  const [activeSeller, setActiveSeller]   = useState<string | null>(null)
  const [compose, setCompose]             = useState('')
  const [drafting, setDrafting]           = useState(false)
  const [sending,  setSending]            = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const sellerMessages = activeSeller
    ? messages.filter(m => m.seller_id === activeSeller)
    : []

  // Unread count per seller
  const unreadMap = sellers.reduce((acc, s) => {
    acc[s.id] = messages.filter(m => m.seller_id === s.id && !m.read && m.sender_role === 'seller').length
    return acc
  }, {} as Record<string, number>)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [sellerMessages.length])

  async function handleSend() {
    if (!activeSeller || !compose.trim()) return
    setSending(true)
    const db = getSupabaseClient()
    const { error } = await db.from('messages').insert({
      seller_id: activeSeller,
      sender_role: 'warehouse',
      content: compose.trim(),
      read: false,
    })
    if (error) { toast.error(error.message); setSending(false); return }
    setCompose('')
    await loadMessages()
    setSending(false)
  }

  async function handleAIDraft() {
    if (!activeSeller) return
    setDrafting(true)
    try {
      const context = sellerMessages.slice(-5).map(m => `${m.sender_role}: ${m.content}`).join('\n')
      const seller  = sellers.find(s => s.id === activeSeller)
      const res = await fetch('/api/openai/draft-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerName: seller?.name, context }),
      })
      const data = await res.json()
      if (data.draft) setCompose(data.draft)
    } catch {
      toast.error('AI draft failed')
    }
    setDrafting(false)
  }

  async function markRead(msgs: Message[]) {
    const db    = getSupabaseClient()
    const unread = msgs.filter(m => !m.read && m.sender_role === 'seller').map(m => m.id)
    if (unread.length === 0) return
    await db.from('messages').update({ read: true }).in('id', unread)
    await loadMessages()
  }

  function handleSelectSeller(id: string) {
    setActiveSeller(id)
    const msgs = messages.filter(m => m.seller_id === id)
    markRead(msgs)
  }

  return (
    <div className="p-6 animate-fadeIn" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex gap-4 h-full">
        {/* Seller list */}
        <div className="w-64 shrink-0">
          <div className="kh-card h-full flex flex-col !p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E8ECF2]">
              <div className="text-sm font-bold text-[#0E2040]">Messages</div>
              <div className="text-xs text-[#7A8BA0]">{messages.filter(m => !m.read && m.sender_role === 'seller').length} unread</div>
            </div>
            <div className="overflow-y-auto flex-1">
              {sellers.map(s => {
                const last    = messages.filter(m => m.seller_id === s.id)[0]
                const unread  = unreadMap[s.id] ?? 0
                const isActive = activeSeller === s.id
                return (
                  <button
                    key={s.id}
                    className="w-full text-left px-4 py-3 border-b border-[#E8ECF2] transition-colors"
                    style={{ background: isActive ? 'linear-gradient(90deg,rgba(200,151,26,.1),transparent)' : undefined, borderLeft: isActive ? '3px solid #C8971A' : '3px solid transparent' }}
                    onClick={() => handleSelectSeller(s.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#0E2040]">{s.icon} {s.name}</span>
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: '#C0321E' }}>
                          {unread}
                        </span>
                      )}
                    </div>
                    {last && (
                      <div className="text-xs text-[#7A8BA0] truncate mt-0.5">{last.content}</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Conversation */}
        <div className="flex-1 kh-card !p-0 flex flex-col overflow-hidden">
          {!activeSeller ? (
            <div className="flex-1 flex items-center justify-center text-[#7A8BA0]">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-sm">Select a seller to view messages</div>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#E8ECF2] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{sellers.find(s => s.id === activeSeller)?.icon}</span>
                  <div>
                    <div className="font-bold text-[#0E2040]">{sellers.find(s => s.id === activeSeller)?.name}</div>
                    <div className="text-xs text-[#7A8BA0]">{sellerMessages.length} messages</div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {sellerMessages.length === 0 ? (
                  <div className="text-center text-[#7A8BA0] text-sm py-8">No messages yet. Start the conversation.</div>
                ) : sellerMessages.map(msg => {
                  const isWarehouse = msg.sender_role === 'warehouse'
                  return (
                    <div key={msg.id} className={`flex ${isWarehouse ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className="max-w-[70%] px-4 py-2.5 rounded-2xl text-sm"
                        style={{
                          background: isWarehouse ? 'linear-gradient(135deg,#1B3A6B,#0E2040)' : '#F0F4FA',
                          color:      isWarehouse ? '#fff' : '#2A3A50',
                          borderBottomRightRadius: isWarehouse ? 4 : undefined,
                          borderBottomLeftRadius:  !isWarehouse ? 4 : undefined,
                        }}
                      >
                        {msg.content}
                        <div className={`text-[10px] mt-1 ${isWarehouse ? 'text-white/50' : 'text-[#7A8BA0]'}`}>
                          {fmtDate(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>

              {/* Compose */}
              <div className="px-5 py-3.5 border-t border-[#E8ECF2]">
                <div className="flex gap-2">
                  <textarea
                    className="kh-input flex-1 resize-none !h-[60px]"
                    placeholder="Type a message…"
                    value={compose}
                    onChange={e => setCompose(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  />
                  <div className="flex flex-col gap-1.5">
                    <button className="btn-gold btn-sm flex-1" onClick={handleSend} disabled={sending || !compose.trim()}>
                      {sending ? '…' : '↑ Send'}
                    </button>
                    <button className="btn-ghost btn-sm flex-1 text-xs" onClick={handleAIDraft} disabled={drafting}>
                      {drafting ? '…' : '✨ AI Draft'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
