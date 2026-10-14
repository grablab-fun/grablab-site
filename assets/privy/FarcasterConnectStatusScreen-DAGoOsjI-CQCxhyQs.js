import{af as I,z as U,W as D,F as M,A as n,H as d,an as W,ab as k,D as r,ad as O,bb as z,a8 as B,E as s}from"./wallet.js";import{n as q}from"./OpenLink-CUpJ1mOr-C95ZGuNa.js";import{x as V}from"./QrCode-Ca9zCmPl-BUaGWRYM.js";import{f as H}from"./ModalFooter-Dm1DuNA5-DsSwKNj1.js";import{r as P}from"./LabelXs-oqZNqbm_-BTw0rNjb.js";import{a as Q}from"./shouldProceedtoEmbeddedWalletCreationFlow-959zu-5T-Ct2KnG7Z.js";import{n as J}from"./ScreenLayout-Cm8E22c4-BZVc9hg-.js";import{l as F}from"./farcaster-DPlSjvF5-CE-M9eLo.js";import{C as K}from"./check-hDzp6hCD.js";import{C as X}from"./copy-DvRJGr9d.js";import"./dijkstra-D_NXgYpA.js";import"./Screen-DmcyiC4O-CgVwO1FA.js";import"./index-CWARkn2w-lV9uBm3s.js";import"./createLucideIcon-CQB5132k.js";let Y=s.div`
  width: 100%;
`,G=s.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  height: 56px;
  background: ${e=>e.$disabled?"var(--privy-color-background-2)":"var(--privy-color-background)"};
  border: 1px solid var(--privy-color-foreground-4);
  border-radius: var(--privy-border-radius-md);

  &:hover {
    border-color: ${e=>e.$disabled?"var(--privy-color-foreground-4)":"var(--privy-color-foreground-3)"};
  }
`,Z=s.div`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
`,R=s.span`
  display: block;
  font-size: 16px;
  line-height: 24px;
  color: ${e=>e.$disabled?"var(--privy-color-foreground-2)":"var(--privy-color-foreground)"};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  /* Single-line truncation: as a flex item this would otherwise be floored at its
     min-content width, so min-width: 0 lets it shrink and the ellipsis land at the
     container edge. */
  min-width: 0;

  @media (min-width: 441px) {
    font-size: 14px;
    line-height: 20px;
  }
`,ee=s(R)`
  color: var(--privy-color-foreground-3);
  font-style: italic;
`,re=s(P)`
  margin-bottom: 0.5rem;
`,te=s(H)`
  && {
    gap: 0.375rem;
    font-size: 14px;
    flex-shrink: 0;
  }
`;const ae=({value:e,title:u,placeholder:l,className:t,showCopyButton:c=!0,truncate:i,maxLength:p=40,disabled:m=!1})=>{let[h,x]=n.useState(!1),w=i&&e?((a,S,f)=>{if((a=a.startsWith("https://")?a.slice(8):a).length<=f)return a;if(S==="middle"){let y=Math.ceil(f/2)-2,E=Math.floor(f/2)-1;return`${a.slice(0,y)}...${a.slice(-E)}`}return`${a.slice(0,f-3)}...`})(e,i,p):e;return n.useEffect(()=>{if(h){let a=setTimeout(()=>x(!1),3e3);return()=>clearTimeout(a)}},[h]),r.jsxs(Y,{className:t,children:[u&&r.jsx(re,{children:u}),r.jsxs(G,{$disabled:m,children:[r.jsx(Z,{children:e?r.jsx(R,{$disabled:m,title:e,children:w}):r.jsx(ee,{$disabled:m,children:l||"No value"})}),c&&e&&r.jsx(te,{onClick:function(a){a.stopPropagation(),navigator.clipboard.writeText(e).then(()=>x(!0)).catch(console.error)},size:"sm",children:r.jsxs(r.Fragment,h?{children:["Copied",r.jsx(K,{size:14})]}:{children:["Copy",r.jsx(X,{size:14})]})})]})]})},oe=({connectUri:e,loading:u,success:l,errorMessage:t,onBack:c,onClose:i,onOpenFarcaster:p})=>r.jsx(J,O||u?z?{title:t?t.message:"Sign in with Farcaster",subtitle:t?t.detail:"To sign in with Farcaster, please open the Farcaster app.",icon:F,iconVariant:"loading",iconLoadingStatus:{success:l,fail:!!t},primaryCta:e&&p?{label:"Open Farcaster app",onClick:p}:void 0,onBack:c,onClose:i,watermark:!0}:{title:t?t.message:"Signing in with Farcaster",subtitle:t?t.detail:"This should only take a moment",icon:F,iconVariant:"loading",iconLoadingStatus:{success:l,fail:!!t},onBack:c,onClose:i,watermark:!0,children:e&&O&&r.jsx(ie,{children:r.jsx(q,{text:"Take me to Farcaster",url:e,color:"#8a63d2"})})}:{title:"Sign in with Farcaster",subtitle:"Scan with your phone's camera to continue.",onBack:c,onClose:i,watermark:!0,children:r.jsxs(se,{children:[r.jsx(ne,{children:e?r.jsx(V,{url:e,size:275,squareLogoElement:F}):r.jsx(de,{children:r.jsx(B,{})})}),r.jsxs(le,{children:[r.jsx(ce,{children:"Or copy this link and paste it into a phone browser to open the Farcaster app."}),e&&r.jsx(ae,{value:e,truncate:"end",maxLength:30,showCopyButton:!0,disabled:!0})]})]})}),Te={component:()=>{let{authenticated:e,logout:u,ready:l,user:t}=I(),{lastScreen:c,navigate:i,navigateBack:p,setModalData:m}=U(),h=D(),{getAuthFlow:x,loginWithFarcaster:w,closePrivyModal:a,createAnalyticsEvent:S}=M(),[f,y]=n.useState(void 0),[E,$]=n.useState(!1),[b,L]=n.useState(!1),C=n.useRef([]),_=x(),T=_?.meta.connectUri;return n.useEffect(()=>{let g=Date.now(),j=setInterval(async()=>{let A=await _.pollForReady.execute(),N=Date.now()-g;if(A){clearInterval(j),$(!0);try{await w(),L(!0)}catch(o){let v={retryable:!1,message:"Authentication failed"};if(o?.privyErrorCode===d.ALLOWLIST_REJECTED)return void i("AllowlistRejectionScreen");if(o?.privyErrorCode===d.USER_LIMIT_REACHED)return console.error(new W(o).toString()),void i("UserLimitReachedScreen");if(o?.privyErrorCode===d.USER_DOES_NOT_EXIST)return void i("AccountNotFoundScreen");if(o?.privyErrorCode===d.LINKED_TO_ANOTHER_USER)v.detail=o.message??"This account has already been linked to another user.";else{if(o?.privyErrorCode===d.ACCOUNT_TRANSFER_REQUIRED&&o.data?.data?.nonce)return m({accountTransfer:{nonce:o.data?.data?.nonce,account:o.data?.data?.subject,displayName:o.data?.data?.account?.displayName,linkMethod:"farcaster",embeddedWalletAddress:o.data?.data?.otherUser?.embeddedWalletAddress,farcasterEmbeddedAddress:o.data?.data?.otherUser?.farcasterEmbeddedAddress}}),void i("LinkConflictScreen");o?.privyErrorCode===d.INVALID_CREDENTIALS?(v.retryable=!0,v.detail="Something went wrong. Try again."):o?.privyErrorCode===d.TOO_MANY_REQUESTS&&(v.detail="Too many requests. Please wait before trying again.")}y(v)}}else N>12e4&&(clearInterval(j),y({retryable:!0,message:"Authentication failed",detail:"The request timed out. Try again."}))},2e3);return()=>{clearInterval(j),C.current.forEach(A=>clearTimeout(A))}},[]),n.useEffect(()=>{if(l&&e&&b&&t){if(h?.legal.requireUsersAcceptTerms&&!t.hasAcceptedTerms){let g=setTimeout(()=>{i("AffirmativeConsentScreen")},k);return()=>clearTimeout(g)}b&&(Q(t,h.embeddedWallets)?C.current.push(setTimeout(()=>{m({createWallet:{onSuccess:()=>{},onFailure:g=>{console.error(g),S({eventName:"embedded_wallet_creation_failure_logout",payload:{error:g,screen:"FarcasterConnectStatusScreen"}}),u()},callAuthOnSuccessOnClose:!0}}),i("EmbeddedWalletOnAccountCreateScreen")},k)):C.current.push(setTimeout(()=>a({shouldCallAuthOnSuccess:!0,isSuccess:!0}),k)))}},[b,l,e,t]),r.jsx(oe,{connectUri:T,loading:E,success:b,errorMessage:f,onBack:c?p:void 0,onClose:a,onOpenFarcaster:()=>{T&&(window.location.href=T)}})}};let ie=s.div`
  margin-top: 24px;
`,se=s.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`,ne=s.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 275px;
`,le=s.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`,ce=s.div`
  font-size: 0.875rem;
  text-align: center;
  color: var(--privy-color-foreground-2);
`,de=s.div`
  position: relative;
  width: 82px;
  height: 82px;
`;export{Te as FarcasterConnectStatusScreen,oe as FarcasterConnectStatusView,Te as default};
