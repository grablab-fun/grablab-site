import{af as R,F as U,z as $,A as y,D as e,ba as g,bp as w,ab as k,E as A}from"./wallet.js";import{F as I}from"./ExclamationTriangleIcon-C5Tgwl-t.js";import{F as P}from"./LockClosedIcon-YVKSR35p.js";import{L as x,u as v,h as j}from"./ModalFooter-Dm1DuNA5-DsSwKNj1.js";import{r as W}from"./Subtitle-CV-2yKE4-vaql7bl2.js";import{e as b}from"./Title-BnzYV3Is-BaT5igNF.js";const M=A.div`
  && {
    border-width: 4px;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  aspect-ratio: 1;
  border-style: solid;
  border-color: ${t=>t.$color??"var(--privy-color-accent)"};
  border-radius: 50%;
`,L={component:()=>{let{user:t}=R(),{client:S,walletProxy:u,refreshSessionAndUser:C,closePrivyModal:s}=U(),r=$(),{entropyId:f,entropyIdVerifier:E}=r.data?.recoverWallet??{},[a,m]=y.useState(!1),[l,F]=y.useState(null),[i,h]=y.useState(null);function n(){if(!a){if(i)return r.data?.setWalletPassword?.onFailure(i),void s();if(!l)return r.data?.setWalletPassword?.onFailure(Error("User exited set recovery flow")),void s()}}r.onUserCloseViaDialogOrKeybindRef.current=n;let T=!(!a&&!l);return e.jsxs(e.Fragment,i?{children:[e.jsx(x,{onClose:n},"header"),e.jsx(M,{$color:"var(--privy-color-error)",style:{alignSelf:"center"},children:e.jsx(I,{height:38,width:38,stroke:"var(--privy-color-error)"})}),e.jsx(b,{style:{marginTop:"0.5rem"},children:"Something went wrong"}),e.jsx(g,{style:{minHeight:"2rem"}}),e.jsx(v,{onClick:()=>h(null),children:"Try again"}),e.jsx(j,{})]}:{children:[e.jsx(x,{onClose:n},"header"),e.jsx(P,{style:{width:"3rem",height:"3rem",alignSelf:"center"}}),e.jsx(b,{style:{marginTop:"0.5rem"},children:"Automatically secure your account"}),e.jsx(W,{style:{marginTop:"1rem"},children:"When you log into a new device, you’ll only need to authenticate to access your account. Never get logged out if you forget your password."}),e.jsx(g,{style:{minHeight:"2rem"}}),e.jsx(v,{loading:a,disabled:T,onClick:()=>async function(){m(!0);try{let o=await S.getAccessToken(),c=w(t,f);if(!o||!u||!c)return;if(!(await u.setRecovery({accessToken:o,entropyId:f,entropyIdVerifier:E,existingRecoveryMethod:c.recoveryMethod,recoveryMethod:"privy"})).entropyId)throw Error("Unable to set recovery on wallet");let d=await C();if(!d)throw Error("Unable to set recovery on wallet");let p=w(d,c.address);if(!p)throw Error("Unabled to set recovery on wallet");F(!!d),setTimeout(()=>{r.data?.setWalletPassword?.onSuccess(p),s()},k)}catch(o){h(o)}finally{m(!1)}}(),children:l?"Success":"Confirm"}),e.jsx(j,{})]})}};export{L as SetAutomaticRecoveryScreen,L as default};
