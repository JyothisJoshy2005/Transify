import { useState, useRef } from 'react'
import { ScanText, Upload, X, ArrowRight, Copy, Check, Loader, Image } from 'lucide-react'
import { ocrTranslate } from '../utils/api'
import AccuracyBar from '../components/AccuracyBar'

const LANGUAGES = [
  { code: 'en',  name: 'English' },
  { code: 'hi',  name: 'Hindi' },
  { code: 'ml',  name: 'Malayalam' },
  { code: 'ta',  name: 'Tamil' },
  { code: 'de',  name: 'German' },
  { code: 'fr',  name: 'French' },
]
const OCR_LANGS = [
  { code: 'eng', name: 'English' },
  { code: 'hin', name: 'Hindi' },
  { code: 'mal', name: 'Malayalam' },
  { code: 'tam', name: 'Tamil' },
]

export default function OCR() {
  const [image, setImage]           = useState(null)
  const [preview, setPreview]       = useState('')
  const [ocrLang, setOcrLang]       = useState('eng')
  const [tgtLang, setTgtLang]       = useState('ml')
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [copied, setCopied]         = useState(false)
  const [dragging, setDragging]     = useState(false)
  const fileRef = useRef()

  const handleFile = file => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null); setError('')
  }

  const handleDrop = e => {
    e.preventDefault(); setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleProcess = async () => {
    if (!image) return
    setLoading(true); setError(''); setResult(null)
    try {
      const data = await ocrTranslate(image, tgtLang, ocrLang)
      setResult(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => { setImage(null); setPreview(''); setResult(null); setError('') }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:'var(--teal)'}}>
          <ScanText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">OCR Translator</h1>
          <p className="page-sub">Extract text from images and translate instantly</p>
        </div>
      </div>

      {/* Language controls */}
      <div className="card p-4 mb-5 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[140px]">
          <label className="section-label block mb-1.5">Image Language</label>
          <select className="select" value={ocrLang} onChange={e => setOcrLang(e.target.value)}>
            {OCR_LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-0.5">
          <ArrowRight className="w-5 h-5" style={{color:'var(--teal)'}} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="section-label block mb-1.5">Translate To</label>
          <select className="select" value={tgtLang} onChange={e => setTgtLang(e.target.value)}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upload panel */}
        <div>
          {!preview ? (
            <div
              onClick={() => fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              className="card cursor-pointer flex flex-col items-center justify-center text-center transition-all"
              style={{
                minHeight: '260px', padding: '32px',
                borderStyle: 'dashed', borderWidth: '2px',
                borderColor: dragging ? 'var(--teal)' : 'var(--border)',
                background: dragging ? 'var(--teal-pale)' : 'var(--white)',
              }}>
              <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center"
                style={{background: dragging ? 'var(--teal)' : 'var(--cream)'}}>
                <Upload className="w-6 h-6" style={{color: dragging ? '#fff' : 'var(--teal)'}} />
              </div>
              <p style={{fontWeight:700, fontSize:'15px', color:'var(--text-dark)'}}>
                {dragging ? 'Drop image here' : 'Upload Image'}
              </p>
              <p style={{fontSize:'12px', color:'var(--text-light)', marginTop:'6px'}}>
                Drag & drop or click to browse
              </p>
              <p style={{fontSize:'11px', color:'var(--text-light)', marginTop:'4px'}}>
                JPG, PNG, WEBP supported
              </p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="card overflow-hidden" style={{minHeight:'260px'}}>
              <div className="relative">
                <img src={preview} alt="Upload" className="w-full object-contain" style={{maxHeight:'220px'}} />
                <button onClick={clear}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white"
                  style={{background:'rgba(28,43,57,0.7)'}}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3 flex items-center gap-3" style={{borderTop:'1px solid var(--border)'}}>
                <Image className="w-4 h-4" style={{color:'var(--text-light)'}} />
                <span style={{fontSize:'12px', color:'var(--text-mid)'}} className="truncate flex-1">{image?.name}</span>
                <button onClick={handleProcess} disabled={loading} className="btn-primary py-2 px-4 text-sm flex-shrink-0">
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ScanText className="w-4 h-4" />}
                  {loading ? 'Processing…' : 'Extract & Translate'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Result panel */}
        <div className="card p-5" style={{background: result ? 'var(--white)' : 'var(--cream)', minHeight:'260px'}}>
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full" style={{minHeight:'220px', color:'var(--text-light)'}}>
              <ScanText className="w-10 h-10 mb-3 opacity-30" />
              <p style={{fontSize:'13px'}}>Results will appear here</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full" style={{minHeight:'220px'}}>
              <Loader className="w-8 h-8 animate-spin mb-3" style={{color:'var(--teal)'}} />
              <p style={{fontSize:'13px', color:'var(--text-light)'}}>Extracting text…</p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Extracted text */}
              <div>
                <p className="section-label mb-2">Extracted Text</p>
                <div className="p-3 rounded-xl text-sm" style={{background:'var(--cream)', color:'var(--text-dark)', lineHeight:'1.6'}}>
                  {result.extracted_text || '(No text detected)'}
                </div>
              </div>

              {/* Translated text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="section-label">Translation</p>
                  <button onClick={() => { navigator.clipboard.writeText(result.translated_text); setCopied(true); setTimeout(()=>setCopied(false),2000) }}
                    className="btn-ghost p-1 text-xs flex items-center gap-1">
                    {copied ? <Check className="w-3 h-3" style={{color:'var(--teal)'}} /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-3 rounded-xl text-sm font-medium" style={{background:'var(--teal-pale)', color:'var(--teal)', lineHeight:'1.6'}}>
                  {result.translated_text}
                </div>
              </div>

              {result.accuracy && <AccuracyBar accuracy={result.accuracy} />}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl text-sm mt-3" style={{background:'#fee2e2', color:'#b91c1c'}}>
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
