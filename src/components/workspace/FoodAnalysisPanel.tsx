import React from 'react';
import { Camera, ImagePlus, ScanLine, Sparkles } from 'lucide-react';
import type { Language } from '../../types';
import type { T1DTheme } from '../../lib/t1d-ui';
import { t1dBtnPrimary, t1dBtnSecondary, t1dSoftLabel } from '../../lib/t1d-ui';
import type { MealRecord, NutritionPayload } from '../../lib/api';
import { NUTRITION_COPY } from '../../content/nutrition-copy';
import { WorkspaceSectionHeader } from './WorkspaceSectionHeader';

const MACRO_KEYS = ['carbs', 'protein', 'fat', 'fiber', 'sugar', 'calories'] as const;

const impactTone = (level: string, theme: T1DTheme) => {
  if (level === 'high') return theme === 'dark' ? 't1d-meal-impact--high-dark' : 't1d-meal-impact--high';
  if (level === 'moderate') return theme === 'dark' ? 't1d-meal-impact--moderate-dark' : 't1d-meal-impact--moderate';
  return theme === 'dark' ? 't1d-meal-impact--low-dark' : 't1d-meal-impact--low';
};

const MacroRing: React.FC<{ label: string; value: number; unit: string; max: number; accent: string }> = ({
  label,
  value,
  unit,
  max,
  accent,
}) => {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="t1d-macro-ring">
      <div
        className="t1d-macro-ring__circle"
        style={{
          background: `conic-gradient(${accent} ${pct * 3.6}deg, rgba(148,163,184,0.2) 0deg)`,
        }}
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

const MealReport: React.FC<{ meal: MealRecord; copy: (typeof NUTRITION_COPY)['en']; theme: T1DTheme; softLabelClass: string }> = ({
  meal,
  copy,
  theme,
  softLabelClass,
}) => {
  const impactLabel =
    meal.glucoseImpact.level === 'high' ? copy.impactHigh :
    meal.glucoseImpact.level === 'moderate' ? copy.impactModerate :
    copy.impactLow;

  const macroLabels: Record<(typeof MACRO_KEYS)[number], string> = {
    carbs: copy.carbs,
    protein: copy.protein,
    fat: copy.fat,
    fiber: copy.fiber,
    sugar: copy.sugar,
    calories: copy.calories,
  };

  const macroMax: Record<(typeof MACRO_KEYS)[number], number> = {
    carbs: 80,
    protein: 40,
    fat: 35,
    fiber: 15,
    sugar: 30,
    calories: 700,
  };

  const accents = ['#f97316', '#0ea5e9', '#a855f7', '#22c55e', '#eab308', '#f43f5e'];

  return (
    <div className={`t1d-meal-report ${theme === 'dark' ? 't1d-meal-report--dark' : 't1d-meal-report--light'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={softLabelClass}>{copy.reportTitle}</p>
          <h3 className="mt-1 text-xl font-black tracking-tight">{meal.label}</h3>
          <p className="mt-1 text-sm opacity-75">{meal.timeLabel} · {copy.confidence}: {meal.confidence}%</p>
        </div>
        <span className={`t1d-meal-impact-badge ${impactTone(meal.glucoseImpact.level, theme)}`}>{impactLabel}</span>
      </div>

      <div className="mt-5">
        <p className={softLabelClass}>{copy.itemsTitle}</p>
        <ul className="mt-2 space-y-1.5">
          {meal.items.map((item) => (
            <li key={`${item.name}-${item.portion}`} className="flex justify-between gap-3 text-sm">
              <span className="font-semibold">{item.name}</span>
              <span className="opacity-75">{item.portion}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6">
        <p className={softLabelClass}>{copy.macrosTitle}</p>
        <div className="mt-4 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {MACRO_KEYS.map((key, index) => (
            <MacroRing
              key={key}
              label={macroLabels[key]}
              value={meal.macros[key]}
              unit={key === 'calories' ? 'kcal' : 'g'}
              max={macroMax[key]}
              accent={accents[index]}
            />
          ))}
        </div>
        <p className="mt-3 text-xs opacity-70">{copy.sodium}: {meal.macros.sodium} mg</p>
      </div>

      <div className={`mt-6 rounded-2xl border p-4 ${impactTone(meal.glucoseImpact.level, theme)}`}>
        <p className={softLabelClass}>{copy.impactTitle}</p>
        <p className="mt-2 font-bold">{meal.glucoseImpact.headline}</p>
        <p className="mt-1 text-sm leading-relaxed opacity-90">{meal.glucoseImpact.detail}</p>
      </div>

      <div className={`mt-4 rounded-2xl border p-4 ${theme === 'dark' ? 'border-sky-500/30 bg-sky-500/10' : 'border-sky-200 bg-sky-50/90'}`}>
        <p className={`flex items-center gap-2 ${softLabelClass}`}>
          <Sparkles size={14} aria-hidden="true" />
          {copy.combinedTitle}
        </p>
        <p className="mt-2 text-sm leading-relaxed">{meal.combinedInsight}</p>
      </div>
    </div>
  );
};

export type FoodAnalysisPanelProps = {
  lang: Language;
  theme: T1DTheme;
  isRTL?: boolean;
  sectionTitle: string;
  sectionSubtitle: string;
  nutrition: NutritionPayload;
  onAnalyze: (payload: { imageBase64?: string; note?: string }) => Promise<void>;
  busy?: boolean;
};

export const FoodAnalysisPanel: React.FC<FoodAnalysisPanelProps> = ({
  lang,
  theme,
  isRTL = false,
  sectionTitle,
  sectionSubtitle,
  nutrition,
  onAnalyze,
  busy = false,
}) => {
  const copy = NUTRITION_COPY[lang];
  const softLabelClass = t1dSoftLabel(theme);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [cameraOn, setCameraOn] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [note, setNote] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const stopCamera = React.useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  }, []);

  React.useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      setPreview(null);
    } catch {
      setError(lang === 'ru' ? 'Не удалось открыть камеру — загрузите фото.' : 'Could not open camera — try uploading a photo.');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL('image/jpeg', 0.82));
    stopCamera();
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(typeof reader.result === 'string' ? reader.result : null);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    setError(null);
    if (!preview && !note.trim()) {
      setError(lang === 'ru' ? 'Сделайте фото или опишите еду.' : 'Take a photo or describe the meal.');
      return;
    }
    await onAnalyze({
      imageBase64: preview || undefined,
      note: note.trim() || undefined,
    });
    setPreview(null);
    setNote('');
  };

  const lastMeal = nutrition.lastMeal;

  return (
    <section className={`t1d-workspace-section ${theme === 'dark' ? 't1d-workspace-section--dark' : 't1d-workspace-section--light'} ${isRTL ? 'text-right' : 'text-left'}`}>
      <WorkspaceSectionHeader title={sectionTitle} subtitle={sectionSubtitle} theme={theme} isRTL={isRTL} />
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">{nutrition.scanHint}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={`t1d-meal-scan ${theme === 'dark' ? 't1d-meal-scan--dark' : 't1d-meal-scan--light'}`}>
          <div className="t1d-meal-scan__viewport">
            {preview ? (
              <img src={preview} alt="" className="h-full w-full object-cover" />
            ) : cameraOn ? (
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
            ) : (
              <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 p-6 text-center opacity-80">
                <ScanLine size={36} aria-hidden="true" />
                <p className="text-sm leading-relaxed">{copy.cameraHint}</p>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFileChange} />

          <div className={`mt-4 flex flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {!cameraOn && !preview ? (
              <>
                <button type="button" onClick={() => void startCamera()} className={t1dBtnPrimary(theme)}>
                  <span className="inline-flex items-center gap-2"><Camera size={16} />{copy.openCamera}</span>
                </button>
                <button type="button" onClick={() => fileRef.current?.click()} className={t1dBtnSecondary(theme)}>
                  <span className="inline-flex items-center gap-2"><ImagePlus size={16} />{copy.uploadPhoto}</span>
                </button>
              </>
            ) : null}
            {cameraOn ? (
              <button type="button" onClick={capturePhoto} className={t1dBtnPrimary(theme)}>{copy.capture}</button>
            ) : null}
            {preview ? (
              <button type="button" onClick={() => { setPreview(null); void startCamera(); }} className={t1dBtnSecondary(theme)}>{copy.retake}</button>
            ) : null}
          </div>

          <label className="mt-4 block space-y-2">
            <span className={softLabelClass}>{lang === 'ru' ? 'Подсказка' : 'Hint'}</span>
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={copy.notePlaceholder}
              className={`w-full rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-slate-800 bg-slate-950/70 text-slate-100' : 'border-slate-200 bg-white text-slate-900'}`}
            />
          </label>

          <button type="button" disabled={busy} onClick={() => void submit()} className={`mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold ${t1dBtnPrimary(theme)} disabled:opacity-50`}>
            {busy ? copy.analyzing : copy.analyze}
          </button>
          {error ? <p className="mt-2 text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
        </div>

        <div className="space-y-5">
          {nutrition.dailyTotals ? (
            <div className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-orange-100 bg-orange-50/80'}`}>
              <p className={softLabelClass}>{copy.todayTitle}</p>
              <p className="mt-2 text-2xl font-black tracking-tight">{nutrition.dailyTotals.calories} kcal</p>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <span>{copy.carbs}: <strong>{nutrition.dailyTotals.carbs}g</strong></span>
                <span>{copy.protein}: <strong>{nutrition.dailyTotals.protein}g</strong></span>
                <span>{copy.fiber}: <strong>{nutrition.dailyTotals.fiber}g</strong></span>
              </div>
              <p className="mt-2 text-xs opacity-70">{nutrition.dailyTotals.mealsCount} {copy.mealsToday}</p>
            </div>
          ) : (
            <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70 text-slate-300' : 'border-slate-200 bg-slate-50/90 text-slate-600'}`}>
              {copy.noMeals}
            </div>
          )}

          {lastMeal ? <MealReport meal={lastMeal} copy={copy} theme={theme} softLabelClass={softLabelClass} /> : null}
        </div>
      </div>

      {nutrition.recentMeals.length > 1 ? (
        <div className="mt-8">
          <p className={softLabelClass}>{copy.recentTitle}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {nutrition.recentMeals.slice(1, 7).map((meal) => (
              <div key={meal.id} className={`rounded-2xl border p-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-slate-200 bg-slate-50/90'}`}>
                <p className="text-sm font-bold">{meal.label}</p>
                <p className="mt-1 text-xs opacity-70">{meal.timeLabel}</p>
                <p className="mt-2 text-sm">{copy.carbs}: <strong>{meal.macros.carbs}g</strong> · {meal.macros.calories} kcal</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};
