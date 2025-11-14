# 📂 DEPLOYMENT MAP - Which Folder Goes Where

## 🎯 Quick Reference

| Folder | Deploy To | Purpose | URL Example |
|--------|-----------|---------|-------------|
| **frontend-react/** | ✅ **Vercel** | React frontend UI | `https://your-app.vercel.app` |
| **backend-node/** | ✅ **Railway** | Node.js API + WebSocket | `https://your-backend.railway.app` |
| **backend-ml/** | ✅ **Render** | Python ML emotion detection | `https://your-ml.onrender.com` |

---

## 📋 DETAILED DEPLOYMENT INSTRUCTIONS

### 1️⃣ **frontend-react/** → Deploy to VERCEL

**Platform:** Vercel (https://vercel.com)  
**Why:** Best for React apps, free tier, automatic HTTPS, global CDN  
**Cost:** FREE

#### **Configuration:**
- **Framework Preset:** Vite
- **Root Directory:** `frontend-react`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)

#### **Environment Variables:**
```env
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
VITE_AGORA_APP_ID=your_agora_app_id
```

#### **Files in this folder:**
```
frontend-react/
├── src/                    # React source code
├── public/                 # Static assets
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Build config
└── .env                    # Environment variables (create this)
```

#### **Deployment Steps:**
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repo
4. Select `frontend-react` as Root Directory
5. Add environment variables above
6. Click "Deploy"
7. Copy your Vercel URL: `https://your-app.vercel.app`

---

### 2️⃣ **backend-node/** → Deploy to RAILWAY

**Platform:** Railway (https://railway.app)  
**Why:** Great for Node.js, WebSocket support, easy deployment  
**Cost:** $5 free credit/month, then ~$5-10/month

#### **Configuration:**
- **Root Directory:** `backend-node`
- **Build Command:** (auto-detected, runs `npm install`)
- **Start Command:** `npm start` (runs `node server.js`)

#### **Environment Variables:**
```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
ML_SERVICE_URL=https://your-ml.onrender.com
FRONTEND_URL=https://your-app.vercel.app
PORT=3000
NODE_ENV=production
```

#### **Files in this folder:**
```
backend-node/
├── server.js               # Main server file
├── package.json            # Dependencies
├── .env                    # Environment variables (don't commit!)
└── .env.example            # Template (safe to commit)
```

#### **Deployment Steps:**
1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Settings → Change Root Directory to `backend-node`
5. Add all environment variables above
   - **IMPORTANT:** Update ML_SERVICE_URL after deploying ML service
   - **IMPORTANT:** Update FRONTEND_URL after deploying frontend
6. Deploy
7. Copy your Railway URL: `https://your-backend.railway.app`

---

### 3️⃣ **backend-ml/** → Deploy to RENDER

**Platform:** Render (https://render.com)  
**Why:** Best for Python apps, handles ML dependencies well  
**Cost:** Free tier (slow) or $7/month Starter (recommended)

#### **Configuration:**
- **Environment:** Python 3
- **Root Directory:** `backend-ml`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### **Environment Variables:**
```env
PORT=8000
HOST=0.0.0.0
MODEL_PATH=./models/emotion_model_traced.pt
IMAGE_SIZE=224
EMOTION_LABELS=neutral,happy,sad,angry,surprised,fearful,disgusted
MAX_WORKERS=4
```

#### **Files in this folder:**
```
backend-ml/
├── main.py                 # FastAPI server
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (don't commit!)
├── .env.example            # Template (safe to commit)
└── models/
    └── emotion_model_traced.pt  # ML model (45MB)
```

#### **Deployment Steps:**
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend-ml`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Starter ($7/month recommended, Free tier is very slow)
5. Add environment variables above
6. Deploy
7. Copy your Render URL: `https://your-ml.onrender.com`

---

## 🔄 DEPLOYMENT ORDER (IMPORTANT!)

Deploy in this order to avoid configuration issues:

### **STEP 1: Deploy ML Service First** ⭐
Deploy `backend-ml/` to Render → Get URL

### **STEP 2: Deploy Backend Node.js** ⭐
Deploy `backend-node/` to Railway → Use ML URL from Step 1 → Get URL

### **STEP 3: Deploy Frontend** ⭐
Deploy `frontend-react/` to Vercel → Use Backend URL from Step 2 → Get URL

### **STEP 4: Update Backend CORS** ⭐
Go back to Railway → Update `FRONTEND_URL` with Vercel URL from Step 3

---

## 📦 WHAT GETS DEPLOYED FROM EACH FOLDER?

### **frontend-react/** (Vercel)
**Builds to:**
- Static HTML, CSS, JavaScript files
- Optimized and minified
- Served from CDN globally

**Does NOT include:**
- `.env` file (stays local)
- `node_modules/` (rebuilt on server)
- Source code (only built output)

---

### **backend-node/** (Railway)
**Runs:**
- Express.js server
- Socket.IO for WebSocket
- Agora token generation
- Analytics storage

**Does NOT include:**
- `.env` file (set in Railway dashboard)
- `node_modules/` (installed during build)

---

### **backend-ml/** (Render)
**Runs:**
- FastAPI server
- PyTorch ML model
- Emotion detection endpoint
- Image processing

**Includes:**
- `models/emotion_model_traced.pt` (45MB model file)
- Python dependencies from `requirements.txt`

**Does NOT include:**
- `.env` file (set in Render dashboard)
- Virtual environment

---

## 🌐 URL FLOW DIAGRAM

```
User Browser
    ↓
https://your-app.vercel.app (frontend-react/)
    ↓
    ├─→ Video Call → Agora Cloud
    ↓
    └─→ API + WebSocket
        ↓
    https://your-backend.railway.app (backend-node/)
        ↓
        ├─→ Token Generation → Agora
        ├─→ Analytics Storage
        └─→ Frame Processing
            ↓
        https://your-ml.onrender.com (backend-ml/)
            ↓
            └─→ Emotion Detection → Results
```

---

## 🚫 FOLDERS THAT DON'T GET DEPLOYED

These folders stay on your local machine:

```
❌ node_modules/          # Rebuilt on each server
❌ __pycache__/           # Python cache
❌ .git/                  # Git history
❌ dist/                  # Build output (generated on server)
❌ venv/ or env/          # Python virtual environment
```

---

## ✅ ENVIRONMENT VARIABLES SUMMARY

### **Which folder needs which variables?**

| Variable | frontend-react/ | backend-node/ | backend-ml/ |
|----------|----------------|---------------|-------------|
| `AGORA_APP_ID` | ✅ (VITE_) | ✅ | ❌ |
| `AGORA_APP_CERTIFICATE` | ❌ | ✅ | ❌ |
| `VITE_API_URL` | ✅ | ❌ | ❌ |
| `VITE_SOCKET_URL` | ✅ | ❌ | ❌ |
| `ML_SERVICE_URL` | ❌ | ✅ | ❌ |
| `FRONTEND_URL` | ❌ | ✅ | ❌ |
| `PORT` | ❌ | ✅ | ✅ |
| `HOST` | ❌ | ❌ | ✅ |
| `MODEL_PATH` | ❌ | ❌ | ✅ |

---

## 🎯 QUICK DEPLOYMENT COMMANDS

### **For local testing before deployment:**

```bash
# Terminal 1 - ML Service
cd backend-ml
python main.py

# Terminal 2 - Backend Node
cd backend-node
npm start

# Terminal 3 - Frontend
cd frontend-react
npm run dev
```

### **For Docker deployment (all at once):**

```bash
# From root folder
docker-compose up -d --build
```

---

## 🔧 FOLDER-SPECIFIC FILES TO CHECK

### **Before deploying frontend-react/:**
- ✅ `.env` created with API URLs
- ✅ `package.json` has correct scripts
- ✅ No localhost URLs in code
- ✅ Agora APP ID set

### **Before deploying backend-node/:**
- ✅ `.env` created with Agora credentials
- ✅ ML_SERVICE_URL points to Render
- ✅ FRONTEND_URL will be updated after frontend deploy
- ✅ `package.json` has start script

### **Before deploying backend-ml/:**
- ✅ `models/emotion_model_traced.pt` exists
- ✅ `requirements.txt` complete
- ✅ `.env` has MODEL_PATH
- ✅ Port set to 8000

---

## 📊 DEPLOYMENT COMPARISON

| Feature | Vercel (frontend-react/) | Railway (backend-node/) | Render (backend-ml/) |
|---------|-------------------------|------------------------|---------------------|
| **Free Tier** | ✅ Unlimited | ✅ $5 credit | ✅ Limited (slow) |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto |
| **Custom Domain** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Build Time** | 2-3 min | 3-5 min | 5-10 min |
| **Cold Start** | < 1s | < 1s | 30s-2min (free) |
| **Best For** | Static sites | APIs + WebSocket | Python ML |

---

## 🎓 REMEMBER

1. **Deploy in order:** ML → Backend → Frontend → Update CORS
2. **Each folder** is a separate deployment
3. **Environment variables** are set in each platform's dashboard
4. **Never commit** `.env` files (already in `.gitignore`)
5. **Copy URLs** from each deployment to configure the next one
6. **Test each service** individually before testing integration

---

## 📞 NEED HELP?

- Frontend issues → Check VITE_API_URL and VITE_SOCKET_URL
- Backend issues → Check ML_SERVICE_URL and FRONTEND_URL
- ML issues → Check MODEL_PATH and ensure model file uploaded
- CORS errors → Update FRONTEND_URL in backend-node

---

**🚀 Ready to deploy? Follow this map and you'll be live in ~1 hour!**

Start with **QUICK_DEPLOY.md** for detailed step-by-step instructions.
