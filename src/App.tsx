import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "./config/wagmi";
import { BottomNav } from "./components/BottomNav";
import { Predictions } from "./screens/Predictions";
import { AllMatches } from "./screens/AllMatches";
import { PredictionDetail } from "./screens/PredictionDetail";
import { CoachInsight } from "./screens/CoachInsight";
import { CoachPass } from "./screens/CoachPass";
import { CoachPassHistory } from "./screens/CoachPassHistory";
import { Ranking } from "./screens/Ranking";
import { MyPicks } from "./screens/MyPicks";
import { OnChainAudit } from "./screens/OnChainAudit";
import { RewardClaim } from "./screens/RewardClaim";
import { Stats } from "./screens/Stats";
import { Support } from "./screens/Support";
import { SplashScreen } from "./screens/SplashScreen";
import { LanguageProvider } from "./i18n";

const queryClient = new QueryClient();
type RootTab = "picks" | "ranking" | "my-picks" | "coach-pass";
const ROOT_TABS = new Set(["picks", "ranking", "my-picks", "coach-pass"]);

function getStoredTab(): RootTab {
  if (typeof window === "undefined") return "picks";
  const stored = window.localStorage.getItem("mangooal:root-tab");
  return ROOT_TABS.has(stored ?? "") ? (stored as RootTab) : "picks";
}

function RootTabs() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<RootTab>(getStoredTab);

  useEffect(() => {
    const queryTab = searchParams.get("tab");
    if (ROOT_TABS.has(queryTab ?? "")) {
      window.localStorage.setItem("mangooal:root-tab", queryTab as RootTab);
      setTab(queryTab as RootTab);
      navigate("/", { replace: true });
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    const onTab = () => setTab(getStoredTab());
    window.addEventListener("mangooal:tab", onTab);
    return () => window.removeEventListener("mangooal:tab", onTab);
  }, []);

  if (tab === "ranking") return <Ranking />;
  if (tab === "my-picks") return <MyPicks />;
  if (tab === "coach-pass") return <CoachPass />;
  return <Predictions />;
}

function AppShell() {
  const location = useLocation();
  const showBottomNav = !location.pathname.startsWith("/support") && !location.pathname.startsWith("/terms");

  return (
    <>
      <Routes>
        <Route path="/" element={<RootTabs />} />
        <Route path="/matches" element={<AllMatches />} />
        <Route path="/match/:id" element={<PredictionDetail />} />
        <Route path="/coach/:id" element={<CoachInsight />} />
        <Route path="/coach-pass" element={<CoachPass />} />
        <Route path="/coach-pass/history" element={<CoachPassHistory />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/my-picks" element={<MyPicks />} />
        <Route path="/audit/:id" element={<OnChainAudit />} />
        <Route path="/claim" element={<RewardClaim />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/support" element={<Support />} />
      </Routes>
      {showBottomNav && <BottomNav />}
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(() => typeof window !== "undefined" && window.location.pathname === "/");

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          {showSplash ? (
            <SplashScreen onDone={() => setShowSplash(false)} />
          ) : (
            <BrowserRouter>
              <AppShell />
            </BrowserRouter>
          )}
        </LanguageProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}