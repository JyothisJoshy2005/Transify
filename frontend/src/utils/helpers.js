// Language list shared across the app
export const LANGUAGES = [
  { code: 'auto', name: '🔍 Auto Detect', flag: '🔍' },
  { code: 'en',   name: '🇬🇧 English',   flag: '🇬🇧' },
  { code: 'hi',   name: '🇮🇳 Hindi',     flag: '🇮🇳' },
  { code: 'ml',   name: '🇮🇳 Malayalam', flag: '🇮🇳' },
  { code: 'ta',   name: '🇮🇳 Tamil',     flag: '🇮🇳' },
  { code: 'kn',   name: '🇮🇳 Kannada',   flag: '🇮🇳' },
  { code: 'de',   name: '🇩🇪 German',    flag: '🇩🇪' },
  { code: 'fr',   name: '🇫🇷 French',    flag: '🇫🇷' },
  { code: 'es',   name: '🇪🇸 Spanish',   flag: '🇪🇸' },
  { code: 'ar',   name: '🇸🇦 Arabic',    flag: '🇸🇦' },
  { code: 'zh',   name: '🇨🇳 Chinese',   flag: '🇨🇳' },
  { code: 'ru',   name: '🇷🇺 Russian',   flag: '🇷🇺' },
  { code: 'it',   name: '🇮🇹 Italian',   flag: '🇮🇹' },
  { code: 'pt',   name: '🇧🇷 Portuguese',flag: '🇧🇷' },
  { code: 'ko',   name: '🇰🇷 Korean',    flag: '🇰🇷' },
  { code: 'ja',   name: '🇯🇵 Japanese',  flag: '🇯🇵' },
]

export const LANGUAGES_NO_AUTO = LANGUAGES.filter(l => l.code !== 'auto')

export const getLangName = (code) =>
  LANGUAGES.find(l => l.code === code)?.name ?? code.toUpperCase()

export const getAccuracyClass = (pct) => {
  if (pct >= 85) return 'accuracy-high'
  if (pct >= 65) return 'accuracy-medium'
  return 'accuracy-low'
}

export const getAccuracyLabel = (pct) => {
  if (pct >= 85) return '✦ Excellent'
  if (pct >= 65) return '~ Good'
  return '⚠ Low'
}

export const formatTimestamp = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const truncate = (str, n = 80) =>
  str && str.length > n ? str.slice(0, n) + '…' : str
