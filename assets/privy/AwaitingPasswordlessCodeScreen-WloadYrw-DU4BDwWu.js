import{A as n,z as B,W as $,F as q,af as V,ab as F,D as r,as as h,H as x,an as z,ad as K,E as b}from"./wallet.js";import{F as H}from"./EnvelopeIcon-BTjKb83v.js";import{F as X}from"./PhoneIcon-DukKnoCc.js";import{o as Y}from"./Layouts-BMRfo5hw-ac7eJrSc.js";import{i as Q}from"./Link-BdDilT2T-C3LbSEFd.js";import{a as Z}from"./shouldProceedtoEmbeddedWalletCreationFlow-959zu-5T-Ct2KnG7Z.js";import{n as G}from"./ScreenLayout-Cm8E22c4-BZVc9hg-.js";import"./ModalFooter-Dm1DuNA5-DsSwKNj1.js";import"./Screen-DmcyiC4O-CgVwO1FA.js";import"./index-CWARkn2w-lV9uBm3s.js";function J({title:a,titleId:d,...w},u){return n.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 20 20",fill:"currentColor","aria-hidden":"true","data-slot":"icon",ref:u,"aria-labelledby":d},w),a?n.createElement("title",{id:d},a):null,n.createElement("path",{fillRule:"evenodd",d:"M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",clipRule:"evenodd"}))}const ee=n.forwardRef(J),re=({contactMethod:a,authFlow:d,emailDomain:w,appName:u="Privy",whatsAppEnabled:R=!1,onBack:y,onCodeSubmit:k,onResend:j,errorMessage:p,success:f=!1,resendCountdown:I=0,onInvalidInput:D,onClearError:_})=>{let[c,S]=n.useState(P);n.useEffect(()=>{p||S(P)},[p]);let g=async v=>{v.preventDefault();let o=v.currentTarget.value.replace(" ","");if(o==="")return;if(isNaN(Number(o)))return void D?.("Code should be numeric");_?.();let m=Number(v.currentTarget.name?.charAt(5)),i=[...o||[""]].slice(0,U-m),s=[...c.slice(0,m),...i,...c.slice(m+i.length)];S(s);let E=Math.min(Math.max(m+i.length,0),U-1);isNaN(Number(v.currentTarget.value))||document.querySelector(`input[name=code-${E}]`)?.focus(),s.every(l=>l&&!isNaN(+l))&&(document.querySelector(`input[name=code-${E}]`)?.blur(),await k?.(s.join("")))};return r.jsx(G,{title:"Enter confirmation code",subtitle:r.jsxs("span",d==="email"?{children:["Please check ",r.jsx(W,{children:a})," for an email from"," ",w??"privy.io"," and enter your code below."]}:{children:["Please check ",r.jsx(W,{children:a})," for a",R?" WhatsApp":""," message from ",u," and enter your code below."]}),icon:d==="email"?H:X,onBack:y,showBack:!0,helpText:r.jsxs(se,{children:[r.jsxs("span",{children:["Didn't get ",d==="email"?"an email":"a message","?"]}),I?r.jsxs(le,{children:[r.jsx(ee,{color:"var(--privy-color-foreground)",strokeWidth:1.33,height:"12px",width:"12px"}),r.jsx("span",{children:"Code sent"})]}):r.jsx(Q,{as:"button",size:"sm",onClick:j,children:"Resend code"})]}),children:r.jsx(te,{children:r.jsx(Y,{children:r.jsxs(ne,{children:[r.jsx("div",{children:c.map((v,o)=>r.jsx("input",{name:`code-${o}`,type:"text",value:c[o],onChange:g,onKeyUp:m=>{m.key==="Backspace"&&(i=>{_?.(),S([...c.slice(0,i),"",...c.slice(i+1)]),i>0&&document.querySelector(`input[name=code-${i-1}]`)?.focus()})(o)},inputMode:"numeric",autoFocus:o===0,pattern:"[0-9]",className:`${f?"success":""} ${p?"fail":""}`,autoComplete:K?"one-time-code":"off"},o))}),r.jsx(ie,{$fail:!!p,$success:f,children:r.jsx("span",{children:p==="Invalid or expired verification code"?"Incorrect code":p||(f?"Success!":"")})})]})})})})};let U=6,P=Array(6).fill("");var A,C,ae=((A=ae||{})[A.RESET_AFTER_DELAY=0]="RESET_AFTER_DELAY",A[A.CLEAR_ON_NEXT_VALID_INPUT=1]="CLEAR_ON_NEXT_VALID_INPUT",A),oe=((C=oe||{})[C.EMAIL=0]="EMAIL",C[C.SMS=1]="SMS",C);const ge={component:()=>{let{navigate:a,lastScreen:d,navigateBack:w,setModalData:u,onUserCloseViaDialogOrKeybindRef:R}=B(),y=$(),{closePrivyModal:k,resendEmailCode:j,resendSmsCode:p,getAuthMeta:f,loginWithCode:I,updateWallets:D,createAnalyticsEvent:_}=q(),{authenticated:c,logout:S,user:g}=V(),{whatsAppEnabled:v}=$(),[o,m]=n.useState(!1),[i,s]=n.useState(null),[E,l]=n.useState(null),[N,M]=n.useState(0);R.current=()=>null;let T=f()?.email?0:1,L=T===0?f()?.email||"":f()?.phoneNumber||"",O=F-500;return n.useEffect(()=>{if(N){let t=setTimeout(()=>{M(N-1)},1e3);return()=>clearTimeout(t)}},[N]),n.useEffect(()=>{if(c&&o&&g){if(y?.legal.requireUsersAcceptTerms&&!g.hasAcceptedTerms){let t=setTimeout(()=>{a("AffirmativeConsentScreen")},O);return()=>clearTimeout(t)}if(Z(g,y.embeddedWallets)){let t=setTimeout(()=>{u({createWallet:{onSuccess:()=>{},onFailure:e=>{console.error(e),_({eventName:"embedded_wallet_creation_failure_logout",payload:{error:e,screen:"AwaitingPasswordlessCodeScreen"}}),S()},callAuthOnSuccessOnClose:!0}}),a("EmbeddedWalletOnAccountCreateScreen")},O);return()=>clearTimeout(t)}{D();let t=setTimeout(()=>k({shouldCallAuthOnSuccess:!0,isSuccess:!0}),F);return()=>clearTimeout(t)}}},[c,o,g]),n.useEffect(()=>{if(i&&E===0){let t=setTimeout(()=>{s(null),l(null),document.querySelector("input[name=code-0]")?.focus()},1400);return()=>clearTimeout(t)}},[i,E]),r.jsx(re,{contactMethod:L,authFlow:T===0?"email":"sms",emailDomain:y?.appearance.emailDomain,appName:y?.name,whatsAppEnabled:v,onBack:()=>w(),onCodeSubmit:async t=>{try{await I(t),m(!0)}catch(e){if(e instanceof h&&e.privyErrorCode===x.INVALID_CREDENTIALS)s("Invalid or expired verification code"),l(0);else if(e instanceof h&&e.privyErrorCode===x.CANNOT_LINK_MORE_OF_TYPE)s(e.message);else{if(e instanceof h&&e.privyErrorCode===x.USER_LIMIT_REACHED)return console.error(new z(e).toString()),void a("UserLimitReachedScreen");if(e instanceof h&&e.privyErrorCode===x.USER_DOES_NOT_EXIST)return void a("AccountNotFoundScreen");if(e instanceof h&&e.privyErrorCode===x.LINKED_TO_ANOTHER_USER)return u({errorModalData:{error:e,previousScreen:d??"AwaitingPasswordlessCodeScreen"}}),void a("ErrorScreen",!1);if(e instanceof h&&e.privyErrorCode===x.DISALLOWED_PLUS_EMAIL)return u({inlineError:{error:e}}),void a("ConnectOrCreateScreen",!1);if(e instanceof h&&e.privyErrorCode===x.ACCOUNT_TRANSFER_REQUIRED&&e.data?.data?.nonce)return u({accountTransfer:{nonce:e.data?.data?.nonce,account:L,displayName:e.data?.data?.account?.displayName,linkMethod:T===0?"email":"sms",embeddedWalletAddress:e.data?.data?.otherUser?.embeddedWalletAddress}}),void a("LinkConflictScreen");s("Issue verifying code"),l(0)}}},onResend:async()=>{M(30),T===0?await j():await p()},errorMessage:i||void 0,success:o,resendCountdown:N,onInvalidInput:t=>{s(t),l(1)},onClearError:()=>{E===1&&(s(null),l(null))}})}};let te=b.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto;
  gap: 16px;
  flex-grow: 1;
  width: 100%;
`,ne=b.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;

  > div:first-child {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    border-radius: var(--privy-border-radius-sm);

    > input {
      border: 1px solid var(--privy-color-foreground-4);
      background: var(--privy-color-background);
      border-radius: var(--privy-border-radius-sm);
      padding: 8px 10px;
      height: 48px;
      width: 40px;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      color: var(--privy-color-foreground);
      transition: all 0.2s ease;
    }

    > input:focus {
      border: 1px solid var(--privy-color-foreground);
      box-shadow: 0 0 0 1px var(--privy-color-foreground);
    }

    > input:invalid {
      border: 1px solid var(--privy-color-error);
    }

    > input.success {
      border: 1px solid var(--privy-color-border-success);
      background: var(--privy-color-success-bg);
    }

    > input.fail {
      border: 1px solid var(--privy-color-border-error);
      background: var(--privy-color-error-bg);
      animation: shake 180ms;
      animation-iteration-count: 2;
    }
  }

  @keyframes shake {
    0% {
      transform: translate(1px, 0);
    }
    33% {
      transform: translate(-1px, 0);
    }
    67% {
      transform: translate(-1px, 0);
    }
    100% {
      transform: translate(1px, 0);
    }
  }
`,ie=b.div`
  line-height: 20px;
  min-height: 20px;
  font-size: 14px;
  font-weight: 400;
  color: ${a=>a.$success?"var(--privy-color-success-dark)":a.$fail?"var(--privy-color-error-dark)":"transparent"};
  display: flex;
  justify-content: center;
  width: 100%;
  text-align: center;
`,se=b.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(--privy-color-foreground-2);
`,le=b.div`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--privy-border-radius-sm);
  padding: 2px 8px;
  gap: 4px;
  background: var(--privy-color-background-2);
  color: var(--privy-color-foreground-2);
`,W=b.span`
  font-weight: 500;
  word-break: break-all;
  color: var(--privy-color-foreground);
`;export{ge as AwaitingPasswordlessCodeScreen,re as AwaitingPasswordlessCodeScreenView,ge as default};
