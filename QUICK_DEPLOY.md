# 🚀 QUICK DEPLOYMENT GUIDE

## 🎯 Choose Your Deployment Method

### **Method 1: Cloud Platforms (Recommended for Beginners)**

Best for: Students, quick deployment, no server management
Cost: Free tier available
Time: 30-60 minutes

### **Method 2: Docker on VPS/Cloud**

Best for: Full control, better performance, production use
Cost: $5-20/month for VPS
Time: 1-2 hours

---

## ⚡ METHOD 1: Cloud Platforms (Easiest)

### **What You'll Need:**

1. GitHub account (free)
2. Agora account (free) - https://console.agora.io/
3. Vercel account (free) - https://vercel.com
4. Railway account (free tier) - https://railway.app
5. Render account (free tier) - https://render.com

### **Step-by-Step:**

#### **1️⃣ Get Agora Credentials (5 minutes)**

1. Go to https://console.agora.io/
2. Sign up / Log in
3. Create a new project
4. Enable "APP Certificate"
5. Copy your APP ID and APP CERTIFICATE
   - Keep these safe! You'll need them multiple times

#### **2️⃣ Push to GitHub (5 minutes)**

```bash
cd student-engagement-portal
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### **3️⃣ Deploy Backend ML (15 minutes)**

**Go to Render.com:**

1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Settings:

   - **Name**: `student-engagement-ml`
   - **Root Directory**: `backend-ml`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free (for testing) or Starter ($7/month recommended)

4. Add Environment Variables:

   ```
   PORT=8000
   HOST=0.0.0.0
   MODEL_PATH=./models/emotion_model_traced.pt
   ```

5. Click "Create Web Service"
6. Wait for deployment (5-10 minutes)
7. **Copy the URL** (e.g., `https://student-engagement-ml.onrender.com`)

#### **4️⃣ Deploy Backend Node.js (10 minutes)**

**Go to Railway.app:**

1. Click "New Project" → "Deploy from GitHub repo"
2. Select your repository
3. Click "Add variables"
4. Add these environment variables:

   ```
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_certificate
   PORT=3000
   ML_SERVICE_URL=https://student-engagement-ml.onrender.com
   FRONTEND_URL=https://your-app.vercel.app
   NODE_ENV=production
   ```

   ⚠️ Replace ML_SERVICE_URL with YOUR Render URL from step 3
   ⚠️ We'll update FRONTEND_URL in step 6

5. Settings:

   - **Root Directory**: `backend-node`
   - **Build Command**: (leave empty, auto-detected)
   - **Start Command**: `npm start`

6. Deploy and wait (3-5 minutes)
7. **Copy the URL** (e.g., `https://student-engagement-backend.up.railway.app`)

#### **5️⃣ Deploy Frontend (10 minutes)**

**Go to Vercel.com:**

1. Click "Add New" → "Project"
2. Import your GitHub repository
3. Settings:

   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-react`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:

   ```
   VITE_API_URL=https://student-engagement-backend.up.railway.app
   VITE_SOCKET_URL=https://student-engagement-backend.up.railway.app
   VITE_AGORA_APP_ID=your_agora_app_id
   ```

   ⚠️ Replace with YOUR Railway URL from step 4

5. Click "Deploy"
6. Wait for deployment (2-3 minutes)
7. **Copy the URL** (e.g., `https://student-engagement.vercel.app`)

#### **6️⃣ Update Backend CORS (5 minutes)**

**Go back to Railway:**

1. Open your backend-node service
2. Go to "Variables"
3. Update `FRONTEND_URL` with your Vercel URL from step 5
   ```
   FRONTEND_URL=https://student-engagement.vercel.app
   ```
4. Save (service will auto-redeploy)

#### **7️⃣ Test Everything (10 minutes)**

1. **Test ML Service:**

   - Open: `https://student-engagement-ml.onrender.com/health`
   - Should show: `{"status":"healthy","model_loaded":true}`

2. **Test Backend:**

   - Open: `https://student-engagement-backend.up.railway.app/health`
   - Should show: `{"status":"ok",...}`

3. **Test Frontend:**

   - Open: `https://student-engagement.vercel.app`
   - Click "Join as Student"
   - Enter name and channel
   - Allow camera access
   - Verify video shows

4. **Test Full Flow:**
   - Open frontend in two different browsers/devices
   - One joins as student
   - Other joins as teacher (same channel name)
   - Teacher should see student video
   - Check emotion detection working

---

## 🐳 METHOD 2: Docker Deployment

### **Prerequisites:**

- VPS/Cloud server (AWS EC2, DigitalOcean, Linode, etc.)
- Domain name (optional but recommended)
- SSH access to server

### **Step-by-Step:**

#### **1️⃣ Server Setup**

```bash
# Connect to your server
ssh user@your-server-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### **2️⃣ Clone Repository**

```bash
# Clone your repository
git clone YOUR_GITHUB_REPO_URL
cd student-engagement-portal
```

#### **3️⃣ Configure Environment**

```bash
# Copy and edit environment file
cp .env.docker .env
nano .env

# Add your Agora credentials and update URLs
# Save with Ctrl+X, then Y, then Enter
```

#### **4️⃣ Build and Deploy**

```bash
# Build and start all services
docker-compose up -d --build

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f
```

#### **5️⃣ Setup Nginx (Optional - for HTTPS)**

```bash
# Install nginx and certbot
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y

# Configure nginx
sudo nano /etc/nginx/sites-available/engagement-portal
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/engagement-portal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

#### **6️⃣ Firewall Configuration**

```bash
# Allow necessary ports
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

---

## ✅ POST-DEPLOYMENT CHECKLIST

### **Verify Everything Works:**

- [ ] ML Service health endpoint accessible
- [ ] Backend health endpoint accessible
- [ ] Frontend loads without errors
- [ ] Can join as student with camera
- [ ] Can join as teacher
- [ ] Teacher sees student video
- [ ] Emotions are being detected
- [ ] Analytics dashboard shows data
- [ ] Can start/end topics
- [ ] Can generate PDF reports
- [ ] WebSocket connections stable
- [ ] No CORS errors in console

### **Security Checks:**

- [ ] SSL/HTTPS enabled
- [ ] Environment variables not exposed
- [ ] CORS configured correctly
- [ ] Rate limiting enabled (optional)
- [ ] Firewall rules set
- [ ] Default passwords changed

### **Performance Checks:**

- [ ] Page load time < 3 seconds
- [ ] Video latency < 500ms
- [ ] Emotion detection < 2 seconds
- [ ] WebSocket reconnection works
- [ ] Multiple students can join

---

## 🆘 TROUBLESHOOTING

### **"WebSocket connection failed"**

- Check CORS settings in backend
- Verify `FRONTEND_URL` matches actual frontend URL
- Ensure WebSocket port is open

### **"Agora token error"**

- Verify APP ID and CERTIFICATE are correct
- Check token generation endpoint works
- Ensure APP ID matches in frontend and backend

### **"Emotion not detecting"**

- Check ML service health endpoint
- Verify `ML_SERVICE_URL` in backend is correct
- Check ML service logs: `docker-compose logs backend-ml`
- Ensure model file exists

### **"CORS errors"**

- Update `FRONTEND_URL` in backend
- Check URL includes protocol (https://)
- Verify no trailing slashes

### **"High latency / slow detection"**

- Upgrade ML service instance (not free tier)
- Check server resources
- Consider GPU-enabled hosting
- Reduce frame capture frequency

---

## 💰 COST BREAKDOWN

### **Cloud Platforms (Method 1):**

- **Free Tier**: $0/month

  - Vercel: Free
  - Railway: $5 free credit/month
  - Render: Free (limited)
  - **Limitations**: Slower ML inference, may sleep after inactivity

- **Production Tier**: ~$15-25/month
  - Vercel: Free
  - Railway: $5-10/month
  - Render Starter: $7-15/month
  - **Benefits**: Always on, better performance

### **VPS Docker (Method 2):**

- **Basic VPS**: $5-10/month (DigitalOcean, Linode, Vultr)
  - 2GB RAM, 1 vCPU
  - Good for 5-10 concurrent users
- **Better Performance**: $20-40/month
  - 4GB RAM, 2 vCPU
  - Good for 20-50 users
- **GPU Enabled**: $50-200/month
  - For real-time ML with many users

---

## 📞 GETTING HELP

- **Check logs**: Most issues show up in service logs
- **Test endpoints**: Use `/health` endpoints to diagnose
- **Browser console**: Check for JavaScript errors
- **Network tab**: Verify API calls are reaching backend

---

## 🎉 SUCCESS!

Your Student Engagement Portal is now deployed and accessible from anywhere!

**Share your URLs with students and teachers:**

- Student/Teacher Portal: `https://your-app.vercel.app`
- Use the same channel name to join the same session
- Camera permissions required for students

**Next Steps:**

- Monitor usage and performance
- Set up analytics tracking
- Add more features
- Scale resources as needed
