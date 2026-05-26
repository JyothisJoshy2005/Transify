import { useState, useEffect, useRef, useCallback } from 'react'
import { MessageSquare, Send, Users, Wifi, WifiOff, Globe } from 'lucide-react'
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket'
import { LANGUAGES_NO_AUTO, getLangName } from '../utils/helpers'

function TypingIndicator({ name }) {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
        {name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="bubble-other flex items-center gap-1 py-3 px-4">
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400 inline-block" />
      </div>
    </div>
  )
}

function ChatBubble({ msg }) {
  const [showOriginal, setShowOriginal] = useState(false)
  return (
    <div className={`flex items-end gap-2 animate-slide-up ${msg.is_own ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!msg.is_own && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
          {msg.sender_name?.[0]?.toUpperCase() || '?'}
        </div>
      )}

      <div className={`flex flex-col gap-1 max-w-xs ${msg.is_own ? 'items-end' : 'items-start'}`}>
        {!msg.is_own && (
          <span className="text-[10px] text-slate-400 px-1">{msg.sender_name}</span>
        )}

        <div className={msg.is_own ? 'bubble-own' : 'bubble-other'}>
          <p className="text-sm leading-relaxed">{msg.translated_text}</p>
          {msg.is_translated && (
            <button
              onClick={() => setShowOriginal(v => !v)}
              className={`text-[10px] mt-1 underline underline-offset-2 opacity-60 hover:opacity-100 ${msg.is_own ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {showOriginal ? 'Hide original' : `Original (${msg.source_lang_name})`}
            </button>
          )}
          {showOriginal && msg.is_translated && (
            <p className={`text-[11px] mt-1 italic opacity-70 border-t pt-1 ${msg.is_own ? 'border-white/30 text-white' : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'}`}>
              {msg.original_text}
            </p>
          )}
        </div>

        <span className={`text-[10px] text-slate-400 px-1 flex items-center gap-1`}>
          {msg.timestamp}
          {msg.is_translated && (
            <span className="text-[9px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full font-semibold">
              Translated · {msg.accuracy?.toFixed(0)}%
            </span>
          )}
        </span>
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages]       = useState([])
  const [inputText, setInputText]     = useState('')
  const [userName, setUserName]       = useState(() => `User_${Math.random().toString(36).slice(2, 7)}`)
  const [userLang, setUserLang]       = useState('en')
  const [connected, setConnected]     = useState(false)
  const [userCount, setUserCount]     = useState(0)
  const [typing, setTyping]           = useState(null)
  const [nameInput, setNameInput]     = useState(userName)
  const [infoSent, setInfoSent]       = useState(false)

  const bottomRef  = useRef(null)
  const typingRef  = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Socket setup
  useEffect(() => {
    const socket = connectSocket()

    socket.on('connect',    () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socket.on('receive_message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    socket.on('user_count', ({ count }) => setUserCount(count))

    socket.on('user_typing', ({ name, is_typing }) => {
      setTyping(is_typing ? name : null)
      if (typingRef.current) clearTimeout(typingRef.current)
      if (is_typing) {
        typingRef.current = setTimeout(() => setTyping(null), 3000)
      }
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('receive_message')
      socket.off('user_count')
      socket.off('user_typing')
      disconnectSocket()
    }
  }, [])

  // Send user info when language changes
  useEffect(() => {
    if (connected) {
      const socket = getSocket()
      socket.emit('set_user_info', { name: userName, language: userLang })
    }
  }, [connected, userName, userLang])

  const handleSend = () => {
    if (!inputText.trim() || !connected) return
    const socket = getSocket()
    socket.emit('chat_message', { text: inputText.trim(), source_lang: userLang })
    socket.emit('typing', { is_typing: false })
    setInputText('')
  }

  const handleTyping = useCallback((e) => {
    setInputText(e.target.value)
    if (connected) {
      const socket = getSocket()
      socket.emit('typing', { is_typing: true })
      if (typingRef.current) clearTimeout(typingRef.current)
      typingRef.current = setTimeout(() => {
        socket.emit('typing', { is_typing: false })
      }, 1500)
    }
  }, [connected])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleSetName = () => {
    const trimmed = nameInput.trim()
    if (!trimmed) return
    setUserName(trimmed)
    setInfoSent(true)
    setTimeout(() => setInfoSent(false), 2000)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen p-4 md:p-6 max-w-4xl mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Live Chat Translation</h1>
            <p className="page-sub">Real-time multilingual · Socket.IO</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300">{userCount}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${connected ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* User Settings */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Your Name</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetName()}
              maxLength={30}
              placeholder="Enter your name…"
            />
            <button onClick={handleSetName} className="btn-secondary px-3 text-xs">
              {infoSent ? '✓' : 'Set'}
            </button>
          </div>
        </div>
        <div className="min-w-[180px]">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block flex items-center gap-1">
            <Globe className="w-3 h-3" /> Your Language
          </label>
          <select className="select" value={userLang} onChange={e => setUserLang(e.target.value)}>
            {LANGUAGES_NO_AUTO.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 card p-4 overflow-y-auto space-y-4 mb-4 no-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-orange-400" />
            </div>
            <p className="font-semibold text-slate-600 dark:text-slate-300">No messages yet</p>
            <p className="text-sm">Send a message — it'll auto-translate for others!</p>
          </div>
        ) : (
          messages.map((msg, i) => <ChatBubble key={msg.id || i} msg={msg} />)
        )}
        {typing && <TypingIndicator name={typing} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="card p-3 flex gap-3 items-end">
        <textarea
          className="input flex-1 resize-none min-h-[44px] max-h-28 py-2.5"
          placeholder={connected ? `Type in ${getLangName(userLang)}…` : 'Connecting to server…'}
          value={inputText}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={!connected}
        />
        <button
          onClick={handleSend}
          disabled={!connected || !inputText.trim()}
          className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-2">
        Open this page in multiple tabs to simulate multi-user chat · Press Enter to send
      </p>
    </div>
  )
}
