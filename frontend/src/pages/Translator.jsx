import { useState } from 'react'
import { ArrowLeftRight, Copy, Check, Globe, Loader, Trash2, ChevronDown } from 'lucide-react'
import { translateText, detectLanguage } from '../utils/api'
import { getLangName, getAccuracyClass } from '../utils/helpers'
import AccuracyBar from '../components/AccuracyBar'

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en',   name: 'English' },
  { code: 'hi',   name: 'Hindi' },
  { code: 'ml',   name: 'Malayalam' },
  { code: 'ta',   name: 'Tamil' },
  { code: 'de',   name: 'German' },
  { code: 'fr',   name: 'French' },
  { code: 'es',   name: 'Spanish' },
  { code: 'ar',   name: 'Arabic' },
  { code: 'zh',   name: 'Chinese' },
  { code: 'ru',   name: 'Russian' },
  { code: 'it',   name: 'Italian' },
  { code: 'ko',   name: 'Korean' },
  { code: 'pt',   name: 'Portuguese' },
]

export default function Translator() {
  const [srcLang, setSrcLang] = useState('auto')
  const [tgtLang, setTgtLang] = useState('hi')
  const [inputText, setInputText]       = useState('')
  const [translated, setTranslated]     = useState('')
  const [accuracy, setAccuracy]         = useState(null)
  const [modelUsed, setModelUsed]       = useState('')
  const [detectedLang, setDetectedLang] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [copied, setCopied]             = useState(false)

  const swapLangs = () => {
    if (srcLang === 'auto') return
    setSrcLang(tgtLang)
    setTgtLang(srcLang)
    setInputText(translated)
    setTranslated('')
    setAccuracy(null)
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) return
    setLoading(true); setError(''); setTranslated(''); setAccuracy(null)
    try {
      const data = await translateText(inputText, srcLang, tgtLang, true)
      setTranslated(data.translated_text)
      setAccuracy(data.accuracy)
      setModelUsed(data.model_used || '')
      setDetectedLang(data.detected_lang)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!translated) return
    navigator.clipboard.writeText(translated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--teal)'}}>
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">Text Translator</h1>
          <p className="page-sub">Powered by MarianMT · Offline capable</p>
        </div>
      </div>

      {/* Language selector bar */}
      <div className="card p-3 mb-4 flex items-center gap-3">
        <select className="select flex-1" value={srcLang} onChange={e => setSrcLang(e.target.value)}>
          {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>

        <button onClick={swapLangs} disabled={srcLang === 'auto'}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          style={{background: srcLang === 'auto' ? 'var(--cream)' : 'var(--teal)', color: srcLang === 'auto' ? 'var(--text-light)' : '#fff'}}>
          <ArrowLeftRight className="w-4 h-4" />
        </button>

        <select className="select flex-1" value={tgtLang} onChange={e => setTgtLang(e.target.value)}>
          {LANGUAGES.filter(l => l.code !== 'auto').map(l => (
            <option key={l.code} value={l.code}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Translation panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Input */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">
              {srcLang === 'auto' ? (detectedLang ? `Detected: ${getLangName(detectedLang)}` : 'Auto Detect') : getLangName(srcLang)}
            </span>
            {inputText && (
              <button onClick={() => { setInputText(''); setTranslated(''); setAccuracy(null) }}
                className="btn-ghost p-1 text-xs flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
          <textarea
            className="textarea"
            placeholder="Type or paste text here…"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.ctrlKey && e.key === 'Enter' && handleTranslate()}
            style={{minHeight:'160px', border:'none', padding:'4px 0', boxShadow:'none', resize:'none'}}
          />
          <div className="flex items-center justify-between mt-2 pt-2" style={{borderTop:'1px solid var(--border)'}}>
            <span style={{fontSize:'12px', color:'var(--text-light)'}}>{inputText.length} chars · Ctrl+Enter</span>
            <button onClick={handleTranslate} disabled={!inputText.trim() || loading}
              className="btn-primary py-2 px-4 text-sm">
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              {loading ? 'Translating…' : 'Translate'}
            </button>
          </div>
        </div>

        {/* Output */}
        <div className="card p-4" style={{background: translated ? 'var(--white)' : 'var(--cream)'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="section-label">{getLangName(tgtLang)}</span>
            {translated && (
              <button onClick={handleCopy} className="btn-ghost p-1 text-xs flex items-center gap-1">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          <div style={{minHeight:'160px', fontSize:'14px', lineHeight:'1.7',
            color: translated ? 'var(--text-dark)' : 'var(--text-light)',
            padding:'4px 0'}}>
            {loading ? (
              <div className="flex items-center gap-2 mt-6" style={{color:'var(--text-light)'}}>
                <Loader className="w-4 h-4 animate-spin" style={{color:'var(--teal)'}} />
                <span>Translating…</span>
              </div>
            ) : translated || 'Translation will appear here…'}
          </div>

          {accuracy && (
            <div className="mt-2 pt-2" style={{borderTop:'1px solid var(--border)'}}>
              <AccuracyBar accuracy={accuracy} />
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-xl text-sm" style={{background:'#fee2e2', color:'#b91c1c'}}>
          ⚠️ {error}
        </div>
      )}

      {/* Model info */}
      {modelUsed && (
        <p className="mt-3 text-center" style={{fontSize:'11px', color:'var(--text-light)'}}>
          Model: {modelUsed}
        </p>
      )}
    </div>
  )
}
