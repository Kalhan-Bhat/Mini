# 🚀 DEPLOYMENT GUIDE
# Student Engagement Portal - Production Deployment

## 📋 Prerequisites

1. **Agora Account**: Sign up at https://console.agora.io/
   - Create a project
   - Get APP ID and APP CERTIFICATE
   - Enable video calling service

2. **Domain/Hosting Requirements**:
   - Frontend: Static hosting (Vercel, Netlify, etc.)
   - Backend Node.js: Server hosting (Heroku, Railway, Render, AWS, etc.)
   - Backend ML (Python): Server with GPU support recommended (Render, AWS EC2, etc.)

## 🔧 Recommended Deployment Architecture

### **Option 1: All-in-One Platform (Easiest)**
**Platform**: Railway or Render
- Deploy all 3 services on one platform
- Automatic HTTPS
- Easy environment variable management

### **Option 2: Distributed (Best Performance)**
- **Frontend**: Vercel or Netlify (Free tier available)
- **Backend Node**: Railway or Render (Free tier available)
- **Backend ML**: Render or AWS (Needs compute resources)

---

## 🌐 DEPLOYMENT STEPS

### **STEP 1: Prepare Environment Variables**

#### **Backend Node.js** (.env)
```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_certificate
PORT=3000
ML_SERVICE_URL=http://localhost:8000  # Update with ML service URL
FRONTEND_URL=https://your-frontend.vercel.app
NODE_ENV=production
```

#### **Backend ML** (.env)
```env
PORT=8000
HOST=0.0.0.0
MODEL_PATH=./models/emotion_model_traced.pt
IMAGE_SIZE=224
EMOTION_LABELS=neutral,happy,sad,angry,surprised,fearful,disgusted
MAX_WORKERS=4
```

#### **Frontend React** (.env.production)
```env
VITE_API_URL=https://your-backend.railway.app
VITE_SOCKET_URL=https://your-backend.railway.app
VITE_AGORA_APP_ID=your_agora_app_id
```

---

## 📦 PLATFORM-SPECIFIC INSTRUCTIONS

### **A. Deploy Backend Node.js (Railway)**

1. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   ```

2. **Via Web Dashboard**:
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - **Root Directory**: `backend-node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - Add environment variables in Settings → Variables
   
3. **Get the URL**: Copy your service URL (e.g., `https://your-app.railway.app`)

---

### **B. Deploy Backend ML (Render)**

1. **Via Web Dashboard**:
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repo
   - **Root Directory**: `backend-ml`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables
   - **Important**: Choose "Standard" or higher plan (Free tier may be too slow)

2. **Get the URL**: Copy service URL (e.g., `https://your-ml-service.onrender.com`)

3. **Update Backend Node.js**: Update `ML_SERVICE_URL` environment variable with this URL

---

### **C. Deploy Frontend (Vercel)**

1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Via Web Dashboard**:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - Add environment variables:
     - `VITE_API_URL`: Your backend Node.js URL
     - `VITE_SOCKET_URL`: Your backend Node.js URL
     - `VITE_AGORA_APP_ID`: Your Agora App ID

3. **Deploy**: Click "Deploy"

4. **Get the URL**: Copy your frontend URL (e.g., `https://your-app.vercel.app`)

5. **Update Backend CORS**: Update `FRONTEND_URL` in backend Node.js environment variables

---

## ⚙️ Alternative: Deploy with Docker (Self-Hosted)

### **Build and Run with Docker Compose**:

```bash
# Make sure docker-compose.yml is configured
docker-compose up -d --build
```

### **For VPS/Cloud Server**:
1. Install Docker and Docker Compose
2. Clone repository
3. Create `.env` files for each service
4. Run: `docker-compose up -d`
5. Setup nginx as reverse proxy for HTTPS

---

## 🔐 CRITICAL SECURITY STEPS

### **1. Environment Variables**
- ✅ NEVER commit `.env` files to GitHub
- ✅ Use `.env.example` as templates
- ✅ Store secrets in platform's environment variable manager

### **2. CORS Configuration**
- ✅ Update `FRONTEND_URL` in backend to your actual frontend URL
- ✅ Remove `http://localhost:*` from CORS in production

### **3. Agora Security**
- ✅ Enable token authentication (already implemented)
- ✅ Set token expiration time (24 hours recommended)
- ✅ Never expose APP CERTIFICATE in frontend

### **4. Rate Limiting** (Recommended)
Add to `backend-node/server.js`:
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

---

## 🧪 TESTING DEPLOYMENT

### **1. Test ML Service**:
```bash
curl https://your-ml-service.onrender.com/health
# Should return: {"status":"healthy","model_loaded":true}
```

### **2. Test Backend Node.js**:
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"ok"}
```

### **3. Test Frontend**:
- Open your frontend URL
- Join as student
- Check video and emotion detection
- Open teacher dashboard in another tab/browser
- Verify real-time updates

---

## 📊 MONITORING & MAINTENANCE

### **Performance Tips**:
1. **ML Service**: Use server with at least 2GB RAM, GPU optional but recommended
2. **Backend Node**: Use server with at least 512MB RAM
3. **Frontend**: CDN automatically handles by Vercel/Netlify

### **Logging**:
- Backend logs available in Railway/Render dashboard
- Monitor WebSocket connections
- Track ML inference times

### **Scaling**:
- **Horizontal**: Deploy multiple ML service instances, use load balancer
- **Vertical**: Upgrade server specs for ML service
- **Database**: Add Redis for session management (currently in-memory)

---

## 🚨 TROUBLESHOOTING

### **Issue: WebSocket Connection Failed**
- ✅ Ensure backend allows WebSocket connections
- ✅ Check CORS settings include frontend URL
- ✅ Verify `VITE_SOCKET_URL` in frontend matches backend URL

### **Issue: Video Not Showing**
- ✅ Check Agora APP ID matches in frontend and backend
- ✅ Verify token generation endpoint is accessible
- ✅ Check browser console for errors

### **Issue: Emotions Not Detecting**
- ✅ Verify ML service is running: `curl /health`
- ✅ Check `ML_SERVICE_URL` in backend points to ML service
- ✅ Ensure model file exists at specified path
- ✅ Check ML service logs for errors

### **Issue: CORS Errors**
- ✅ Update `FRONTEND_URL` in backend to match actual frontend URL
- ✅ Ensure URL includes protocol (https://)
- ✅ Check for trailing slashes

---

## 💰 COST ESTIMATES

### **Free Tier (for testing)**:
- Vercel: Free (frontend)
- Railway: $5/month free credit (backend Node)
- Render: Free tier limited (ML service, may be slow)
- **Total**: ~$0-5/month

### **Production Tier**:
- Vercel: Free (frontend)
- Railway: ~$5-10/month (backend Node)
- Render Standard: ~$7-25/month (ML service with better performance)
- **Total**: ~$12-35/month

### **High Performance**:
- AWS EC2 with GPU: ~$50-200/month
- Load balancer: ~$20/month
- **Total**: ~$70-220/month

---

## 📞 SUPPORT & RESOURCES

- **Agora Docs**: https://docs.agora.io/
- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

## ✅ DEPLOYMENT CHECKLIST

- [ ] Agora account created and credentials obtained
- [ ] All `.env` files configured with production values
- [ ] Backend ML service deployed and health check passing
- [ ] Backend Node.js deployed and health check passing
- [ ] Frontend deployed with correct API URLs
- [ ] CORS configured with production frontend URL
- [ ] WebSocket connections working
- [ ] Video calling tested between two devices
- [ ] Emotion detection verified
- [ ] Teacher dashboard tested
- [ ] Analytics and reports working
- [ ] SSL/HTTPS enabled on all services
- [ ] Environment variables secured
- [ ] Error logging configured

---

**🎉 Once all steps are complete, your Student Engagement Portal will be live and accessible from anywhere!**
