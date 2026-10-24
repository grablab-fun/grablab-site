/* POST /api/inquiry: forwards the maintenance page inquiry to contact@grablab.fun through Resend.
   Needs RESEND_API_KEY (and a verified grablab.fun sender) in the Vercel env; without it the page falls back to mailto. */
const TO = "contact@grablab.fun";
const FROM = process.env.INQUIRY_FROM || "Grablab site <inquiry@grablab.fun>";
const clip = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(503).json({ ok: false, error: "mail not configured" });
  const b = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  if (b.company) return res.status(200).json({ ok: true });   // honeypot
  const name = clip(b.name, 80), email = clip(b.email, 120), topic = clip(b.topic, 40) || "Inquiry";
  const message = String(b.message || "").trim().slice(0, 4000);
  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ ok: false, error: "invalid" });
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: email, subject: `[${topic}] ${name}`, text: `${message}\n\n${name} <${email}>` })
  });
  if (!r.ok) return res.status(502).json({ ok: false });
  res.status(200).json({ ok: true });
};
