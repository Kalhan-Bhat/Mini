# 🔍 Emotion Detection Debugging Guide

## Current Status

✅ **Names are working!** - Backend shows: "👨‍🎓 jjj (ID: 61937) joined channel: kalhan"

❌ **Emotions not detecting** - No frame logs appearing in backend

## Step-by-Step Debugging

### Step 1: Test Frame Capture Independently

Open `test-frame-capture.html` in your browser:

```bash
# Just double-click the file or open it in browser
test-frame-capture.html
```

This will test if your browser can capture video frames. You should see:

- ✅ Camera starts
- ✅ Frame captured successfully
- ✅ Base64 data generated

### Step 2: Check Browser Console (Student View)

1. **Open Student Page:** http://localhost:5173/student
2. **Open Browser Console:** Press F12
3. **Enter name and channel, click Join Class**
4. **Look for these logs:**

**Expected logs:**

```
🎥 Joining channel as student...
✅ Joined successfully, UID: 61937
📡 Notified backend of join
⏱️ Waiting 3 seconds before starting frame capture...
🎬 Now attempting to start frame capture...
📸 Starting frame capture...
✅ Found video element, capturing frame...
📤 Sent frame to backend (size: 12 KB)
```

**If you see:**

- ❌ "No video track available" → Camera not working
- ❌ "Video element not found" → Video not rendering correctly
- ❌ "Video not ready yet" → Need to wait longer
- ✅ "Sent frame to backend" → Frame capture is working!

### Step 3: Check Backend Logs

**If frames are being sent, backend should show:**

```
📸 Received frame from jjj (ID: 61937), frame size: 12 KB
🔄 Forwarding frame to ML service at http://localhost:8000/predict...
✅ ML service responded successfully
🎭 Detected emotion for jjj: happy (85.3%)
📤 Sent emotion result to jjj
📡 Broadcast emotion update to teachers in channel: kalhan
```

### Step 4: Common Issues and Fixes

#### Issue A: No logs about frame capture starting

**Symptoms:** Browser console doesn't show "Starting frame capture..."

**Cause:** Frontend not rebuilt after code changes

**Fix:**

```bash
cd frontend-react
# Stop the dev server (Ctrl+C)
npm run dev
```

#### Issue B: "Video element not found"

**Symptoms:** Console shows "Video element not found"

**Diagnostic:**

1. Open browser DevTools (F12)
2. Go to Elements tab
3. Search (Ctrl+F) for "local-video"
4. Check the actual HTML structure

**Possible structures:**

```html
<!-- Option 1 -->
<div class="video-player local-video">
  <div>
    <video></video>
  </div>
</div>

<!-- Option 2 -->
<div class="video-player local-video">
  <video></video>
</div>
```

**Fix:** Update the selector in `StudentPage.jsx` line ~105 based on actual structure.

#### Issue C: Frames sent but backend not receiving

**Symptoms:** Browser shows "Sent frame to backend" but backend shows nothing

**Diagnostic:**

```bash
# Check if backend is running
curl http://localhost:3000/health
```

**Fix:**

1. Restart backend server
2. Check WebSocket connection in browser Network tab (WS filter)

#### Issue D: Backend receives frames but ML service fails

**Symptoms:** Backend shows "Received frame" but then error

**Check ML service:**

```bash
curl http://localhost:8000/health
```

**Should return:**

```json
{ "status": "healthy", "model_loaded": true, "device": "cpu" }
```

**If ML service down:**

```bash
cd backend-ml
python main.py
```

### Step 5: Manual Frame Test

Test the ML service directly with a test image:

```bash
# In backend-ml directory, create test.py
```

Create `backend-ml/test.py`:

```python
import requests
import base64

# Create a simple 224x224 white image
from PIL import Image
import io

img = Image.new('RGB', (224, 224), color='white')
buffer = io.BytesIO()
img.save(buffer, format='JPEG')
img_base64 = base64.b64encode(buffer.getvalue()).decode()

# Test the endpoint
response = requests.post(
    'http://localhost:8000/predict',
    json={'image': f'data:image/jpeg;base64,{img_base64}'}
)

print('Status:', response.status_code)
print('Response:', response.json())
```

Run:

```bash
cd backend-ml
python test.py
```

**Expected output:**

```
Status: 200
Response: {'emotion': 'neutral', 'confidence': 0.42, ...}
```

## Quick Verification Checklist

Run these checks in order:

- [ ] **Frontend rebuilt:** `cd frontend-react && npm run dev`
- [ ] **Backend running:** Check logs show "HTTP Server: http://localhost:3000"
- [ ] **ML service running:** `curl http://localhost:8000/health`
- [ ] **Student joins:** Backend shows "👨‍🎓 Name (ID: xxx) joined"
- [ ] **Browser console open:** Press F12 to see logs
- [ ] **Frame capture starts:** Console shows "📸 Starting frame capture..."
- [ ] **Video element found:** Console shows "✅ Found video element"
- [ ] **Frames sent:** Console shows "📤 Sent frame to backend"
- [ ] **Backend receives:** Backend shows "📸 Received frame from Name"
- [ ] **ML processes:** Backend shows "🎭 Detected emotion"

## What to Share for Help

If still not working, share:

1. **Browser console output** (full output after joining)
2. **Backend terminal output** (the npm start window)
3. **ML service output** (the python main.py window)
4. **Screenshot of Elements tab** showing the video player HTML structure

## Current Improvements Made

✅ **Enhanced logging** - Every step now has detailed console logs
✅ **Better error handling** - More specific error messages
✅ **Multiple selectors** - Tries different ways to find video element
✅ **Video readiness check** - Waits for video to be ready before capturing
✅ **Size logging** - Shows frame size to verify capture worked
✅ **ML service timeout** - Increased to 10 seconds
✅ **Test page** - Created standalone test for frame capture

## Next Steps

1. **Restart frontend dev server** to get new code
2. **Open browser console** (F12) when testing
3. **Share the console output** - this will tell us exactly what's happening
4. **Try the test page** - `test-frame-capture.html` to isolate the issue

The enhanced logging will now show exactly where the process stops!
