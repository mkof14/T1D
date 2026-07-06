import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Language } from '../types';
import { LANGUAGE_OPTIONS } from '../lib/languages';

interface LanguageSelectorProps {
  current: Language;
  onSelect: (lang: Language) => void;
  label: string;
  buttonLabel: string;
  rtl?: boolean;
  dropUp?: boolean;
}

const LANGUAGES = LANGUAGE_OPTIONS;
const MENU_WIDTH = 256;

const LanguageMenu: React.FC<{
  label: string;
  current: Language;
  rtl: boolean;
  onSelect: (lang: Language) => void;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  className?: string;
  style?: React.CSSProperties;
}> = ({ label, current, rtl, onSelect, onClose, menuRef, className = '', style }) => (
  <div
    ref={menuRef}
    role="listbox"
    aria-label={label}
    className={`w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2.5rem] overflow-hidden z-[1200] ${className}`}
    style={style}
  >
    <div className="p-4 space-y-1">
      <div className="px-5 py-3 mb-2 border-b border-slate-100 dark:border-slate-800">
        <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">{label}</span>
      </div>
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          role="option"
          aria-selected={current === item.code}
          onClick={() => {
            onSelect(item.code);
            onClose();
          }}
          className={`w-full px-5 py-4 ${rtl ? 'text-right' : 'text-left'} flex items-center justify-between rounded-2xl transition-all ${
            current === item.code
              ? 'bg-orange-100 text-orange-900 dark:bg-orange-400/10 dark:text-amber-100'
              : 'text-stone-600 dark:text-stone-400 hover:bg-orange-50 dark:hover:bg-stone-800'
          }`}
        >
          <div className={`flex items-center gap-3 ${rtl ? 'flex-row-reverse' : ''}`}>
            <span className="text-base leading-none" aria-hidden="true">{item.flag}</span>
            <div className={`flex flex-col ${rtl ? 'items-end' : 'items-start'}`}>
              <span className="text-sm font-semibold">{item.native}</span>
              <span className="text-[9px] font-bold opacity-40 italic">{item.full}</span>
            </div>
          </div>
          {current === item.code ? <div className="w-1.5 h-1.5 rounded-full bg-orange-500 dark:bg-amber-300" /> : null}
        </button>
      ))}
    </div>
  </div>
);

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  current,
  onSelect,
  label,
  buttonLabel,
  rtl = false,
  dropUp = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !dropUp || !buttonRef.current) {
      setMenuStyle(null);
      return;
    }

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const left = rtl ? rect.left : Math.max(12, rect.right - MENU_WIDTH);
      setMenuStyle({ top: rect.top - 8, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, dropUp, rtl]);

  const currentLang = LANGUAGES.find((item) => item.code === current) || LANGUAGES[0];

  const closeMenu = () => setIsOpen(false);

  const menu = isOpen ? (
    dropUp && menuStyle ? (
      createPortal(
        <LanguageMenu
          label={label}
          current={current}
          rtl={rtl}
          onSelect={onSelect}
          onClose={closeMenu}
          menuRef={menuRef}
          className="fixed -translate-y-full"
          style={{ top: menuStyle.top, left: menuStyle.left, width: MENU_WIDTH }}
        />,
        document.body,
      )
    ) : dropUp ? null : (
      <LanguageMenu
        label={label}
        current={current}
        rtl={rtl}
        onSelect={onSelect}
        onClose={closeMenu}
        menuRef={menuRef}
        className={`absolute mt-4 top-full ${rtl ? 'left-0' : 'right-0'}`}
      />
    )
  ) : null;

  return (
    <div className="relative w-fit" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className={`group inline-flex items-center gap-3 px-4 py-2.5 rounded-full bg-gradient-to-br from-white/90 to-orange-50/80 dark:from-stone-900/75 dark:to-stone-900/45 backdrop-blur-xl border border-orange-200/70 dark:border-stone-700/80 shadow-[0_4px_20px_rgba(120,53,15,0.08)] transition-all hover:border-orange-300 hover:-translate-y-0.5 active:scale-95 outline-none ${rtl ? 'flex-row-reverse' : ''}`}
        aria-label={buttonLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-200/80 via-rose-200/50 to-violet-200/50 dark:from-orange-400/20 dark:via-rose-400/15 dark:to-violet-400/15 flex items-center justify-center text-base shadow-inner">
          <span aria-hidden="true">{currentLang.flag}</span>
        </div>
        <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white transition-colors">
          {currentLang.label}
        </span>
      </button>
      {menu}
    </div>
  );
};

export default LanguageSelector;
