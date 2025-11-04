// student.js
let model;
let ws;




async function setupWebSocket() {
  ws = new WebSocket("ws://localhost:8081");
  ws.onopen = () => console.log("✅ Connected to WebSocket Server");
  ws.onerror = (err) => console.error("❌ WebSocket error:", err);
}

// Load model and start camera
async function initEmotionDetection() {
  try {
    // Load the TensorFlow.js model
    model = await tf.loadGraphModel("model/model.json");
    console.log("✅ Model loaded successfully!");

    // Access webcam
    const video = document.getElementById("studentVideo");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Start detecting emotions
    detectEmotion(video);
  } catch (error) {
    console.error("Error initializing emotion detection:", error);
  }
}

// Dummy emotion labels (you can change based on your model)
const emotions = ["Happy", "Sad", "Angry", "Surprised", "Neutral"];

async function detectEmotion(video) {
  const emotionLabel = document.getElementById("emotionLabel");

  setInterval(async () => {
    if (!model) return;

    // Convert video frame into tensor
    const tensor = tf.browser.fromPixels(video)
      .resizeNearestNeighbor([48, 48]) // resize to match model input
      .mean(2)                         // grayscale if needed
      .expandDims(0)
      .expandDims(-1)
      .toFloat()
      .div(255.0);

    // Run prediction
    const prediction = await model.predict(tensor);
    const emotionIndex = prediction.argMax(-1).dataSync()[0];
    const emotion = emotions[emotionIndex] || "Unknown";

    // Update UI
    emotionLabel.textContent = `Emotion: ${emotion}`;

    // Send emotion to teacher portal via WebSocket
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "emotion", emotion }));
    }

    tensor.dispose();
    prediction.dispose();
  }, 2000); // detect every 2 seconds
}

window.onload = async () => {
  await setupWebSocket();
  await initEmotionDetection();
};
