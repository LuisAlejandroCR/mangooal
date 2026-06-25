import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./config/wagmi";
import { BottomNav } from "./components/BottomNav";
import { Predictions } from "./screens/Predictions";
import { PredictionDetail } from "./screens/PredictionDetail";
import { CoachInsight } from "./screens/CoachInsight";
import { CoachPass } from "./screens/CoachPass";
import { Ranking } from "./screens/Ranking";
import { MyPicks } from "./screens/MyPicks";
import { WalletStatus } from "./screens/WalletStatus";
import { OnChainAudit } from "./screens/OnChainAudit";

const queryClient = new QueryClient();

function AppShell() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Predictions />} />
        <Route path="/match/:id" element={<PredictionDetail />} />
        <Route path="/coach/:id" element={<CoachInsight />} />
        <Route path="/coach-pass" element={<CoachPass />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/my-picks" element={<MyPicks />} />
        <Route path="/wallet" element={<WalletStatus />} />
        <Route path="/audit/:id" element={<OnChainAudit />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
