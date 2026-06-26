import { useEffect } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2250);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="splash">
      <div className="splash-rig">
        <img src="/icon.svg" alt="Mangooal" className="splash-icon" />
        <span className="splash-dot" />
        <span className="splash-dot" />
      </div>
      <div className="splash-words">
        <div className="splash-name">Mangoo<span>al</span></div>
        <div className="splash-sub">FIFA World Cup 2026 · Predictions</div>
      </div>
    </div>
  );
}
