import{A as a,af as E,F as T,z as _,D as e,bp as F,bq as I,aP as U,E as u,aY as W}from"./wallet.js";import{F as N}from"./ShieldCheckIcon-DtdTnEAK.js";import{b as O}from"./ModalFooter-Dm1DuNA5-DsSwKNj1.js";import{l as V}from"./Layouts-BMRfo5hw-ac7eJrSc.js";import{g as z,h as H,y as B,w as D,k as K}from"./shared-C4nt6l3l-ClLMRVYi.js";import{w as t}from"./Screen-DmcyiC4O-CgVwO1FA.js";import"./index-CWARkn2w-lV9uBm3s.js";const re={component:()=>{let[o,h]=a.useState(!0),{authenticated:p,user:b}=E(),{walletProxy:y,closePrivyModal:m,createAnalyticsEvent:v,client:g}=T(),{navigate:j,data:k,onUserCloseViaDialogOrKeybindRef:A}=_(),[l,C]=a.useState(void 0),[x,n]=a.useState(""),[d,f]=a.useState(!1),{entropyId:c,entropyIdVerifier:$,onCompleteNavigateTo:w,onSuccess:P,onFailure:S}=k.recoverWallet,i=(r="User exited before their wallet could be recovered")=>{m({shouldCallAuthOnSuccess:!1}),S(typeof r=="string"?new U(r):r)};return A.current=i,a.useEffect(()=>{if(!p)return i("User must be authenticated and have a Privy wallet before it can be recovered")},[p]),e.jsxs(t,{children:[e.jsx(t.Header,{icon:N,title:"Enter your password",subtitle:"Please provision your account on this new device. To continue, enter your recovery password.",showClose:!0,onClose:i}),e.jsx(t.Body,{children:e.jsx(M,{children:e.jsxs("div",{children:[e.jsxs(z,{children:[e.jsx(H,{type:o?"password":"text",onChange:r=>(s=>{s&&C(s)})(r.target.value),disabled:d,style:{paddingRight:"2.3rem"}}),e.jsx(B,{style:{right:"0.75rem"},children:o?e.jsx(D,{onClick:()=>h(!1)}):e.jsx(K,{onClick:()=>h(!0)})})]}),!!x&&e.jsx(Y,{children:x})]})})}),e.jsxs(t.Footer,{children:[e.jsx(t.HelpText,{children:e.jsxs(V,{children:[e.jsx("h4",{children:"Why is this necessary?"}),e.jsx("p",{children:"You previously set a password for this wallet. This helps ensure only you can access it"})]})}),e.jsx(t.Actions,{children:e.jsx(q,{loading:d||!y,disabled:!l,onClick:async()=>{f(!0);let r=await g.getAccessToken(),s=F(b,c);if(!r||!s||l===null)return i("User must be authenticated and have a Privy wallet before it can be recovered");try{v({eventName:"embedded_wallet_recovery_started",payload:{walletAddress:s.address}}),await y?.recover({accessToken:r,entropyId:c,entropyIdVerifier:$,recoveryPassword:l}),n(""),w?j(w):m({shouldCallAuthOnSuccess:!1}),P?.(s),v({eventName:"embedded_wallet_recovery_completed",payload:{walletAddress:s.address}})}catch(R){I(R)?n("Invalid recovery password, please try again."):n("An error has occurred, please try again.")}finally{f(!1)}},$hideAnimations:!c&&d,children:"Recover your account"})}),e.jsx(t.Watermark,{})]})]})}};let M=u.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,Y=u.div`
  line-height: 20px;
  height: 20px;
  font-size: 13px;
  color: var(--privy-color-error);
  text-align: left;
  margin-top: 0.5rem;
`,q=u(O)`
  ${({$hideAnimations:o})=>o&&W`
      && {
        /* Remove animations because the recoverWallet task on the iframe partially
           blocks the renderer, so the animation stutters and doesn't look good */
        transition: none;
      }
    `}
`;export{re as PasswordRecoveryScreen,re as default};
