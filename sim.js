/* ============ SIMULATOR : pick a sponsored drop, pay (simulated), claim, drive the claw for 30 s, win ============
   Everything here is a demo: no wallet is touched, nothing is signed or sent. Open with #simulate or any [data-sim]. */
(function(){
  const PROJECTS = [
    { id:"rover",    name:"Rover Labs",  tk:"$ROVR", c:"#13a3b3", logo:"assets/proj3d/rover.webp",    tags:"Delivery robots", gold:2500,  violet:12000, rare:"Rover Genesis pass", left:148, cap:240, price:5, chain:"solana", status:"live" },
    { id:"kinetic",  name:"Kinetic Arm", tk:"$KNTC", c:"#fd730a", logo:"assets/proj3d/kinetic.webp",  tags:"Industrial arms", gold:1800,  violet:9000,  rare:"Kinetic Founder NFT", left:201, cap:300, price:4, chain:"solana", status:"live" },
    { id:"orbit",    name:"Orbit Drone", tk:"$ORBT", c:"#6847fd", logo:"assets/proj3d/orbit.webp",    tags:"Drone mapping",   gold:3000,  violet:15000, rare:"Orbit Pilot badge",   left:57,  cap:180, price:6, chain:"solana", status:"hot" },
    { id:"lumen",    name:"Lumen Hand",  tk:"$LUMN", c:"#fc5267", logo:"assets/proj3d/lumen.webp",    tags:"Humanoid hands",  gold:1200,  violet:6000,  rare:"Lumen Glove NFT",     left:233, cap:240, price:5, chain:"solana", status:"live" },
    { id:"fieldbot", name:"Fieldbot",    tk:"$FLDB", c:"#f7c842", logo:"assets/proj3d/fieldbot.webp", tags:"Agritech DePIN",  gold:5000,  violet:20000, rare:"Fieldbot Seed pass",  left:96,  cap:120, price:3, chain:"solana", status:"new" },
    { id:"pallet",   name:"Pallet Bots", tk:"$PLT",  c:"#bff339", logo:"assets/proj3d/pallet.webp",   tags:"Warehouse",       gold:4000,  violet:18000, rare:"Pallet Ops NFT",      left:180, cap:200, price:5, chain:"solana", status:"live" }
  ];
  const QICON = {
    x:'<svg viewBox="0 0 24 24"><path d="M3 3l7.5 9.5L3.5 21H6l5.5-6.3L16 21h5l-7.9-10 7-8h-2.5l-5 5.7L8 3z" fill="currentColor" stroke="none"/></svg>',
    chat:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-4 3.5V16H4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>',
    link:'<svg viewBox="0 0 24 24"><path d="M9 15l6-6"/><path d="M10.5 6.5l1.4-1.4a4 4 0 015.7 5.7L16 12.4"/><path d="M13.5 17.5l-1.4 1.4a4 4 0 01-5.7-5.7L8 11.6"/></svg>',
    coin:'<svg viewBox="0 0 24 24"><ellipse cx="12" cy="7" rx="7" ry="3.3"/><path d="M5 7v6c0 1.8 3.1 3.3 7 3.3s7-1.5 7-3.3V7"/><path d="M5 11.5c0 1.8 3.1 3.3 7 3.3s7-1.5 7-3.3"/></svg>'
  };
  const QIMG = { x:"q-follow", chat:"q-community", link:"q-invite", coin:"q-hold" };
  const QUESTS = [
    { k:"x",    title:"Follow Grablab on X", desc:"The fastest way to hear when a machine goes live.", reward:"+1 play", cta:"Follow" },
    { k:"chat", title:"Join the Discord", desc:"Get pinged the moment a drop opens near you.", reward:"+1 play", cta:"Join" },
    { k:"link", title:"Bring a friend", desc:"They grab their first capsule, you both earn a play.", reward:"+3 plays", cta:"Get link" },
    { k:"coin", title:"Hold a sponsor token", desc:"Hold $ROVR or $KNTC through the night to qualify.", reward:"+2 plays", cta:"Check" }
  ];
  const UPCOMING = [
    { id:"atlas",  name:"Atlas Rigs",   tk:"$ATLS", c:"#3b7bff", logo:"assets/proj3d/rover.webp", hue:28,   tags:"Heavy robotics", day:-1, h:20, cap:200 },
    { id:"nimbus", name:"Nimbus Fleet", tk:"$NMBS", c:"#13a3b3", logo:"assets/proj3d/orbit.webp", hue:-75,  tags:"Sky logistics",  day:5,  h:18, cap:180 },
    { id:"seed",   name:"Seed Harvest", tk:"$SEED", c:"#bff339", logo:"assets/proj3d/fieldbot.webp", hue:38, tags:"Agritech",       day:6,  h:21, cap:140 }
  ];
  const WALLETS = [["Phantom","assets/wallets/phantom.png"],["Solflare","assets/wallets/solflare.png"],["Backpack","assets/wallets/backpack.png"]];
  /* Grablab is Solana only: plays are paid in USDC on Solana and every prize lands on Solana */
  const CHAINS = {
    solana: { name:"Solana", fee:"SOL", svg:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#10132a"/><path fill="#14f195" d="M7.6 7h10l-1.7 1.8H5.9z"/><path fill="#5fb8f0" d="M16.3 11.1H6.3L4.6 12.9h10z" transform="translate(1.6 0)"/><path fill="#9945ff" d="M7.6 15.2h10l-1.7 1.8H5.9z"/></svg>' }
  };
  const chainTag = c => `<i class="chn" title="Prizes on ${CHAINS[c].name}">${CHAINS[c].svg}</i>`;
  let payChain = "solana";
  const STEPS = ["Drop","Pay","Claim","Play","Prize"];
  const PLAY_S = 30;
  const CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const b58 = n => [...Array(n)].map(() => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random()*57)]).join("");
  const fmt = n => n.toLocaleString("en-US");
  const short = a => a.length > 12 ? a.slice(0,4) + "…" + a.slice(-4) : a;
  const $ = (s, r) => (r || document).querySelector(s);

  let lastTx = "";
  const feeds = [];
  let root, proj = PROJECTS[0], wallet = 0, addr = "", playNo = 428 + Math.floor(Math.random()*40), lastFocus = null;

  /* ---------------- markup ---------------- */
  /* real camera loops (3 clips over 6 machines: second use mirrored and offset) */
  const FEED = [[6,0,0],[4,0,0],[5,0,0],[1,0,0],[6,1,6],[4,1,5]];
  function feedVideo(i){
    const [n, mir, off] = FEED[i % FEED.length];
    return `<video class="pc-vid${mir ? " mir" : ""}" src="assets/feeds/feed${n}.mp4?v=5" poster="assets/feeds/feed${n}.jpg?v=5" muted loop playsinline preload="metadata" data-off="${off}" aria-hidden="true"></video>`;
  }
  function capCluster(n){ return `<span class="pc-caps">${["","v","r"].slice(0,n).map(k => `<i class="cap ${k}"></i>`).join("")}</span>`; }
  /* project socials (demo projects: icons only, real ones link out) */
  const SOC = {
    x:'<svg viewBox="0 0 24 24"><path d="M3 3l7.5 9.5L3.5 21H6l5.5-6.3L16 21h5l-7.9-10 7-8h-2.5l-5 5.7L8 3z"/></svg>',
    tg:'<svg viewBox="0 0 24 24"><path d="M21.5 3.5L2.8 10.7c-.9.4-.9 1.6.1 1.9l4.6 1.5 1.8 5.6c.3.8 1.3 1 1.9.4l2.6-2.5 4.9 3.6c.7.5 1.7.1 1.9-.7l3-15.3c.2-1-.8-1.8-1.7-1.4zM9.6 14.3l-.5 3.4-1.2-3.9 9.5-6.2z"/></svg>',
    dc:'<svg viewBox="0 0 24 24"><path d="M19.3 5.3A16 16 0 0015.2 4l-.5 1a14.6 14.6 0 00-5.4 0l-.5-1a16 16 0 00-4.1 1.3C2.1 9.2 1.4 13 1.7 16.7a16.3 16.3 0 005 2.5l1.1-1.7a10.6 10.6 0 01-1.7-.8l.4-.3a11.7 11.7 0 0011 0l.4.3c-.5.3-1.1.6-1.7.8l1.1 1.7a16.2 16.2 0 005-2.5c.4-4.3-.7-8.1-3-11.4zM8.7 14.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z"/></svg>',
    web:'<svg viewBox="0 0 24 24" class="st"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>'
  };
  function socials(p){
    const items = [["x","X"],["tg","Telegram"],["dc","Discord"],["web","Website"]];
    return `<span class="pc-soc">${items.map(([k, n]) => `<a href="#" data-soc="${k}" title="${p.name} on ${n}" aria-label="${p.name} on ${n}">${SOC[k]}</a>`).join("")}</span>`;
  }
  /* upcoming drops: times are always UTC */
  const CAL = '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>';
  const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  function startOf(u){
    const now = new Date(), d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), u.h, 0, 0));
    if (u.day < 0){ if (d <= now) d.setUTCDate(d.getUTCDate() + 1); }
    else { let add = (u.day - d.getUTCDay() + 7) % 7; if (add === 0 && d <= now) add = 7; d.setUTCDate(d.getUTCDate() + add); }
    return d;
  }
  const hh = d => String(d.getUTCHours()).padStart(2,"0") + ":00 UTC";
  function whenLabel(u){
    const d = startOf(u), now = new Date();
    const today = d.getUTCDate() === now.getUTCDate() && d - now < 864e5;
    return (u.day < 0 && today ? "Tonight " : DAYS[d.getUTCDay()] + " ") + hh(d);
  }
  function dayWord(u){
    const d = startOf(u), now = new Date(), day = 864e5;
    const dd = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), nd = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    return dd === nd ? "Tonight" : dd - nd === day ? "Tomorrow" : DAYS[d.getUTCDay()];
  }
  const hhmm = u => String(startOf(u).getUTCHours()).padStart(2,"0") + ":00";
  /* countdown as digit tiles: d h m when more than a day away, else h m s */
  function clockTiles(t){
    const sec = Math.max(0, Math.floor((t - Date.now()) / 1000));
    const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60), s2 = sec % 60;
    const parts = d ? [[d,"d"],[h,"h"],[m,"m"]] : [[h,"h"],[m,"m"],[s2,"s"]];
    return parts.map(([v, u]) => `<span class="ut"><b>${String(v).padStart(2,"0")}</b><i>${u}</i></span>`).join("");
  }
  function countdown(t){
    const m = Math.max(0, Math.round((t - Date.now()) / 6e4)), d = Math.floor(m / 1440), h = Math.floor(m % 1440 / 60), mm = m % 60;
    return "Starts in " + (d ? `${d}d ${h}h` : h ? `${h}h ${String(mm).padStart(2,"0")}m` : `${mm}m`);
  }
  function utcDate(u){ const d = startOf(u); return d.getUTCDate() + " " + d.toLocaleString("en-US", { month:"short", timeZone:"UTC" }); }
  function calUrl(u){
    const d = startOf(u), e = new Date(+d + 36e5), f = x => x.toISOString().replace(/[-:]/g, "").replace(/[.][0-9]{3}/, "");
    const q = new URLSearchParams({ action:"TEMPLATE", text:`${u.name} drop on Grablab`, dates:`${f(d)}/${f(e)}`,
      details:`${u.name} (${u.tk}) goes live on the Grablab claw. ${u.cap} capsules. Times in UTC.`, location:"https://grablab.fun/participate" });
    return "https://calendar.google.com/calendar/render?" + q.toString();
  }
  const REM_KEY = "gl_reminders";
  const getRem = () => { try { return JSON.parse(localStorage.getItem(REM_KEY) || "[]"); } catch(e){ return []; } };
  const setRem = a => { try { localStorage.setItem(REM_KEY, JSON.stringify(a)); } catch(e){} };
  function card(p, i, feat){
    const vn = 380 + (p.left * 37) % 1400, watching = `<b class="vn" data-n="${vn}">${fmt(vn)}</b>`;
    if (feat) return `<div class="pc feat" role="button" tabindex="0" style="--c:${p.c}" data-i="${i}">
      <div class="pc-cover pc-live">${feedVideo(i)}
        <span class="pc-view"><i></i>${watching} watching</span></div>
      <div class="pc-b">
        <span class="pc-tag">Featured drop</span>
        <div class="pc-t"><img class="pc-logo" src="${p.logo}" alt="" /><b>${p.name}</b><span>${p.tk}</span><span class="pc-chain">${chainTag(p.chain)}On ${CHAINS[p.chain].name}</span></div>
        <p class="pc-blurb">${p.tags}, renting the claw tonight</p>
        <div class="pc-prize"><span>Top capsule</span><strong>${fmt(p.violet)} ${p.tk}</strong></div>
        <div class="pc-bar"><i style="--f:${(1 - p.left/p.cap).toFixed(2)}"></i></div>
        <div class="pc-meta"><span>${p.left} / ${p.cap} left</span><span>${p.price} USDC per play</span></div>
        <div class="pc-foot"><span class="pc-go">Participate<svg viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></span>${socials(p)}</div>
      </div></div>`;
    return `<div class="pc" role="button" tabindex="0" style="--c:${p.c}" data-i="${i}">
      <div class="pc-live sm">${feedVideo(i)}
        <span class="pc-view"><i></i>${watching}</span></div>
      <div class="pc-head"><img class="pc-logo" src="${p.logo}" alt="" /><div class="pc-t"><b>${p.name}</b><span>${p.tk}${chainTag(p.chain)}</span></div></div>
      <div class="pc-b">
        <div class="pc-prize"><span>Top capsule</span><strong>${fmt(p.violet)} ${p.tk}</strong></div>
        <div class="pc-bar"><i style="--f:${(1 - p.left/p.cap).toFixed(2)}"></i></div>
        <div class="pc-meta"><span>${p.left} / ${p.cap} left</span>${socials(p)}</div>
      </div></div>`;
  }
  /* each sponsor brings its own quests: finish them, get plays on its machine */
  function projQuests(p, i){
    return [
      { k:"x", t:`Follow ${p.name} on X`, r:1, cta:"Follow" },
      i % 2 ? { k:"chat", t:`Join the ${p.name} Discord`, r:1, cta:"Join" } : { k:"chat", t:`Join the ${p.name} Telegram`, r:1, cta:"Join" },
      i % 3 === 0 ? { k:"link", t:`Share the ${p.name} drop`, r:2, cta:"Share" } : { k:"coin", t:`Hold 500 ${p.tk}`, r:2, cta:"Check" }
    ];
  }
  function projQuestCard(p, i){
    const qs = projQuests(p, i), up = qs.reduce((n, q) => n + q.r, 0);
    return `<div class="pq" style="--c:${p.c}">
      <div class="pq-h"><img class="pc-logo" src="${p.logo}" alt="" /><div class="pq-n"><b>${p.name}</b><span><em>${p.tk}</em>${p.tags}</span></div><span class="pq-up"><b>+${up}</b><small>plays</small></span></div>
      <ul class="pq-l">${qs.map(q => `<li><img src="assets/icons/${QIMG[q.k]}.webp" alt="" /><span class="pq-t">${q.t}</span><span class="pq-r">+${q.r}</span><button class="qc-cta" type="button">${q.cta}</button></li>`).join("")}</ul>
      <div class="pq-p"><span class="pq-bar"><i></i></span><small><b>0</b> / ${qs.length} done</small></div>
    </div>`;
  }
  function questCard(q){
    return `<div class="qc" style="--c:#7db0ff">
      <span class="qc-ic"><img src="assets/icons/${QIMG[q.k]}.webp" alt="" /></span>
      <div class="qc-b"><b>${q.title}</b><p>${q.desc}</p></div>
      <div class="qc-side"><span class="qc-reward">${q.reward}</span><button class="qc-cta" type="button">${q.cta}</button></div>
    </div>`;
  }
  function upcomingCard(u){
    return `<div class="uc" style="--c:${u.c}">
      <div class="uc-head"><img class="pc-logo" src="${u.logo}" alt="" style="filter:hue-rotate(${u.hue || 0}deg) drop-shadow(0 8px 16px rgba(0,0,0,.45))" /><div class="uc-date"><small><span>${dayWord(u)}</span><span>${utcDate(u)}</span></small><b>${hhmm(u)}<em>UTC</em></b></div></div>
      <div class="pc-b">
        <div class="pc-t"><b>${u.name}</b><span>${u.tk}</span></div>
        <p class="uc-tags">${u.tags}</p>
        <div class="uc-meta"><span>${u.cap} capsules</span><span>${u.tk}</span></div>
        <div class="uc-clock" data-t="${+startOf(u)}"><span class="uc-k">Opens in</span><span class="uc-tiles">${clockTiles(+startOf(u))}</span></div>
        <div class="uc-acts">
          <button class="uc-cta" type="button" data-id="${u.id}">Remind me</button>
          <button class="uc-cancel" type="button" data-id="${u.id}">Cancel</button>
          <a class="uc-cal" href="${calUrl(u)}" target="_blank" rel="noopener" title="Add to Google Calendar" aria-label="Add ${u.name} to Google Calendar">${CAL}</a>
        </div>
      </div></div>`;
  }
  function build(){
    root = document.createElement("div");
    root.className = "sim"; root.id = "sim"; root.hidden = true;
    root.setAttribute("role","dialog"); root.setAttribute("aria-modal","true"); root.setAttribute("aria-label","Grablab simulator");
    root.innerHTML = `
    <div class="sim-top">
      <div class="sim-brand"><img src="assets/brand/mark-chrome-256.png" alt="" /><b>GRABLAB</b><span>Simulator</span></div>
      <ol class="sim-steps">${STEPS.map((s,i) => `<li><i>${i+1}</i><span>${s}</span></li>`).join("")}</ol>
      <span class="chip sim-demo">No real funds</span>
      <button class="sim-x" type="button" aria-label="Close simulator">&times;</button>
    </div>
    <div class="sim-body">
      <section class="sv" data-v="pick">
<div class="pick-top">
        <div class="sv-head"><h2>Pick a <span class="hl">drop.</span></h2>
          <p class="sv-sub two"><span>Every capsule holds a real on-chain prize.</span><span>Grab one live for the ticket price.</span></p></div>
        <div class="sv-tabs" role="tablist">
          <button class="sv-tab on" type="button" data-tab="live" role="tab">Live drops<em>${PROJECTS.length}</em></button>
          <button class="sv-tab" type="button" data-tab="quests" role="tab">Earn plays<em>${PROJECTS.length * 3}</em></button>
          <button class="sv-tab" type="button" data-tab="soon" role="tab">Upcoming<em>${UPCOMING.length}</em></button>
        </div>
        </div>
        <div class="tabpane on" data-pane="live">
          <div class="pgrid">${PROJECTS.map((p,i) => card(p, i, i === 0)).join("")}</div>
        </div>
        <div class="tabpane" data-pane="quests">
          <div class="qnote"><b>No wallet full of tokens? Grab a play for free.</b><span>Every project brings its own quests. Finish them and get plays on its machine, dropped to your address.</span></div>
          <div class="pqgrid">${PROJECTS.map(projQuestCard).join("")}</div>
        </div>
        <div class="tabpane" data-pane="soon">
          <div class="qnote"><b>Machines warming up.</b><span>Sponsors locking in capsules now.<br class="mbr2"> Set a reminder and be first on the claw.</span></div>
          <div class="ugrid">${UPCOMING.map(upcomingCard).join("")}</div>
        </div>
      </section>

      <section class="sv" data-v="room">
        <div class="rm-top">
          <button class="rm-back" type="button" aria-label="All drops"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>All drops</button>
          <div class="rm-idw"><img class="rm-logo" id="rmLogo" src="" alt="" /><div class="rm-id"><b id="rmName"></b></div><div class="rm-tags"><span class="rm-tag tk" id="rmTk"></span><span class="rm-tag" id="rmCat"></span></div></div>
          <div class="rm-soc" id="rmSoc"></div>
        </div>
        <div class="rm-grid">
          <div class="rm-main">
            <div class="rm-stream"><video id="rmVid" muted loop playsinline preload="metadata" aria-hidden="true"></video>
              <div class="pc-ov"><span class="sc"><i class="rec"></i>Live</span><span class="sc" id="rmCatch"></span></div>
              <span class="pc-view"><i></i><b class="vn" id="rmWatch" data-n="900">900</b> watching</span>
              <span class="sc rm-queue" id="rmQueue"></span>
              <span class="rm-camname" id="rmCam">Corner camera</span>
              <div class="rm-pips"><button class="rm-pip" type="button" data-k="claw"><video muted loop playsinline preload="metadata" aria-hidden="true"></video><span>Claw camera</span></button><button class="rm-pip" type="button" data-k="chute"><video muted loop playsinline preload="metadata" aria-hidden="true"></video><span>Beam sensor camera</span></button></div>
            </div>
            <div class="rm-info">
              <div class="rm-tiers">
                <div class="rt"><img class="rt-cap" src="assets/caps/gold.webp" alt="" /><div><small>Gold capsule</small><b id="rmGold"></b></div></div>
                <div class="rt"><img class="rt-cap" src="assets/caps/violet.webp" alt="" /><div><small>Violet capsule</small><b id="rmViolet"></b></div></div>
                <div class="rt"><img class="rt-cap" src="assets/caps/rare.webp" alt="" /><div><small>Rare capsule</small><b id="rmRare"></b></div></div>
              </div>
              <div class="rm-stock"><div class="rs-top"><b id="rmLeftN"></b><small id="rmLeftOf"></small></div><span class="pc-bar"><i id="rmBar"></i></span></div>
              <div class="rm-buyw"><button class="rm-buy" id="rmBuy" type="button"><span>Buy a play</span><small id="rmPrice"></small></button>
              <button class="swap-link sm" type="button" data-swap><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg><span>Need USDC? <b>Swap</b></span><em>via <img src="assets/chains/jup.png" alt="" />Jupiter</em></button></div>
            </div>
          </div>
          <aside class="rm-chat">
            <div class="ch-h"><b>Live chat</b><span id="rmChatN"></span></div>
            <div class="ch-list" id="rmChat" aria-live="polite"></div>
            <form class="ch-in" id="rmChatForm"><input id="rmChatIn" maxlength="120" placeholder="Say something" autocomplete="off" /><button type="submit" aria-label="Send"><svg viewBox="0 0 24 24"><path d="M4 12l16-8-6 16-2-6z"/></svg></button></form>
          </aside>
        </div>
      </section>

      <section class="sv" data-v="pay">
        <div class="sv-head"><h2>Buy a <span class="hl">play.</span></h2></div>
        <div class="pay">
          <div class="glass pay-sum">
            <div class="pay-live"><video id="payVid" muted loop playsinline preload="metadata" aria-hidden="true"></video>
              <div class="pc-ov"><span class="sc"><i class="rec"></i>Live</span><span class="sc" id="payMach"></span></div>
              <span class="pc-view"><i></i><b class="vn" id="payWatch" data-n="900">900</b> watching</span></div>
            <div class="pay-p"><img id="payLogo" src="" alt="" /><div><b id="payName"></b><small id="payTags"></small></div></div>
            <div class="pay-prizes">
              <span class="pp-k">In the machine right now</span>
              <div class="pp-row">
                <span class="pp"><img src="assets/caps/gold.webp" alt="" /><b id="ppGold"></b></span>
                <span class="pp"><img src="assets/caps/violet.webp" alt="" /><b id="ppViolet"></b></span>
                <span class="pp"><img src="assets/caps/rare.webp" alt="" /><b id="ppRare"></b></span>
              </div>
            </div>
            <div class="row"><span>1 play on Machine 01</span><b id="payPrice"></b></div>
            <div class="row"><span>Network fee</span><b id="payFee"></b></div>
            <div class="row"><span>Refund if the machine fails</span><b class="yes">Yes</b></div>
            <div class="row tot"><span>Total</span><b id="payTot"></b></div>
          </div>
          <div class="glass pay-w">
            <small>Pay with</small>
            ${WALLETS.map((w,i) => `<button class="wl${i===0?" on":""}" type="button" data-w="${i}"><img src="${w[1]}" alt="" />${w[0]}<em>${i===0?"Selected":"Detected"}</em></button>`).join("")}
            <button class="btn btn-primary big act" id="payBtn" type="button"></button>
            <div class="okline" id="payOk">
              <span class="ok-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><path d="M14 22.5l5.5 5.5L30 17"/></svg></span>
              <span class="ok-t"><b>Payment confirmed</b><small>Settled in 0.4 s</small></span>
              <span class="ok-m"><small>Play</small><b id="okNo"></b><small>Tx</small><code id="okTx"></code></span>
            </div>
            <p class="fine">Simulated. Your wallet is never opened.</p>
            <button class="swap-link" type="button" data-swap><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3M17 17H6l3 3"/></svg><span>Need USDC? <b>Swap to USDC</b></span><em>via <img src="assets/chains/jup.png" alt="" />Jupiter</em></button>
          </div>
        </div>
      </section>

      <section class="sv" data-v="claim">
        <div class="sv-head c"><span class="k" id="claimK"></span><h2>Where does the <span class="hl">prize land?</span></h2></div>
        <div class="claim-wrap">
          <div class="ticket">
            <div class="tk-top"><img id="tkLogo" src="" alt="" /><div><b id="tkName"></b><small>30 seconds on Machine 01</small></div></div>
            <div class="tk-mid"><div><small>Play</small><b id="tkNo"></b></div><div><small>Price</small><b id="tkPrice"></b></div><div><small>Grip</small><b>70%</b></div></div>
            <div class="tk-cut"></div>
            <div class="tk-bot"><div><small>Receipt</small><code id="tkTx"></code></div><span class="tk-paid"><span class="ok-ring"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><path d="M14 22.5l5.5 5.5L30 17"/></svg></span><span class="tp-t"><b>Paid</b><small>Confirmed</small></span></span></div>
          </div>
          <div class="glass claim">
            <label for="simAddr" id="simAddrL">Your Solana address</label>
            <div class="inrow"><input id="simAddr" type="text" autocomplete="off" spellcheck="false" /><button class="btn btn-ghost" id="simAddrNew" type="button">New demo</button></div>
            <div class="err" id="simErr"></div>
            <div class="tick"><i></i><span>Prize goes straight to this address</span><i></i><span>Grip set to 70% before your play</span><i></i><span>Refund if the machine fails</span></div>
            <button class="btn btn-primary big act" id="claimBtn" type="button">Claim my play</button>
          </div>
        </div>
      </section>

      <section class="sv" data-v="play">
        <div class="stagew" id="stagew">
          <canvas id="simCv"></canvas>
          <canvas id="sim3d" class="s3" aria-label="The machine, live"></canvas>
          <span class="s3-main" id="s3Main">Corner camera</span>
          <button class="s3-pip l" type="button" data-cam="1"><span>Claw camera</span></button>
          <button class="s3-pip r" type="button" data-cam="2"><span>Chute camera</span></button>
          <div class="shud tl"><div class="bcast"><span class="slive">Live</span><i class="bdiv"></i><img class="bimg" id="hudLogo" src="" alt="" /><span class="smach" id="hudProj"></span></div></div>
          <div class="shud tm"><b id="simT">0:30</b><span class="tb"><i id="simTb"></i></span></div>
          <div class="shud tr"><span class="swatch"><i></i><b class="vn" data-n="1284">1,284</b> watching</span></div>
          <div class="toast" id="simToast"></div>
          <div class="toast hint" id="simHint"></div>
          <div class="queue" id="simQ"><div><small>You're up on Machine 01</small><b id="simQn">3</b></div></div>
        </div>
        <div class="ctrl">
          <div class="joy" id="simJoy" aria-label="Joystick"><img class="jbase" src="assets/play/joy-base.webp" alt="" draggable="false" /><span class="knob"><img src="assets/play/joy-stick.webp" alt="" draggable="false" /></span></div>
          <div class="ctrl-mid">
            <div class="gauge" aria-label="Grip 70%">
              <svg viewBox="0 0 140 78"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#1f4fd1"/><stop offset=".55" stop-color="#7db0ff"/><stop offset="1" stop-color="#e8f0ff"/></linearGradient></defs>
                ${Array.from({length:21}, (_, i) => { const a = Math.PI*(1 - i/20), r1 = i % 5 ? 60 : 57, r2 = 64; return `<line x1="${(70 + Math.cos(a)*r1).toFixed(1)}" y1="${(72 - Math.sin(a)*r1).toFixed(1)}" x2="${(70 + Math.cos(a)*r2).toFixed(1)}" y2="${(72 - Math.sin(a)*r2).toFixed(1)}" class="${i <= 14 ? "on" : ""}"/>`; }).join("")}
                <path class="trk" d="M18 72 A52 52 0 0 1 122 72" pathLength="100"/><path class="val" d="M18 72 A52 52 0 0 1 122 72" pathLength="100"/></svg>
              <b>70<em>%</em></b><small>Grip</small>
            </div>
            <div class="keys">
              <span class="kg"><span class="kpad"><kbd data-k="ArrowUp">&uarr;</kbd><kbd data-k="ArrowLeft">&larr;</kbd><kbd data-k="ArrowDown">&darr;</kbd><kbd data-k="ArrowRight">&rarr;</kbd></span><small>Move</small></span>
              <span class="kg"><kbd class="wide" data-k=" ">Space</kbd><small>Grab</small></span>
            </div>
          </div>
          <button class="grabb" id="simGrab" type="button"><img src="assets/play/btn.webp" alt="" draggable="false" /><span>Grab</span></button>
        </div>
      </section>

      <section class="sv" data-v="win">
        <div class="win-cap" id="winCap"><i class="cap"></i></div>
        <span class="win-k" id="winK"></span>
        <h2 class="win-prize" id="winP"></h2>
        <p class="win-sub" id="winS"></p>
        <div class="glass rc" id="winRc">
          <div class="rc-h"><span>Play receipt</span><span id="rcNo"></span></div>
          <div class="rc-r"><i></i>Inventory committed<small id="rc0"></small></div>
          <div class="rc-r"><i></i>Grip locked<small>70%</small></div>
          <div class="rc-r"><i></i>Machine signed the play<small>peaqOS</small></div>
          <div class="rc-r"><i></i>Drop seen<small>beam + camera</small></div>
          <div class="rc-r"><i></i><span id="rc4t">Paid out</span><small id="rc4"></small></div>
        </div>
        <div class="win-acts"><button class="btn btn-primary big" id="winAgain" type="button">Play again</button><button class="btn btn-ghost big" id="winOther" type="button">Other drops</button></div>
      </section>
    </div>
    <canvas class="confetti" id="simConf"></canvas>`;
    document.body.appendChild(root);

    root.querySelector(".sim-x").addEventListener("click", () => close());
    root.querySelectorAll(".pc").forEach(b => {
      b.addEventListener("click", e => { if (e.target.closest(".pc-soc")) return; proj = PROJECTS[+b.dataset.i]; go("room"); });
      b.addEventListener("keydown", e => { if (e.target === b && (e.key === "Enter" || e.key === " ")){ e.preventDefault(); b.click(); } });
    });
    root.querySelectorAll(".pc-soc a").forEach(a => a.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); }));
    root.querySelectorAll(".sv-tab").forEach(t => t.addEventListener("click", () => {
      root.querySelectorAll(".sv-tab").forEach(x => x.classList.toggle("on", x === t));
      root.querySelectorAll(".tabpane").forEach(p => p.classList.toggle("on", p.dataset.pane === t.dataset.tab));
    }));
    root.querySelectorAll(".qc-cta").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.done) return;
      b.dataset.done = "1"; b.classList.add("done"); b.textContent = "Done";
      const card = b.closest(".pq"); if (!card) return;
      const all = card.querySelectorAll(".qc-cta").length, done = card.querySelectorAll(".qc-cta.done").length;
      card.querySelector(".pq-p b").textContent = done;
      card.querySelector(".pq-bar i").style.width = (done / all * 100) + "%";
      card.classList.toggle("complete", done === all);
    }));
    /* reminders: set, cancel, remembered on this device */
    const paintRem = () => { const on = getRem(); root.querySelectorAll(".uc").forEach(c => {
      const id = c.querySelector(".uc-cta").dataset.id, set = on.includes(id);
      c.classList.toggle("rem", set); c.querySelector(".uc-cta").innerHTML = set ? CHECK + "Reminder set" : "Remind me";
    }); };
    root.querySelectorAll(".uc-cta").forEach(b => b.addEventListener("click", () => { const a = getRem(); if (!a.includes(b.dataset.id)){ a.push(b.dataset.id); setRem(a); } paintRem(); }));
    root.querySelectorAll(".uc-cancel").forEach(b => b.addEventListener("click", () => { setRem(getRem().filter(x => x !== b.dataset.id)); paintRem(); }));
    paintRem();
    setInterval(() => { if (root.hidden || view !== "pick") return; root.querySelectorAll(".uc-clock").forEach(c => { c.querySelector(".uc-tiles").innerHTML = clockTiles(+c.dataset.t); }); }, 1000);
    root.querySelectorAll(".wl").forEach(b => b.addEventListener("click", () => {
      wallet = +b.dataset.w;
      root.querySelectorAll(".wl").forEach(x => { x.classList.toggle("on", x === b); x.querySelector("em").textContent = x === b ? "Selected" : "Detected"; });
      setPayLabel();
    }));
    root.querySelectorAll(".ch").forEach(b => b.addEventListener("click", () => { payChain = b.dataset.c; root.querySelectorAll(".ch").forEach(x => x.classList.toggle("on", x === b)); setPayLabel(); }));
    $("#payBtn", root).addEventListener("click", pay);
    $("#simAddrNew", root).addEventListener("click", () => { $("#simAddr", root).value = demoAddr(proj.chain); $("#simErr", root).textContent = ""; });
    $("#claimBtn", root).addEventListener("click", claim);
    $("#simAddr", root).addEventListener("keydown", e => { if (e.key === "Enter") claim(); });
    $("#winAgain", root).addEventListener("click", () => go("pay"));
    $("#winOther", root).addEventListener("click", () => go("pick"));
    $(".rm-back", root).addEventListener("click", () => go("pick"));
    $("#rmBuy", root).addEventListener("click", () => go("pay"));
    root.addEventListener("click", e => { if (e.target.closest(".rm-soc a")) e.preventDefault(); });
    $("#rmChatForm", root).addEventListener("submit", e => {
      e.preventDefault();
      const i = $("#rmChatIn", root), t = i.value.trim(); if (!t) return;
      chatAdd({ who:"you", text:t, me:true }); i.value = "";
      setTimeout(() => chatAdd({ who:pick(CH_NAMES), text:pick(["welcome in", "gl on your play", "go get it", "you're up soon"]) }), 1400 + Math.random()*1200);
    });
    game.init();
    /* a live feed per drop card: the same claw game on autopilot, framed without distortion for any card shape */
    const feedCam = (W, H) => { const k = Math.min(W*0.46, H*0.64); return { k, cx:0, fy:H*0.93, dz:H*0.3 }; };
    root.querySelectorAll(".pc").forEach(card => {
      const cvs = card.querySelector(".pc-cv"); if (!cvs) return;
      const g = makeGame({ auto:true, jitter:3, el: sel => sel === "#simCv" ? cvs : null, cam: feedCam,
        paused: () => root.hidden || view !== "pick" || !root.querySelector('.tabpane[data-pane="live"].on'),
        onResult: () => setTimeout(() => g.start(), 1600) });
      g.init(); feeds.push(g);
    });
  }

  /* ---------------- project room : live stream + chat ---------------- */
  const CH_NAMES = ["clawmaxi","0xmira","solsurfer","gm_kate","tinyfish","drop_hunter","nightowl","pixelpaw","moonbeam","grabfather","lowkey_lena","rekt_raccoon"];
  const CH_LINES = ["gm from Berlin","that claw is smooth tonight","almost had it last night","who is next in line?","{n} team is cooking","violet one top left, go for it","grip feels right","lfg","watching from my phone, crisp","how many violet ones left?","finished the quests, free plays incoming","camera angle is perfect","next one is mine","anyone got the {r} yet?","this beats any airdrop form"];
  const pick = a => a[Math.floor(Math.random()*a.length)];
  const wal = () => b58(4) + "…" + b58(4);
  let chatT = 0, chatN = 0;
  const avatarOf = n => n === "you" ? 1 : [...n].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 9;
  function chatAdd(m){
    const list = $("#rmChat", root), el = document.createElement("div");
    el.className = "ch-m" + (m.ev ? " ev" : "") + (m.me ? " me" : "");
    el.innerHTML = m.ev ? `<img class="ch-ev" src="assets/caps/${m.cap || "gold"}.webp" alt="" /><span>${m.text}</span>`
      : `<img class="ch-av" src="assets/av/a${avatarOf(m.who)}.webp" alt="" /><p><b>${m.who}</b><span></span></p>`;
    if (!m.ev) el.querySelector("p span").textContent = m.text;
    list.appendChild(el);
    while (list.children.length > 40) list.firstChild.remove();
    list.scrollTop = list.scrollHeight;
  }
  function chatTick(){
    if (view !== "room") return;
    const r = Math.random();
    if (r < 0.12) chatAdd({ ev:true, cap:"gold", text:`${wal()} grabbed +${fmt(proj.gold)} ${proj.tk}` });
    else if (r < 0.17) chatAdd({ ev:true, cap:"violet", text:`${wal()} grabbed a violet capsule: +${fmt(proj.violet)} ${proj.tk}` });
    else if (r < 0.22) chatAdd({ who:pick(CH_NAMES), text:"joined the line" });
    else chatAdd({ who:pick(CH_NAMES), text:pick(CH_LINES).replace("{n}", proj.name).replace("{r}", proj.rare) });
    chatT = setTimeout(chatTick, 1500 + Math.random()*2200);
  }
  function enterRoom(){
    const p = proj, pi = PROJECTS.indexOf(p), [fn, mir] = FEED[pi % FEED.length], v = $("#rmVid", root);
    $("#rmLogo", root).src = p.logo; $("#rmName", root).textContent = p.name; $("#rmTk", root).textContent = p.tk; $("#rmCat", root).textContent = p.tags;
    $("#rmSoc", root).innerHTML = socials(p);
    /* three cameras on the same play: the stream, straight down from the top, and the beam sensor in the chute; tap a window to swap it in */
    const CAMN = { main:"Corner camera", claw:"Claw camera", chute:"Beam sensor camera" }, url = k => `assets/feeds/feed${fn}${k === "main" ? "" : "-" + k}.mp4?v=5`;
    const pips = [...root.querySelectorAll(".rm-pip")];
    if (v.dataset.fn !== String(fn)){ v.dataset.fn = fn; v.dataset.k = "main"; v.src = url("main"); v.poster = `assets/feeds/feed${fn}.jpg?v=5`;
      pips.forEach(b => { const pv = b.querySelector("video"); pv.src = url(b.dataset.k); pv.dataset.k = b.dataset.k; b.querySelector("span").textContent = CAMN[b.dataset.k]; }); $("#rmCam", root).textContent = CAMN.main; }
    if (!root.dataset.rmPips){ root.dataset.rmPips = "1";
      /* keep the windows on the same moment as the main feed */
      setInterval(() => { if (v.paused || !v.duration) return; pips.forEach(b => { const pv = b.querySelector("video"); if (pv.readyState > 0 && Math.abs(pv.currentTime - v.currentTime) > .2) pv.currentTime = v.currentTime; }); }, 700);
      pips.forEach(b => b.addEventListener("click", () => { const pv = b.querySelector("video"), k1 = v.dataset.k, k2 = pv.dataset.k, t = v.currentTime;
        v.src = url(k2); v.dataset.k = k2; pv.src = url(k1); pv.dataset.k = k1; b.querySelector("span").textContent = CAMN[k1]; $("#rmCam", root).textContent = CAMN[k2];
        const all = [v, ...pips.map(x => x.querySelector("video"))]; all.forEach(x => { x.addEventListener("loadedmetadata", () => { x.currentTime = t; x.play().catch(() => {}); }, { once:true }); }); })); }
    v.classList.remove("mir"); v.play().catch(() => {}); pips.forEach(b => { const pv = b.querySelector("video"); pv.currentTime = v.currentTime || 0; pv.play().catch(() => {}); });
    $("#rmCatch", root).textContent = `Catching at ${p.name}`;
    const w = 380 + (p.left * 37) % 1400, wv = $("#rmWatch", root); wv.dataset.n = w; wv.dataset.base = w; wv.textContent = fmt(w);
    $("#rmQueue", root).textContent = `${2 + pi % 4} in line`;
    $("#rmGold", root).textContent = `${fmt(p.gold)} ${p.tk}`; $("#rmViolet", root).textContent = `${fmt(p.violet)} ${p.tk}`; $("#rmRare", root).textContent = p.rare;
    $("#rmBar", root).style.width = ((1 - p.left/p.cap) * 100) + "%";
    $("#rmLeftN", root).textContent = p.left; $("#rmLeftOf", root).textContent = `of ${p.cap} capsules left`;
    $("#rmPrice", root).textContent = `${p.price} USDC`;
    $("#rmChatN", root).textContent = `${fmt(Math.round(w * 0.08))} chatting`;
    if (chatN !== pi + 1){ chatN = pi + 1; $("#rmChat", root).innerHTML = ""; for (let k = 0; k < 7; k++) chatAdd({ who:pick(CH_NAMES), text:pick(CH_LINES).replace("{n}", p.name).replace("{r}", p.rare) }); }
    clearTimeout(chatT); chatT = setTimeout(chatTick, 1200);
  }

  /* ---------------- navigation ---------------- */
  let view = "pick";
  function go(v){
    view = v; root.oncontextmenu = v === "play" ? (e => e.preventDefault()) : null;
    const idx = ["pick","pay","claim","play","win"].indexOf(v === "room" ? "pick" : v);
    root.querySelectorAll(".sv").forEach(s => s.classList.toggle("on", s.dataset.v === v));
    root.querySelectorAll(".sim-steps li").forEach((li,i) => { li.classList.toggle("on", i === idx); li.classList.toggle("done", i < idx); });
    $(".sim-body", root).scrollTop = 0;
    const pv = root.querySelector("#payVid"); if (pv && v !== "pay") pv.pause();
    if (v === "room") enterRoom(); else { clearTimeout(chatT); const rv = root.querySelector("#rmVid"); if (rv) rv.pause(); }
    if (v === "pay") enterPay();
    if (v === "claim") enterClaim();
    if (v === "play") game.start();
    else game.stop();
  }
  /* the 3D machine with three live cameras (sim3d.js), loaded when the simulator opens; the photo mode stays as the fallback */
  let S3 = null, S3m = null, S3p = null;
  function load3d(){
    if (S3p || !root) return S3p;
    const c = root.querySelector("#sim3d"); if (!c) return null;
    const pips = [...root.querySelectorAll(".s3-pip")]; pips.label = root.querySelector("#s3Main");
    S3p = import("./sim3d.js?v=7").then(m => { S3m = m; S3 = m.createSim3D(c, pips); }).catch(e => { console.warn("3D simulator", e); });
    return S3p;
  }
  function open(){
    if (!root) build();
    lastFocus = document.activeElement;
    root.hidden = false; document.body.classList.add("sim-lock");
    requestAnimationFrame(() => root.classList.add("open"));
    go("pick"); load3d();
    if (window.glBack && !glBack.has("sim")) glBack.push("sim", simBack);
    feeds.forEach(g => { if (!g.isRunning()) g.start(); });
    root.querySelectorAll(".pc-vid").forEach(v => {
      if (+v.dataset.off && !v.dataset.set){
        v.dataset.set = 1;
        const seek = () => { try { v.currentTime = +v.dataset.off; } catch(e){} };
        if (v.readyState >= 1) seek(); else v.addEventListener("loadedmetadata", seek, { once:true });
      }
      v.play().catch(() => {});
    });
    setTimeout(() => { const f = root.querySelector(".pc"); if (f) f.focus({ preventScroll:true }); }, 60);
  }
  /* Back gesture inside the simulator: pay -> drops, claim -> pay, play / result -> drops, drops -> close */
  const BACK_TO = { room:"pick", pay:"room", claim:"pay", play:"room", win:"room" };
  function simBack(){
    if (!root || root.hidden || !BACK_TO[view]){ close(true); return; }
    go(BACK_TO[view]);
    if (window.glBack) glBack.push("sim", simBack);
  }
  function close(fromBack){
    if (!root || root.hidden) return;
    if (!fromBack && window.glBack) glBack.drop("sim");
    game.stop(); confetti.stop(); feeds.forEach(g => g.stop()); root.querySelectorAll(".pc-vid").forEach(v => v.pause());
    root.classList.remove("open"); document.body.classList.remove("sim-lock");
    setTimeout(() => { root.hidden = true; }, 350);
    if (location.hash === "#simulate") history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll:true });
  }
  addEventListener("keydown", e => { if (e.key === "Escape" && root && !root.hidden) close(); });

  /* ---------------- 2. pay ---------------- */
  function setPayLabel(){
    $("#payBtn", root).innerHTML = `Pay ${proj.price} USDC with ${WALLETS[wallet][0]}`;
    const f = $("#payFee", root); if (f) f.textContent = `under $0.01 in ${CHAINS[payChain].fee}`;
  }
  function demoAddr(c){ return c === "base" ? "0x" + Array.from({length:40}, () => "0123456789abcdef"[Math.random()*16|0]).join("") : b58(44); }
  function enterPay(){
    const pi = PROJECTS.indexOf(proj), [fn, mir] = FEED[pi % FEED.length], pv = $("#payVid", root);
    if (!pv.src.endsWith(`feed${fn}.mp4?v=5`)){ pv.src = `assets/feeds/feed${fn}.mp4?v=5`; pv.poster = `assets/feeds/feed${fn}.jpg?v=5`; }
    pv.classList.toggle("mir", !!mir); pv.play().catch(() => {});
    $("#payMach", root).textContent = `Catching at ${proj.name}`;
    const w = 380 + (proj.left * 37) % 1400, wv = $("#payWatch", root); wv.dataset.n = w; wv.dataset.base = w; wv.textContent = fmt(w);
    $("#payLogo", root).src = proj.logo; $("#payName", root).textContent = proj.name;
    $("#payTags", root).innerHTML = `<em>${proj.tk}</em>${proj.tags}`;
    $("#payPrice", root).textContent = proj.price + " USDC";
    $("#ppGold", root).textContent = fmt(proj.gold) + " " + proj.tk;
    $("#ppViolet", root).textContent = fmt(proj.violet) + " " + proj.tk;
    $("#ppRare", root).textContent = proj.rare;
    $("#payTot", root).textContent = proj.price + " USDC";
    const b = $("#payBtn", root); b.disabled = false; b.classList.remove("paid"); setPayLabel();
    $("#payOk", root).classList.remove("on");
  }
  function pay(){
    const b = $("#payBtn", root); if (b.disabled) return;
    b.disabled = true; b.innerHTML = `<span class="spin"></span>Approve in ${WALLETS[wallet][0]}`;
    setTimeout(() => {
      b.innerHTML = `<span class="spin"></span>Confirming`;
      setTimeout(() => {
        b.innerHTML = CHECK + "Paid";
        lastTx = b58(4) + "…" + b58(4);
        const ok = $("#payOk", root); $("#okNo", root).textContent = "#" + String(playNo).padStart(6,"0"); $("#okTx", root).textContent = lastTx; ok.classList.add("on"); b.classList.add("paid");
        setTimeout(() => { if (view === "pay") go("claim"); }, 1100);
      }, 800);
    }, 1100);
  }

  /* ---------------- 3. claim ---------------- */
  function enterClaim(){
    $("#claimK", root).textContent = "Last step";
    $("#tkLogo", root).src = proj.logo; $("#tkName", root).textContent = proj.name;
    $("#tkNo", root).textContent = "#" + String(playNo).padStart(6,"0");
    $("#tkPrice", root).textContent = proj.price + " USDC";
    $("#tkTx", root).textContent = "tx " + (lastTx || b58(4) + "…" + b58(4));
    root.querySelector(".ticket").style.setProperty("--c", proj.c);
    $("#simAddrL", root).textContent = `Your ${CHAINS[proj.chain].name} address`;
    const i = $("#simAddr", root), fits = v => proj.chain === "base" ? /^0x/.test(v) : !/^0x/.test(v);
    if (!i.value || !fits(i.value)) i.value = addr && fits(addr) ? addr : demoAddr(proj.chain);
    $("#simErr", root).textContent = "";
    const b = $("#claimBtn", root); b.disabled = false; b.textContent = "Claim my play";
  }
  function claim(){
    const v = ($("#simAddr", root).value || "").trim();
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v) && !/^0x[0-9a-fA-F]{40}$/.test(v)){ $("#simErr", root).textContent = "That doesn't look like a wallet address."; return; }
    if ((proj.chain === "base") !== /^0x/.test(v)){ $("#simErr", root).textContent = `${proj.name} prizes land on ${CHAINS[proj.chain].name}. Paste a ${proj.chain === "base" ? "0x" : "Solana"} address.`; return; }
    addr = v;
    const b = $("#claimBtn", root); b.disabled = true; b.innerHTML = '<span class="spin"></span>Claiming';
    setTimeout(() => go("play"), 900);
  }

  /* ---------------- 5. result ---------------- */
  function result(win, kind){
    go("win");
    const cap = $("#winCap", root), P = $("#winP", root);
    cap.className = "win-cap " + (win ? (kind === "violet" ? "v" : kind === "rare" ? "r" : "") : "lose");
    cap.innerHTML = `<i class="cap ${win ? (kind === "violet" ? "v" : kind === "rare" ? "r" : "") : ""}"></i>`;
    const no = "#" + String(playNo).padStart(6,"0");
    $("#rcNo", root).textContent = no; $("#rc0", root).textContent = `${proj.cap} capsules`;
    if (win){
      const txt = kind === "rare" ? proj.rare : kind === "violet" ? `+${fmt(proj.violet)} ${proj.tk}` : `+${fmt(proj.gold)} ${proj.tk}`;
      $("#winK", root).textContent = kind === "rare" ? "Rare capsule" : "You won";
      P.textContent = txt; P.className = "win-prize" + (kind === "gold" ? " gold" : "");
      $("#winS", root).textContent = `Sent to ${short(addr)} in tx ${b58(4)}…${b58(4)}`;
      $("#rc4t", root).textContent = "Paid out"; $("#rc4", root).textContent = short(addr);
      confetti.burst(kind);
    } else {
      $("#winK", root).textContent = game.why || "No grab this time";
      P.textContent = "So close."; P.className = "win-prize";
      $("#winS", root).innerHTML = "The capsule stays in the machine.<br>Every grab is on the record.";
      $("#rc4t", root).textContent = "Result"; $("#rc4", root).textContent = "no prize";
    }
    const rows = [...root.querySelectorAll(".rc-r")]; rows.forEach(r => r.classList.remove("on"));
    rows.forEach((r,i) => setTimeout(() => r.classList.add("on"), 500 + i*380));
    playNo += 1 + Math.floor(Math.random()*3);
  }

  window.__simDbg = { go:v => go(v), result:(w, k) => result(w, k) };   /* for the page checks */
  /* ================= the machine : pseudo 3D canvas game ================= */
  /* the claw game; makeGame() = full simulator, makeGame({auto, el, cam, onResult, onMove, paused}) = self-playing demo */
  function makeGame(o){
    o = o || {};
    const DUMMY = document.createElement("div");
    const el = s => (o.el ? o.el(s) : $(s, root)) || DUMMY;
    let cv, cx, W = 0, H = 0, dpr = 1, raf = 0, last = 0, running = false;
    let caps = [], parts = [], st, keys = {}, joyV = { x:0, z:0 };
    let R = 0.085, M3 = false; const TOP = 0.98, R2 = 0.085;
    /* PHOTO MODE (full simulator): the machine is a real photo of the cabinet (assets/play/plate.webp) and only the claw,
       the grabbed capsule and shadows are drawn over it. The chute is the acrylic box front-left in that photo. */
    const PH = !o.auto && !o.cam ? photoKit() : null;
    const CHUTE0 = PH ? { x0:-1, x1:-0.56, z0:0.1, z1:0.48, h:0.2 } : { x0:-1, x1:-0.6, z0:0, z1:0.36, h:0.2 };
    let CHUTE = CHUTE0, DZ = 1.15;
    let joyEl = null;
    function tilt(ux, uy){
      if (!joyEl) joyEl = el("#simJoy");
      const k = joyEl.querySelector(".knob"); if (!k) return;
      k.style.setProperty("--jx", ux.toFixed(3)); k.style.setProperty("--jy", uy.toFixed(3));
    }

    function layout(){
      const r = cv.getBoundingClientRect(); dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height; cv.width = Math.round(W*dpr); cv.height = Math.round(H*dpr);
      if (PH) PH.fit(W, H);
      if (M3 && S3) S3.resize();
    }
    /* world: x -1..1 (left..right), z 0..1 (front..back), y 0..1 (floor..top) */
    function P(x, y, z){
      if (PH){ const g = PH.G(x, z), r = PH.r(z); return { x:g.x, y:g.y - (y - R)*8.5*r, s:1, k:r/R }; }
      const s = 1 - 0.3*z, fy = H*0.88 - z*H*0.33;
      if (o.cam && camC){ const c = camC, fz = c.fy - z*c.dz; return { x: W/2 + (x - c.cx)*c.k*s, y: fz - y*c.k*s, s, k: c.k*s }; }
      return { x: W/2 + x*W*0.44*s, y: fy - y*H*0.66*s, s, k: W*0.44*s };
    }

    function fill(){
      caps = [];
      if (M3){   /* our machine: one clear layer packed on the floor, a few on top */
        const sp = S3.spots();
        for (const [x, z] of sp) caps.push({ x, z, y:R, kind:(r => r < 0.1 ? "rare" : r < 0.38 ? "violet" : "gold")(Math.random()), vy:0, rest:R, state:"pile", a:1 });
        return;
      }
      if (PH){   /* the photo pile is dense: every spot has a capsule under it */
        const kinds = () => { const r = Math.random(); return r < 0.1 ? "rare" : r < 0.38 ? "violet" : "gold"; };
        for (let z = 0.08; z < 0.97; z += 0.1) for (let x = -0.92; x < 0.95; x += 0.11){
          const cx = x + (Math.round(z*10) % 2 ? 0.055 : 0) + (Math.random()-.5)*0.02;
          if (cx < CHUTE.x1 + 0.02 && z < CHUTE.z1 + 0.02) continue;
          caps.push({ x:cx, z, y:R, kind:kinds(), vy:0, rest:R, state:"pile", a:1 });
        }
        return;
      }
      const kinds = () => { const r = Math.random(); return r < 0.1 ? "rare" : r < 0.38 ? "violet" : "gold"; };
      for (let row = 0; row < 5; row++){
        for (let col = 0; col < 9; col++){
          const x = -0.42 + col*0.165 + (row % 2 ? 0.08 : 0) + (Math.random()-.5)*0.04;
          const z = 0.12 + row*0.19 + (Math.random()-.5)*0.04;
          if (x > 0.93) continue;
          caps.push({ x, z, y:R, kind:kinds(), vy:0, rest:R, state:"pile", a:1 });
        }
      }
      /* a second layer on top, nested between the first */
      for (let k = 0; k < 9; k++){
        const x = -0.3 + Math.random()*1.15, z = 0.2 + Math.random()*0.65;
        caps.push({ x, z, y:R*2.3, kind:kinds(), vy:0, rest:R*2.3, state:"pile", a:1 });
      }
    }

    function reset(){
      fill(); parts = [];
      st = { phase:"count", t:PLAY_S, x:0.25, z:0.55, y:TOP, open:0, held:null, slipAt:0, target:0, timeUp:false, ph:0, chuteGlow:0, shake:0, sw:0, sv:0, px:0.25 };
      api.why = "";
    }

    /* ---------- drawing ---------- */
    function quad(a, b, c, d, f, s, lw){
      cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.lineTo(c.x,c.y); cx.lineTo(d.x,d.y); cx.closePath();
      if (f){ cx.fillStyle = f; cx.fill(); }
      if (s){ cx.strokeStyle = s; cx.lineWidth = lw || 1; cx.stroke(); }
    }
    function line(a, b, s, lw){ cx.beginPath(); cx.moveTo(a.x,a.y); cx.lineTo(b.x,b.y); cx.strokeStyle = s; cx.lineWidth = lw; cx.stroke(); }
    function glowLine(a, b, col, lw){
      cx.save(); cx.shadowColor = col; cx.shadowBlur = 16; line(a, b, col, lw); cx.restore();
    }

    function drawRoom(){
      const g = cx.createLinearGradient(0,0,0,H); g.addColorStop(0,"#070c22"); g.addColorStop(1,"#03050d");
      cx.fillStyle = g; cx.fillRect(0,0,W,H);
      const TOPY = o.roomTop || 1.18;
      /* back wall */
      const bl = P(-1,0,1), br = P(1,0,1), tr = P(1,TOPY,1), tl = P(-1,TOPY,1);
      const bw = cx.createRadialGradient(W/2, bl.y - H*0.18, 10, W/2, bl.y - H*0.18, W*0.5);
      bw.addColorStop(0,"rgba(68,82,190,.55)"); bw.addColorStop(.6,"rgba(24,32,96,.35)"); bw.addColorStop(1,"rgba(8,12,34,.2)");
      quad(bl, br, tr, tl, bw);
      /* side walls */
      quad(P(-1,0,0), P(-1,0,1), P(-1,TOPY,1), P(-1,TOPY,0), "rgba(14,22,66,.55)");
      quad(P(1,0,0), P(1,0,1), P(1,TOPY,1), P(1,TOPY,0), "rgba(14,22,66,.55)");
      /* floor */
      const fl = cx.createLinearGradient(0, P(0,0,1).y, 0, P(0,0,0).y); fl.addColorStop(0,"#0d1640"); fl.addColorStop(1,"#060a1e");
      quad(P(-1,0,0), P(1,0,0), P(1,0,1), P(-1,0,1), fl);
      cx.globalAlpha = .18;
      for (let i = 1; i < 10; i++){ const x = -1 + i*0.2; line(P(x,0,0), P(x,0,1), "#7d84ff", 1); }
      for (let i = 1; i < 5; i++){ const z = i*0.2; line(P(-1,0,z), P(1,0,z), "#7d84ff", 1); }
      cx.globalAlpha = 1;
      /* neon edges */
      glowLine(P(-1,0,1), P(1,0,1), "rgba(125,132,255,.9)", 2);
      glowLine(P(-1,0,1), P(-1,TOPY,1), "rgba(63,233,255,.7)", 2);
      glowLine(P(1,0,1), P(1,TOPY,1), "rgba(255,92,174,.6)", 2);
      glowLine(P(-1,0,0), P(-1,0,1), "rgba(63,233,255,.5)", 2);
      glowLine(P(1,0,0), P(1,0,1), "rgba(255,92,174,.45)", 2);
      /* gantry */
      line(P(-0.98,1.1,0.02), P(-0.98,1.1,0.98), "rgba(200,210,235,.5)", 3);
      line(P(0.98,1.1,0.02), P(0.98,1.1,0.98), "rgba(200,210,235,.5)", 3);
      line(P(-0.98,1.1,0.98), P(0.98,1.1,0.98), "rgba(200,210,235,.35)", 3);
    }

    function drawChute(){
      const { x0, x1, z0, z1, h } = CHUTE, gl = st.chuteGlow;
      /* right face */
      const rg = cx.createLinearGradient(P(x1,h,z0).x, 0, P(x1,h,z1).x, 0); rg.addColorStop(0,"#1a2766"); rg.addColorStop(1,"#0e1747");
      quad(P(x1,0,z0), P(x1,0,z1), P(x1,h,z1), P(x1,h,z0), rg, "rgba(180,186,255,.35)", 1);
      /* top (opening) */
      const a = P(x0,h,z0), b = P(x1,h,z0), c = P(x1,h,z1), d = P(x0,h,z1);
      quad(a, b, c, d, "#02030a");
      cx.save(); cx.shadowColor = `rgba(255,178,74,${.35 + gl*.6})`; cx.shadowBlur = 14 + gl*30;
      quad(a, b, c, d, null, `rgba(255,${190 - gl*20},${90 - gl*30},${.55 + gl*.45})`, 2 + gl*2); cx.restore();
      /* front face */
      const fg = cx.createLinearGradient(0, a.y, 0, P(x0,0,z0).y); fg.addColorStop(0,"#25358a"); fg.addColorStop(1,"#121c55");
      quad(P(x0,0,z0), P(x1,0,z0), b, a, fg, "rgba(180,186,255,.4)", 1);
      /* label */
      const m = P((x0+x1)/2, h*0.5, z0);
      cx.font = `600 ${Math.max(9, m.k*0.035)}px ui-monospace, Menlo, monospace`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = `rgba(255,${210 - gl*40},140,${.7 + gl*.3})`; cx.fillText("DROP", m.x, m.y);
      /* pulsing arrow when carrying */
      if (st.phase === "carry"){
        const t = performance.now()/400, top = P((x0+x1)/2, h + 0.3 + Math.sin(t)*0.04, (z0+z1)/2);
        cx.fillStyle = "rgba(255,200,110,.95)"; cx.beginPath();
        const s = top.k*0.05; cx.moveTo(top.x - s, top.y - s); cx.lineTo(top.x + s, top.y - s); cx.lineTo(top.x, top.y + s*0.6); cx.closePath(); cx.fill();
      }
    }

    function drawCap(c){
      const p = P(c.x, c.y, c.z), r = R*p.k;
      if (c.a <= 0) return;
      cx.save(); cx.globalAlpha = c.a;
      /* contact shadow */
      if (c.state !== "chute"){
        const f = P(c.x, 0, c.z), lift = Math.max(0, c.y - c.rest);
        cx.fillStyle = `rgba(0,0,0,${.45 - Math.min(.3, lift)})`;
        cx.beginPath(); cx.ellipse(f.x, f.y, r*1.05, r*0.32, 0, 0, Math.PI*2); cx.fill();
      }
      /* coin */
      const col = c.kind === "rare" ? ["#ffffff","#7db0ff","#1f4fd1","rgba(59,123,255,.9)"] : c.kind === "violet" ? ["#efe8ff","#9a7bff","#4b2fc0","rgba(154,123,255,.8)"] : ["#fff3cf","#ffb24a","#c06a10","rgba(255,178,74,.75)"];
      const cg = cx.createRadialGradient(p.x - r*.15, p.y - r*.18, r*.05, p.x, p.y, r*.48);
      cg.addColorStop(0,col[0]); cg.addColorStop(.5,col[1]); cg.addColorStop(1,col[2]);
      cx.shadowColor = col[3]; cx.shadowBlur = r*.9;
      cx.fillStyle = cg; cx.beginPath(); cx.ellipse(p.x, p.y, r*.46, r*.42, -0.3, 0, Math.PI*2); cx.fill();
      cx.shadowBlur = 0;
      /* glass shell */
      const sg = cx.createRadialGradient(p.x - r*.35, p.y - r*.4, r*.05, p.x, p.y, r);
      sg.addColorStop(0,"rgba(255,255,255,.75)"); sg.addColorStop(.18,"rgba(255,255,255,.12)"); sg.addColorStop(.7,"rgba(150,165,255,.08)"); sg.addColorStop(1,"rgba(220,228,255,.45)");
      cx.fillStyle = sg; cx.beginPath(); cx.arc(p.x, p.y, r, 0, Math.PI*2); cx.fill();
      cx.strokeStyle = "rgba(230,236,255,.45)"; cx.lineWidth = Math.max(1, r*.05); cx.stroke();
      /* seam */
      cx.strokeStyle = "rgba(230,236,255,.25)"; cx.beginPath(); cx.ellipse(p.x, p.y, r*.98, r*.22, 0, 0, Math.PI); cx.stroke();
      cx.restore();
    }

    function chromeStroke(a, b){
      const g = cx.createLinearGradient(a.x, a.y, b.x, b.y);
      g.addColorStop(0,"#f4f6fb"); g.addColorStop(.45,"#8f9ab6"); g.addColorStop(.6,"#ffffff"); g.addColorStop(1,"#6b7593");
      return g;
    }
    function prong(hx, hy, dir, L, open, lw, dim){
      const a = (0.18 + open*0.62) * dir;
      const p1 = { x: hx + Math.sin(a)*L*0.62, y: hy + Math.cos(a)*L*0.62 };
      const b = a - dir*(0.95 + (1-open)*0.35);
      const p2 = { x: p1.x + Math.sin(b)*L*0.5, y: p1.y + Math.cos(b)*L*0.5 };
      cx.lineCap = "round"; cx.lineJoin = "round";
      cx.strokeStyle = dim ? "#59627e" : chromeStroke({x:hx,y:hy}, p2); cx.lineWidth = lw;
      cx.beginPath(); cx.moveTo(hx, hy); cx.lineTo(p1.x, p1.y); cx.lineTo(p2.x, p2.y); cx.stroke();
    }
    function drawClaw(){
      const top = P(st.x, 1.1, st.z), h = P(st.x, st.y, st.z), k = h.k;
      /* bridge across the gantry at the claw's depth + carriage */
      line(P(-0.98,1.1,st.z), P(0.98,1.1,st.z), "rgba(210,218,240,.65)", Math.max(2, k*0.012));
      cx.fillStyle = chromeStroke({x:top.x - k*.05, y:top.y}, {x:top.x + k*.05, y:top.y});
      cx.fillRect(top.x - k*0.05, top.y - k*0.02, k*0.1, k*0.04);
      /* cable, swung by the pendulum (longer cable = bigger swing) */
      const dx = st.sw * k * (0.12 + (TOP - st.y)*0.35);
      line(top, { x:h.x + dx, y:h.y - k*0.04 }, "rgba(220,226,245,.85)", Math.max(1.2, k*0.005));
      cx.save(); cx.translate(dx, 0);
      const L = k*0.2, lw = Math.max(3, k*0.02), hy = h.y + k*0.025;
      /* back prong, then held capsule, then front prongs */
      prong(h.x, hy, 0.0001, L*0.82, st.open*0.3, lw*0.9, true);
      if (st.held) drawCap(st.held);
      prong(h.x - k*0.012, hy, -1, L, st.open, lw);
      prong(h.x + k*0.012, hy, 1, L, st.open, lw);
      /* hub */
      const hg = cx.createLinearGradient(h.x - k*.055, 0, h.x + k*.055, 0);
      hg.addColorStop(0,"#6b7593"); hg.addColorStop(.35,"#f4f6fb"); hg.addColorStop(.6,"#aab4cf"); hg.addColorStop(1,"#4b5470");
      cx.fillStyle = hg; cx.beginPath();
      if (cx.roundRect) cx.roundRect(h.x - k*.055, h.y - k*.065, k*.11, k*.095, k*.022); else cx.rect(h.x - k*.055, h.y - k*.065, k*.11, k*.095);
      cx.fill();
      cx.fillStyle = "rgba(59,123,255,.9)"; cx.beginPath(); cx.arc(h.x, h.y - k*.012, k*.01, 0, Math.PI*2); cx.fill();
      cx.restore();
    }
    function drawAim(){
      if (!(st.phase === "aim" || st.phase === "carry")) return;
      const r = R*P(st.x, 0, st.z).k*1.1;
      const under = topAt(st.x, st.z), on = P(st.x, under, st.z);
      cx.save();
      cx.setLineDash([3,5]); line(P(st.x, st.y - 0.12, st.z), on, "rgba(125,176,255,.45)", 1); cx.setLineDash([]);
      cx.strokeStyle = "rgba(125,176,255,.9)"; cx.lineWidth = 2; cx.shadowColor = "#3b7bff"; cx.shadowBlur = 12;
      cx.beginPath(); cx.ellipse(on.x, on.y, r, r*0.34, 0, 0, Math.PI*2); cx.stroke();
      cx.restore();
    }
    function drawParts(dt){
      parts = parts.filter(p => (p.life -= dt) > 0);
      parts.forEach(p => {
        p.vy += 900*dt; p.x += p.vx*dt; p.y += p.vy*dt;
        cx.globalAlpha = Math.min(1, p.life*2); cx.fillStyle = p.c;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI*2); cx.fill();
      });
      cx.globalAlpha = 1;
    }
    /* front cabinet panel under the glass (stream framing): dark body, LED strip, tiny brand plate */
    function drawCabinet(){
      const l = P(-1.2, 0, 0), r = P(1.2, 0, 0), y = Math.min(l.y, r.y);
      const g = cx.createLinearGradient(0, y, 0, H); g.addColorStop(0, "#111a3f"); g.addColorStop(.25, "#0a1030"); g.addColorStop(1, "#04060f");
      cx.fillStyle = g; cx.fillRect(0, y, W, H - y);
      glowLine({ x:0, y }, { x:W, y }, "rgba(125,176,255,.85)", 2);
      cx.fillStyle = "rgba(125,176,255,.08)"; cx.fillRect(0, y + 2, W, Math.max(6, (H - y)*0.08));
      cx.font = `600 ${Math.max(9, W*0.032)}px ui-monospace, Menlo, monospace`; cx.textAlign = "center"; cx.textBaseline = "middle";
      cx.fillStyle = "rgba(180,186,255,.32)"; cx.fillText("G R A B L A B     M A C H I N E  0 1", W/2, y + (H - y)*0.22);
    }
    function glassFront(){
      const g = cx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,"rgba(255,255,255,.05)"); g.addColorStop(.35,"rgba(255,255,255,0)"); g.addColorStop(.62,"rgba(180,186,255,.05)"); g.addColorStop(.66,"rgba(180,186,255,0)");
      cx.fillStyle = g; cx.fillRect(0,0,W,H);
      const v = cx.createRadialGradient(W/2, H/2, H*0.3, W/2, H/2, W*0.75); v.addColorStop(0,"rgba(0,0,0,0)"); v.addColorStop(1,"rgba(0,0,0,.45)");
      cx.fillStyle = v; cx.fillRect(0,0,W,H);
    }

    /* ---------- photo mode drawing ---------- */
    function capSprite(x, y, r, a){
      if (!PH.cap.complete) return;
      cx.save(); cx.globalAlpha = a == null ? 1 : a;
      cx.drawImage(PH.cap, x - r, y - r, r*2, r*2); cx.restore();
    }
    function drawPhoto(dt){
      const pl = PH.plate;
      cx.fillStyle = "#0b0a08"; cx.fillRect(0, 0, W, H);
      if (pl.complete && pl.naturalWidth) cx.drawImage(pl, PH.ox, PH.oy, PH.dw, PH.dh);
      /* gaps left where capsules were lifted out, dropped capsules lying on top */
      for (const c of caps){
        if (c.state === "held" && !c.hole) c.hole = { x:c.x, z:c.z };
        if (c.hole){
          const g = PH.G(c.hole.x, c.hole.z), r = PH.r(c.hole.z);
          const hg = cx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r*1.1);
          hg.addColorStop(0, "rgba(20,12,4,.62)"); hg.addColorStop(.7, "rgba(20,12,4,.35)"); hg.addColorStop(1, "rgba(20,12,4,0)");
          cx.fillStyle = hg; cx.beginPath(); cx.ellipse(g.x, g.y, r*1.1, r*.8, 0, 0, Math.PI*2); cx.fill();
        }
      }
      for (const c of caps){
        if (c.state === "fall") c.moved = true;
        if ((c.state === "pile" && c.moved) || c.state === "fall"){ const p = P(c.x, c.y, c.z); capSprite(p.x, p.y, PH.r(c.z)); }
      }
      /* the claw hangs on a cable from the gantry above the frame and swings like a pendulum */
      const r = PH.r(st.z), ch = r*2*4.1, g = PH.G(st.x, st.z);
      const hubY = g.y - ch*0.93 - (st.y - 0.2)*8.5*r, piv = -H*0.15, ang = -st.sw*0.32;
      /* soft shadow on the capsules, darker the lower the claw */
      const lowness = Math.max(0, Math.min(1, 1 - (st.y - 0.2)/0.8));
      const sg = cx.createRadialGradient(g.x, g.y, 0, g.x, g.y, r*2.2);
      sg.addColorStop(0, `rgba(10,6,2,${.18 + lowness*.4})`); sg.addColorStop(1, "rgba(10,6,2,0)");
      cx.fillStyle = sg; cx.beginPath(); cx.ellipse(g.x, g.y, r*2.2, r*.9, 0, 0, Math.PI*2); cx.fill();
      cx.save(); cx.translate(g.x, piv); cx.rotate(ang);
      const L = hubY - piv;
      const cg = cx.createLinearGradient(-2, 0, 2, 0); cg.addColorStop(0, "#5b5e66"); cg.addColorStop(.5, "#e9ecf2"); cg.addColorStop(1, "#6b6e76");
      cx.fillStyle = cg; cx.fillRect(-Math.max(1.2, r*.05), 0, Math.max(2.4, r*.1), L + 4);
      /* held capsule sits inside the closed fingers, behind them */
      const vis = st.held ? 0 : st.open, a = Math.max(0, Math.min(1, (vis - 0.3)/0.35));
      if (st.held) capSprite(0, L + ch*0.79, r*1.12);
      const draw = (im, ax, al) => { if (al <= 0.01 || !im.complete || !im.naturalWidth) return; const w = ch*im.naturalWidth/im.naturalHeight; cx.globalAlpha = al; cx.drawImage(im, -w*ax, L, w, ch); };
      cx.filter = "saturate(.85) sepia(.12) brightness(.96)";
      draw(PH.shut, .515, 1 - a); draw(PH.open, .49, a);
      cx.filter = "none"; cx.globalAlpha = 1;
      cx.restore();
      /* capsule going into the chute */
      for (const c of caps) if (c.state === "chute" && c.a > 0){ const p = P(c.x, c.y, c.z); capSprite(p.x, p.y, PH.r(c.z), c.a); }
      /* warm glow in the chute while carrying, flash on a win */
      const b = PH.box, bx = PH.ox + b[0]*PH.dw, by = PH.oy + b[1]*PH.dh, bw = (b[2]-b[0])*PH.dw, bh = (b[3]-b[1])*PH.dh;
      if (st.chuteGlow > 0.01){
        const gl = cx.createRadialGradient(bx + bw/2, by + bh/2, 0, bx + bw/2, by + bh/2, bw*.7);
        gl.addColorStop(0, `rgba(255,190,90,${st.chuteGlow*.35})`); gl.addColorStop(1, "rgba(255,190,90,0)");
        cx.fillStyle = gl; cx.fillRect(bx - bw*.3, by - bh, bw*1.6, bh*3);
      }
      if (st.phase === "carry"){
        const t = performance.now()/400, ax = bx + bw/2, ay = by - 26 + Math.sin(t)*5, s = 9;
        cx.fillStyle = "rgba(255,214,140,.95)"; cx.shadowColor = "rgba(255,178,74,.9)"; cx.shadowBlur = 14;
        cx.beginPath(); cx.moveTo(ax - s, ay - s); cx.lineTo(ax + s, ay - s); cx.lineTo(ax, ay + s*0.6); cx.closePath(); cx.fill(); cx.shadowBlur = 0;
      }
      drawParts(dt);
      /* camera feel: vignette */
      const v = cx.createRadialGradient(W/2, H*.45, H*.35, W/2, H/2, W*.72); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,.42)");
      cx.fillStyle = v; cx.fillRect(0, 0, W, H);
    }

    let camC = null;
    function render(dt){
      if (o.cam) camC = o.cam(W, H, st);
      cx.setTransform(dpr,0,0,dpr,0,0);
      const sh = st.shake > 0 ? (Math.random()-.5)*st.shake*8 : 0;
      cx.translate(sh, 0);
      if (M3){ S3.draw(st, caps); return; }
      if (PH){ drawPhoto(dt); return; }
      drawRoom(); drawChute();
      const list = caps.filter(c => c !== st.held && c.state !== "gone").sort((a,b) => b.z - a.z || a.y - b.y);
      let clawDrawn = false;
      for (const c of list){
        if (!clawDrawn && c.z < st.z - 0.02){ drawAim(); drawClaw(); clawDrawn = true; }
        drawCap(c);
      }
      if (!clawDrawn){ drawAim(); drawClaw(); }
      drawParts(dt);
      if (o.cabinet) drawCabinet();
      glassFront();
    }

    /* ---------- logic ---------- */
    function topAt(x, z){
      let best = 0;
      for (const c of caps){ if (c.state !== "pile") continue; const d = Math.hypot(c.x - x, (c.z - z)*DZ); if (d < R*1.1) best = Math.max(best, c.y + R*Math.sqrt(1 - Math.min(1,(d/(R*1.1))**2))); }
      return best;
    }
    function nearest(x, z){
      let best = null, bd = 1e9;
      for (const c of caps){ if (c.state !== "pile") continue; const d = Math.hypot(c.x - x, (c.z - z)*DZ) - (c.y - R)*0.4; if (d < bd){ bd = d; best = c; } }
      return { c: best, d: bd };
    }
    function inChute(){ return M3 ? st.x < CHUTE.x1 - 0.02 && st.z > CHUTE.z0 + 0.02 : st.x < CHUTE.x1 - 0.02 && st.z < CHUTE.z1 - 0.02; }
    function toast(t, ms){
      const node = el("#simToast"); node.textContent = t; node.classList.add("on");
      clearTimeout(node._t); node._t = setTimeout(() => node.classList.remove("on"), ms || 1300);
    }
    function hint(t){ const node = el("#simHint"); if (t){ node.textContent = t; node.classList.add("on"); } else node.classList.remove("on"); }
    function setTimer(){
      const s = Math.max(0, Math.ceil(st.t)), b = el("#simT");
      b.textContent = "0:" + String(s).padStart(2,"0"); b.classList.toggle("low", s <= 5 && st.t > 0);
      el("#simTb").style.transform = `scaleX(${Math.max(0, st.t/PLAY_S)})`;
    }
    function burst(x, y, n, cols){
      for (let i = 0; i < n; i++){
        const a = -Math.PI/2 + (Math.random()-.5)*2.2, v = 180 + Math.random()*420;
        parts.push({ x, y, vx: Math.cos(a)*v, vy: Math.sin(a)*v, r: 1.5 + Math.random()*3, life: .6 + Math.random()*.8, c: cols[i % cols.length] });
      }
    }
    function dropHeld(){
      const c = st.held; if (!c) return;
      st.held = null; c.state = "fall"; c.vy = 0;
      c.rest = R; /* settle on the floor or on a lower capsule */
      const t = topAt(c.x, c.z); if (t > R*1.2) c.rest = Math.min(R*2.3, t + R*0.3);
    }
    function lose(why){
      if (st.phase === "end") return;
      st.phase = "end"; api.why = why; grabBtn(false); hint("");
      setTimeout(() => { if (running) (o.onResult || result)(false); }, 1500);
    }

    function step(dt){
      /* falling / chute capsules */
      for (const c of caps){
        if (c.state === "fall"){
          c.vy -= 3.2*dt; c.y += c.vy*dt;
          if (c.y <= c.rest){ c.y = c.rest; if (Math.abs(c.vy) > 0.35){ c.vy = -c.vy*0.32; } else { c.vy = 0; c.state = "pile"; } }
        } else if (c.state === "chute"){
          c.vy -= 3.4*dt; c.y += c.vy*dt;
          if (c.y < CHUTE.h){ c.a = Math.max(0, c.a - dt*5); }
          if (c.y < CHUTE.h - 0.05 && !c.burst){
            c.burst = true; st.chuteGlow = 1; st.shake = 0.6;
            const p = P((CHUTE.x0 + CHUTE.x1)/2, CHUTE.h, (CHUTE.z0 + CHUTE.z1)/2);
            burst(p.x, p.y, 70, ["#ffe3ad","#ffb24a","#ffffff","#7db0ff","#9a7bff"]);
            st.phase = "end"; hint("");
            setTimeout(() => { if (running) (o.onResult || result)(true, c.kind); }, 1300);
          }
          if (c.a <= 0) c.state = "gone";
        }
      }
      /* pendulum: the claw hangs on a cable, so it lags behind the gantry and settles */
      const vx = (st.x - st.px) / Math.max(dt, 1e-3); st.px = st.x;
      st.sv += (-vx*0.22 - st.sw)*dt*38 - st.sv*dt*4.5; st.sw += st.sv*dt;
      st.sw = Math.max(-0.5, Math.min(0.5, st.sw));
      st.chuteGlow = Math.max(st.phase === "carry" ? 0.35 + Math.sin(performance.now()/260)*0.25 : 0, st.chuteGlow - dt*0.8);
      st.shake = Math.max(0, st.shake - dt*2);

      /* the 30 s clock */
      if (["aim","down","close","up","carry"].includes(st.phase)){
        st.t -= dt; setTimer();
        if (st.t <= 0){
          st.t = 0; setTimer();
          if (st.phase === "aim"){ toast("Time's up", 1400); lose("Time ran out"); return; }
          if (st.phase === "carry"){ st.open = 1; dropHeld(); toast("Time's up", 1400); lose("Time ran out with the capsule in the claw"); return; }
          st.timeUp = true;
        }
      }

      /* movement */
      if (st.phase === "aim" || st.phase === "carry"){
        let mx = joyV.x, mz = joyV.z;
        if (keys.ArrowLeft || keys.a) mx = -1; if (keys.ArrowRight || keys.d) mx = 1;
        if (keys.ArrowUp || keys.w) mz = 1; if (keys.ArrowDown || keys.s) mz = -1;
        if (PH && !(joyEl && joyEl.classList.contains("drag"))) tilt(mx, -mz);
        st.x = Math.max(-0.9, Math.min(0.9, st.x + mx*dt*0.85));
        st.z = Math.max(0.06, Math.min(0.94, st.z + mz*dt*0.62));
        if (st.held){ st.held.x = st.x; st.held.z = st.z; st.held.y = st.y - 0.15; }
        if (st.phase === "carry" && inChute()){
          st.phase = "release"; st.ph = 0; hint("");
        }
      }

      if (st.phase === "down"){
        st.open = Math.min(1, st.open + dt*3);
        st.y = Math.max(st.target, st.y - dt*0.8);
        if (st.y <= st.target){ st.phase = "close"; st.ph = 0; }
      } else if (st.phase === "close"){
        st.ph += dt;
        const n = nearest(st.x, st.z), reach = R*1.25;
        const hold = n.c && n.d < reach;
        st.open = Math.max(hold ? 0.58 : 0, 1 - st.ph/0.45);
        if (st.ph >= 0.55){
          if (hold){
            const p = 0.32 + 0.6*(1 - Math.max(0, n.d)/reach); /* centred = 92%, edge = 32% */
            st.held = n.c; n.c.state = "held"; st.shake = 0.28;
            st.slipAt = (o.auto || Math.random() < p) ? 0 : 0.45 + Math.random()*0.4;
          } else st.held = null;
          st.phase = "up";
        }
      } else if (st.phase === "up"){
        st.y = Math.min(TOP, st.y + dt*0.62);
        if (st.held){
          st.held.x = st.x; st.held.z = st.z; st.held.y = st.y - 0.15;
          if (st.slipAt && st.y > st.slipAt){ st.open = 0.95; dropHeld(); toast("Slipped!", 1200); st.slipAt = 0; }
        }
        if (st.y >= TOP){
          if (st.held){
            if (st.timeUp){ st.open = 1; dropHeld(); toast("Time's up", 1400); lose("Time ran out with the capsule in the claw"); return; }
            st.phase = "carry"; hint("Bring it to the drop chute"); grabBtn(true, "Drop");
          } else {
            if (st.timeUp || st.t <= 0){ toast("Time's up", 1400); lose(st.open > 0.4 ? "It slipped at the last second" : "Time ran out"); return; }
            st.phase = "aim"; st.open = 0; grabBtn(true);
            if (!el("#simToast").classList.contains("on")) toast("Missed. Again!", 1100);
          }
        }
      } else if (st.phase === "release"){
        st.ph += dt;
        /* glide to the centre of the chute, then open */
        const tx = CHUTE.cx != null ? CHUTE.cx : (CHUTE.x0 + CHUTE.x1)/2 + 0.04, tz = CHUTE.cz != null ? CHUTE.cz : (CHUTE.z0 + CHUTE.z1)/2, e = Math.min(1, dt*7);
        st.x += (tx - st.x)*e; st.z += (tz - st.z)*e;
        if (st.held){ st.held.x = st.x; st.held.z = st.z; }
        if (st.ph > 0.4) st.open = Math.min(1, st.open + dt*4);
        if (st.held && st.ph > 0.5){ const c = st.held; st.held = null; c.state = "chute"; c.vy = 0; c.x = st.x; c.z = st.z; }
      } else if (st.phase === "aim" && st.open > 0){ st.open = Math.max(0, st.open - dt*2); }
    }

    function grab(){
      if (st.phase === "aim"){
        st.phase = "down";
        const n = nearest(st.x, st.z);
        const top = n.c && n.d < R*1.25 ? n.c.y + R*0.25 : 0.02;
        st.target = top + 0.1;
        grabBtn(false); hint("");
        const b = el("#simGrab"); b.classList.add("press"); setTimeout(() => b.classList.remove("press"), 150);
      } else if (st.phase === "carry"){
        /* manual drop away from the chute: the capsule falls back on the pile */
        st.open = 1; dropHeld(); toast("Dropped", 1000); st.phase = "aim"; grabBtn(true); hint("");
      }
    }
    function grabBtn(on, label){ const b = el("#simGrab"); b.disabled = !on; (b.querySelector("span") || b).textContent = label || "Grab"; }

    /* autopilot for the demo: pick a capsule on top of the pile, line up, grab, carry it to the chute */
    let ap = null;
    function pilot(dt){
      if (!ap) return;
      const move = (x, z) => { joyV.x = x; joyV.z = z; if (o.onMove) o.onMove(x, z); };
      if (ap.wait > 0){ ap.wait -= dt; move(0, 0); if (ap.wait <= 0 && ap.grabNext){ ap.grabNext = false; grab(); } return; }
      let tx, tz;
      if (st.phase === "aim"){
        if (!ap.tgt || ap.tgt.state !== "pile"){
          const pick = caps.filter(c => c.state === "pile" && c.x > -0.25 && c.x < 0.5 && c.z > 0.3 && c.z < 0.8).sort((a, b) => b.y - a.y);
          ap.tgt = pick[0] || caps.find(c => c.state === "pile");
        }
        tx = ap.tgt.x; tz = ap.tgt.z;
      } else if (st.phase === "carry"){ tx = CHUTE.cx != null ? CHUTE.cx : (CHUTE.x0 + CHUTE.x1)/2; tz = CHUTE.cz != null ? CHUTE.cz : (CHUTE.z0 + CHUTE.z1)/2; }
      else { move(0, 0); return; }
      const dx = tx - st.x, dz = tz - st.z;
      move(Math.abs(dx) > 0.008 ? Math.max(-1, Math.min(1, dx*4)) : 0, Math.abs(dz) > 0.008 ? Math.max(-1, Math.min(1, dz*4)) : 0);
      if (st.phase === "aim" && Math.abs(dx) < 0.012 && Math.abs(dz) < 0.012){ ap.wait = 0.4; ap.grabNext = true; }
    }
    function frame(now){
      const dt = Math.min(0.1, (now - last)/1000 || 0); last = now;
      if (o.auto) pilot(dt);
      if (st.phase !== "count") step(dt);
      render(dt);
    }
    function loop(now){
      if (!running) return;
      if (o.paused && o.paused()) last = now;
      else { if (cv.clientWidth && (Math.abs(cv.clientWidth - W) > 1 || Math.abs(cv.clientHeight - H) > 1)) layout(); frame(now); }
      raf = requestAnimationFrame(loop);
    }
    /* watchdog: if rAF is throttled (background pane, power saving) keep the clock and the claw honest */
    setInterval(() => { if (running && !(o.paused && o.paused()) && performance.now() - last > 120) frame(performance.now()); }, 100);

    function countdown(){
      const q = el("#simQ"), n = el("#simQn");
      q.classList.add("on"); let k = 3;
      const tick = () => {
        if (!running) return;
        if (k === 0){ q.classList.remove("on"); st.phase = "aim"; grabBtn(true); hint("Steer over a capsule, then grab"); setTimeout(() => { if (st.phase === "aim") hint(""); }, 3600); return; }
        n.textContent = k; n.classList.remove("pop"); void n.offsetWidth; n.classList.add("pop"); k--;
        setTimeout(tick, 800);
      };
      tick();
    }

    /* joystick : drag the knob, or press and hold an edge */
    function joystick(){
      const j = el("#simJoy");
      let id = null;
      const setFrom = e => {
        const r = j.getBoundingClientRect(), max = r.width*0.32;
        let dx = e.clientX - (r.left + r.width/2), dy = e.clientY - (r.top + r.height/2);
        const l = Math.hypot(dx, dy); if (l > max){ dx *= max/l; dy *= max/l; }
        const ux = dx/max, uy = dy/max; tilt(ux, uy);
        joyV.x = Math.abs(ux) > 0.18 ? ux : 0; joyV.z = Math.abs(uy) > 0.18 ? -uy : 0;
      };
      j.addEventListener("pointerdown", e => { id = e.pointerId; j.setPointerCapture(id); j.classList.add("drag"); setFrom(e); e.preventDefault(); });
      j.addEventListener("pointermove", e => { if (e.pointerId === id) setFrom(e); });
      const end = e => { if (e.pointerId !== id) return; id = null; j.classList.remove("drag"); tilt(0, 0); joyV.x = joyV.z = 0; };
      j.addEventListener("pointerup", end); j.addEventListener("pointercancel", end);
    }

    const WASD = { w:"ArrowUp", a:"ArrowLeft", s:"ArrowDown", d:"ArrowRight" };
    function keyCap(k, on){ const c = root && root.querySelector(`.keys kbd[data-k="${WASD[k] || k}"]`); if (c) c.classList.toggle("on", on); }
    const api = {
      why: "",
      init(){
        cv = el("#simCv"); cx = cv.getContext("2d");
        if (o.auto){ addEventListener("resize", () => { if (running) layout(); }); return; }
        joystick();
        el("#simGrab").addEventListener("click", grab);
        addEventListener("keydown", e => {
          if (!running) return;
          const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
          if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","w","a","s","d"].includes(k)){ keys[k] = true; e.preventDefault(); }
          keyCap(k, true);
          if (k === " " || k === "Enter"){ e.preventDefault(); if (!e.repeat) grab(); }
        });
        addEventListener("keyup", e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = false; keyCap(k, false); });
        addEventListener("blur", () => { keys = {}; });
        addEventListener("resize", () => { if (running) layout(); });
      },
      start(){
        /* the full simulator plays on the 3D machine once it has loaded */
        M3 = !o.auto && !o.cam && !!S3 && S3.ok(); R = M3 ? S3m.CAP_R : R2; CHUTE = M3 ? S3m.CHUTE : CHUTE0; DZ = M3 ? 2 : 1.15;
        if (root && !o.auto && !o.cam){ root.classList.toggle("s3-on", M3); }
        el("#hudProj").textContent = proj.name; el("#hudLogo").src = proj.logo;
        reset(); setTimer(); grabBtn(false); hint("");
        running = true; layout(); last = performance.now();
        cancelAnimationFrame(raf); raf = requestAnimationFrame(loop);
        if (o.auto){ st.phase = "aim"; grabBtn(true); ap = { wait:0.9 + (o.jitter ? Math.random()*o.jitter : 0), tgt:null, grabNext:false }; } else countdown();
      },
      stop(){ running = false; cancelAnimationFrame(raf); keys = {}; joyV = { x:0, z:0 }; }
    };
    if (!o.auto) window.__sim = { get st(){ return st; }, get caps(){ return caps; }, grab, step: dt => step(dt) };
    api.isRunning = () => running;
    return api;
  }
  /* real-photo assets for the full simulator + the mapping from game space to that photo */
  function photoKit(){
    const img = f => { const i = new Image(); i.decoding = "async"; i.src = "assets/play/" + f; return i; };
    const K = { plate:img("plate.webp"), open:img("claw-open.webp"), shut:img("claw-closed.webp"), cap:img("cap.webp"),
      ox:0, oy:0, dw:1, dh:1,
      /* pile surface in plate coords (0..1): front edge runs off the bottom, back edge under the gantry */
      FL:[.05, 1.02], FR:[.97, 1.02], BL:[.23, .02], BR:[.73, .05],
      box:[.09, .54, .31, .62]   /* opening of the acrylic chute */
    };
    const PW = 1920, PHh = 1086;
    K.fit = (W, H) => { const s = Math.max(W/PW, H/PHh); K.dw = PW*s; K.dh = PHh*s; K.ox = (W - K.dw)*0.12; K.oy = (H - K.dh)*0.35; };
    K.G = (x, z) => {
      const u = (x + 1)/2, L = [K.FL[0] + (K.BL[0]-K.FL[0])*z, K.FL[1] + (K.BL[1]-K.FL[1])*z], R = [K.FR[0] + (K.BR[0]-K.FR[0])*z, K.FR[1] + (K.BR[1]-K.FR[1])*z];
      return { x: K.ox + (L[0] + (R[0]-L[0])*u)*K.dw, y: K.oy + (L[1] + (R[1]-L[1])*u)*K.dh };
    };
    K.r = z => (0.029 + (0.012 - 0.029)*z) * K.dw;
    return K;
  }
  const game = makeGame();

  /* ---------------- confetti ---------------- */
  const confetti = (function(){
    let cv, cx, ps = [], raf = 0, until = 0;
    const COLS = { gold:["#ffb24a","#ffe3ad","#ffffff","#3b7bff","#b4baff"], violet:["#9a7bff","#c9bfff","#ffffff","#3b7bff","#ffb24a"], rare:["#3b7bff","#d6e4ff","#ffffff","#7db0ff","#ffb24a"] };
    function size(){ const d = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth*d; cv.height = innerHeight*d; cx.setTransform(d,0,0,d,0,0); }
    function add(n, cols, fromTop){
      for (let i = 0; i < n; i++){
        const a = -Math.PI/2 + (Math.random()-.5)*1.6, v = 500 + Math.random()*700;
        ps.push(fromTop
          ? { x: Math.random()*innerWidth, y: -20 - Math.random()*200, vx:(Math.random()-.5)*60, vy: 60 + Math.random()*120, w: 6 + Math.random()*6, h: 3 + Math.random()*4, r: Math.random()*6, vr:(Math.random()-.5)*10, c: cols[i % cols.length], life: 6 }
          : { x: innerWidth/2 + (Math.random()-.5)*120, y: innerHeight*0.42, vx: Math.cos(a)*v, vy: Math.sin(a)*v, w: 6 + Math.random()*7, h: 3 + Math.random()*4, r: Math.random()*6, vr:(Math.random()-.5)*12, c: cols[i % cols.length], life: 5 });
      }
    }
    function frame(){
      cx.clearRect(0,0,innerWidth,innerHeight);
      const dt = 1/60;
      ps = ps.filter(p => (p.life -= dt) > 0 && p.y < innerHeight + 40);
      for (const p of ps){
        p.vy += 520*dt; p.vx *= 0.985; p.vy = Math.min(p.vy, 380); p.x += p.vx*dt; p.y += p.vy*dt; p.r += p.vr*dt;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.scale(1, Math.cos(p.r*1.7));
        cx.fillStyle = p.c; cx.fillRect(-p.w/2, -p.h/2, p.w, p.h); cx.restore();
      }
      if (ps.length || performance.now() < until) raf = requestAnimationFrame(frame); else cx.clearRect(0,0,innerWidth,innerHeight);
    }
    return {
      burst(kind){
        cv = $("#simConf", root); cx = cv.getContext("2d"); size();
        const cols = COLS[kind] || COLS.gold;
        add(180, cols, false); setTimeout(() => add(160, cols, true), 350); setTimeout(() => add(90, cols, false), 900);
        until = performance.now() + 2000; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame);
      },
      stop(){ ps = []; cancelAnimationFrame(raf); if (cx) cx.clearRect(0,0,innerWidth,innerHeight); }
    };
  })();

  /* ---------------- hero window : the real game playing itself in the browser mockup ---------------- */
  (function(){
    const cvh = document.getElementById("phCv");
    if (!cvh) return;
    const won = document.getElementById("phWon"), knob = document.querySelector(".bwin .stick i");
    const map = { "#simCv": cvh, "#simT": document.getElementById("phTimer"), "#simGrab": document.querySelector(".ph-grab") };
    const p0 = PROJECTS[0];
    let visible = false;
    const hero = makeGame({
      auto: true,
      el: s => map[s],
      paused: () => !visible || document.body.classList.contains("sim-lock"),
      onMove: (x, z) => { if (knob) knob.style.transform = `translate(${(x*9).toFixed(1)}px,${(-z*9).toFixed(1)}px)`; },
      onResult: (win, kind) => {
        if (won){
          won.querySelector("b").textContent = kind === "rare" ? p0.rare : `+${fmt(kind === "violet" ? p0.violet : p0.gold)} ${p0.tk}`;
          won.classList.add("on");
        }
        setTimeout(() => { if (won) won.classList.remove("on"); hero.start(); }, 2800);
      }
    });
    hero.init();
    new IntersectionObserver(es => {
      visible = es[0].isIntersecting;
      if (visible && !hero.isRunning()) hero.start();
    }, { threshold: 0.15 }).observe(cvh);
  })();

  /* ---------------- hero window : real remote-play footage, HUD synced to the clip ---------------- */
  (function(){
    const v = document.getElementById("phVid"); if (!v) return;
    const tm = document.getElementById("phTimer"), gb = document.querySelector(".bwin .ph-grab"), knob = document.querySelector(".bwin .stick i");
    /* clip beats (s): steering 0 to 2.4, grab pressed ~2.6, claw grabs a capsule and drops it in the chute */
    v.addEventListener("timeupdate", () => {
      const t = v.currentTime;
      if (tm) tm.textContent = "0:" + String(Math.max(0, 30 - Math.floor(t * 1.5))).padStart(2, "0");
      if (gb) gb.classList.toggle("press", t > 2.45 && t < 2.85);
      if (knob) knob.classList.toggle("steer", t < 2.4);
    });
  })();

  /* ---------------- live viewer counts : drift a little every couple of seconds ---------------- */
  setInterval(() => {
    document.querySelectorAll(".vn").forEach(el => {
      if (!el.offsetParent) return;                       // not on screen: leave it
      const base = +(el.dataset.base || (el.dataset.base = el.dataset.n)), n = +el.dataset.n;
      const step = Math.max(2, Math.round(base * 0.012)), d = Math.round((Math.random() - 0.45) * step * 2);
      const next = Math.min(Math.round(base * 1.35), Math.max(Math.round(base * 0.75), n + d));
      if (next === n) return;
      el.dataset.n = next; el.textContent = fmt(next);
      el.classList.remove("tick"); void el.offsetWidth; el.classList.add("tick");
    });
  }, 2200);

  /* ---------------- swapper : real SOL to USDC swap through Jupiter's official widget, loaded on first use.
     USDC is locked as the output and the play price is pre-filled; the user signs in their own wallet. ---------------- */
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", SOL_MINT = "So11111111111111111111111111111111111111112";
  let jupLoad = null;
  function loadJupiter(){
    if (!jupLoad) jupLoad = new Promise((res, rej) => {
      const sc = document.createElement("script"); sc.src = "https://plugin.jup.ag/plugin-v1.js"; sc.async = true;
      sc.onload = () => res(window.Jupiter); sc.onerror = () => { jupLoad = null; rej(new Error("Jupiter failed to load")); };
      document.head.appendChild(sc);
    });
    return jupLoad;
  }
  /* the widget reads initialAmount as SOL in lamports, so convert the play price (USDC) at the live SOL price, plus 2% buffer */
  async function solFor(usdc){
    try {
      const j = await (await fetch(`https://lite-api.jup.ag/price/v3?ids=${SOL_MINT}`)).json();
      const px = j && j[SOL_MINT] && j[SOL_MINT].usdPrice;
      return px ? String(Math.ceil(usdc / px * 1.02 * 1e9)) : undefined;
    } catch (e) { return undefined; }
  }
  /* Jupiter (Solana): the widget reads initialAmount in the input token's smallest unit */
  async function openJupiter(inputMint, amountRaw){
    try {
      const J = await loadJupiter();
      if (document.getElementById("jupiter-plugin-instance")) { try { J.close(); } catch (e) {} }
      const formProps = { swapMode: "ExactIn", initialInputMint: inputMint, initialOutputMint: USDC_MINT, fixedMint: USDC_MINT };
      if (amountRaw) formProps.initialAmount = amountRaw;
      J.init({ displayMode: "modal", formProps, branding: { name: "Grablab", logoUri: location.origin + "/assets/brand/mark-chrome-256.png" } });
    } catch (e) { alert("The swap could not load. Try again in a moment, or swap on jup.ag."); }
  }

  /* ---------------- swap picker : chain first, then coin, biggest first; everything arrives as USDC on Solana ---------------- */
  const NATIVE = "0x0000000000000000000000000000000000000000", DB_SOLANA = 7565164;
  const LG = n => `assets/chains/${n}`;
  const SW_CHAINS = [
    { id:"solana", name:"Solana", logo:LG("solana.jpg"), note:"Fastest, lowest fees", tokens:[
      { sym:"SOL", name:"Solana", logo:LG("solana.jpg"), mint:SOL_MINT, dec:9, px:true },
      { sym:"USDT", name:"Tether", logo:LG("usdt.svg"), mint:"Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", dec:6, usd:true },
      { sym:"JUP", name:"Jupiter", logo:LG("jup.png"), mint:"JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN" },
      { sym:"BONK", name:"Bonk", logo:LG("bonk.png"), mint:"DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" } ] },
    { id:1, name:"Ethereum", logo:LG("ethereum.jpg"), tokens:[
      { sym:"ETH", name:"Ether", logo:LG("ethereum.jpg"), addr:NATIVE },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
      { sym:"USDT", name:"Tether", logo:LG("usdt.svg"), addr:"0xdAC17F958D2ee523a2206206994597C13D831ec7" } ] },
    { id:8453, name:"Base", logo:LG("base.svg"), tokens:[
      { sym:"ETH", name:"Ether", logo:LG("ethereum.jpg"), addr:NATIVE },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" } ] },
    { id:56, name:"BNB Chain", logo:LG("binance.jpg"), tokens:[
      { sym:"BNB", name:"BNB", logo:LG("binance.jpg"), addr:NATIVE },
      { sym:"USDT", name:"Tether", logo:LG("usdt.svg"), addr:"0x55d398326f99059fF775485246999027B3197955" },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" } ] },
    { id:42161, name:"Arbitrum", logo:LG("arbitrum.jpg"), tokens:[
      { sym:"ETH", name:"Ether", logo:LG("ethereum.jpg"), addr:NATIVE },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0xaf88d065e77c8cC2239327C5EDb3A432268e5831" },
      { sym:"USDT", name:"Tether", logo:LG("usdt.svg"), addr:"0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9" } ] },
    { id:137, name:"Polygon", logo:LG("polygon.jpg"), tokens:[
      { sym:"POL", name:"Polygon", logo:LG("polygon.jpg"), addr:NATIVE },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" },
      { sym:"USDT", name:"Tether", logo:LG("usdt.svg"), addr:"0xc2132D05D31c914a87C6611C10748AEb04B58e8F" } ] },
    { id:10, name:"Optimism", logo:LG("optimism.jpg"), tokens:[
      { sym:"ETH", name:"Ether", logo:LG("ethereum.jpg"), addr:NATIVE },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85" } ] },
    { id:43114, name:"Avalanche", logo:LG("avalanche.jpg"), tokens:[
      { sym:"AVAX", name:"Avalanche", logo:LG("avalanche.jpg"), addr:NATIVE },
      { sym:"USDC", name:"USD Coin", logo:LG("usdc.png"), addr:"0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E" } ] }
  ];
  /* deBridge widget colours, matched to the site */
  const DB_STYLES = btoa(JSON.stringify({ appBackground:"#0b0e1b", appAccentBg:"#121a36", chartBg:"#0b0e1b", primary:"#b4baff", secondary:"#1e2648",
    badge:"#7d84ff", borderColor:"#262e55", borderRadius:16, fontColor:"#f3f4fb", fontColorAccent:"#9cc0ff", fontFamily:"Inter" }));
  let swEl = null, dbLoad = null;
  function loadDeBridge(){
    if (!dbLoad) dbLoad = new Promise((res, rej) => {
      const sc = document.createElement("script"); sc.src = "https://app.debridge.com/assets/scripts/widget.js"; sc.async = true;
      sc.onload = () => res(window.deBridge); sc.onerror = () => { dbLoad = null; rej(new Error("deBridge failed to load")); };
      document.head.appendChild(sc);
    });
    return dbLoad;
  }
  function swapUI(){
    if (swEl) return swEl;
    swEl = document.createElement("div");
    swEl.className = "swp"; swEl.hidden = true;
    swEl.innerHTML = `<div class="swp-sheet" role="dialog" aria-modal="true" aria-label="Get USDC to play">
      <div class="swp-h"><button class="swp-back" type="button" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <div><b class="swp-t">Get USDC to play</b><span class="swp-s">Pick where your money is. It arrives as USDC on Solana.</span></div>
        <button class="swp-x" type="button" aria-label="Close">×</button></div>
      <div class="swp-body"></div></div>`;
    document.body.appendChild(swEl);
    swEl.addEventListener("click", e => { if (e.target === swEl || e.target.closest(".swp-x")) closeSwapUI(); });
    swEl.querySelector(".swp-back").addEventListener("click", () => chainStep());
    addEventListener("keydown", e => { if (e.key === "Escape" && swEl && !swEl.hidden) closeSwapUI(); });
    return swEl;
  }
  function closeSwapUI(){ if (swEl){ swEl.hidden = true; swEl.querySelector(".swp-body").innerHTML = ""; } }
  function setHead(title, sub, back){
    swEl.querySelector(".swp-t").textContent = title; swEl.querySelector(".swp-s").textContent = sub;
    swEl.querySelector(".swp-back").style.display = back ? "" : "none";
  }
  function chainStep(){
    setHead("Get USDC to play", "Pick where your money is. It arrives as USDC on Solana.", false);
    swEl.querySelector(".swp-body").innerHTML = `<div class="swp-chains">${SW_CHAINS.map((c, i) => `
      <button class="swp-chain${c.note ? " top" : ""}" type="button" data-c="${i}"><img src="${c.logo}" alt="" /><span><b>${c.name}</b>${c.note ? `<small>${c.note}</small>` : ""}</span>${c.note ? `<em>Recommended</em>` : ""}</button>`).join("")}</div>`;
    swEl.querySelectorAll(".swp-chain").forEach(b => b.addEventListener("click", () => tokenStep(SW_CHAINS[+b.dataset.c])));
  }
  function tokenStep(c){
    setHead(`Pay from ${c.name}`, "Pick the coin you hold.", true);
    swEl.querySelector(".swp-body").innerHTML = `<div class="swp-tokens">${c.tokens.map((t, i) => `
      <button class="swp-tok" type="button" data-t="${i}"><img src="${t.logo}" alt="" /><span><b>${t.sym}</b><small>${t.name}</small></span><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>`).join("")}
      <button class="swp-tok other" type="button" data-t="-1"><span class="swp-any">+</span><span><b>Another coin</b><small>Search any token on ${c.name}</small></span><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>`;
    swEl.querySelectorAll(".swp-tok").forEach(b => b.addEventListener("click", () => pickToken(c, +b.dataset.t < 0 ? null : c.tokens[+b.dataset.t])));
  }
  async function pickToken(c, t){
    const usdc = (proj && proj.price) || 5;
    if (c.id === "solana"){
      let raw;
      if (t && t.px) raw = await solFor(usdc);
      else if (t && t.usd) raw = String(Math.ceil(usdc * 1.02 * 10 ** t.dec));
      closeSwapUI(); openJupiter(t ? t.mint : SOL_MINT, raw); return;
    }
    setHead(`${t ? t.sym : "Any coin"} on ${c.name} to USDC on Solana`, "Bridged and swapped by deBridge. You sign in your own wallet.", true);
    const body = swEl.querySelector(".swp-body");
    body.innerHTML = `<div class="swp-db" id="glDebridge"><span class="swp-load">Loading the bridge…</span></div>`;
    try {
      const DB = await loadDeBridge();
      const box = body.querySelector("#glDebridge");
      box.innerHTML = "";
      const cfg = { v:"1", element:"glDebridge", mode:"deswap", title:"Grablab", theme:"dark", styles:DB_STYLES, lang:"en",
        width: Math.round(box.clientWidth) || 420, height: 560,
        inputChain: c.id, outputChain: DB_SOLANA, outputCurrency: USDC_MINT };
      if (t) cfg.inputCurrency = t.addr;
      if (t && /^USD/.test(t.sym)) cfg.amount = (usdc * 1.02).toFixed(2);   /* stablecoins: roughly 1:1, plus 2% for fees */
      await DB.widget(cfg);
    } catch (e) {
      body.innerHTML = `<p class="swp-err">The bridge could not load. Try again in a moment, or use app.debridge.com.</p>`;
    }
  }
  function openSwapUI(){ swapUI(); chainStep(); swEl.hidden = false; }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-swap]"); if (!b) return;
    e.preventDefault(); e.stopPropagation(); openSwapUI();
  });

  /* ---------------- entry points ---------------- */
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-sim], a[href='#simulate']");
    if (!t || e.target.closest(".bwin .stick")) return;
    e.preventDefault(); open();
  });
  if (location.hash === "#simulate") addEventListener("load", () => setTimeout(open, 300));
  window.GrabSim = { open, close };
})();
