import { useState, useEffect, useRef } from 'react'
import { Send, Smile, Paperclip, Mic, MoreVertical, Phone, Video, Search } from 'lucide-react'
import { getSocket } from '../utils/socket'

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ta', name: 'Tamil' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
]

const DEMO_CONTACTS = [
  { id: 1, name: 'Anand (Malayalam)', lang: 'ml', lastMsg: 'നമ്മൾ പറഞ്ഞോ?', time: '11:30 AM', unread: 2, online: true },
  { id: 2, name: 'Priya (Tamil)',     lang: 'ta', lastMsg: 'நாளை பார்க்கலாம்', time: '10:15 AM', unread: 0, online: false },
  { id: 3, name: 'Ravi (English)',    lang: 'en', lastMsg: 'See you tomorrow!',   time: 'Yesterday', unread: 0, online: false },
  { id: 4, name: 'Kavya (Hindi)',     lang: 'hi', lastMsg: 'ठीक है, कल मिलते हैं', time: 'Yesterday', unread: 0, online: false },
]

function Avatar({ name, online, size = 9 }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
  const colors = ['#4d7a6a','#e87540','#1c2b39','#7c6a4d','#6a4d7c']
  const bg = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="relative flex-shrink-0" style={{width: size*4+'px', height: size*4+'px'}}>
      <div className="w-full h-full rounded-full flex items-center justify-center text-white text-sm font-bold"
        style={{background: bg}}>
        {initials}
      </div>
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
          style={{background:'#22c55e'}}/>
      )}
    </div>
  )
}

export default function Chat() {
  const [myName, setMyName]       = useState('')
  const [myLang, setMyLang]       = useState('en')
  const [joined, setJoined]       = useState(false)
  const [messages, setMessages]   = useState([])
  const [inputMsg, setInputMsg]   = useState('')
  const [userCount, setUserCount] = useState(1)
  const [typing, setTyping]       = useState('')
  const [activeContact, setActiveContact] = useState(DEMO_CONTACTS[0])
  const messagesEndRef = useRef(null)
  const socketRef      = useRef(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  useEffect(() => { scrollToBottom() }, [messages])

  const handleJoin = () => {
    if (!myName.trim()) return
    const socket = getSocket()
    socketRef.current = socket
    socket.emit('set_user_info', { name: myName, language: myLang })
    socket.on('receive_message', msg => {
      setMessages(prev => [...prev, { ...msg, id: Date.now() + Math.random() }])
    })
    socket.on('user_count', data => setUserCount(data.count))
    socket.on('user_typing', data => {
      if (data.name !== myName) {
        setTyping(data.is_typing ? data.name : '')
        if (data.is_typing) setTimeout(() => setTyping(''), 3000)
      }
    })
    setJoined(true)
  }

  const sendMessage = () => {
    if (!inputMsg.trim() || !socketRef.current) return
    socketRef.current.emit('chat_message', { text: inputMsg, source_lang: myLang })
    setInputMsg('')
  }

  const handleTyping = e => {
    setInputMsg(e.target.value)
    socketRef.current?.emit('typing', { is_typing: true })
  }

  // ── Join Screen ──────────────────────────────────────────────
  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 animate-fade-in" style={{background:'var(--cream)'}}>
        <div className="card p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
              style={{background:'var(--navy)'}}>
              <Send className="w-6 h-6 text-white" />
            </div>
            <h2 style={{fontWeight:800, fontSize:'20px', color:'var(--text-dark)'}}>Join Live Chat</h2>
            <p style={{fontSize:'13px', color:'var(--text-light)', marginTop:'4px'}}>
              Messages auto-translate to your language
            </p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="section-label block mb-1.5">Your Name</label>
              <input className="input" placeholder="Enter your name…"
                value={myName} onChange={e => setMyName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleJoin()} />
            </div>
            <div>
              <label className="section-label block mb-1.5">Your Language</label>
              <select className="select" value={myLang} onChange={e => setMyLang(e.target.value)}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <button onClick={handleJoin} disabled={!myName.trim()} className="btn-primary w-full justify-center mt-2">
              <Send className="w-4 h-4" /> Join Chat
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Chat Interface ───────────────────────────────────────────
  return (
    <div className="flex h-screen animate-fade-in" style={{background:'var(--cream)'}}>

      {/* Contact List */}
      <div className="w-72 flex-shrink-0 flex flex-col" style={{background:'var(--white)', borderRight:'1px solid var(--border)'}}>
        {/* Search */}
        <div className="p-3" style={{borderBottom:'1px solid var(--border)'}}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{color:'var(--text-light)'}} />
            <input className="input pl-8" style={{fontSize:'12px', padding:'8px 12px 8px 32px'}}
              placeholder="Search or start new chat" />
          </div>
        </div>

        {/* Contacts */}
        <div className="flex-1 overflow-y-auto">
          {DEMO_CONTACTS.map(contact => (
            <button key={contact.id} onClick={() => setActiveContact(contact)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 transition-colors"
              style={{background: activeContact.id === contact.id ? 'var(--teal-pale)' : 'transparent',
                borderLeft: activeContact.id === contact.id ? '3px solid var(--teal)' : '3px solid transparent'}}>
              <Avatar name={contact.name} online={contact.online} size={10} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span style={{fontSize:'13px', fontWeight:600, color:'var(--text-dark)'}} className="truncate">{contact.name}</span>
                  <span style={{fontSize:'10px', color:'var(--text-light)', flexShrink:0, marginLeft:'8px'}}>{contact.time}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span style={{fontSize:'11px', color:'var(--text-light)'}} className="truncate">{contact.lastMsg}</span>
                  {contact.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{background:'var(--teal)', fontSize:'9px', fontWeight:700}}>{contact.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {/* Live users */}
          <div className="px-4 py-3" style={{borderTop:'1px solid var(--border)'}}>
            <p className="section-label mb-2">Live Room ({userCount} online)</p>
            <div className="flex items-center gap-2 p-2 rounded-xl" style={{background:'var(--teal-pale)'}}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{background:'var(--teal)'}}/>
              <span style={{fontSize:'12px', color:'var(--teal)', fontWeight:600}}>You · {myName}</span>
              <span className="ml-auto pill pill-teal" style={{fontSize:'10px', padding:'2px 8px'}}>{LANGUAGES.find(l=>l.code===myLang)?.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{background:'var(--white)', borderBottom:'1px solid var(--border)'}}>
          <Avatar name={activeContact.name} online={activeContact.online} size={9} />
          <div className="flex-1 min-w-0">
            <p style={{fontWeight:700, fontSize:'14px', color:'var(--text-dark)'}}>{activeContact.name}</p>
            <p style={{fontSize:'11px', color: activeContact.online ? '#22c55e' : 'var(--text-light)'}}>
              {activeContact.online ? '● Online' : 'Offline'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost p-2"><Phone className="w-4 h-4" /></button>
            <button className="btn-ghost p-2"><Video className="w-4 h-4" /></button>
            <button className="btn-ghost p-2"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          style={{background:'var(--cream)'}}>
          {/* Date separator */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
            <span style={{fontSize:'11px', color:'var(--text-light)', padding:'2px 10px',
              background:'var(--cream-dark)', borderRadius:'999px'}}>Today</span>
            <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
          </div>

          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p style={{fontSize:'13px', color:'var(--text-light)'}}>
                Send a message — it auto-translates for everyone! 🌍
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isOwn = msg.sender === myName
              return (
                <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                  {!isOwn && <Avatar name={msg.sender || 'User'} online size={8} />}
                  <div className="max-w-xs">
                    {!isOwn && (
                      <p style={{fontSize:'10px', color:'var(--text-light)', marginBottom:'3px', marginLeft:'4px'}}>
                        {msg.sender}
                      </p>
                    )}
                    <div className={isOwn ? 'bubble-own' : 'bubble-other'}>
                      <p style={{fontSize:'13px', lineHeight:'1.5'}}>{isOwn ? msg.original_text : (msg.translated_text || msg.original_text)}</p>
                      {!isOwn && msg.is_translated && (
                        <p style={{fontSize:'10px', marginTop:'4px', opacity:0.6}}>⊙ Original: {msg.original_text}</p>
                      )}
                      <p style={{fontSize:'10px', opacity:0.5, marginTop:'4px', textAlign:'right'}}>
                        {new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} ✓✓
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )}

          {typing && (
            <div className="flex items-center gap-2">
              <div style={{background:'var(--white)', border:'1px solid var(--border)'}} className="px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
                <span className="typing-dot"/><span className="typing-dot"/><span className="typing-dot"/>
              </div>
              <span style={{fontSize:'11px', color:'var(--text-light)'}}>{typing} is typing…</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
          style={{background:'var(--white)', borderTop:'1px solid var(--border)'}}>
          <button className="btn-ghost p-2 flex-shrink-0"><Smile className="w-5 h-5" /></button>
          <input
            className="flex-1 rounded-2xl px-4 py-2.5 text-sm outline-none"
            style={{background:'var(--cream)', border:'1px solid var(--border)', color:'var(--text-dark)'}}
            placeholder={`Type in ${LANGUAGES.find(l=>l.code===myLang)?.name}…`}
            value={inputMsg}
            onChange={handleTyping}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button className="btn-ghost p-2 flex-shrink-0"><Paperclip className="w-5 h-5" /></button>
          <button onClick={sendMessage} disabled={!inputMsg.trim()}
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
            style={{background: inputMsg.trim() ? 'var(--teal)' : 'var(--cream)', color: inputMsg.trim() ? '#fff' : 'var(--text-light)'}}>
            {inputMsg.trim() ? <Send className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
