import React from 'react';
import { Camera, ScanLine, Sparkles } from 'lucide-react';
import { LANDING_NUTRITION_COPY, LANDING_NUTRITION_DEMO } from '../../content/landing-nutrition-copy';
import { NUTRITION_COPY } from '../../content/nutrition-copy';
import type { Language } from '../../types';

interface LandingNutritionShowcaseProps {
  lang: Language;
  theme: 'light' | 'dark';
  isRTL: boolean;
}

const DemoMacroRing: React.FC<{
  label: string;
  value: number;
  unit: string;
  max: number;
  accent: string;
}> = ({ label, value, unit, max, accent }) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="t1d-macro-ring">
      <div
        className="t1d-macro-ring__circle"
        style={{ background: `conic-gradient(${accent} ${pct}%, rgba(148,163,184,0.2) ${pct}%)` }}
      >
        <div className="t1d-macro-ring__inner">
          <span className="t1d-macro-ring__value">{value}</span>
          <span className="t1d-macro-ring__unit">{unit}</span>
        </div>
      </div>
      <p className="t1d-macro-ring__label">{label}</p>
    </div>
  );
};

export const LandingNutritionShowcase: React.FC<LandingNutritionShowcaseProps> = ({ lang, theme, isRTL }) => {
  const copy = LANDING_NUTRITION_COPY[lang];
  const nutrition = NUTRITION_COPY[lang];
  const demo = LANDING_NUTRITION_DEMO;
  const shellClass = theme === 'dark' ? 't1d-landing-nutrition t1d-landing-nutrition--dark' : 't1d-landing-nutrition t1d-landing-nutrition--light';
  const softLabel = theme === 'dark' ? 't1d-soft-label t1d-soft-label--dark' : 't1d-soft-label t1d-soft-label--light';
  const subtle = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';

  return (
    <section className={shellClass} aria-labelledby="landing-nutrition-title">
      <div className={`t1d-landing-nutrition__grid ${isRTL ? 't1d-landing-nutrition__grid--rtl' : ''}`}>
        <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className={softLabel}>
            <Sparkles size={14} className={`inline-block align-[-2px] ${isRTL ? 'ml-1' : 'mr-1'}`} />
            {copy.eyebrow}
          </p>
          <h2 id="landing-nutrition-title" className={`text-xl md:text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-50' : 'text-stone-900'}`}>
            {copy.title}
          </h2>
          <p className={`max-w-xl text-sm leading-relaxed ${subtle}`}>{copy.body}</p>
          <ul className={`grid gap-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            {copy.features.map((feature) => (
              <li key={feature} className={`t1d-landing-nutrition__feature ${theme === 'dark' ? 't1d-landing-nutrition__feature--dark' : ''}`}>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className={`t1d-landing-nutrition__demo ${theme === 'dark' ? 't1d-landing-nutrition__demo--dark' : ''}`}>
          <div className={`t1d-meal-scan ${theme === 'dark' ? 't1d-meal-scan--dark' : 't1d-meal-scan--light'}`}>
            <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <p className={softLabel}>{copy.scanLabel}</p>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-emerald-400/12 text-emerald-200' : 'bg-emerald-100 text-emerald-700'}`}>
                <Camera size={16} />
              </span>
            </div>
            <div className="t1d-meal-scan__viewport t1d-landing-nutrition__viewport">
              <div className="t1d-landing-nutrition__scan-frame">
                <span className="t1d-landing-nutrition__scan-corner t1d-landing-nutrition__scan-corner--tl" aria-hidden="true" />
                <span className="t1d-landing-nutrition__scan-corner t1d-landing-nutrition__scan-corner--tr" aria-hidden="true" />
                <span className="t1d-landing-nutrition__scan-corner t1d-landing-nutrition__scan-corner--bl" aria-hidden="true" />
                <span className="t1d-landing-nutrition__scan-corner t1d-landing-nutrition__scan-corner--br" aria-hidden="true" />
                <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center">
                  <ScanLine size={34} className={theme === 'dark' ? 'text-emerald-200/80' : 'text-emerald-700/80'} aria-hidden="true" />
                  <p className={`text-sm leading-relaxed ${subtle}`}>{copy.scanHint}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`t1d-meal-report ${theme === 'dark' ? 't1d-meal-report--dark' : 't1d-meal-report--light'}`}>
            <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
              <div>
                <p className="text-sm font-black tracking-tight">{copy.sampleMeal}</p>
                <p className={`mt-1 text-xs font-semibold ${subtle}`}>{copy.sampleTime}</p>
              </div>
              <span className="t1d-meal-impact-badge t1d-meal-impact--moderate">{copy.impactValue}</span>
            </div>
            <p className={`mt-3 text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-50' : 'text-stone-900'}`}>
              {demo.calories} kcal
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <DemoMacroRing label={nutrition.carbs} value={demo.carbs} unit="g" max={60} accent="#10b981" />
              <DemoMacroRing label={nutrition.protein} value={demo.protein} unit="g" max={40} accent="#0ea5e9" />
              <DemoMacroRing label={nutrition.fiber} value={demo.fiber} unit="g" max={15} accent="#8b5cf6" />
              <DemoMacroRing label={nutrition.calories} value={demo.calories} unit="" max={600} accent="#f97316" />
            </div>
            <p className={`mt-3 text-xs font-semibold ${subtle}`}>{copy.impactLabel}: {copy.impactValue}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingNutritionShowcase;
