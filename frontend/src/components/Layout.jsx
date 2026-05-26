import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="main-content">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{background:'var(--cream)', borderBottom:'1px solid var(--border)'}}>
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'var(--teal)'}}>
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="font-bold text-sm" style={{color:'var(--text-dark)'}}>Transify AI</span>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  )
}
