import{z as F,W as T,F as I,A as c,ab as w,D as a,ad as y,bb as B,a8 as O,E as o}from"./wallet.js";import{h as _}from"./CopyToClipboard-i_OQSBJr-CNOMMoBc.js";import{n as q}from"./OpenLink-CUpJ1mOr-C95ZGuNa.js";import{x as E}from"./QrCode-Ca9zCmPl-BUaGWRYM.js";import{n as A}from"./ScreenLayout-Cm8E22c4-BZVc9hg-.js";import{l as h}from"./farcaster-DPlSjvF5-CE-M9eLo.js";import"./dijkstra-D_NXgYpA.js";import"./ModalFooter-Dm1DuNA5-DsSwKNj1.js";import"./Screen-DmcyiC4O-CgVwO1FA.js";import"./index-CWARkn2w-lV9uBm3s.js";let S="#8a63d2";const M=({appName:u,loading:m,success:d,errorMessage:e,connectUri:t,onBack:r,onClose:l,onOpenFarcaster:s})=>a.jsx(A,y||m?B?{title:e?e.message:"Add a signer to Farcaster",subtitle:e?e.detail:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,icon:h,iconVariant:"loading",iconLoadingStatus:{success:d,fail:!!e},primaryCta:t&&s?{label:"Open Farcaster app",onClick:s}:void 0,onBack:r,onClose:l,watermark:!0}:{title:e?e.message:"Requesting signer from Farcaster",subtitle:e?e.detail:"This should only take a moment",icon:h,iconVariant:"loading",iconLoadingStatus:{success:d,fail:!!e},onBack:r,onClose:l,watermark:!0,children:t&&y&&a.jsx(R,{children:a.jsx(q,{text:"Take me to Farcaster",url:t,color:S})})}:{title:"Add a signer to Farcaster",subtitle:`This will allow ${u} to add casts, likes, follows, and more on your behalf.`,onBack:r,onClose:l,watermark:!0,children:a.jsxs(z,{children:[a.jsx(D,{children:t?a.jsx(E,{url:t,size:275,squareLogoElement:h}):a.jsx(P,{children:a.jsx(O,{})})}),a.jsxs(L,{children:[a.jsx(N,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),t&&a.jsx(_,{text:t,itemName:"link",color:S})]})]})});let R=o.div`
  margin-top: 24px;
`,z=o.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,D=o.div`
  padding: 24px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,L=o.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,N=o.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,P=o.div`
  position: relative;
  width: 82px;
  height: 82px;
`;const Z={component:()=>{let{lastScreen:u,navigateBack:m,data:d}=F(),e=T(),{requestFarcasterSignerStatus:t,closePrivyModal:r}=I(),[l,s]=c.useState(void 0),[k,x]=c.useState(!1),[b,v]=c.useState(!1),g=c.useRef([]),n=d?.farcasterSigner;c.useEffect(()=>{let j=Date.now(),i=setInterval(async()=>{if(!n?.public_key)return clearInterval(i),void s({retryable:!0,message:"Connect failed",detail:"Something went wrong. Please try again."});n.status==="approved"&&(clearInterval(i),x(!1),v(!0),g.current.push(setTimeout(()=>r({shouldCallAuthOnSuccess:!1,isSuccess:!0}),w)));let p=await t(n?.public_key),C=Date.now()-j;p.status==="approved"?(clearInterval(i),x(!1),v(!0),g.current.push(setTimeout(()=>r({shouldCallAuthOnSuccess:!1,isSuccess:!0}),w))):C>3e5?(clearInterval(i),s({retryable:!0,message:"Connect failed",detail:"The request timed out. Try again."})):p.status==="revoked"&&(clearInterval(i),s({retryable:!0,message:"Request rejected",detail:"The request was rejected. Please try again."}))},2e3);return()=>{clearInterval(i),g.current.forEach(p=>clearTimeout(p))}},[]);let f=n?.status==="pending_approval"?n.signer_approval_url:void 0;return a.jsx(M,{appName:e.name,loading:k,success:b,errorMessage:l,connectUri:f,onBack:u?m:void 0,onClose:r,onOpenFarcaster:()=>{f&&(window.location.href=f)}})}};export{Z as FarcasterSignerStatusScreen,M as FarcasterSignerStatusView,Z as default};
