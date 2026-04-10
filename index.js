const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const VERIFY_TOKEN = "mwr123";
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// =========================
// WEBHOOK VERIFICATION
// =========================
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

// =========================
// SEND MESSAGE FUNCTION
// =========================
async function sendMessage(senderId, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages`,
      {
        recipient: { id: senderId },
        message: { text }
      },
      {
        params: {
          access_token: PAGE_ACCESS_TOKEN
        }
      }
    );
  } catch (err) {
    console.log("Send error:", err.response?.data || err.message);
  }
}

// =========================
// AI FUNCTION (GROQ)
// =========================
async function getAIResponse(userText) {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `
You are a customer service representative for MWR Frozen Supply in the Philippines.

Personality:
- Simple, clear Taglish
- Professional but friendly
- Not too salesy
- Helpful CSR tone

Goal:
Help customers with orders and inquiries.
Keep answers short (1–3 sentences).
            `
          },
          {
            role: "user",
            content: userText
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (err) {
    console.log("AI error:", err.response?.data || err.message);
    return "Sorry 😊 may error po. Please try again.";
  }
}

// =========================
// RECEIVE MESSAGES
// =========================
app.post("/webhook", (req, res) => {
  console.log("🔥 WEBHOOK HIT:");
  console.log(JSON.stringify(req.body, null, 2));

  if (req.body.object === "page") {
    req.body.entry.forEach(async (entry) => {
      const event = entry.messaging[0];

      if (event.message && event.message.text) {
        const text = event.message.text.toLowerCase();
        const senderId = event.sender.id;

        let reply = "";

        // 🟡 RULE BOT FIRST (BUSINESS FLOW)
        if (text.includes("hello") || text.includes("hi")) {
          reply = "Hi 😊 Welcome to MWR Frozen Supply! Ano pong kailangan nyo?";
        }
        else if (text.includes("price")) {
          reply = "Ano pong product ang gusto nyo ng price?";
        }
        else if (text.includes("order")) {
          reply = "Sige 😊 Ano pong item at ilang packs po?";
        }
        else if (text.includes("hotdog")) {
          reply = "Hotdog available 😊 Ilang packs po ang kailangan nyo?";
        }

        // 🟢 AI FALLBACK
        else {
          reply = await getAIResponse(text);
        }

        console.log("🤖 REPLY:", reply);

        await sendMessage(senderId, reply);
      }
    });
  }

  res.status(200).send("EVENT_RECEIVED");
});

// =========================
// HEALTH CHECK
// =========================
app.get("/", (req, res) => {
  res.send("MWR Bot is running");
});

// =========================
// START SERVER
// =========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot running on port " + PORT);
});
