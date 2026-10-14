/* Grablab wallet island: Privy (EVM + Solana) behind the site's own wallet modal.
   Built with `npm run build` (in wallet-src/) into assets/privy/. site.js loads it on demand and talks to it
   through window.GLPrivy; nothing here signs or sends a transaction. */
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PrivyProvider, usePrivy, useConnectWallet, useLogout } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

const APP_ID = "cmv8hys5c009y0fk19wk9xl0m";
const WC_PROJECT = "e0d66ac468a740af5b8fdecbc14874fa";   /* Reown (WalletConnect) project, public */
/* our wallet ids -> Privy wallet list entries */
const IDS = { phantom:"phantom", solflare:"solflare", backpack:"backpack", metamask:"metamask", coinbase:"coinbase_wallet", walletconnect:"wallet_connect_qr" };
/* one chain per pick so multi-chain wallets connect straight away instead of asking for a network */
const CHAIN = { phantom:"solana-only", solflare:"solana-only", backpack:"solana-only", metamask:"ethereum-only", coinbase:"ethereum-only", walletconnect:"ethereum-and-solana" };

const listeners = new Set();
let current = null;
function emit(addr){ current = addr; listeners.forEach(f => { try { f(addr); } catch (e) {} }); }
const api = { connect(){}, email(){}, logout(){}, get address(){ return current; }, onChange(f){ listeners.add(f); f(current); return () => listeners.delete(f); } };

function firstAddress(user){
  if (!user) return null;
  const w = (user.linkedAccounts || []).filter(a => a.type === "wallet");
  const ext = w.find(a => a.walletClientType && a.walletClientType !== "privy");
  return (ext || w[0] || user.wallet || {}).address || null;
}

function Bridge(){
  const { ready, authenticated, user, login } = usePrivy();
  const { logout } = useLogout({ onSuccess: () => emit(null) });
  const { connectWallet } = useConnectWallet({ onSuccess: ({ wallet }) => emit(wallet.address) });

  useEffect(() => {
    api.connect = id => connectWallet({ walletList:[IDS[id] || id], preSelectedWalletId: IDS[id] || id, walletChainType: CHAIN[id] || "ethereum-and-solana" });
    api.email = email => login(email ? { loginMethods:["email"], prefill:{ type:"email", value:email } } : { loginMethods:["email"] });
    api.logout = () => { emit(null); return logout(); };
  }, [connectWallet, login, logout]);

  useEffect(() => { if (ready && authenticated) emit(firstAddress(user)); }, [ready, authenticated, user]);
  useEffect(() => { if (ready) window.dispatchEvent(new CustomEvent("gl:privy-ready")); }, [ready]);
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
      walletChainType: "ethereum-and-solana",
      walletList: ["phantom", "metamask", "coinbase_wallet", "solflare", "backpack", "wallet_connect"]
    },
    embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" }, solana: { createOnLogin: "users-without-wallets" } },
    externalWallets: { solana: { connectors: toSolanaWalletConnectors() } }
  }}>
    <Bridge />
  </PrivyProvider>
);
window.GLPrivy = api;
