const express = require("express");
const app = express();

app.use(express.json());

const VERIFY_TOKEN = "mwr123";

// webhook verification (Meta checks this)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    console.log("Webhook verified");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// RECEIVE MESSAGES (THIS IS THE IMPORTANT PART)
app.post("/webhook", (req, res) => {
  console.log("🔥 WEBHOOK HIT:");
  console.log(JSON.stringify(req.body, null, 2));

  // IMPORTANT: acknowledge Meta
  res.status(200).send("EVENT_RECEIVED");
});

// health check
app.get("/", (req, res) => {
  res.send("MWR Bot is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port " + PORT);
});
