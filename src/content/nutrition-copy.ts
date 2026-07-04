import type { Language } from '../types';

export type NutritionCopy = {
  openCamera: string;
  uploadPhoto: string;
  capture: string;
  retake: string;
  notePlaceholder: string;
  analyze: string;
  analyzing: string;
  cameraHint: string;
  reportTitle: string;
  itemsTitle: string;
  macrosTitle: string;
  impactTitle: string;
  combinedTitle: string;
  todayTitle: string;
  recentTitle: string;
  calories: string;
  carbs: string;
  protein: string;
  fat: string;
  fiber: string;
  sugar: string;
  sodium: string;
  confidence: string;
  mealsToday: string;
  noMeals: string;
  impactLow: string;
  impactModerate: string;
  impactHigh: string;
};

const en: NutritionCopy = {
  openCamera: 'Open camera',
  uploadPhoto: 'Upload photo',
  capture: 'Scan plate',
  retake: 'Retake',
  notePlaceholder: 'Optional: pizza, salad, rice bowl…',
  analyze: 'Analyze meal',
  analyzing: 'Analyzing…',
  cameraHint: 'Center the plate in the frame. Good light helps accuracy.',
  reportTitle: 'Your meal report',
  itemsTitle: 'What we see',
  macrosTitle: 'Nutrition breakdown',
  impactTitle: 'Glucose impact',
  combinedTitle: 'Together with your readings',
  todayTitle: 'Today so far',
  recentTitle: 'Recent meals',
  calories: 'Calories',
  carbs: 'Carbs',
  protein: 'Protein',
  fat: 'Fat',
  fiber: 'Fiber',
  sugar: 'Sugar',
  sodium: 'Sodium',
  confidence: 'Estimate confidence',
  mealsToday: 'meals logged',
  noMeals: 'Scan your first meal to see carbs and how it connects to glucose.',
  impactLow: 'Light',
  impactModerate: 'Moderate',
  impactHigh: 'Higher',
};

const ru: NutritionCopy = {
  openCamera: 'Открыть камеру',
  uploadPhoto: 'Загрузить фото',
  capture: 'Сканировать тарелку',
  retake: 'Переснять',
  notePlaceholder: 'Необязательно: пицца, салат, рис…',
  analyze: 'Анализировать',
  analyzing: 'Анализ…',
  cameraHint: 'Держите тарелку по центру. Хороший свет повышает точность.',
  reportTitle: 'Отчёт о еде',
  itemsTitle: 'Что на тарелке',
  macrosTitle: 'Пищевая ценность',
  impactTitle: 'Влияние на глюкозу',
  combinedTitle: 'Вместе с вашими показаниями',
  todayTitle: 'Сегодня',
  recentTitle: 'Недавние приёмы пищи',
  calories: 'Калории',
  carbs: 'Углеводы',
  protein: 'Белки',
  fat: 'Жиры',
  fiber: 'Клетчатка',
  sugar: 'Сахар',
  sodium: 'Натрий',
  confidence: 'Уверенность оценки',
  mealsToday: 'приёмов пищи',
  noMeals: 'Отсканируйте первый приём пищи — увидите углеводы и связь с глюкозой.',
  impactLow: 'Лёгкое',
  impactModerate: 'Умеренное',
  impactHigh: 'Выше',
};

export const NUTRITION_COPY: Record<Language, NutritionCopy> = {
  en,
  ru,
  uk: { ...ru, openCamera: 'Відкрити камеру', uploadPhoto: 'Завантажити фото', capture: 'Сканувати тарілку', analyze: 'Аналізувати', reportTitle: 'Звіт про їжу', carbs: 'Вуглеводи', protein: 'Білки', fiber: 'Клітковина' },
  es: { ...en, openCamera: 'Abrir cámara', uploadPhoto: 'Subir foto', capture: 'Escanear plato', analyze: 'Analizar', reportTitle: 'Informe de comida', carbs: 'Carbohidratos', todayTitle: 'Hoy' },
  fr: { ...en, openCamera: 'Ouvrir la caméra', uploadPhoto: 'Importer une photo', capture: 'Scanner l’assiette', analyze: 'Analyser', reportTitle: 'Rapport repas', carbs: 'Glucides', protein: 'Protéines' },
  de: { ...en, openCamera: 'Kamera öffnen', uploadPhoto: 'Foto hochladen', capture: 'Teller scannen', analyze: 'Analysieren', reportTitle: 'Mahlzeit-Bericht', carbs: 'Kohlenhydrate', protein: 'Eiweiß', fiber: 'Ballaststoffe' },
  zh: { ...en, openCamera: '打开相机', uploadPhoto: '上传照片', capture: '扫描餐盘', analyze: '分析', reportTitle: '餐食报告', carbs: '碳水', protein: '蛋白质', fiber: '纤维' },
  ja: { ...en, openCamera: 'カメラを開く', uploadPhoto: '写真をアップロード', capture: '食事をスキャン', analyze: '分析する', reportTitle: '食事レポート', carbs: '炭水化物', protein: 'タンパク質', fiber: '食物繊維' },
  pt: { ...en, openCamera: 'Abrir câmera', uploadPhoto: 'Enviar foto', capture: 'Escanear prato', analyze: 'Analisar', reportTitle: 'Relatório da refeição', carbs: 'Carboidratos', protein: 'Proteína', fiber: 'Fibra' },
  he: { ...en, openCamera: 'פתח מצלמה', uploadPhoto: 'העלה תמונה', capture: 'סרוק צלחת', analyze: 'נתח', reportTitle: 'דוח ארוחה', carbs: 'פחמימות', protein: 'חלבון', fiber: 'סיבים' },
  ar: { ...en, openCamera: 'فتح الكاميرا', uploadPhoto: 'رفع صورة', capture: 'مسح الطبق', analyze: 'تحليل', reportTitle: 'تقرير الوجبة', carbs: 'كربohydrates', protein: 'بروtein', fiber: 'ألياف' },
};
