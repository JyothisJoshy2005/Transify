import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000, // 2 min for first model download
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — log in dev
api.interceptors.request.use((config) => {
  if (import.meta.env.DEV) console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  return config
})

// Response interceptor — normalise errors
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

// ── Translation ──────────────────────────────────────
export const translateText = (text, sourceLang, targetLang, saveHistory = true) =>
  api.post('/translate', { text, source_lang: sourceLang, target_lang: targetLang, save_history: saveHistory })

export const detectLanguage = (text) =>
  api.post('/detect', { text })

export const getSupportedLanguages = () =>
  api.get('/languages')

// ── OCR ──────────────────────────────────────────────
export const ocrTranslate = (formData) =>
  api.post('/ocr-translate', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })

// ── History ──────────────────────────────────────────
export const getHistory = (limit = 50, skip = 0) =>
  api.get(`/history?limit=${limit}&skip=${skip}`)

export const deleteHistoryItem = (id) =>
  api.delete(`/history/${id}`)

export const clearAllHistory = () =>
  api.delete('/history/clear')

export const getHistoryStats = () =>
  api.get('/history/stats')

// ── Health ───────────────────────────────────────────
export const checkHealth = () =>
  api.get('/health')

export default api
