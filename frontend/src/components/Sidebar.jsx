import { NavLink } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import {
  Home, Globe, ScanText, MessageSquare, History,
  Sun, Moon, Zap, X
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',         label: 'Home',      icon: Home },
  { to: '/translate',label: 'Translator',icon: Globe },
  { to: '/ocr',      label: 'OCR',       icon: ScanText },
  { to: '/chat',     label: 'Live Chat', icon: MessageSquare },
  { to: '/history',  label: 'History',   icon: History },
]

export default function Sidebar({ open, onClose }) {
  const { dark, toggle } = useTheme()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          w-[220px] bg-white dark:bg-dark-900
          border-r border-slate-100 dark:border-slate-800
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">Transify AI</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-0.5">Multilingual Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden btn-ghost p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom — Theme Toggle */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={toggle}
            className="nav-link w-full"
          >
            {dark
              ? <Sun  className="w-4 h-4 text-amber-400" />
              : <Moon className="w-4 h-4 text-slate-500" />
            }
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <p className="text-center text-[10px] text-slate-400 dark:text-slate-600 pb-1">
            v1.0.0 · Free & Open Source
          </p>
        </div>
      </aside>
    </>
  )
}
