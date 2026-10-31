/* Grablab wallet island: Privy (Solana only) behind the site's own wallet modal.
   Built with `npm run build` (in wallet-src/) into assets/privy/. site.js loads it on demand and talks to it
   through window.GLPrivy. It signs two things, always on the player's click: the sign-in text and a swap
   transaction built by Jupiter. It never sends a transaction itself and holds no keys. */
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider, usePrivy, useConnectWallet, useLogout } from "@privy-io/react-auth";
import { toSolanaWalletConnectors, useWallets as useSolanaWallets, useSignMessage, useSignTransaction, useStandardWallets } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";

const APP_ID = "cmv8hys5c009y0fk19wk9xl0m";
const WC_PROJECT = "e0d66ac468a740af5b8fdecbc14874fa";   /* Reown (WalletConnect) project, public */
/* our wallet ids -> Privy wallet list entries */
const IDS = { phantom:"phantom", solflare:"solflare", backpack:"backpack", metamask:"metamask", coinbase:"coinbase_wallet", okx:"okx_wallet", walletconnect:"wallet_connect_qr" };
/* wallets without a Privy id (Trust and any other Wallet Standard Solana wallet) are found by detection */
const DETECTED = ["detected_solana_wallets", "wallet_connect_qr"];
/* Grablab is Solana only: every wallet connects on Solana, no network picker */
const CHAIN_TYPE = "solana-only";
const CHAIN = "solana:mainnet";
const RPC = "solana-rpc.publicnode.com";
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0)), tob64 = u => btoa(String.fromCharCode(...u));

const listeners = new Set();
let current = null, previous = null, standardNow = [];
function emit(addr){ current = addr; listeners.forEach(f => { try { f(addr); } catch (e) {} }); }
const api = { connect(){}, email(){}, logout(){}, sign(){ return Promise.reject(new Error("no wallet")); }, signTx(){ return Promise.reject(new Error("no wallet")); }, has(){ return false; }, get address(){ return current; }, onChange(f){ listeners.add(f); f(current); return () => listeners.delete(f); } };

function firstAddress(user){
  if (!user) return null;
  const w = (user.linkedAccounts || []).filter(a => a.type === "wallet");
  const ext = w.find(a => a.walletClientType && a.walletClientType !== "privy");
  return (ext || w[0] || user.wallet || {}).address || null;
}

/* a wallet that shares several accounts may list the old one first: after a switch, take the other one */
function picked(addr){
  const old = previous; previous = null;
  if (addr !== old) return addr;
  const w = standardNow.find(s => s.accounts?.some(a => a.address === addr));
  return w?.accounts.find(a => a.address !== old)?.address || addr;
}

function Bridge(){
  const { ready, authenticated, user, login } = usePrivy();
  const { logout } = useLogout({ onSuccess: () => emit(null) });
  const { connectWallet } = useConnectWallet({ onSuccess: ({ wallet }) => emit(picked(wallet.address)) });
  const { wallets } = useSolanaWallets();
  const { signMessage } = useSignMessage();
  const { signTransaction } = useSignTransaction();
  const { wallets: standard } = useStandardWallets();
  standardNow = standard;

  useEffect(() => {
    api.connect = id => IDS[id]
      ? connectWallet({ walletList:[IDS[id]], preSelectedWalletId: IDS[id], walletChainType: CHAIN_TYPE })
      : connectWallet({ walletList: DETECTED, walletChainType: CHAIN_TYPE });
    api.email = email => login(email ? { loginMethods:["email"], prefill:{ type:"email", value:email } } : { loginMethods:["email"] });
    /* also drop the connection inside the wallet (MetaMask, Phantom...): otherwise the next connect silently hands back the same account */
    api.logout = async () => {
      previous = current; emit(null);
      await Promise.all(standard.filter(w => w.accounts?.length).map(w => w.features["standard:disconnect"]?.disconnect().catch(() => {})));
      return logout();
    };
    /* sign-in proof for the API: plain text, never a transaction. Returns the signature as base64 */
    api.has = addr => wallets.some(x => x.address === addr);
    api.sign = async (text, addr) => {
      const w = wallets.find(x => x.address === (addr || current)) || (addr ? null : wallets[0]);
      if (!w) throw new Error("no wallet");
      const { signature } = await signMessage({ message: new TextEncoder().encode(text), wallet: w, options: { uiOptions: { showWalletUIs: false } } });
      return tob64(signature);
    };
    /* a Jupiter swap: the wallet shows it, the player approves, Jupiter lands the signed bytes */
    api.signTx = async (b64, addr) => {
      const w = wallets.find(x => x.address === addr);
      if (!w) throw new Error("no wallet");
      const { signedTransaction } = await signTransaction({ transaction: unb64(b64), wallet: w, chain: CHAIN });
      return tob64(signedTransaction);
    };
  }, [connectWallet, login, logout, wallets, standard, signMessage, signTransaction]);

  useEffect(() => { if (ready && authenticated) emit(firstAddress(user)); }, [ready, authenticated, user]);
  /* the player picked another account in Phantom (or Solflare, Backpack): the site follows it */
  useEffect(() => { if (current && wallets.length && !wallets.some(w => w.address === current)) emit(wallets[0].address); }, [wallets]);
  useEffect(() => { if (ready){ api.ready = true; window.dispatchEvent(new CustomEvent("gl:privy-ready")); } }, [ready]);
  return null;
}

const host = document.createElement("div");
host.id = "gl-privy";
document.body.appendChild(host);
createRoot(host).render(
  <PrivyProvider appId={APP_ID} config={{
    walletConnectCloudProjectId: WC_PROJECT,
    loginMethods: ["wallet", "email"],
    appearance: {
      theme: "dark",
      accentColor: "#7d84ff",
      logo: new URL("../brand/mark-chrome-256.png", import.meta.url).href,
      landingHeader: "Connect to Grablab",
      walletChainType: CHAIN_TYPE,
      walletList: ["phantom", "solflare", "backpack", "metamask", "coinbase_wallet", "okx_wallet", "detected_solana_wallets", "wallet_connect"]
    },
    embeddedWallets: { ethereum: { createOnLogin: "off" }, solana: { createOnLogin: "users-without-wallets" } },
    externalWallets: { solana: { connectors: toSolanaWalletConnectors() } },
    solana: { rpcs: { [CHAIN]: { rpc: createSolanaRpc(`https://${RPC}`), rpcSubscriptions: createSolanaRpcSubscriptions(`wss://${RPC}`), blockExplorerUrl: "https://solscan.io" } } }
  }}>
    <Bridge />
  </PrivyProvider>
);
window.GLPrivy = api;
