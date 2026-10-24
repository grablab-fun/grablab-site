/* POST /api/inquiry: sends the maintenance page inquiry to contact@grablab.fun through the Namecheap Private Email mailbox (SMTP over TLS, no dependencies).
   Needs SMTP_PASS in the Vercel env (SMTP_USER defaults to contact@grablab.fun); without it the page falls back to mailto. */
const tls = require("tls");
const HOST = process.env.SMTP_HOST || "mail.privateemail.com", PORT = +(process.env.SMTP_PORT || 465);
const USER = process.env.SMTP_USER || "contact@grablab.fun", TO = process.env.INQUIRY_TO || "contact@grablab.fun";
const clip = (v, n) => String(v || "").replace(/[\r\n]+/g, " ").trim().slice(0, n);
const b64 = s => Buffer.from(s, "utf8").toString("base64");

function smtp(steps){
  return new Promise((resolve, reject) => {
    const sock = tls.connect({ host: HOST, port: PORT, servername: HOST }); let buf = "", i = -1;
    const fail = e => { sock.destroy(); reject(e instanceof Error ? e : new Error(e)); };
    sock.setTimeout(12000, () => fail("smtp timeout"));
    sock.on("error", fail);
    sock.on("data", d => {
      buf += d.toString("utf8");
      /* a reply is complete when its last line has a space after the code: "250 ok", not "250-..." */
      const lines = buf.split("\r\n"); if (lines.length < 2 || !/^\d{3} /.test(lines[lines.length - 2])) return;
      const code = +lines[lines.length - 2].slice(0, 3); buf = "";
      if (i >= 0 && code !== steps[i][1]) return fail("smtp " + code + " at step " + i);
      if (++i === steps.length){ sock.end("QUIT\r\n"); return resolve(); }
      sock.write(steps[i][0] + "\r\n");
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const pass = process.env.SMTP_PASS;
  if (!pass) return res.status(503).json({ ok: false, error: "mail not configured" });
  let b = req.body || {}; if (typeof b === "string"){ try { b = JSON.parse(b); } catch (e){ b = {}; } }
  if (b.company) return res.status(200).json({ ok: true });   // honeypot
  const name = clip(b.name, 80), email = clip(b.email, 120), topic = clip(b.topic, 40) || "Inquiry";
  const message = String(b.message || "").trim().slice(0, 4000);
  if (!name || !message || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email)) return res.status(400).json({ ok: false, error: "invalid" });
  const body = (message + "\n\n" + name + " <" + email + ">").replace(/\r?\n/g, "\r\n").replace(/^\./gm, "..");
  const data = [
    `From: Grablab site <${USER}>`, `To: <${TO}>`, `Reply-To: ${name} <${email}>`,
    `Subject: =?UTF-8?B?${b64("[" + topic + "] " + name)}?=`, `Date: ${new Date().toUTCString()}`,
    "MIME-Version: 1.0", "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit", "", body, "."
  ].join("\r\n");
  try {
    await smtp([["EHLO grablab.fun", 250], ["AUTH LOGIN", 334], [b64(USER), 334], [b64(pass), 235],
      [`MAIL FROM:<${USER}>`, 250], [`RCPT TO:<${TO}>`, 250], ["DATA", 354], [data, 250]]);
    res.status(200).json({ ok: true });
  } catch (e){
    console.error("inquiry", e.message);
    res.status(502).json({ ok: false });
  }
};
