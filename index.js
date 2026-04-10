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

VERY IMPORTANT RULES:
- Always reply in SIMPLE Taglish (Filipino + English mix)
- NEVER use pure English
- NEVER use deep Tagalog or formal language
- Keep replies VERY SHORT (1–2 sentences only)
- Be natural, casual, and professional CSR tone
- Do NOT over-explain
- Focus on helping fast (orders, price, delivery)

STRICT STYLE:
- Short replies only
- 1 idea per message
- Friendly but not salesy

EXAMPLES:
User: price?
Bot: Hi 😊 anong product po?

User: do you deliver?
Bot: Yes po 😊 saan location nyo?

User: order
Bot: Sige 😊 ano pong item at ilan?
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

    let reply = response.data.choices[0].message.content;

    // 🧠 EXTRA FORCE SHORT RESPONSE
    if (reply.length > 120) {
      reply = reply.split(".")[0];
    }

    return reply;

  } catch (err) {
    console.log("AI error:", err.response?.data || err.message);
    return "Hi 😊 pasensya na may error, pakisubukan ulit.";
  }
}
