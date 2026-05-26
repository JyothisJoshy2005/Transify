import { useState, useRef, useCallback } from 'react'
import { ScanText, Upload, X, ImageIcon, Copy, Info, ArrowRight } from 'lucide-react'
import { ocrTranslate } from '../utils/api'
import { LANGUAGES_NO_AUTO } from '../utils/helpers'
import AccuracyBar from '../components/AccuracyBar'
import LoadingSpinner from '../components/LoadingSpinner'

const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/webp']

export default function OCR() {
  const [file, setFile]           = useState(null)
  const [preview, setPreview]     = useState(null)
  const [targetLang, setTargetLang] = useState('en')
  const [ocrLang, setOcrLang]     = useState('en')
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [dragging, setDragging]   = useState(false)
  const [copiedField, setCopiedField] = useState('')
  const inputRef = useRef()

  const loadFile = (f) => {
    if (!f || !ACCEPTED.includes(f.type)) {
      setError('Unsupported format. Please upload JPG, PNG, JPEG, BMP, or WEBP.')
      return
    }
    setFile(f)
    setError('')
    setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false)
    loadFile(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  const handleRemove = () => {
    setFile(null); setPreview(null); setResult(null); setError('')
    if (preview) URL.revokeObjectURL(preview)
  }

  const handleTranslate = async () => {
    if (!file) { setError('Please upload an image first.'); return }
    setLoading(true); setError(''); setResult(null)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('target_lang', targetLang)
      fd.append('ocr_lang', ocrLang)
      const data = await ocrTranslate(fd)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text, field) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <ScanText className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="page-title">OCR Image Translation</h1>
          <p className="page-sub">Extract text from images · Powered by Tesseract OCR</p>
        </div>
      </div>

      {/* Language selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Text Language in Image</label>
          <select className="select" value={ocrLang} onChange={e => setOcrLang(e.target.value)}>
            {LANGUAGES_NO_AUTO.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">Translate To</label>
          <select className="select" value={targetLang} onChange={e => setTargetLang(e.target.value)}>
            {LANGUAGES_NO_AUTO.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
        </div>
      </div>

      {/* Drop Zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`card p-10 border-2 border-dashed cursor-pointer text-center transition-all select-none
            ${dragging
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 scale-[1.01]'
              : 'border-slate-200 dark:border-slate-700 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={e => loadFile(e.target.files[0])}
          />
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <Upload className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {dragging ? 'Drop image here' : 'Click or drag & drop an image'}
          </p>
          <p className="text-sm text-slate-400">Supports JPG, PNG, JPEG, BMP, WEBP · Max 16MB</p>
        </div>
      ) : (
        /* Image Preview */
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{file?.name}</span>
            </div>
            <button onClick={handleRemove} className="btn-ghost p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center max-h-64">
            <img src={preview} alt="Preview" className="max-h-64 object-contain" />
          </div>
        </div>
      )}

      {/* Translate Button */}
      {file && (
        <div className="flex justify-center">
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="btn-primary px-10 py-3 text-base shadow-lg shadow-emerald-500/20"
          >
            {loading ? <LoadingSpinner size="sm" label="" /> : <ScanText className="w-4 h-4" />}
            {loading ? 'Extracting & Translating…' : 'Extract & Translate'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm animate-fade-in">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-slide-up">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Extracted Text */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Extracted Text</p>
                <button onClick={() => handleCopy(result.extracted_text, 'extracted')} className="btn-ghost text-xs py-1 px-2">
                  <Copy className="w-3.5 h-3.5" /> {copiedField === 'extracted' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-h-[80px] whitespace-pre-wrap">
                {result.extracted_text}
              </p>
              <p className="text-xs text-slate-400">{result.word_count} words extracted</p>
            </div>

            {/* Translated Text */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Translation</p>
                  <ArrowRight className="w-3 h-3 text-slate-300" />
                  <p className="text-xs font-semibold text-primary-500 uppercase tracking-widest">{result.target_lang?.toUpperCase()}</p>
                </div>
                <button onClick={() => handleCopy(result.translated_text, 'translated')} className="btn-ghost text-xs py-1 px-2">
                  <Copy className="w-3.5 h-3.5" /> {copiedField === 'translated' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed min-h-[80px] whitespace-pre-wrap">
                {result.translated_text}
              </p>
            </div>
          </div>

          {/* Accuracy */}
          <div className="card p-4 space-y-3">
            <AccuracyBar accuracy={result.accuracy} />
            <p className="text-xs text-slate-400">OCR confidence: {result.ocr_confidence?.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Tip */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-600">
        💡 For best OCR accuracy, use high-resolution images with clear, non-cursive text. Ensure Tesseract OCR is installed on your system.
      </p>
    </div>
  )
}
