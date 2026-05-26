import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Home       from './pages/Home'
import Translator from './pages/Translator'
import OCR        from './pages/OCR'
import Chat       from './pages/Chat'
import History    from './pages/History'

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/"         element={<Home />} />
            <Route path="/translate" element={<Translator />} />
            <Route path="/ocr"       element={<OCR />} />
            <Route path="/chat"      element={<Chat />} />
            <Route path="/history"   element={<History />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
