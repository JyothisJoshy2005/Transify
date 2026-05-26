import { Link } from 'react-router-dom'
import { Globe, ScanText, MessageSquare, Mic, Lock, ArrowRight, ArrowLeftRight, Copy } from 'lucide-react'

const FEATURES = [
  { icon: MessageSquare, color: 'var(--orange)', label: 'Real-time Chat Translation' },
  { icon: Mic,           color: 'var(--teal)',   label: 'Voice & Text Translation' },
  { icon: ScanText,      color: 'var(--orange)', label: 'OCR Image Translation' },
  { icon: Globe,         color: 'var(--teal)',   label: '100+ Languages Supported' },
  { icon: Lock,          color: 'var(--orange)', label: 'Private & Secure' },
]

const LANGUAGES = [
  { name: 'Hindi',    flag: '🇮🇳' },
  { name: 'Malayalam',flag: '🇮🇳' },
  { name: 'Tamil',    flag: '🇮🇳' },
  { name: 'German',   flag: '🇩🇪' },
]

export default function Home() {
  return (
    <div className="min-h-screen animate-fade-in" style={{background:'var(--cream)'}}>

      {/* ── Hero ── */}
      <div className="flex flex-col lg:flex-row min-h-[60vh]">

        {/* Left Hero Panel */}
        <div className="lg:w-72 p-8 flex flex-col justify-between"
          style={{background:'var(--navy)', minHeight:'320px'}}>
          <div>
            {/* Decorative leaf */}
            <div className="flex justify-end mb-4 opacity-30">
              <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
                <ellipse cx="40" cy="60" rx="22" ry="40" fill="#4d7a6a" transform="rotate(-20 40 60)"/>
                <ellipse cx="55" cy="50" rx="14" ry="28" fill="#5d8f7e" transform="rotate(10 55 50)"/>
                <line x1="40" y1="100" x2="40" y2="30" stroke="#3d6a5a" strokeWidth="2"/>
              </svg>
            </div>

            <h1 style={{fontFamily:"'Playfair Display', serif", fontSize:'34px', lineHeight:'1.15', color:'#fff', fontWeight:800}}>
              Speak Freely.<br />
              Understand<br />
              <span style={{color:'var(--orange)'}}>Instantly.</span>
            </h1>
            <p style={{fontSize:'13px', color:'rgba(255,255,255,0.5)', marginTop:'12px', lineHeight:'1.6'}}>
              Real-time translation for meaningful conversations across any language.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-3 mt-8">
            {FEATURES.map(({ icon: Icon, color, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{background: color === 'var(--orange)' ? 'rgba(232,117,64,0.2)' : 'rgba(77,122,106,0.2)'}}>
                  <Icon className="w-3.5 h-3.5" style={{color}} />
                </div>
                <span style={{fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:500}}>{label}</span>
              </div>
            ))}
          </div>

          {/* Language pills */}
          <div className="mt-8">
            <p style={{fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:'10px', fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase'}}>Your Languages</p>
            <div className="space-y-2">
              {LANGUAGES.slice(0,2).map(lang => (
                <div key={lang.name} className="flex items-center justify-between"
                  style={{background:'rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 12px'}}>
                  <div className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span style={{fontSize:'12px', color:'rgba(255,255,255,0.7)', fontWeight:500}}>{lang.name}</span>
                  </div>
                  <ArrowLeftRight className="w-3 h-3" style={{color:'rgba(255,255,255,0.3)'}} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Hero Content */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="max-w-lg">
            <span className="pill pill-teal text-xs mb-4 inline-flex">🚀 AI-Powered Translation</span>
            <h2 style={{fontSize:'28px', fontWeight:800, color:'var(--text-dark)', lineHeight:1.2}} className="mb-3">
              Break language barriers with{' '}
              <span style={{color:'var(--teal)'}}>AI precision</span>
            </h2>
            <p style={{color:'var(--text-mid)', fontSize:'14px', lineHeight:1.7}} className="mb-8">
              Transify uses MarianMT neural models to deliver high-accuracy translations
              across 13+ languages — fully offline after first download.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/translate" className="btn-primary">
                <Globe className="w-4 h-4" /> Start Translating
              </Link>
              <Link to="/chat" className="btn-ghost border" style={{border:'1.5px solid var(--border)'}}>
                <MessageSquare className="w-4 h-4" /> Open Chat
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-10 pt-8" style={{borderTop:'1px solid var(--border)'}}>
              {[
                { val: '13+', label: 'Languages' },
                { val: '100%', label: 'Offline' },
                { val: '85%+', label: 'Accuracy' },
                { val: 'Free', label: 'Always' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{fontSize:'22px', fontWeight:800, color:'var(--teal)'}}>{s.val}</p>
                  <p style={{fontSize:'11px', color:'var(--text-light)', fontWeight:500}}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Feature Cards ── */}
      <div className="p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl">

          {/* Text Translator Card */}
          <Link to="/translate" className="card card-orange p-5 block group hover:shadow-md transition-all animate-slide-up" style={{animationDelay:'0.1s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--orange)'}}>
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span style={{fontWeight:700, fontSize:'13px', color:'var(--text-dark)'}}>Text Translator</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{color:'var(--orange)'}} />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 p-2 rounded-lg text-xs" style={{background:'rgba(255,255,255,0.7)', color:'var(--text-mid)'}}>
                  <span style={{fontSize:'9px', color:'var(--text-light)', display:'block', marginBottom:'3px'}}>English</span>
                  Good Morning!
                </div>
                <ArrowLeftRight className="w-4 h-4 mt-4 flex-shrink-0" style={{color:'var(--orange)'}} />
                <div className="flex-1 p-2 rounded-lg text-xs" style={{background:'rgba(255,255,255,0.7)', color:'var(--teal)'}}>
                  <span style={{fontSize:'9px', color:'var(--text-light)', display:'block', marginBottom:'3px'}}>Tamil</span>
                  காலை வணக்கம்!
                </div>
              </div>
            </div>
          </Link>

          {/* Chat Card */}
          <Link to="/chat" className="card p-5 block group hover:shadow-md transition-all animate-slide-up" style={{animationDelay:'0.2s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--navy)'}}>
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span style={{fontWeight:700, fontSize:'13px', color:'var(--text-dark)'}}>Live Chat</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{color:'var(--teal)'}} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-2xl text-xs" style={{background:'#f1f5f9', color:'var(--text-dark)', maxWidth:'80%'}}>
                  नमस्ते! कैसे हो?
                  <span className="block" style={{fontSize:'9px', color:'var(--text-light)', marginTop:'2px'}}>⊙ Original</span>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="px-3 py-2 rounded-2xl text-xs text-white" style={{background:'var(--navy)', maxWidth:'80%'}}>
                  സുഖമാണോ?
                </div>
              </div>
            </div>
          </Link>

          {/* OCR Card */}
          <Link to="/ocr" className="card card-teal p-5 block group hover:shadow-md transition-all animate-slide-up" style={{animationDelay:'0.3s'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'var(--teal)'}}>
                  <ScanText className="w-4 h-4 text-white" />
                </div>
                <span style={{fontWeight:700, fontSize:'13px', color:'var(--text-dark)'}}>OCR Translator</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{color:'var(--teal)'}} />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 rounded-lg overflow-hidden flex items-center justify-center py-4 text-center" style={{background:'rgba(255,255,255,0.7)', fontSize:'11px', color:'var(--text-mid)'}}>
                <div>
                  <div style={{fontSize:'18px', fontWeight:900, color:'var(--text-dark)'}}>EXIT</div>
                  <div style={{fontSize:'14px', color:'var(--text-mid)'}}>बाहर</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{color:'var(--teal)'}} />
              <div className="flex-1 p-2 rounded-lg" style={{background:'rgba(255,255,255,0.7)'}}>
                <p style={{fontSize:'10px', color:'var(--text-light)', marginBottom:'4px'}}>Translation</p>
                <p style={{fontSize:'12px', color:'var(--text-dark)', fontWeight:600}}>EXIT</p>
                <p style={{fontSize:'12px', color:'var(--teal)', fontWeight:600}}>പുറത്ത്</p>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}
