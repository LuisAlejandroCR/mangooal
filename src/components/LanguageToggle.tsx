import { useLanguage, type Language } from "../i18n";

const OPTIONS: { value: Language; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="language-toggle" aria-label="Language selector">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          className={language === option.value ? "active" : ""}
          onClick={() => setLanguage(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
