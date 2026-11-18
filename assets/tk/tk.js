/* Token page: every scene is a small canvas loop. Only visible scenes run. Launch values live in TK. */
const TK={ca:"",buy:"account.html#swap",machine:"https://machine.fun/",chart:ca=>`https://dexscreener.com/solana/${ca}?embed=1&theme=dark&trades=0&info=0`};
(function(){
const TAU=Math.PI*2,clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),lerp=(a,b,t)=>a+(b-a)*t,ease=x=>x*x*(3-2*x),seg=(t,a,b)=>ease(clamp((t-a)/(b-a)));
const MONO="ui-monospace,SFMono-Regular,Menlo,monospace",ANT="Anton,Impact,sans-serif",SAT="Satoshi,system-ui,sans-serif";
const INK="#f3f4fb",MUTE="#a7b0cc",BLUE="#7db0ff",LIGHT="#d6e4ff",LINE="rgba(180,196,255,.2)";
const img=s=>{const i=new Image();i.src=s;return i};
const COIN=img("assets/tk/coin-blue.webp"),SOL=img("assets/chains/solana-mark.svg"),USDC=img("assets/chains/usdc.png"),BONK=img("assets/chains/bonk.png");
const ok=i=>i.complete&&i.naturalWidth>0;
const sprite=(c0,c1)=>{const s=document.createElement("canvas");s.width=s.height=64;const x=s.getContext("2d"),g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,c0);g.addColorStop(1,c1);x.fillStyle=g;x.fillRect(0,0,64,64);return s};
const S_WHITE=sprite("rgba(255,255,255,.95)","rgba(180,210,255,0)"),S_BLUE=sprite("rgba(125,176,255,.85)","rgba(59,123,255,0)"),S_DEEP=sprite("rgba(40,90,240,.6)","rgba(31,79,209,0)");
function tx(c,s,x,y,size,font=MONO,color=MUTE,align="left",ls=0){c.font=`${font===SAT?700:400} ${size}px ${font}`;c.fillStyle=color;c.textAlign=align;c.textBaseline="middle";if("letterSpacing" in c)c.letterSpacing=ls+"px";c.fillText(s,x,y);if("letterSpacing" in c)c.letterSpacing="0px"}
const usd=(c,x,y,r,sx=1,a=1)=>{if(!ok(USDC))return;c.save();c.globalAlpha*=a;c.translate(x,y);c.scale(sx,1);c.beginPath();c.arc(0,0,r,0,TAU);c.clip();c.drawImage(USDC,-r,-r,r*2,r*2);c.restore()};
const coin=(c,x,y,r,sx=1,a=1)=>{if(!ok(COIN))return;c.save();c.globalAlpha*=a;c.translate(x,y);c.scale(sx,1);c.drawImage(COIN,-r,-r,r*2,r*2);c.restore()};
const pic=(c,i,x,y,r,a=1)=>{if(!ok(i))return;const h=r*i.naturalHeight/i.naturalWidth;c.save();c.globalAlpha*=a;c.drawImage(i,x-r,y-h,r*2,h*2);c.restore()};
const glow=(c,x,y,r,a=1,s=S_BLUE)=>{c.save();c.globalCompositeOperation="lighter";c.globalAlpha=clamp(a);c.drawImage(s,x-r,y-r,r*2,r*2);c.restore()};
const rr=(c,x,y,w,h,r)=>{c.beginPath();c.roundRect(x,y,w,h,r)};
const chrome=(c,x0,y0,x1,y1)=>{const g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,"#fff");g.addColorStop(.3,"#d6e4ff");g.addColorStop(.5,"#3b7bff");g.addColorStop(.62,"#e8f0ff");g.addColorStop(1,"#1f4fd1");return g};
const line=(c,x0,y0,x1,y1,col=LINE,w=1,dash)=>{c.save();c.strokeStyle=col;c.lineWidth=w;if(dash)c.setLineDash(dash);c.beginPath();c.moveTo(x0,y0);c.lineTo(x1,y1);c.stroke();c.restore()};
function lockIcon(c,x,y,s,open,a=1){c.save();c.globalAlpha*=a;c.translate(x,y);c.strokeStyle=open?BLUE:MUTE;c.lineWidth=1.7*s;c.save();if(open){c.translate(3*s*open,-3*s*open);c.rotate(.5*open)}c.beginPath();c.arc(0,-3.5*s,3.6*s,Math.PI,0);c.lineTo(3.6*s,-1*s);c.stroke();c.restore();c.fillStyle=open?BLUE:MUTE;rr(c,-5.5*s,-1.5*s,11*s,9*s,2*s);c.fill();c.restore()}
function ticketShape(c,x,y,w,h){const r=7,n=5;c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h/2-n);c.arc(x+w,y+h/2,n,-Math.PI/2,Math.PI/2,true);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+h/2+n);c.arc(x,y+h/2,n,Math.PI/2,-Math.PI/2,true);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath()}
/* blue fire: additive embers, one pool per scene */
function Fire(){const p=[];return{add(x,y,w,n=1,sp=1,sz=1){for(let i=0;i<n;i++)p.push({x:x+(Math.random()-.5)*w,y,vx:(Math.random()-.5)*16,vy:-(36+Math.random()*60)*sp,l:0,m:.45+Math.random()*.5,s:(7+Math.random()*12)*sz})},draw(c,dt){c.save();c.globalCompositeOperation="lighter";for(let i=p.length-1;i>=0;i--){const e=p[i];e.l+=dt;if(e.l>e.m){p.splice(i,1);continue}e.x+=e.vx*dt;e.y+=e.vy*dt;const u=e.l/e.m,r=e.s*(1-u*.65);c.globalAlpha=(1-u)*.5;c.drawImage(u<.12?S_WHITE:u<.6?S_BLUE:S_DEEP,e.x-r,e.y-r,r*2,r*2)}c.restore()}}}
const scenes=[];
function mount(el,W,H,draw,o={}){if(!el)return;const cv=document.createElement("canvas");cv.className="tk-cv";el.appendChild(cv);const c=cv.getContext("2d");c.imageSmoothingQuality="high";const s={el,cv,c,W,H,draw,t:0,on:false,st:{},o,still:o.still||0};
  s.size=()=>{const w=el.clientWidth||W;s.narrow=o.alt&&w<o.alt.below;const lw=s.narrow?o.alt.W:W,lh=s.narrow?o.alt.H:H;if(!o.free)el.style.aspectRatio=`${lw}/${lh}`;const dpr=Math.min(2,devicePixelRatio||1),h=w*lh/lw;cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);s.k=w/lw*dpr;s.lw=lw;s.lh=lh};
  s.p={x:0,y:0,in:false,down:false};
  if(o.live){const pos=e=>{const r=cv.getBoundingClientRect();s.p.x=(e.clientX-r.left)/r.width*s.lw;s.p.y=(e.clientY-r.top)/r.height*s.lh};cv.style.touchAction=o.drag?"pan-y":"auto";
    cv.addEventListener("pointermove",e=>{pos(e);s.p.in=true});cv.addEventListener("pointerleave",()=>{s.p.in=false;s.p.down=false});
    cv.addEventListener("pointerdown",e=>{pos(e);s.p.in=true;s.p.down=true;s.clicked=true;if(o.drag)cv.setPointerCapture(e.pointerId)});
    cv.addEventListener("pointerup",e=>{s.p.down=false;if(e.pointerType!=="mouse")setTimeout(()=>s.p.in=false,60)});cv.addEventListener("pointercancel",()=>{s.p.down=false;s.p.in=false})}
  s.size();scenes.push(s);return s}
function render(s,dt){const c=s.c;c.setTransform(s.k,0,0,s.k,0,0);c.imageSmoothingQuality="high";c.clearRect(0,0,s.lw,s.lh);s.draw(c,s.t,dt,s.st,s)}
function fade(c,W,H,e=44){c.save();c.globalCompositeOperation="destination-out";let g=c.createLinearGradient(0,0,e,0);g.addColorStop(0,"#000");g.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=g;c.fillRect(0,0,e,H);g=c.createLinearGradient(W-e,0,W,0);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"#000");c.fillStyle=g;c.fillRect(W-e,0,e,H);c.restore()}
const $=id=>document.getElementById(id);

/* IN: anything enters, one coin leaves. Tap a token to send it. */
mount($("scIn"),360,170,(c,t,dt,st,s)=>{const hx=178,hy=85,src=[[34,36],[34,85],[34,134]],p=s.p;let flash=0,hov=-1;st.q=st.q||[];st.n=st.n||0;st.next=(st.next||0)-dt;st.f=Math.max(0,(st.f||0)-dt*2.4);
  if(st.next<=0&&!p.in&&dt>0){st.q.push({i:st.n++%3,u:0});st.next=1.2}
  if(p.in)src.forEach((q,i)=>{if(Math.hypot(p.x-q[0],p.y-q[1])<26)hov=i});
  if(s.clicked){s.clicked=false;if(hov>=0)st.q.push({i:hov,u:0})}
  s.cv.style.cursor=hov>=0?"pointer":"";
  src.forEach((q,i)=>{c.strokeStyle=i==hov?"rgba(125,176,255,.7)":LINE;c.lineWidth=1;c.setLineDash([3,6]);c.beginPath();c.moveTo(q[0]+18,q[1]);c.bezierCurveTo(100,q[1],120,hy,hx-34,hy);c.stroke();c.setLineDash([])});
  line(c,hx+34,hy,300,hy,"rgba(125,176,255,.45)",1,[3,6]);
  const mark=(i,x,y,r)=>{if(!i){pic(c,SOL,x,y,r*.68);return}c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();pic(c,i==1?USDC:BONK,x,y,r);c.restore()};
  const bz=(q,m)=>{const v=1-m,a=[q[0]+18,q[1]],b=[100,q[1]],d=[120,hy],e=[hx-20,hy];return[v*v*v*a[0]+3*v*v*m*b[0]+3*v*m*m*d[0]+m*m*m*e[0],v*v*v*a[1]+3*v*v*m*b[1]+3*v*m*m*d[1]+m*m*m*e[1]]};
  for(let k=st.q.length-1;k>=0;k--){const o=st.q[k],pu=o.u;o.u+=dt/3.2;if(o.u>=1){st.q.splice(k,1);continue}const u=o.u,i=o.i,[x,y]=bz(src[i],ease(clamp(u/.46)));
    if(u<.46){const a=seg(u,0,.05)*(1-seg(u,.38,.45)),r=14*(1-seg(u,.36,.46)*.4);c.save();c.globalAlpha=a;c.fillStyle="#0b1640";c.beginPath();c.arc(x,y,r,0,TAU);c.fill();mark(i,x,y,r);c.restore()}
    else{const v=(u-.46)/.5;glow(c,lerp(hx,300,v),hy,20,.5*(1-v));usd(c,lerp(hx,300,ease(v)),hy,14,Math.cos(v*8),seg(u,.46,.5)*(1-seg(u,.9,.96)));if(pu<.46)st.f=1}
    flash=Math.max(flash,1-Math.abs(u-.46)/.07)}
  src.forEach((q,i)=>{const on=i==hov,R=on?20:17;if(on)glow(c,q[0],q[1],40,.5);c.fillStyle="rgba(11,22,64,.9)";c.beginPath();c.arc(q[0],q[1],R,0,TAU);c.fill();c.strokeStyle=on?BLUE:"rgba(180,196,255,.3)";c.lineWidth=1;c.stroke();c.save();c.globalAlpha=on?1:.75;mark(i,q[0],q[1],R-1);c.restore()});
  flash=Math.max(clamp(flash),st.f);glow(c,hx,hy,70,.25+.5*flash);c.fillStyle="#0e1a4a";c.beginPath();c.arc(hx,hy,33,0,TAU);c.fill();c.strokeStyle=`rgba(125,176,255,${.45+.5*flash})`;c.lineWidth=1.5;c.stroke();
  c.save();c.translate(hx,hy);c.rotate(t*1.4);c.strokeStyle=LIGHT;c.lineWidth=3;c.lineCap="round";for(let k=0;k<2;k++){c.rotate(Math.PI);c.beginPath();c.arc(0,0,18,.25,2.5);c.stroke();const a=2.5,x=18*Math.cos(a),y=18*Math.sin(a);c.fillStyle=LIGHT;c.beginPath();c.moveTo(x-7,y-1);c.lineTo(x+6,y-3);c.lineTo(x+1,y+8);c.closePath();c.fill()}c.restore();
  const beat=.5+.5*Math.sin(t*5.2);glow(c,322,hy,44,.3+.12*beat);usd(c,322,hy,22)},{live:true});

/* THROUGH: blocks cross the line and settle. Drag the chain. */
mount($("scThrough"),360,170,(c,t,dt,st,s)=>{const w=74,gap=20,sp=34,L=["PLAY","RENT","CAPSULE","PLAY","SPONSOR"],y=62,h=74,cx=180,pitch=w+gap,p=s.p;st.off=st.off||0;if(st.v===undefined)st.v=sp;
  if(!st.k){st.k=1;s.el.tabIndex=0;s.el.setAttribute("aria-label","Settled blocks, use the arrow keys to move them");s.el.addEventListener("keydown",e=>{if(e.key!=="ArrowLeft"&&e.key!=="ArrowRight")return;e.preventDefault();st.tgt=(Math.round(st.off/pitch)+(e.key==="ArrowRight"?1:-1))*pitch;st.hold=2.5})}
  const arrow=p.in?(Math.hypot(p.x-16,p.y-(y+h/2))<22?-1:Math.hypot(p.x-344,p.y-(y+h/2))<22?1:0):0;
  s.clicked=false;
  if(p.down){if(st.lx!=null){const d=p.x-st.lx;st.off-=d;st.dx+=Math.abs(d);st.v=-d/Math.max(dt,.008);st.tgt=null}else{st.dx=0;st.a0=arrow}st.lx=p.x}
  else{st.lx=null;if(st.was){st.hold=2.5;if(st.dx<4){if(st.a0)st.tgt=(Math.round(st.off/pitch)+st.a0)*pitch;else st.ck=true}else st.tgt=Math.round((st.off+clamp(st.v,-500,500)*.18)/pitch)*pitch}
    if(st.tgt!=null){st.off+=(st.tgt-st.off)*Math.min(1,dt*9);st.v=0;if(Math.abs(st.tgt-st.off)<.3){st.off=st.tgt;st.tgt=null}}
    else if(p.in||st.hold>0){st.hold-=dt;st.v=0}else{st.v+=(sp-st.v)*Math.min(1,dt*2);st.off+=st.v*dt}}
  st.was=p.down;s.cv.style.cursor=p.down?"grabbing":arrow?"pointer":"grab";
  const base=Math.floor(st.off/pitch),frac=st.off-base*pitch;
  tx(c,"SETTLED IN USDC",cx,24,9.5,MONO,"#9cc0ff","center",2.4);
  line(c,0,y+h/2,360,y+h/2,"rgba(125,176,255,.3)",1.5);
  for(let i=-3;i<5;i++){const x=cx-w/2+i*pitch-frac,id=base+i,mid=x+w/2,done=mid<cx,d=clamp(1-Math.abs(mid-cx)/48),lbl=L[((id%5)+5)%5],hv=p.in&&!p.down&&Math.abs(p.x-mid)<w/2&&Math.abs(p.y-(y+h/2))<h/2,yy=y-(hv?5:0);if(st.ck&&Math.abs(p.x-mid)<w/2&&Math.abs(p.y-(y+h/2))<h/2){st.tgt=st.off+i*pitch-frac;st.ck=false}
    if(done){const g=c.createLinearGradient(x,yy,x,yy+h);g.addColorStop(0,"#2f61d8");g.addColorStop(1,"#183a9c");c.fillStyle=g}else c.fillStyle="#0e1a4a";rr(c,x,yy,w,h,12);c.fill();c.strokeStyle=hv?LIGHT:done?"rgba(125,176,255,.8)":"rgba(180,196,255,.22)";c.lineWidth=1;c.stroke();
    usd(c,mid,yy+29,14,1,done||hv?1:.4);tx(c,lbl,mid,yy+58,8.5,MONO,done||hv?INK:MUTE,"center",1);if(d>0)glow(c,mid,y+h/2,70,d*.55)}
  c.strokeStyle=BLUE;c.lineWidth=2;c.lineCap="round";const a=y-9,b=y+h+9,e=14,xl=cx-w/2-8,xr=cx+w/2+8;[[xl,a,1,1],[xr,a,-1,1],[xl,b,1,-1],[xr,b,-1,-1]].forEach(q=>{c.beginPath();c.moveTo(q[0]+q[2]*e,q[1]);c.lineTo(q[0],q[1]);c.lineTo(q[0],q[1]+q[3]*e);c.stroke()});
  st.ck=false;fade(c,360,170,56);
  [[16,-1],[344,1]].forEach(q=>{const on=arrow===q[1],yc=y+h/2;c.fillStyle=on?"rgba(59,123,255,.5)":"rgba(14,26,74,.9)";c.beginPath();c.arc(q[0],yc,14,0,TAU);c.fill();c.strokeStyle=on?LIGHT:"rgba(125,176,255,.45)";c.lineWidth=1;c.stroke();c.strokeStyle=on?"#fff":LIGHT;c.lineWidth=2;c.lineCap="round";c.lineJoin="round";c.beginPath();c.moveTo(q[0]-q[1]*3,yc-5);c.lineTo(q[0]+q[1]*3,yc);c.lineTo(q[0]-q[1]*3,yc+5);c.stroke()})},{live:true,drag:true});

/* OUT: the coin is cut in three. Hover a slice, tap to send it, and the fifth burns. */
const fOut=Fire();
mount($("scOut"),360,170,(c,t,dt,st,s)=>{const P=5.8,cx=92,cy=85,r=46,W=[[-90,90],[90,198],[198,270]],D=[[250,36],[250,85],[250,134]],lb=[["50%","MACHINES"],["30%","HOLDERS"],["20%","BURNED"]],p=s.p;st.u=st.u===undefined?.5:st.u;st.h=st.h||0;
  if(!p.in)st.u=(st.u+dt)%P;st.h=clamp(st.h+(p.in?dt*5:-dt*5));const h=ease(st.h),u=st.u;let sel=-1;
  if(p.in){if(p.x>215)sel=p.y<62?0:p.y<110?1:2;else if(Math.hypot(p.x-cx,p.y-cy)<r+22){let d=Math.atan2(p.y-cy,p.x-cx)*180/Math.PI;if(d<-90)d+=360;W.forEach((w,i)=>{if(d>=w[0]&&d<w[1])sel=i})}}
  if(s.clicked){s.clicked=false;if(sel>=0&&!st.act)st.act={i:sel,t:0}}
  if(st.act){st.act.t+=dt;if(st.act.t>1.9)st.act=null}
  s.cv.style.cursor=sel>=0?"pointer":"";
  const a0=Math.max(seg(u,0,.25)*(1-seg(u,5.55,5.8)),h),gap=Math.max(seg(u,.5,1),h),go=seg(u,1.1,2.3)*(1-h),hit=seg(u,2.3,2.7)*(1-h);
  /* every slice docks into its own small coin, so the share still reads as a piece of the whole */
  D.forEach((d,i)=>{c.save();c.translate(d[0],d[1]);c.beginPath();c.arc(0,0,21,0,TAU);c.fillStyle="rgba(11,22,64,.75)";c.fill();c.strokeStyle="rgba(180,196,255,.22)";c.lineWidth=1;c.stroke();c.beginPath();c.moveTo(0,0);c.arc(0,0,21,W[i][0]*Math.PI/180,W[i][1]*Math.PI/180);c.closePath();c.fillStyle="rgba(180,196,255,.07)";c.fill();c.restore()});
  W.forEach((w,i)=>{const m=(w[0]+w[1])/2*Math.PI/180,act=st.act&&st.act.i===i?st.act:null,off=9*gap+(sel===i?9:0),ox=Math.cos(m)*off,oy=Math.sin(m)*off,auto=i==2?seg(u,2.3,3.1)*(1-h):0;
    let g=go,al=a0*(1-auto);
    if(act){const T=act.t,out=seg(T,0,.7),back=seg(T,1.35,1.9),gone=seg(T,i==2?.6:1,i==2?1.2:1.3);g=Math.max(go,back>0?0:out);al=back>0?back*a0:a0*(1-gone);if(i==2&&T>.3&&T<1.2)fOut.add(lerp(cx,D[i][0],out),lerp(cy,D[i][1],out),14,1,.8,.5)}
    else if(i==2&&u>1.7&&u<3.1&&!h){const x=lerp(cx+ox,D[i][0],go),y=lerp(cy+oy,D[i][1],go);fOut.add(x,y,14,1,.8,.5)}
    const x=lerp(cx+ox,D[i][0],g),y=lerp(cy+oy,D[i][1],g),sc=lerp(1,.46,g);
    if(ok(COIN)&&al>0){c.save();c.globalAlpha=clamp(al);c.translate(x,y);c.scale(sc,sc);c.beginPath();c.moveTo(0,0);c.arc(0,0,r,w[0]*Math.PI/180,w[1]*Math.PI/180);c.closePath();c.clip();c.drawImage(COIN,-r,-r,r*2,r*2);c.restore()}
    const lit=sel===i||!!act||(hit&&i<2);tx(c,lb[i][0],292,D[i][1]-8,20,ANT,lit?INK:MUTE,"left",.5);tx(c,lb[i][1],292,D[i][1]+11,8.5,MONO,lit?"#9cc0ff":MUTE,"left",1.2)});
  fOut.draw(c,dt)},{live:true});

/* DEMAND: more machines, more buys */
mount($("scDemand"),360,190,(c,t)=>{const P=12,step=.14,n=26,now=t/step,u=(t%P)/P,mAt=x=>1+Math.floor((((x*step)%P+P)%P)/P*6),m=mAt(now);
  tx(c,String(m*100),0,26,38,ANT,INK,"left",.5);tx(c,"BUYS AN HOUR",2,56,9.5,MONO,"#9cc0ff","left",1.8);
  for(let i=0;i<6;i++){const x=360-(6-i)*22,lit=i<m,pop=i==m-1?1-clamp((u*6%1)*4):0;c.fillStyle=lit?chrome(c,x,12,x,30):"rgba(180,196,255,.08)";rr(c,x,12,16,18,4);c.fill();if(pop>0)glow(c,x+8,21,28,pop*.8)}
  tx(c,"MACHINES",360,44,8.5,MONO,MUTE,"right",1.4);
  const w=360/n,fr=now%1,b=Math.floor(now),bh=184;
  for(let i=0;i<=n;i++){const id=b-n+i,mm=mAt(id),nz=.45+.55*Math.abs(Math.sin(id*12.9898)),h=8+nz*mm/6*104,x=(i-fr)*w,last=i==n,g=c.createLinearGradient(0,bh-h,0,bh);g.addColorStop(0,"#d6e4ff");g.addColorStop(.25,"#3b7bff");g.addColorStop(1,"rgba(31,79,209,.25)");c.fillStyle=g;c.globalAlpha=last?fr:1;rr(c,x+1.5,bh-h,w-3,h,[3,3,0,0]);c.fill();c.globalAlpha=1;}
  line(c,0,bh+.5,360,bh+.5,"rgba(180,196,255,.25)")});

/* SUPPLY: the stack loses a coin, every week */
const fStk=Fire();
mount($("scBurn"),360,190,(c,t,dt)=>{const P=1.5,N=6,k=Math.floor(t/P)%N,ph=(t%P)/P,x=150,bot=166,th=15,rx=62,count=8-k,top=bot-(count-1)*th;
  glow(c,x,112,76,.2);
  for(let i=0;i<count;i++){const y=bot-i*th,isTop=i==count-1,a=isTop?1-seg(ph,.25,.85):1,lift=isTop?seg(ph,.05,.6)*16:0,yy=y-lift,g=c.createLinearGradient(x-rx,0,x+rx,0);g.addColorStop(0,"#16307e");g.addColorStop(.3,"#7db0ff");g.addColorStop(.48,"#fff");g.addColorStop(.7,"#3b7bff");g.addColorStop(1,"#101f5c");c.save();c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.ellipse(x,yy,rx,19,0,0,Math.PI);c.lineTo(x-rx,yy-th+2);c.ellipse(x,yy-th+2,rx,19,0,Math.PI,0,true);c.closePath();c.fill();c.restore();
    if(isTop&&ok(COIN)){c.save();c.globalAlpha=a;c.translate(x,yy-th+2);c.scale(1,19/rx);c.drawImage(COIN,-rx,-rx,rx*2,rx*2);c.restore()}}
  if(ph>.08&&ph<.95)fStk.add(x,top-20,rx*1.4,2,1.1,.8);else fStk.add(x,top-14,rx*1.1,1,.6,.5);
  fStk.draw(c,dt);
  const gx=296,gt=44,gb=166,f=(count-1)/7,e=lerp(f+1/7,f,seg(ph,.25,.85)),h=(gb-gt)*e;tx(c,"SUPPLY",gx+7,24,9,MONO,MUTE,"center",1.6);rr(c,gx,gt,14,gb-gt,7);c.fillStyle="rgba(180,196,255,.1)";c.fill();rr(c,gx,gb-h,14,h,7);c.fillStyle=chrome(c,gx,gb-h,gx,gb);c.fill()});

/* ALIGNED: nothing of ours moves until the market passes the level */
mount($("scAligned"),360,190,(c,t)=>{const P=7.5,u=(t%P)/5.8,L=[["1M",146],["2M",112],["5M",78],["10M",44]],x0=34,x1=336,yb=178,alpha=1-seg(t%P,7,7.5),py=v=>172-Math.pow(v,1.25)*150-Math.sin(v*17)*5*(1-v*.4)-Math.sin(v*41)*2,v=clamp(u),n=Math.floor(120*v);
  L.forEach(l=>{let cr=null;for(let i=0;i<=120;i++)if(py(i/120)<l[1]){cr=i/120;break}const open=cr!==null&&v>cr,since=open?(v-cr)*5.8:0;line(c,x0,l[1],x1,l[1],open?"rgba(125,176,255,.65)":LINE,1,[4,6]);tx(c,l[0],0,l[1],11,ANT,open?INK:MUTE,"left",.4);lockIcon(c,x1-9,l[1]-13,.95,open?seg(since,0,.3):0);
    if(open&&since<.9){const cx=x0+(x1-x0)*cr;glow(c,cx,l[1],46*(.4+since),.9*(1-since/.9));tx(c,"SOLD HERE",Math.max(x0+36,cx-34),l[1]-11,8,MONO,"#9cc0ff","center",1.2)}});
  c.save();c.globalAlpha=alpha;const g=c.createLinearGradient(0,20,0,yb);g.addColorStop(0,"rgba(59,123,255,.32)");g.addColorStop(1,"rgba(59,123,255,0)");c.beginPath();c.moveTo(x0,yb);for(let i=0;i<=n;i++){const q=i/120;c.lineTo(x0+(x1-x0)*q,py(q))}c.lineTo(x0+(x1-x0)*v,yb);c.closePath();c.fillStyle=g;c.fill();
  c.beginPath();for(let i=0;i<=n;i++){const q=i/120,X=x0+(x1-x0)*q;i?c.lineTo(X,py(q)):c.moveTo(X,py(q))}c.strokeStyle=LIGHT;c.lineWidth=2;c.lineJoin="round";c.stroke();
  const hx=x0+(x1-x0)*v,hy=py(v);glow(c,hx,hy,14,.9,S_WHITE);c.fillStyle="#fff";c.beginPath();c.arc(hx,hy,3,0,TAU);c.fill();c.restore()});

/* PLAYS: the bag fills, the tiers open */
mount($("scPlays"),360,170,(c,t)=>{const P=6.4,u=t%P,f=seg(u,.2,4.4)*(1-seg(u,5.8,6.3)),X=[64,180,296],w=92,h=62,y=24,bx=30,bw=300,by=134;
  X.forEach((x,i)=>{const th=(i+1)/3-.02,o=clamp((f-th)/.05);c.save();const sc=1+.05*Math.sin(o*Math.PI);c.translate(x,y+h/2);c.scale(sc,sc);c.translate(-x,-(y+h/2));ticketShape(c,x-w/2,y,w,h);if(o>0){glow(c,x,y+h/2,54,o*.38);c.fillStyle=chrome(c,x-w/2,y,x-w/2+20,y+h);c.globalAlpha=o;c.fill();c.globalAlpha=1;tx(c,"TIER "+(i+1),x,y+h/2+1,17,ANT,"#071029","center",.5)}else{c.fillStyle="rgba(14,26,74,.7)";c.fill();c.strokeStyle="rgba(180,196,255,.25)";c.lineWidth=1;c.setLineDash([3,4]);c.stroke();c.setLineDash([]);lockIcon(c,x,y+h/2,1.1,0,.8)}c.restore()});
  rr(c,bx,by,bw,10,5);c.fillStyle="rgba(180,196,255,.12)";c.fill();if(f>0){rr(c,bx,by,Math.max(10,bw*f),10,5);c.fillStyle=chrome(c,bx,by-20,bx+bw,by+30);c.fill()}
  [1,2].forEach(i=>line(c,bx+bw*i/3,by-3,bx+bw*i/3,by+13,"rgba(214,228,255,.5)",1));
  glow(c,bx+bw*f,by+5,26,.5);coin(c,bx+bw*f,by+5,13,Math.cos(t*3));tx(c,"HOLD",bx,by+26,8.5,MONO,MUTE,"left",1.6)});

/* CAPSULES: one drops every night, and it opens */
mount($("scCapsule"),360,170,(c,t)=>{const P=5.6,u=t%P,cx=170,R=46,a=seg(u,0,.15)*(1-seg(u,5.1,5.5)),d=clamp(u/.8),by=(d<1?lerp(-60,108,d*d):108)-(u>.8?Math.abs(Math.sin((u-.8)*8))*Math.exp(-(u-.8)*5)*16:0),open=seg(u,1.5,2.2),rise=seg(u,1.8,2.7);
  [[58,40],[92,22],[250,28],[282,62],[36,86],[226,70]].forEach((s,i)=>glow(c,s[0],s[1],6,.4+.4*Math.sin(t*2+i),S_WHITE));
  c.save();c.beginPath();c.rect(280,10,70,70);c.arc(321,34,16,0,TAU,true);c.clip("evenodd");c.fillStyle=LIGHT;c.beginPath();c.arc(312,40,18,0,TAU);c.fill();c.restore();glow(c,310,40,40,.25);
  c.save();c.globalAlpha=a;c.fillStyle="rgba(5,9,24,.45)";c.beginPath();c.ellipse(cx,158,R*.9,6,0,0,TAU);c.fill();
  if(rise>0){glow(c,cx,by-30*rise,84,.55*rise);coin(c,cx,by-46*rise,27,Math.cos((u-1.8)*2.4))}
  const g=c.createLinearGradient(cx-R,0,cx+R,0);g.addColorStop(0,"#17307e");g.addColorStop(.35,"#9cc0ff");g.addColorStop(.5,"#fff");g.addColorStop(.75,"#3b7bff");g.addColorStop(1,"#0f1e58");c.fillStyle=g;c.beginPath();c.arc(cx,by,R,0,Math.PI);c.closePath();c.fill();
  c.fillStyle="#0b1640";c.beginPath();c.ellipse(cx,by,R,5*(.4+open),0,0,TAU);c.fill();
  c.save();c.translate(cx-R,by);c.rotate(-open*1.15);c.translate(R,0);const h=c.createRadialGradient(-14,-22,4,0,-8,R+6);h.addColorStop(0,"rgba(255,255,255,.95)");h.addColorStop(.45,"rgba(125,176,255,.55)");h.addColorStop(1,"rgba(31,79,209,.75)");c.fillStyle=h;c.beginPath();c.arc(0,0,R,Math.PI,0);c.closePath();c.fill();c.strokeStyle="rgba(214,228,255,.6)";c.lineWidth=1;c.stroke();c.restore();c.restore()});

/* QUEUE: the holder walks to the front */
mount($("scQueue"),360,170,(c,t)=>{const P=5.4,u=t%P,y=112,X=[226,190,154,118,82],hop=seg(u,.7,2),walk=seg(u,2.5,3.4),a=seg(u,0,.4)*(1-seg(u,4.9,5.4)),gx=280;
  const pawn=(x,yy,lit,al=1)=>{c.save();c.globalAlpha*=al;c.fillStyle=lit?chrome(c,x-12,yy-30,x+12,yy+16):"rgba(150,165,210,.3)";c.beginPath();c.arc(x,yy-18,9,0,TAU);c.fill();c.beginPath();c.moveTo(x-13,yy+14);c.quadraticCurveTo(x-11,yy-8,x,yy-8);c.quadraticCurveTo(x+11,yy-8,x+13,yy+14);c.closePath();c.fill();c.restore()};
  X.forEach(x=>pawn(x,y,false));line(c,30,y+15,350,y+15,LINE,1);
  [gx,gx+50].forEach(x=>{c.fillStyle=chrome(c,x-3,y-54,x+3,y+15);rr(c,x-2.5,y-46,5,61,2);c.fill();c.beginPath();c.arc(x,y-48,6,0,TAU);c.fill()});
  const sw=seg(u,2.2,2.6)*(1-seg(u,3.6,4));c.strokeStyle=BLUE;c.lineWidth=2.5;c.beginPath();c.moveTo(gx,y-40);c.quadraticCurveTo(gx+25,y-14-sw*46,gx+50,y-40);c.stroke();
  tx(c,"NEXT PLAY",gx+25,24,8.5,MONO,"#9cc0ff","center",1.4);
  const sx=44,ex=258,hx=lerp(lerp(sx,ex,ease(hop)),gx+52,walk),hy=y-Math.sin(hop*Math.PI)*56;glow(c,hx,hy-6,34,.4*a);pawn(hx,hy,true,a);coin(c,hx,hy-45,10,Math.cos(t*3),a)});

/* HOW: one purchase, three screens, one clock */
const HP=10.5,how=$("tkHow"),hu=t=>t%HP,box=(c,x,y,w,h,on)=>{rr(c,x,y,w,h,13);c.fillStyle=on?"rgba(59,123,255,.16)":"rgba(10,18,52,.75)";c.fill();c.strokeStyle=on?"rgba(125,176,255,.6)":"rgba(180,196,255,.14)";c.lineWidth=1;c.stroke()};
mount($("scPay"),340,210,(c,t)=>{const u=hu(t),L=[["USDC",USDC],["BONK",BONK],["SOL",SOL]],sel=u<.9?0:u<1.8?1:2;tx(c,"A PLAY",2,18,9.5,MONO,MUTE,"left",1.8);
  L.forEach(([l,m],i)=>{const y=44+i*53,on=i==sel;box(c,0,y,340,44,on);c.save();c.beginPath();c.arc(28,y+22,13,0,TAU);c.clip();pic(c,m,28,y+22,13);c.restore();tx(c,l,52,y+23,15,SAT,on?INK:MUTE);if(on){c.save();c.strokeStyle=BLUE;c.lineWidth=2;c.lineCap="round";c.beginPath();c.moveTo(308,y+22);c.lineTo(314,y+28);c.lineTo(324,y+16);c.stroke();c.restore()}})},{still:2.6});
mount($("scSwap"),340,210,(c,t)=>{const u=hu(t),p=seg(u,3.6,4.2),g=seg(u,4.3,5),press=seg(u,5,5.3)*(1-seg(u,5.4,5.8)),done=seg(u,5.5,6)>.5;
  box(c,0,0,340,66);tx(c,"You pay",14,17,11,SAT,MUTE);pic(c,SOL,28,44,12);tx(c,"SOL",48,45,22,SAT,p>0?INK:MUTE);
  box(c,0,76,340,66,g>.9);tx(c,"You get",14,93,11,SAT,MUTE);usd(c,28,120,13);tx(c,"USDC",48,121,22,SAT,g>0?INK:MUTE);
  c.save();c.translate(170,71);c.fillStyle="#0b1640";c.beginPath();c.arc(0,0,15,0,TAU);c.fill();c.strokeStyle="rgba(125,176,255,.6)";c.lineWidth=1;c.stroke();c.rotate(seg(u,4.2,5)*TAU);c.strokeStyle=LIGHT;c.lineWidth=2;c.lineCap="round";c.beginPath();c.arc(0,0,7,.3,2.7);c.stroke();c.beginPath();c.arc(0,0,7,3.4,5.8);c.stroke();c.restore();
  rr(c,0,160,340,42,21);c.fillStyle=chrome(c,0,160,0,202);c.fill();if(press)glow(c,170,181,110,press*.7);tx(c,done?"Swapped":"Swap",170,182,14,SAT,"#071029","center");
  },{still:6.5});
const fSet=Fire();
mount($("scSettle"),340,210,(c,t,dt)=>{const u=hu(t),R=[["Machines",.5,"50%"],["Holders",.3,"30%"],["Burned",.2,"20%"]],st=seg(u,9.1,9.4);
  usd(c,16,20,15);tx(c,"Settled in USDC",42,21,14,SAT,INK);
  R.forEach((r,i)=>{const y=62+i*44,f=seg(u,7+i*.5,7.6+i*.5);tx(c,r[0],0,y,11,SAT,MUTE);tx(c,r[2],340,y,14,ANT,f>.5?INK:MUTE,"right",.4);rr(c,0,y+11,340,9,5);c.fillStyle="rgba(180,196,255,.1)";c.fill();if(f>0){const bw=Math.max(9,340*r[1]*f),ash=i==2?seg(u,8.9,9.6):0;rr(c,0,y+11,bw,9,5);c.fillStyle=chrome(c,0,y+6,Math.max(bw,40),y+24);c.save();c.globalAlpha=1-ash*.75;c.fill();c.restore();if(i==2&&u>8.3&&u<9.8)fSet.add(Math.random()*bw,y+15,6,1,.28,.32)}});
  fSet.draw(c,dt);if(st)tx(c,"ON-CHAIN",0,201,9,MONO,`rgba(207,224,255,${st})`,"left",1.8)},{still:10});

/* BUYBACK: a week of revenue, then the machine turns it into coin */
const fBb=Fire();
mount($("scBuyback"),1040,350,(c,t,dt,st,s)=>{const nw=s.narrow,P=9,u=(t%P)/P,D=["MON","TUE","WED","THU","FRI","SAT","SUN"],A=nw?{wx:0,ww:360,wy:0,sx:96,sy:176,gx:262,gy:176,fx:84,fy:362,px:276,py:362}:{wx:300,ww:440,wy:4,sx:170,sy:236,gx:520,gy:190,fx:840,fy:96,px:840,py:252},day=Math.min(6,Math.floor(u/.09)),go=u>=.63;
  const dx=i=>A.wx+A.ww*(i+.5)/7,ry=A.wy+26,x0=dx(0),x6=dx(6),head=lerp(x0,x6,Math.min(6,u/.09)/6),rail=c.createLinearGradient(x0,0,x6,0),sun=seg(u,.54,.6);rail.addColorStop(0,"#3b7bff");rail.addColorStop(1,"#d6e4ff");rr(c,x0,ry-1,x6-x0,2,1);c.fillStyle="rgba(180,196,255,.14)";c.fill();rr(c,x0,ry-1,Math.max(2,head-x0),2,1);c.fillStyle=rail;c.fill();
  D.forEach((d,i)=>{const x=dx(i),on=i==day,done=i<day;tx(c,d,x,A.wy+6,9.5,MONO,on?INK:done?"#9cc0ff":MUTE,"center",1.8);if(i==6){if(sun)glow(c,x,ry,24,sun*.6);coin(c,x,ry,10,1,.35+.65*sun);return}if(on)glow(c,x,ry,16,.6);c.fillStyle=on||done?"#d6e4ff":"#2a3a78";c.beginPath();c.arc(x,ry,on?4.5:3,0,TAU);c.fill()});
  const n=Math.min(8,1+Math.floor(u/.08)),bw=120,bh=13,bill=(x,y,a=1)=>{c.save();c.globalAlpha*=a;rr(c,x-bw/2,y-bh/2,bw,bh+3,4);const g=c.createLinearGradient(x-bw/2,0,x+bw/2,0);g.addColorStop(0,"#27408f");g.addColorStop(.5,"#9cc0ff");g.addColorStop(1,"#27408f");c.fillStyle=g;c.fill();c.strokeStyle="rgba(214,228,255,.5)";c.lineWidth=1;c.stroke();tx(c,"$",x,y+2,11,SAT,"#071029","center");c.restore()};
  for(let i=0,e=go?6:n;i<e;i++)bill(A.sx,A.sy-i*12);
  if(!go){const f=(u%.08)/.08;bill(A.sx,lerp(A.sy-130,A.sy-n*12,f*f),1-seg(f,.85,1));if(!nw)tx(c,["SPONSORS","MERCH","PARTNERS"][day%3],A.sx,A.sy-158,10,MONO,"#9cc0ff","center",2)}
  else for(let i=0;i<2;i++){const f=seg(u,.63+i*.03,.74+i*.03);bill(lerp(A.sx,A.gx-50,f),lerp(A.sy-(6+i)*12,A.gy,f),1-seg(f,.85,1))}
  line(c,A.sx+70,A.gy,A.gx-40,A.gy,LINE,1,[4,6]);
  const flash=go?seg(u,.72,.75)*(1-seg(u,.8,.9)):0;glow(c,A.gx,A.gy,110,.2+.6*flash);c.fillStyle="rgba(14,26,74,.96)";c.beginPath();c.arc(A.gx,A.gy,40,0,TAU);c.fill();c.strokeStyle=`rgba(125,176,255,${.45+.5*flash})`;c.lineWidth=1.5;c.stroke();c.save();c.translate(A.gx,A.gy);c.rotate(t*(go?3.2:.8));c.strokeStyle=LIGHT;c.lineWidth=3;c.lineCap="round";for(let k=0;k<2;k++){c.rotate(Math.PI);c.beginPath();c.arc(0,0,27,.3,2.5);c.stroke()}c.restore();coin(c,A.gx,A.gy,16);
  const bez=(i,f)=>{const T=i?[A.px,A.py]:[A.fx,A.fy],mx=nw?A.gx:(A.gx+T[0])/2,my=nw?(A.gy+T[1])/2:A.gy,v=1-f;return[v*v*A.gx+2*v*f*mx+f*f*T[0],v*v*A.gy+2*v*f*my+f*f*T[1]]};
  [0,1].forEach(i=>{c.save();c.strokeStyle="rgba(125,176,255,.35)";c.lineWidth=1;c.setLineDash([4,6]);c.beginPath();for(let k=0;k<=30;k++){const[x,y]=bez(i,k/30);k?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();c.restore();for(let k=0;k<7;k++){const f=clamp((u-.74-k*.016)/.14);if(f>0&&f<1){const[x,y]=bez(i,ease(f));glow(c,x,y,18,.5);coin(c,x,y,11,Math.cos(f*9))}}});
  const hitF=clamp((u-.84)/.1)*(1-seg(u,.97,1));fBb.add(A.fx,A.fy+22,44,hitF>0?2:1,hitF>0?1.3:.6,hitF>0?.9:.55);fBb.draw(c,dt);coin(c,A.fx,A.fy+12,18,1,1-hitF*.8);
  const hitP=clamp((u-.84)/.05)*(1-seg(u,.97,1));ticketShape(c,A.px-44,A.py-24,88,48);if(hitP)glow(c,A.px,A.py,70,hitP*.5);c.fillStyle=hitP>0?chrome(c,A.px-44,A.py-24,A.px-20,A.py+24):"rgba(14,26,74,.8)";c.fill();c.strokeStyle="rgba(125,176,255,.5)";c.lineWidth=1;c.stroke();tx(c,"PLAY",A.px,A.py+1,17,ANT,hitP>0?"#071029":MUTE,"center",.5);
  const cap=(a,b,x,y)=>{tx(c,a,x,y,nw?17:22,ANT,INK,"center",.3);tx(c,b,x,y+(nw?19:23),nw?8:10,MONO,MUTE,"center",1.2)};
  cap("REVENUE","ALL IN USDC",A.sx,A.sy+(nw?30:46));cap("HALF BUYS THE COIN","EVERY WEEK",A.gx,A.gy+(nw?-84:66));cap("40% BURNED","LEAVES FOREVER",A.fx,A.fy+(nw?44:52));cap("60% TO HOLDERS","PLAYS AND PRIZES",A.px,A.py+(nw?44:44))},{alt:{W:360,H:430,below:640},still:7.7});

/* SUPPLY: a hundred coins, each ten million tokens. Hover to read, tap to pin, slide across a row to scrub it. */
const cats=[45,25,10,10,5,5],names=["public curve","Raydium pool","Ignition","team","marketing","community and rewards"],kind=[];cats.forEach((k,i)=>{for(let n=0;n<k;n++)kind.push(i)});
const rows=[...document.querySelectorAll("[data-cat]")],rdAmt=$("rdAmt"),rdLab=$("rdLab");let forced=-1,pin=-1,gridHov=-1;
const setPin=i=>{pin=pin===i?-1:i;rows.forEach((r,k)=>r.classList.toggle("pin",k===pin))};
rows.forEach((r,i)=>{r.addEventListener("mouseenter",()=>forced=i);r.addEventListener("mouseleave",()=>forced=-1);r.addEventListener("click",()=>setPin(i))});
mount($("scGrid"),320,320,(c,t,dt,st,s)=>{const p=s.p,cell=32,idx=p.in?clamp(Math.floor(p.x/cell),0,9)+clamp(Math.floor(p.y/cell),0,9)*10:-1;gridHov=p.in?kind[idx]:-1;
  const active=gridHov>=0?gridHov:forced>=0?forced:pin>=0?pin:Math.floor(t/2.6)%6;
  if(s.clicked){s.clicked=false;if(idx>=0){setPin(kind[idx]);st.rip={x:p.x,y:p.y,t:0}}}
  s.cv.style.cursor=p.in?"pointer":"";
  rows.forEach((r,i)=>r.classList.toggle("on",i===active));
  st.sc=st.sc||new Array(100).fill(0);if(st.rip){st.rip.t+=dt;if(st.rip.t>1.1)st.rip=null}
  for(let i=0;i<100;i++){const x=16+(i%10)*cell,y=16+Math.floor(i/10)*cell,on=kind[i]===active,w=.5+.5*Math.sin(t*3-i*.45);st.sc[i]+=((on?1:0)-st.sc[i])*Math.min(1,dt*9||1);const k=st.sc[i];let bump=0;if(st.rip){const d=Math.hypot(x-st.rip.x,y-st.rip.y)/190;bump=Math.max(0,1-Math.abs(st.rip.t-d)*7)}
    const self=i===idx?2.4:0;if(k>.05)glow(c,x,y,20,k*(.3+.2*w));coin(c,x,y,10.5+k*(2.5+w*1.1)+bump*3.5+self,1,.22+.78*Math.max(k,bump))}
  const target=cats[active]*1e7;st.v=st.v===undefined?target:st.v+(target-st.v)*Math.min(1,dt*10||1);if(Math.abs(target-st.v)<5e4)st.v=target;
  const txt=(Math.round(st.v/1e6)*1e6).toLocaleString("en-US");if(st.txt!==txt){st.txt=txt;rdAmt.textContent=txt}
  if(st.a!==active){st.a=active;rdLab.textContent="tokens, "+names[active]}},{still:1,live:true});
const sp=(id,fn,still)=>{const el=$(id),note=el.closest(".tk-row").querySelector("p"),base=note.textContent;let shown=base;const say=x=>{const v=x||base;if(v!==shown){shown=v;note.textContent=v}};return mount(el,150,46,(c,t,dt,st,s)=>{s.cv.style.cursor=s.p.in?"ew-resize":"";fn(c,t,s.p.in?clamp(s.p.x/148):null,say,s)},{still,live:true})};
sp("spPub",(c,t,q,say)=>{const u=q!==null?q:(t%4)/4,X=v=>12+v*124,y=v=>36-Math.pow(v,2.1)*24;c.lineWidth=2;c.lineCap="round";c.beginPath();for(let i=0;i<=40;i++){const v=i/40;i?c.lineTo(X(v),y(v)):c.moveTo(X(0),y(0))}c.strokeStyle=LINE;c.stroke();c.beginPath();for(let i=0;i<=40*u;i++){const v=i/40;i?c.lineTo(X(v),y(v)):c.moveTo(X(0),y(0))}c.strokeStyle=LIGHT;c.stroke();glow(c,X(u),y(u),10,.9,S_WHITE);say(q!==null?`${Math.round(u*100)}% of the way to graduation.`:"")},3);
sp("spLp",(c,t,q,say,s)=>{rr(c,1,4,148,38,9);c.strokeStyle=LINE;c.lineWidth=1;c.stroke();c.save();rr(c,1,4,148,38,9);c.clip();const lvl=16+Math.sin(t*.7)*3,bx=q===null?-99:q*148;[[.8,"rgba(59,123,255,.8)",0],[1.3,"rgba(180,210,255,.4)",1.6]].forEach(w=>{c.beginPath();c.moveTo(0,46);for(let x=0;x<=150;x+=3){const d=(x-bx)/16;c.lineTo(x,lvl+Math.sin(x*.05+t*2*w[0]+w[2])*3-Math.exp(-d*d)*9*Math.cos(d*2))}c.lineTo(150,46);c.closePath();c.fillStyle=w[1];c.fill()});c.restore();say(q!==null?"Every trade passes through it.":"")},1);
const IGN=[["1M",2.5],["2M",5],["5M",7.5],["10M",10]];
sp("spIgn",(c,t,q,say)=>{const u=(t%4.6)/4,Y=[32,23,14,5],lit=q!==null?Math.min(4,Math.floor(q*4)+1):-1;Y.forEach((y,i)=>{const x=i*37+2,on=lit>0?i<lit:u>(i+.5)/4.4;rr(c,x,y,33,44-y,4);c.fillStyle=on?chrome(c,0,5,0,44):"rgba(180,196,255,.1)";c.fill()});say(lit>0?`At ${IGN[lit-1][0]}, ${IGN[lit-1][1]}% of supply has sold.`:"")},4);
sp("spTeam",(c,t,q,say)=>{const f=q!==null?q:clamp((t%5)/4.4),cl=3/27,y=34,w=148*f,m=Math.round(f*27);rr(c,0,y-4,148,8,4);c.fillStyle="rgba(180,196,255,.1)";c.fill();if(w>0){rr(c,0,y-4,Math.max(8,Math.min(w,148*cl)),8,4);c.fillStyle="rgba(150,165,210,.45)";c.fill();if(f>cl){rr(c,148*cl,y-4,w-148*cl,8,4);c.fillStyle=chrome(c,0,y-8,148,y+8);c.fill()}}lockIcon(c,148*cl,y-18,.85,f>cl?seg(f,cl,cl+.05):0);tx(c,"3M",0,y-15,8.5,MONO,MUTE,"left");tx(c,"2Y",148*.6,y-15,8.5,MONO,MUTE,"center");say(q!==null?(m<=3?`Month ${m}, all locked.`:`Month ${m}, ${Math.round((m-3)/24*100)}% released.`):"")},3);
sp("spMkt",(c,t,q,say)=>{const u=q!==null?q:(t%5.2)/4.6,n=q!==null?Math.ceil(q*52):Math.floor(u*52);for(let i=0;i<52;i++){const x=i*2.86,on=i<n;rr(c,x,10,1.9,26,1);c.fillStyle=on?chrome(c,x,10,x,36):"rgba(180,196,255,.1)";c.fill()}say(q!==null?`Week ${Math.max(1,n)}, ${(Math.max(1,n)/52*5).toFixed(2)}% of supply released.`:"")},3);
sp("spEco",(c,t,q,say)=>{const x=74,y=23,p=.5+.5*Math.sin(t*2.2),h=q!==null?1:p;tx(c,"?",x,y+1,26,ANT,"#d6e4ff","center",.5);for(let i=0;i<6;i++){const a=t*.8+i/6*TAU;glow(c,x+Math.cos(a)*56,y+Math.sin(a)*14,6,.55+.35*h,S_WHITE)}say(q!==null?"What and when: you hear it first.":"")},3);

/* closing: the coin turns, embers around it */
mount($("scOutro"),280,240,(c,t)=>{const x=140,y=118,R=86,o=t*.9;glow(c,x,y,118,.3);const orbit=front=>{for(let i=0;i<26;i++){const a=o*.4+i/26*TAU,b=Math.sin(a);if((b>=0)===front)glow(c,x+Math.cos(a)*126,y+b*34,7+3*Math.sin(i*2.1),front?.8:.5,S_WHITE)}};orbit(false);
  const sx=Math.cos(o),dir=sx>=0?1:-1;if(ok(COIN))for(let i=9;i>=0;i--){c.save();c.translate(x-dir*i*(1-Math.abs(sx))*1.1,y);c.scale(Math.max(.02,Math.abs(sx)),1);c.drawImage(COIN,-R,-R,R*2,R*2);c.restore()}orbit(true)},{still:.2});

/* the market card: live once TK.ca is set */
const cha=$("mkCa"),btn=$("mkCopy"),buy=$("mkBuy"),lnk=$("mkLink"),ch=$("mkChart");
if(TK.ca){cha.textContent=TK.ca.slice(0,6)+"..."+TK.ca.slice(-6);btn.hidden=false;btn.onclick=async()=>{try{await navigator.clipboard.writeText(TK.ca);btn.textContent="Copied";setTimeout(()=>btn.textContent="Copy",1400)}catch(e){}};buy.href=TK.buy;buy.textContent="Buy now";buy.classList.remove("off");buy.removeAttribute("aria-disabled");const f=document.createElement("iframe");f.src=TK.chart(TK.ca);f.title="Coin chart";f.loading="lazy";ch.textContent="";ch.appendChild(f)}
else{buy.addEventListener("click",e=>e.preventDefault());mount($("scChart"),520,260,(c,t)=>{const W=520,x0=30,x1=486,yb=222,X=q=>lerp(x0,x1,q),Y=q=>yb-Math.pow(q,2.7)*176,P=7,u=(t%P)/5.6,v=ease(clamp(u)),a=1-seg(t%P,6.3,7);
  for(let i=0;i<4;i++)line(c,x0,yb-i*58,x1,yb-i*58,"rgba(180,196,255,.07)");
  line(c,x0,yb,x1,yb,"rgba(180,196,255,.22)");
  const path=(n,to)=>{for(let i=0;i<=n;i++){const q=i/120*to/(n/120||1);i?c.lineTo(X(q),Y(q)):c.moveTo(X(q),Y(q))}};
  c.lineWidth=1.5;c.strokeStyle="rgba(125,176,255,.22)";c.setLineDash([3,6]);c.beginPath();path(120,1);c.stroke();c.setLineDash([]);
  c.save();c.globalAlpha=a;const n=Math.max(2,Math.floor(120*v));
  c.beginPath();path(n,v);c.strokeStyle=chrome(c,0,40,0,yb);c.lineWidth=2.5;c.lineCap="round";c.lineJoin="round";c.stroke();
  glow(c,X(v),Y(v),34,.8);glow(c,X(v),Y(v),13,1,S_WHITE);c.restore();
  const end=seg(u,.97,1)*a;
  c.strokeStyle=end?LIGHT:"rgba(180,196,255,.4)";c.lineWidth=1.5;c.beginPath();c.arc(x1,Y(1),5,0,TAU);c.stroke();if(end)glow(c,x1,Y(1),40,end*.8);
  tx(c,"LAUNCH",x0,yb+18,11,MONO,MUTE,"left",2);tx(c,"GRADUATION",x1,yb+18,11,MONO,end?INK:MUTE,"right",2)},{still:6,free:true})}

/* the closing figures count up once, when they arrive */
const facts=[...document.querySelectorAll(".tk-facts [data-n]")];if(facts.length){const fo=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;fo.unobserve(e.target);const el=e.target,n=+el.dataset.n,sf=el.dataset.s||"",t0=performance.now(),step=ts=>{const k=clamp((ts-t0)/1300),v=1-Math.pow(1-k,3);el.textContent=Math.round(n*v)+sf;if(k<1)requestAnimationFrame(step)};requestAnimationFrame(step)}),{threshold:.6});facts.forEach(f=>fo.observe(f))}

/* run only what is on screen */
const io=new IntersectionObserver(es=>es.forEach(e=>{const s=scenes.find(x=>x.el===e.target);if(s)s.on=e.isIntersecting}),{rootMargin:"80px"});scenes.forEach(s=>io.observe(s.el));
let last=0,clock=0;addEventListener("resize",()=>scenes.forEach(s=>s.size()));
const cells=how?[...how.querySelectorAll(".tk-step")]:[],bar=$("tkHowBar");
function loop(ts){const dt=Math.min(.05,(ts-last)/1000||.016);last=ts;clock+=dt;for(const s of scenes)if(s.on){s.t=clock;render(s,dt)}
  if(how){const u=clock%HP,i=u<3.2?0:u<6.8?1:2;cells.forEach((e,k)=>e.classList.toggle("on",k===i));if(bar)bar.style.transform=`scaleX(${u/HP})`}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
})();
