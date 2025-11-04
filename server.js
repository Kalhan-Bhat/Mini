// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");

const app = express();
app.use(cors());
app.use(express.static("public"));

const APP_ID = "e406f5072e4b40bab7ad97258614a32a";
const APP_CERTIFICATE = "6c2c3eb204554da49d048d48a5f991c5";

// Endpoint to generate temporary Agora token

app.get("/token", (req, res) => {
  const channelName = req.query.channel;
  if (!channelName) {
    return res.status(400).json({ error: "Channel name is required" });
  }

  const uid = Math.floor(Math.random() * 100000);
  const role = RtcRole.PUBLISHER;
  const expireTime = 3600;
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  res.json({ token, uid });
});

app.get("/student", (req, res) => res.sendFile(__dirname + "/public/student.html"));
app.get("/teacher", (req, res) => res.sendFile(__dirname + "/public/teacher.html"));


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// ---- WEBSOCKET EMOTION BRIDGE ----
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8081 });

wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("message", (msg) => {
    // Broadcast received emotion message to all connected clients
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg.toString());
      }
    });
  });
});
console.log("WebSocket server running on ws://localhost:8081");
