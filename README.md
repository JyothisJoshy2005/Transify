# 🌐 Transify AI — Multilingual Translation Platform

> **Speak Freely. Understand Instantly.**
> A full-stack, 100% free & open-source AI-powered multilingual translation system.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20Flask%20%7C%20MarianMT%20%7C%20Tesseract-6366f1?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌍 **Text Translation** | 15+ languages using offline MarianMT AI models |
| 📷 **OCR Image Translation** | Extract & translate text from images via Tesseract |
| 💬 **Live Chat Translation** | Real-time multilingual chat with Socket.IO |
| 📜 **Translation History** | Saved to MongoDB with search, filter & delete |
| 🌙 **Dark Mode** | Toggle + localStorage persistence |
| 📊 **Accuracy Score** | Confidence percentage on every translation |

---

## 🛠️ Tech Stack

**Frontend:** React + Vite + Tailwind CSS + Socket.IO Client  
**Backend:** Python Flask + Flask-SocketIO + Flask-CORS  
**AI/NLP:** HuggingFace MarianMT + Tesseract OCR + langdetect  
**Database:** MongoDB (with in-memory fallback)  

---

## 📁 Folder Structure

```
Transify v.1/
├── frontend/              # React app (Vite)
│   ├── src/
│   │   ├── pages/         # Home, Translator, OCR, Chat, History
│   │   ├── components/    # Sidebar, Layout, AccuracyBar, Spinner
│   │   ├── context/       # ThemeContext
│   │   └── utils/         # api.js, socket.js, helpers.js
│   └── .env               # API URL config
│
├── backend/               # Flask API
│   ├── app.py             # Entry point
│   ├── routes/            # translate, ocr, history
│   ├── translation/       # MarianMT engine
│   ├── ocr/               # Tesseract wrapper
│   ├── chat/              # Socket.IO handlers
│   ├── database/          # MongoDB helpers
│   ├── models/            # Downloaded AI models (auto-created)
│   └── uploads/           # Temp image uploads (auto-created)
│
├── start_backend.bat      # One-click backend start (Windows)
├── start_frontend.bat     # One-click frontend start (Windows)
└── README.md
```

---

## 🚀 Quick Setup

### Prerequisites

1. **Python 3.10+** — [python.org](https://python.org)
2. **Node.js 18+** — [nodejs.org](https://nodejs.org)
3. **MongoDB** (optional) — [mongodb.com](https://www.mongodb.com/try/download/community) *(falls back to memory if not running)*
4. **Tesseract OCR** (for OCR feature) — [UB-Mannheim/tesseract](https://github.com/UB-Mannheim/tesseract/wiki)
   - Install to default path: `C:\Program Files\Tesseract-OCR\`
   - During install, select additional languages: Hindi, Malayalam, Tamil

---

### Step 1 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start backend
python app.py
```

Backend runs at: **http://localhost:5000**

> ⚡ **First translation** will automatically download the MarianMT model (~300MB).
> Subsequent translations work fully **offline**.

---

### Step 2 — Frontend Setup

```bash
cd frontend

# Install packages (already done if you ran npm install)
npm install

# Start dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

### Quick Start (Windows)

Double-click `start_backend.bat` and `start_frontend.bat` to launch both servers instantly.

---

## 🌍 Supported Languages

| Language   | Code | Direction |
|-----------|------|-----------|
| English   | en   | ↔ All pairs |
| Hindi     | hi   | en ↔ hi |
| Malayalam | ml   | en ↔ ml |
| Tamil     | ta   | en ↔ ta |
| German    | de   | en ↔ de |
| French    | fr   | en ↔ fr |
| Spanish   | es   | en ↔ es |
| Arabic    | ar   | en ↔ ar |
| Chinese   | zh   | en ↔ zh |
| Russian   | ru   | en ↔ ru |
| Italian   | it   | en ↔ it |
| Korean    | ko   | en ↔ ko |

> Unsupported direct pairs automatically route through English as a pivot language.

---

## 📡 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/translate` | POST | Text translation |
| `/api/detect` | POST | Language detection |
| `/api/languages` | GET | Supported languages |
| `/api/ocr-translate` | POST | Image OCR + translation |
| `/api/history` | GET | Get history (paginated) |
| `/api/history/<id>` | DELETE | Delete one item |
| `/api/history/clear` | DELETE | Clear all history |
| `/api/health` | GET | Health check |

---

## 🔌 Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client→Server | Join chat room |
| `set_user_info` | Client→Server | Set name & language |
| `chat_message` | Client→Server | Send message |
| `typing` | Client→Server | Typing indicator |
| `receive_message` | Server→Client | Translated message |
| `user_count` | Server→Client | Online user count |
| `user_typing` | Server→Client | Typing notification |

---

## ⚙️ Configuration

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

**Backend** — Edit `backend/translation/translator.py` to add more language pairs.

---

## 🧠 How AI Translation Works

1. **MarianMT** — Helsinki-NLP transformer models, downloaded once from HuggingFace Hub
2. **Stored** in `backend/models/<src>-<tgt>/` for offline use
3. **Accuracy** — computed from model output softmax probabilities (60–99% range)
4. **Pivot** — unsupported pairs route through English automatically

---

## 📝 License

MIT License — Free to use, modify, and distribute.

---

*Built with ❤️ using 100% free & open-source tools.*
