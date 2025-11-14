# Troubleshooting Guide - Emotion Detection

## Quick Diagnostics

Run these commands to verify everything is working:

### 1. Check ML Service is Running

```bash
curl http://localhost:8000/health
```

**Expected Response:**

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

### 2. Test ML Service Directly

```bash
# Create a test image (base64)
curl -X POST http://localhost:8000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"image\":\"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...\"}"
```

### 3. Check Backend is Running

```bash
curl http://localhost:3000/health
```

**Expected Response:**

```json
{
  "status": "OK",
  "timestamp": "2025-11-13T..."
}
```

### 4. Check WebSocket Connection

Open browser console (F12) when on student page and look for:

```
✅ Connected to WebSocket server
📸 Starting frame capture...
📤 Sent frame to backend
```

## Common Issues and Fixes

### Issue 1: No emotion detection happening

**Symptoms:**

- No logs showing "Received frame from student"
- No emotions appearing on dashboard

**Diagnostics:**

```bash
# Check if ML service is running
curl http://localhost:8000/health

# Check backend logs for frame receiving
# Look for: "📸 Received frame from..."
```

**Fixes:**

1. Ensure ML service is running on port 8000
2. Check `backend-node/.env` has correct `ML_SERVICE_URL=http://localhost:8000`
3. Restart backend server
4. Check browser console for video element issues

### Issue 2: Video element not found

**Symptoms:**

- Console shows "Video element not found"
- Frames not being captured

**Fix:**
The video selector was updated to: `.local-video div video`

If still not working:

1. Open browser DevTools (F12)
2. Go to Elements tab
3. Search for `.local-video` class
4. Check the actual structure of video element
5. Update selector in `StudentPage.jsx` if needed

### Issue 3: Model not loading

**Symptoms:**

- ML service shows "Model file not found"
- Using placeholder model

**Check:**

```bash
cd backend-ml
dir models
# Should show: emotion_model_traced.pt
```

**Fix:**

1. Ensure model is at: `backend-ml/models/emotion_model_traced.pt`
2. Check `backend-ml/.env` has correct path: `MODEL_PATH=./models/emotion_model_traced.pt`
3. Restart ML service

### Issue 4: Names showing as UIDs

**This has been fixed!** Changes made:

- Backend now logs with names: "👨‍🎓 Alice (ID: 2953) joined channel: kalhan"
- Teacher dashboard shows student names instead of UIDs
- All logs now include both name and ID

## Testing Emotion Detection

### Step-by-step test:

1. **Start all services:**

   ```bash
   start.bat
   ```

2. **Check ML service:**

   ```bash
   curl http://localhost:8000/health
   ```

3. **Join as student:**

   - Go to http://localhost:5173
   - Enter name: "Alice"
   - Enter channel: "test123"
   - Click "Join Class"

4. **Watch backend logs for:**

   ```
   👨‍🎓 Alice (ID: 12345) joined channel: test123
   📸 Received frame from Alice (ID: 12345)
   🎭 Detected emotion for Alice: happy (85.3%)
   ```

5. **Watch browser console for:**

   ```
   📸 Starting frame capture...
   📤 Sent frame to backend
   🎭 Received emotion: {emotion: 'happy', confidence: 0.853}
   ```

6. **Join as teacher (new browser window):**
   - Enter name: "Teacher"
   - Enter same channel: "test123"
   - Should see Alice in dashboard with emotion

## Debug Mode

### Enable detailed logging:

**Backend (server.js):**
Add after line 1:

```javascript
process.env.DEBUG = "*";
```

**ML Service (main.py):**
Change logging level:

```python
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

## Expected Data Flow

```
1. Student joins → "Alice (ID: 12345) joined"
2. Frame captured every 2s → "Starting frame capture..."
3. Frame sent to backend → "Received frame from Alice"
4. Backend forwards to ML → POST to http://localhost:8000/predict
5. ML processes → "Prediction: happy (85.3%)"
6. Backend broadcasts → "Detected emotion for Alice: happy"
7. Student receives → "Received emotion: {emotion: 'happy'}"
8. Teacher receives → Dashboard updates
```

## Verification Checklist

- [ ] ML service running (port 8000)
- [ ] Backend running (port 3000)
- [ ] Frontend running (port 5173)
- [ ] Model file exists at `backend-ml/models/emotion_model_traced.pt`
- [ ] Browser console shows "Connected to WebSocket server"
- [ ] Browser console shows "Starting frame capture..."
- [ ] Backend logs show "Received frame from [name]"
- [ ] Backend logs show "Detected emotion for [name]"
- [ ] Emotions appear in teacher dashboard

## Still Not Working?

### Check Network Tab (F12 → Network):

1. Filter by "WS" (WebSocket)
2. Should see connection to `localhost:3000`
3. Click on it → Messages tab
4. Should see frame:send messages every 2 seconds

### Check Console Errors:

Look for:

- CORS errors
- WebSocket connection refused
- 404 errors to ML service
- Video element not found

### Manual Test ML Service:

Save this as `test_ml.py` in `backend-ml/`:

```python
import requests
import base64

# Create a simple test image
with open('test_image.jpg', 'rb') as f:
    img_base64 = base64.b64encode(f.read()).decode()

response = requests.post(
    'http://localhost:8000/predict',
    json={'image': img_base64}
)

print(response.json())
```

Run: `python test_ml.py`

## Contact

If all else fails:

1. Share backend terminal output
2. Share browser console output
3. Share ML service terminal output
4. Check this file for common solutions
