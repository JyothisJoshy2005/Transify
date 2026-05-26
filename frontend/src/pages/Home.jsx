import { Link } from 'react-router-dom'
import { Globe, ScanText, MessageSquare, History, Zap, Shield, Wifi, ArrowRight } from 'lucide-react'

const FEATURES = [
  {
    icon: Globe,
    title: 'Text Translation',
    desc: 'Translate across 15+ languages instantly using offline MarianMT AI models.',
    to: '/translate',
    gradient: 'from-indigo-500 to-purple-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
  {
    icon: ScanText,
    title: 'OCR Image Translation',
    desc: 'Upload any image, extract text with Tesseract OCR, and translate it instantly.',
    to: '/ocr',
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat Translation',
    desc: 'Real-time multilingual chat — each person reads messages in their own language.',
    to: '/chat',
    gradient: 'from-orange-500 to-rose-600',
    bg: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: History,
    title: 'Translation History',
    desc: 'All translations saved locally. Search, revisit, and delete your history anytime.',
    to: '/history',
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
  },
]

const STATS = [
  { label: 'Languages', value: '15+' },
  { label: 'AI Models', value: 'MarianMT' },
  { label: 'Cost', value: 'Free' },
  { label: 'Internet', value: 'Offline' },
]

const BADGES = [
  { icon: Zap,    label: 'Offline AI' },
  { icon: Shield, label: 'Private & Secure' },
  { icon: Wifi,   label: 'Real-Time Chat' },
]

export default function Home() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-12 animate-fade-in">

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-purple-600 to-indigo-700 p-8 md:p-12 text-white shadow-2xl shadow-primary-500/30">
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-72 h-72 rounded-full bg-purple-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Zap className="w-3.5 h-3.5" /> AI-Powered · 100% Free & Open Source
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Speak Freely.<br />
            <span className="text-yellow-300">Understand Instantly.</span>
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed">
            Transify AI is a full-stack multilingual translation platform powered by
            MarianMT, Tesseract OCR, and Socket.IO — all running locally on your machine.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/translate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-primary-700 font-bold hover:bg-yellow-50 transition-colors shadow-lg">
              Start Translating <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/chat" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition-colors backdrop-blur-sm">
              Try Live Chat
            </Link>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            {BADGES.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
                <Icon className="w-3.5 h-3.5 text-yellow-300" /> {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value }) => (
          <div key={label} className="card p-5 text-center">
            <p className="text-2xl font-extrabold text-gradient">{value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
          Everything you need
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, to, gradient, bg }) => (
            <Link
              key={to}
              to={to}
              className="card p-6 group flex gap-4 items-start cursor-pointer"
            >
              <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-primary-500 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="card p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Input Your Content', desc: 'Type text, upload an image, or start a live chat session in any supported language.' },
            { step: '02', title: 'AI Processes It', desc: 'MarianMT models translate locally on your machine — no data leaves your device.' },
            { step: '03', title: 'Get Instant Results', desc: 'See translated text with an accuracy score, saved automatically to your history.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{step}</span>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
