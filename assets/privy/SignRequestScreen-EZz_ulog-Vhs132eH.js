import{af as U,F as N,z as M,A as o,cb as k,ak as b,bA as E,bB as w,D as t,ab as z,E as p,ao as O,cc as q,cd as F}from"./wallet.js";import{h as I}from"./CopyToClipboard-i_OQSBJr-CNOMMoBc.js";import{d as P}from"./Layouts-BMRfo5hw-ac7eJrSc.js";import{a as $,i as B}from"./JsonTree-BHzNC-ic-BmbWPIJ8.js";import{n as V}from"./ScreenLayout-Cm8E22c4-BZVc9hg-.js";import{c as H}from"./createLucideIcon-CQB5132k.js";import"./ModalFooter-Dm1DuNA5-DsSwKNj1.js";import"./Screen-DmcyiC4O-CgVwO1FA.js";import"./index-CWARkn2w-lV9uBm3s.js";/**
 * @license lucide-react v0.554.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=[["path",{d:"M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",key:"1m0v6g"}],["path",{d:"M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",key:"ohrbg2"}]],K=H("square-pen",J),Q=p.img`
  && {
    height: ${e=>e.size==="sm"?"65px":"140px"};
    width: ${e=>e.size==="sm"?"65px":"140px"};
    border-radius: 16px;
    margin-bottom: 12px;
  }
`;let W=e=>{if(!O(e))return e;try{let a=q(e);return a.includes("�")?e:a}catch{return e}},G=e=>{try{let a=F.decode(e),s=new TextDecoder().decode(a);return s.includes("�")?e:s}catch{return e}},X=e=>{let{types:a,primaryType:s,...l}=e.typedData;return t.jsxs(t.Fragment,{children:[t.jsx(te,{data:l}),t.jsx(I,{text:(n=e.typedData,JSON.stringify(n,null,2)),itemName:"full payload to clipboard"})," "]});var n};const Y=({method:e,messageData:a,copy:s,iconUrl:l,isLoading:n,success:g,walletProxyIsLoading:m,errorMessage:x,isCancellable:d,onSign:c,onCancel:y,onClose:u})=>t.jsx(V,{title:s.title,subtitle:s.description,showClose:!0,onClose:u,icon:K,iconVariant:"subtle",helpText:x?t.jsx(ee,{children:x}):void 0,primaryCta:{label:s.buttonText,onClick:c,disabled:n||g||m,loading:n},secondaryCta:d?{label:"Not now",onClick:y,disabled:n||g||m}:void 0,watermark:!0,children:t.jsxs(P,{children:[l?t.jsx(Q,{style:{alignSelf:"center"},size:"sm",src:l,alt:"app image"}):null,t.jsxs(Z,{children:[e==="personal_sign"&&t.jsx(j,{children:W(a)}),e==="eth_signTypedData_v4"&&t.jsx(X,{typedData:a}),e==="solana_signMessage"&&t.jsx(j,{children:G(a)})]})]})}),ue={component:()=>{let{authenticated:e}=U(),{initializeWalletProxy:a,closePrivyModal:s}=N(),{navigate:l,data:n,onUserCloseViaDialogOrKeybindRef:g}=M(),[m,x]=o.useState(!0),[d,c]=o.useState(""),[y,u]=o.useState(),[f,C]=o.useState(null),[R,S]=o.useState(!1);o.useEffect(()=>{e||l("LandingScreen")},[e]),o.useEffect(()=>{a(k).then(i=>{x(!1),i||(c("An error has occurred, please try again."),u(new b(new E(d,w.E32603_DEFAULT_INTERNAL_ERROR.eipCode))))})},[]);let{method:T,data:_,confirmAndSign:v,onSuccess:D,onFailure:A,uiOptions:r}=n.signMessage,L={title:r?.title||"Sign message",description:r?.description||"Signing this message will not cost you any fees.",buttonText:r?.buttonText||"Sign and continue"},h=i=>{i?D(i):A(y||new b(new E("The user rejected the request.",w.E4001_USER_REJECTED_REQUEST.eipCode))),s({shouldCallAuthOnSuccess:!1}),setTimeout(()=>{C(null),c(""),u(void 0)},200)};return g.current=()=>{h(f)},t.jsx(Y,{method:T,messageData:_,copy:L,iconUrl:r?.iconUrl&&typeof r.iconUrl=="string"?r.iconUrl:void 0,isLoading:R,success:f!==null,walletProxyIsLoading:m,errorMessage:d,isCancellable:r?.isCancellable,onSign:async()=>{S(!0),c("");try{let i=await v();C(i),S(!1),setTimeout(()=>{h(i)},z)}catch(i){console.error(i),c("An error has occurred, please try again."),u(new b(new E(d,w.E32603_DEFAULT_INTERNAL_ERROR.eipCode))),S(!1)}},onCancel:()=>h(null),onClose:()=>h(f)})}};let Z=p.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`,ee=p.p`
  && {
    margin: 0;
    width: 100%;
    text-align: center;
    color: var(--privy-color-error-dark);
    font-size: 14px;
    line-height: 22px;
  }
`,te=p($)`
  margin-top: 0;
`,j=p(B)`
  margin-top: 0;
`;export{ue as SignRequestScreen,Y as SignRequestView,ue as default};
