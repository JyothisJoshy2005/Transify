import { NavLink } from 'react-router-dom'
import { Globe, ScanText, MessageSquare, History, Home, Zap, X, Settings, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/chat',     label: 'Chats',      icon: MessageSquare },
  { to: '/translate',label: 'Translator', icon: Globe },
  { to: '/ocr',      label: 'OCR',        icon: ScanText },
  { to: '/history',  label: 'History',    icon: History },
  { to: '/',         label: 'Home',       icon: Home, end: true },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`sidebar transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="sidebar-logo-text">Transify AI</div>
            <div className="sidebar-logo-sub">Multilingual Platform</div>
          </div>
          <button onClick={onClose} className="ml-auto lg:hidden text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="section-label px-3 mb-3" style={{color:'rgba(255,255,255,0.3)'}}>Navigation</p>
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="nav-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer space-y-1">
          <button className="nav-link w-full">
            <Settings className="nav-icon" />
            <span>Settings</span>
          </button>
          <button className="nav-link w-full" style={{color:'rgba(232,117,64,0.7)'}}>
            <LogOut className="nav-icon" />
            <span>Logout</span>
          </button>
          <p className="text-center pt-2" style={{fontSize:'10px', color:'rgba(255,255,255,0.2)'}}>
            v1.0.0 · Free & Open Source
          </p>
        </div>
      </aside>
    </>
  )
}
