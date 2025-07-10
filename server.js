const express = require("express"); 
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express(); require("dotenv").config();

app.use(bodyParser.json());

let AI_ENABLED = true;

app.get("/dashboard", (req, res) => { res.send(<html> <head><title>Dang Bot Dashboard</title></head> <body style="font-family:sans-serif;text-align:center;padding:2em"> <h1>AI ตอบคอมเมนต์ Facebook</h1> <p>สถานะระบบ: <strong id="status">${AI_ENABLED ? "เปิด" : "ปิด"}</strong></p> <button onclick="toggle()">${AI_ENABLED ? "ปิดระบบ" : "เปิดระบบ"}</button> <script> function toggle() { fetch('/toggle', { method: 'POST' }) .then(() => location.reload()); } </script> </body> </html>); });

app.post("/toggle", (req, res) => { AI_ENABLED = !AI_ENABLED; res.sendStatus(200); });

app.post("/webhook", async (req, res) => { const body = req.body; if (body.object === "page") { for (const entry of body.entry) { const event = entry.messaging || entry.changes; if (!event) continue;

for (const change of event) {
    const comment = change.value?.message || change.value?.message || "";
    const commentId = change.value?.comment_id;
    const fromName = change.value?.from?.name;
    const postId = change.value?.post_id;

    if (comment && commentId && AI_ENABLED) {
      let reply = await generateReply(comment, fromName);
      await axios.post(`https://graph.facebook.com/v18.0/${commentId}/comments`, {
        message: reply,
        access_token: process.env.PAGE_ACCESS_TOKEN
      });
    }
  }
}

} res.sendStatus(200); });

async function generateReply(comment, name) { const isFunny = /555|ฮา|ขำ|ตลก/.test(comment); const isRude = /fuck|เหี้ย|ควย|ด่า|สัส/.test(comment);

if (isRude) return "ขออภัยในความไม่สุภาพ ทางเราจะตรวจสอบอีกครั้งนะครับ 🙏"; if (isFunny) return 555 ขำจริงครับคุณ${name ?? "เพื่อน"} 😄;

const res = await axios.post("https://api.openai.com/v1/chat/completions", { model: "gpt-4", messages: [ { role: "system", content: "ตอบคอมเมนต์เฟซบุ๊กแบบสุภาพ มีมารยาท และเป็นกันเอง ถ้ามีคำหยาบให้ตอบแบบสุภาพกลับ" }, { role: "user", content: comment } ] }, { headers: { Authorization: Bearer ${process.env.OPENAI_API_KEY} } });

return res.data.choices[0].message.content; }

app.get("/webhook", (req, res) => { const VERIFY_TOKEN = process.env.VERIFY_TOKEN; const mode = req.query["hub.mode"]; const token = req.query["hub.verify_token"]; const challenge = req.query["hub.challenge"];

if (mode === "subscribe" && token === VERIFY_TOKEN) { res.status(200).send(challenge); } else { res.sendStatus(403); } });

const PORT = process.env.PORT || 3000; app.listen(PORT, () => console.log("Dang AI Comment Bot Running at port " + PORT));

