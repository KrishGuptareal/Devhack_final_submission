# 🎓 Adaptive Academic System

> An intelligent academic planning and productivity platform for students — featuring AI-powered resume enhancement, gamified study sessions, DSA practice scheduling, and real-time academic health tracking.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **AI Resume Generator** | Create professional resumes with AI-powered text enhancement using Groq (Llama 3.3 70B) |
| 🧠 **DSA Practice Scheduler** | Daily coding practice with streak tracking, topic rotation, and contest notifications |
| 🎯 **GPA Strategizer** | Plan and optimize your academic performance with smart recommendations |
| 📚 **Flashcards** | Study with interactive flashcards organized by subject |
| 📅 **Calendar** | Track assignments, exams, and deadlines in one place |
| 🎓 **Elective Planner** | Choose electives strategically with conflict detection |
| ⏱️ **Focus Mode** | Distraction-free study sessions with XP rewards and streak tracking |
| 📊 **Academic Health Score** | Composite health metric based on streaks, completion rate, frequency, and XP |
| 🏆 **Gamification** | XP system with levels, streaks, and progress tracking |

---

## 🏗️ Architecture Highlights

- **Race-condition-safe user sync** — Atomic MongoDB upserts with E11000 duplicate key retry
- **Atomic XP & progress updates** — Uses `$inc` operations to prevent lost updates under concurrency
- **Streak tracking** — Consecutive day detection with automatic reset, longest streak tracking
- **AI integration** — Groq API with exponential backoff retry and rate limit handling
- **Optimistic UI updates** — Instant feedback with server-side rollback on failure
- **Weighted health score** — 30% streak + 30% completion + 20% frequency + 20% XP rate

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas account (or local MongoDB)
- Clerk account (for authentication)
- Groq account (for AI features — FREE)

---

## 🔑 API Keys & Environment Setup

### Backend Environment Variables

Create a `.env` file in the `backend/` folder by copying `.env.example`:

```bash
cd backend
cp .env.example .env
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `DB_NAME` | Your MongoDB database name | Choose any name, e.g., `academic_system_db` |
| `MONGODB_URI` | MongoDB connection string | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → Create Cluster → Connect → Get URI |
| `PORT` | Backend server port | Use `8000` |
| `CORS_ORIGIN` | Frontend URL | Use `*` for dev, exact URL for production |
| `CLERK_PUBLISHABLE_KEY` | Clerk public key | [Clerk Dashboard](https://dashboard.clerk.com) → Your App → API Keys |
| `CLERK_SECRET_KEY` | Clerk secret key | [Clerk Dashboard](https://dashboard.clerk.com) → Your App → API Keys |
| `GROQ_API_KEY` | Groq API key for AI | [Groq Console](https://console.groq.com) → API Keys → Create (FREE) |

### Frontend Environment Variables

Create a `.env` file in the `devhacks-frontend/` folder by copying `.env.example`:

```bash
cd devhacks-frontend
cp .env.example .env
```

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk public key (same as backend) | [Clerk Dashboard](https://dashboard.clerk.com) → Your App → API Keys |
| `VITE_BASE_URL` | Backend API URL | Use `http://localhost:8000/api/v1` for local dev |

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/DevHack-7-0/Team10.git
cd Team10
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd devhacks-frontend
npm install
```

### 4. Set up environment files

Copy the example files and fill in your API keys (see above):

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp devhacks-frontend/.env.example devhacks-frontend/.env
```

### 5. Run the application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd devhacks-frontend
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🌐 Deployment

> **Deploy order: Backend first → then Frontend** (so you have an API URL to configure the frontend with)

### Backend → Render

1. Push your code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add all backend environment variables (see table above)
6. Set `CORS_ORIGIN` to your frontend Vercel URL after deploying frontend
7. Deploy → copy the URL (e.g., `https://your-app.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Configure:
   - **Root Directory:** `devhacks-frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY` = your Clerk key
   - `VITE_BASE_URL` = `https://your-backend.onrender.com/api/v1`
5. Deploy

> ⚠️ **After deploying both:** Go back to Render and update `CORS_ORIGIN` to your exact Vercel URL (no trailing slash).

---

## 🔗 Getting Free API Keys

### Groq API (AI Enhancement - FREE)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up / Log in
3. Go to **API Keys**
4. Click **Create API Key**
5. Copy and use in `GROQ_API_KEY`

### Clerk (Authentication - FREE tier)
1. Go to [clerk.com](https://clerk.com)
2. Sign up and create an application
3. Go to **API Keys** in dashboard
4. Copy **Publishable Key** and **Secret Key**

### MongoDB Atlas (Database - FREE tier)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click **Connect** → **Connect your application**
4. Copy the connection string (replace `<password>` with your DB password)

---

## 📁 Project Structure

```
Team10/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── controllers/      # Route handlers (user, task, session, analytics, AI)
│   │   ├── models/           # MongoDB schemas (User, Task, StudySession, etc.)
│   │   ├── routes/           # RESTful API routes
│   │   ├── middlewares/      # Clerk auth & file upload (multer)
│   │   └── utils/            # XP calculator, analytics helpers, cloudinary
│   ├── .env.example          # Example environment file
│   ├── app.js                # Express app setup with CORS & routes
│   └── server.js             # Server entry point
│
├── devhacks-frontend/        # React + Vite frontend
│   ├── src/
│   │   ├── api/              # API client layer (user, task, session APIs)
│   │   ├── constants/        # DSA questions, config, Gemini enhancer
│   │   ├── context/          # React context (AppContext with global state)
│   │   ├── hooks/            # Custom hooks (useUser)
│   │   ├── App.jsx           # Routing & layout
│   │   ├── Dashboard.jsx     # Main dashboard with health meter
│   │   ├── SecondPage.jsx    # Task manager
│   │   ├── ResumeGenerator.jsx # AI-powered resume builder
│   │   └── ...               # Other page components
│   ├── .env.example          # Example environment file
│   └── vite.config.js        # Vite configuration
│
└── README.md                 # This file
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, React Router v7 |
| **Backend** | Node.js, Express 5 |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Authentication** | Clerk (SSO, JWT) |
| **AI** | Groq API (Llama 3.3 70B Versatile) |
| **File Uploads** | Multer + Cloudinary (optional) |
| **Styling** | Custom CSS with glassmorphism & dark theme |
| **Deployment** | Render (backend) + Vercel (frontend) |

---

## 👥 Team

**Team 10** — DevHack 7.0
