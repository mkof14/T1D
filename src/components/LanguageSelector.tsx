import React, { useEffect, useRef, useState } from 'react';
import { Language } from '../types';

interface LanguageSelectorProps {
  current: Language;
  onSelect: (lang: Language) => void;
  label: string;
  buttonLabel: string;
  rtl?: boolean;
}

const LANGUAGES: { code: Language; label: string; full: string; native: string; flag: string }[] = [
  { code: 'en', label: 'EN', full: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'DE', full: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'ES', full: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'FR', full: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'ja', label: 'JA', full: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'pt', label: 'PT', full: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'ru', label: 'RU', full: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'uk', label: 'UK', full: 'Ukrainian', native: 'Українська', flag: '🇺🇦' },
  { code: 'zh', label: 'ZH', full: 'Chinese', native: '中文', flag: '🇨🇳' },
  { code: 'he', label: 'HE', full: 'Hebrew', native: 'עברית', flag: '🇮🇱' },
  { code: 'ar', label: 'AR', full: 'Arabic', native: 'العربية', flag: '🇸🇦' },
];

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ current, onSelect, label, buttonLabel, rtl = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((lang) => lang.code === current) || LANGUAGES[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-br from-white/90 to-orange-50/80 dark:from-stone-900/75 dark:to-stone-900/45 backdrop-blur-xl border border-orange-200/70 dark:border-stone-700/80 shadow-[0_4px_20px_rgba(120,53,15,0.08)] transition-all hover:border-orange-300 hover:-translate-y-0.5 active:scale-95 outline-none ${rtl ? 'flex-row-reverse' : ''}`}
        aria-label={buttonLabel}
        aria-expanded={isOpen}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-200/80 via-rose-200/50 to-violet-200/50 dark:from-orange-400/20 dark:via-rose-400/15 dark:to-violet-400/15 flex items-center justify-center text-base shadow-inner">
          <span aria-hidden="true">{currentLang.flag}</span>
        </div>
        <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
          {currentLang.label}
        </span>
      </button>

      {isOpen ? (
        <div className={`absolute mt-4 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden z-[1000] animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 ${rtl ? 'left-0' : 'right-0'}`}>
          <div className="p-4 space-y-1">
            <div className="px-5 py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">{label}</span>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onSelect(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-5 py-4 ${rtl ? 'text-right' : 'text-left'} flex items-center justify-between rounded-2xl transition-all ${
                  current === lang.code ? 'bg-orange-100 text-orange-900 dark:bg-orange-400/10 dark:text-amber-100' : 'text-stone-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800'
                }`}
              >
                <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
                  <span className="text-base leading-none" aria-hidden="true">{lang.flag}</span>
                  <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
                    <span className="text-sm font-semibold">{lang.native}</span>
                    <span className="text-[9px] font-bold opacity-40 italic">{lang.full}</span>
                  </div>
                </div>
                {current === lang.code ? <div className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-amber-300" /> : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LanguageSelector;
