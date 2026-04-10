const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// 🔑 SAME TOKEN ITO SA META
const VERIFY_TOKEN = "mwr123";

// 1. Webhook verification (Meta checks this)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// 2. Receive messages
app.post("/webhook", (req, res) => {
  console.log("New message:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

// 3. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running on port " + PORT));
