import { useEffect } from "react";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3750);
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
        <div className="splash-sub">Free score picks · Every tournament</div>
      </div>
    </div>
  );
}
