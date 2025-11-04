// --- CONFIG --- //
const APP_ID = "e406f5072e4b40bab7ad97258614a32a";
AgoraRTC.setLogLevel(0); // debug logs

let client;
let localTracks = [];
let joined = false;


// --- JOIN FUNCTION --- //
async function joinMeeting(channel) {
  if (joined) return;
  joined = true;

  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

  // Register events early
  client.on("user-published", handleUserPublished);
  client.on("user-unpublished", handleUserUnpublished);
  client.on("user-left", handleUserLeft);

  // Fetch token
  const res = await fetch(`/token?channel=${channel}`);
  const { token, uid } = await res.json();

  // Join channel
  await client.join(APP_ID, channel, token, uid);
  console.log("✅ Joined channel", channel, "as", uid);

  // Create local media
  localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

  // Add local video to grid
  addVideoPlayer(uid, "You");
  localTracks[1].play(`player-${uid}`);

  // Publish local tracks
  await client.publish(localTracks);
  console.log("📡 Published local stream");
  initEmotionDetection();


  // Subscribe to existing users *after* join completes
  const remoteUsers = client.remoteUsers;
  for (let u of remoteUsers) {
    await subscribeAndPlay(u);
  }
}

// --- EVENT HANDLERS --- //
async function handleUserPublished(user, mediaType) {
  await client.subscribe(user, mediaType);
  await subscribeAndPlay(user);
}

async function subscribeAndPlay(user) {
  addVideoPlayer(user.uid, `User ${user.uid}`);
  if (user.videoTrack) user.videoTrack.play(`player-${user.uid}`);
  if (user.audioTrack) user.audioTrack.play();
}

function handleUserUnpublished(user) {
  document.getElementById(`player-${user.uid}`)?.remove();
}

function handleUserLeft(user) {
  console.log("❌ User left", user.uid);
  document.getElementById(`player-${user.uid}`)?.remove();
}

function addVideoPlayer(uid, label) {
  if (document.getElementById(`player-${uid}`)) return;

  // Detect if it's the teacher's own video
  const isTeacher = label === "You";
  const borderColor = isTeacher ? "green" : "#4a90e2"; // 🟩 teacher / 🟦 students
  const glowColor = isTeacher ? "rgba(0, 255, 0, 0.5)" : "rgba(74, 144, 226, 0.5)";

  const html = `
    <div id="player-${uid}" style="
      width: 320px;
      height: 240px;
      margin: 10px;
      background: #000;
      border-radius: 10px;
      border: 3px solid ${borderColor};
      overflow: hidden;
      position: relative;
      box-shadow: 0 0 15px ${glowColor};
    ">
      <div style="
        position: absolute;
        bottom: 4px;
        left: 4px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      ">${label}</div>
    </div>`;
  
  document.getElementById("video-container").insertAdjacentHTML("beforeend", html);
}

// --- EMOTION DETECTION --- //
async function initEmotionDetection() {
  try {
    if (typeof tf === "undefined" || !tf?.version) {
      console.error("❌ TensorFlow.js not loaded yet.");
      return;
    }

    console.log("✅ TensorFlow.js version:", tf.version.tfjs);

    let model;
    try {
      model = await tf.loadLayersModel('model/model.json');
      console.log("✅ Model loaded successfully");
    } catch (loadErr) {
      console.warn("⚠️ Could not load model.json, using placeholder model instead.");
      model = tf.sequential();
      model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
      model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
    }

    // Just test prediction
    const result = model.predict(tf.tensor2d([[0]], [1, 1]));
    result.print();

  } catch (err) {
    console.error("Error initializing emotion detection:", err);
  }
}
