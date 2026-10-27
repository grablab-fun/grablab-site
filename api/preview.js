/* GET /preview?k=<key>: lets a guest see the whole site while it is in maintenance.
   Sets a 30 day cookie; the maintenance redirect in vercel.json skips requests that carry it.
   /preview?off=1 clears the cookie. The key is only a share secret, not a login. */
const KEY = process.env.PREVIEW_KEY || "honest-claw-7731";

module.exports = (req, res) => {
  const q = req.query || {};
  if (q.off){
    res.setHeader("Set-Cookie", "gl_preview=; Path=/; Max-Age=0; SameSite=Lax; Secure");
    res.statusCode = 302; res.setHeader("Location", "/maintenance"); return res.end();
  }
  if (q.k !== KEY){
    res.statusCode = 302; res.setHeader("Location", "/maintenance"); return res.end();
  }
  res.setHeader("Set-Cookie", "gl_preview=1; Path=/; Max-Age=2592000; SameSite=Lax; Secure");
  res.setHeader("Cache-Control", "no-store");
  res.statusCode = 302; res.setHeader("Location", "/" + (q.to ? String(q.to).replace(/[^a-z0-9-]/gi, "") : "")); res.end();
};
