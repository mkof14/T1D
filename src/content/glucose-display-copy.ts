import type { Language } from '../types';
import type { GlucoseUnit } from '../lib/glucose-units';

export type GlucoseDisplayCopy = {
  unitField: string;
  unitMgDl: string;
  unitMmol: string;
  unitHint: string;
  trendChart: string;
  rangeGauge: string;
  inTarget: string;
  belowTarget: string;
  aboveTarget: string;
  targetBand: string;
  lowZone: string;
  highZone: string;
  lastReadings: string;
  currentReading: string;
  timeInRange: string;
  type1Target: string;
  type2Target: string;
  noData: string;
  updatedAgo: string;
};

const en: GlucoseDisplayCopy = {
  unitField: 'Glucose units',
  unitMgDl: 'mg/dL (US)',
  unitMmol: 'mmol/L (EU & international)',
  unitHint: 'Choose how numbers appear across the app — charts, alerts, and sensor screens.',
  trendChart: 'Glucose trend',
  rangeGauge: 'Where you are now',
  inTarget: 'In target range',
  belowTarget: 'Below target',
  aboveTarget: 'Above target',
  targetBand: 'Target range',
  lowZone: 'Low',
  highZone: 'High',
  lastReadings: 'Last ~1 hour',
  currentReading: 'Current glucose',
  timeInRange: 'In range lately',
  type1Target: 'Type 1 target: 70–180 mg/dL (3.9–10.0 mmol/L)',
  type2Target: 'Type 2 target: 80–180 mg/dL (4.4–10.0 mmol/L)',
  noData: 'Waiting for a reading',
  updatedAgo: 'Updated',
};

const ru: GlucoseDisplayCopy = {
  unitField: 'Единицы глюкозы',
  unitMgDl: 'mg/dL (США)',
  unitMmol: 'mmol/L (Европа и мир)',
  unitHint: 'Выберите, как показывать числа во всём приложении — графики, сигналы и датчик.',
  trendChart: 'Динамика глюкозы',
  rangeGauge: 'Где вы сейчас',
  inTarget: 'В целевом диапазоне',
  belowTarget: 'Ниже цели',
  aboveTarget: 'Выше цели',
  targetBand: 'Целевой диапазон',
  lowZone: 'Низко',
  highZone: 'Высоко',
  lastReadings: 'Последний ~час',
  currentReading: 'Текущая глюкоза',
  timeInRange: 'В диапазоне недавно',
  type1Target: 'Цель при СД1: 70–180 mg/dL (3.9–10.0 mmol/L)',
  type2Target: 'Цель при СД2: 80–180 mg/dL (4.4–10.0 mmol/L)',
  noData: 'Ожидаем показание',
  updatedAgo: 'Обновлено',
};

const uk: GlucoseDisplayCopy = {
  ...ru,
  unitField: 'Одиниці глюкози',
  unitMgDl: 'mg/dL (США)',
  unitMmol: 'mmol/L (Європа та світ)',
  unitHint: 'Оберіть, як показувати числа в усьому застосунку.',
  trendChart: 'Динаміка глюкози',
  rangeGauge: 'Де ви зараз',
  inTarget: 'У цільовому діапазоні',
  belowTarget: 'Нижче цілі',
  aboveTarget: 'Вище цілі',
  targetBand: 'Цільовий діапазон',
  lowZone: 'Низько',
  highZone: 'Високо',
  lastReadings: 'Остання ~година',
  currentReading: 'Поточна глюкоза',
  timeInRange: 'У діапазоні недавно',
  type1Target: 'Ціль при СД1: 70–180 mg/dL (3.9–10.0 mmol/L)',
  type2Target: 'Ціль при СД2: 80–180 mg/dL (4.4–10.0 mmol/L)',
  noData: 'Чекаємо показник',
  updatedAgo: 'Оновлено',
};

const es: GlucoseDisplayCopy = {
  unitField: 'Unidades de glucosa',
  unitMgDl: 'mg/dL (EE. UU.)',
  unitMmol: 'mmol/L (UE e internacional)',
  unitHint: 'Elige cómo se muestran los números en toda la app.',
  trendChart: 'Tendencia de glucosa',
  rangeGauge: 'Dónde estás ahora',
  inTarget: 'En rango objetivo',
  belowTarget: 'Por debajo del objetivo',
  aboveTarget: 'Por encima del objetivo',
  targetBand: 'Rango objetivo',
  lowZone: 'Bajo',
  highZone: 'Alto',
  lastReadings: 'Última ~hora',
  currentReading: 'Glucosa actual',
  timeInRange: 'En rango recientemente',
  type1Target: 'Objetivo T1: 70–180 mg/dL (3.9–10.0 mmol/L)',
  type2Target: 'Objetivo T2: 80–180 mg/dL (4.4–10.0 mmol/L)',
  noData: 'Esperando lectura',
  updatedAgo: 'Actualizado',
};

const fr: GlucoseDisplayCopy = {
  unitField: 'Unités de glycémie',
  unitMgDl: 'mg/dL (États-Unis)',
  unitMmol: 'mmol/L (UE et international)',
  unitHint: 'Choisissez l’affichage des valeurs dans toute l’application.',
  trendChart: 'Courbe de glycémie',
  rangeGauge: 'Où vous en êtes',
  inTarget: 'Dans la cible',
  belowTarget: 'Sous la cible',
  aboveTarget: 'Au-dessus de la cible',
  targetBand: 'Plage cible',
  lowZone: 'Bas',
  highZone: 'Haut',
  lastReadings: 'Dernière ~heure',
  currentReading: 'Glycémie actuelle',
  timeInRange: 'Dans la cible récemment',
  type1Target: 'Cible DT1 : 70–180 mg/dL (3,9–10,0 mmol/L)',
  type2Target: 'Cible DT2 : 80–180 mg/dL (4,4–10,0 mmol/L)',
  noData: 'En attente d’une mesure',
  updatedAgo: 'Mis à jour',
};

const de: GlucoseDisplayCopy = {
  unitField: 'Glukose-Einheiten',
  unitMgDl: 'mg/dL (USA)',
  unitMmol: 'mmol/L (EU & international)',
  unitHint: 'Legen Sie fest, wie Werte in der gesamten App angezeigt werden.',
  trendChart: 'Glukoseverlauf',
  rangeGauge: 'Aktuelle Position',
  inTarget: 'Im Zielbereich',
  belowTarget: 'Unter dem Ziel',
  aboveTarget: 'Über dem Ziel',
  targetBand: 'Zielbereich',
  lowZone: 'Niedrig',
  highZone: 'Hoch',
  lastReadings: 'Letzte ~Stunde',
  currentReading: 'Aktuelle Glukose',
  timeInRange: 'Kürzlich im Bereich',
  type1Target: 'Ziel Typ 1: 70–180 mg/dL (3,9–10,0 mmol/L)',
  type2Target: 'Ziel Typ 2: 80–180 mg/dL (4,4–10,0 mmol/L)',
  noData: 'Warte auf Messwert',
  updatedAgo: 'Aktualisiert',
};

const zh: GlucoseDisplayCopy = {
  unitField: '葡萄糖单位',
  unitMgDl: 'mg/dL（美国）',
  unitMmol: 'mmol/L（欧洲及国际）',
  unitHint: '选择在整个应用中如何显示数值。',
  trendChart: '葡萄糖趋势',
  rangeGauge: '当前位置',
  inTarget: '在目标范围内',
  belowTarget: '低于目标',
  aboveTarget: '高于目标',
  targetBand: '目标范围',
  lowZone: '偏低',
  highZone: '偏高',
  lastReadings: '最近约1小时',
  currentReading: '当前葡萄糖',
  timeInRange: '近期在范围内',
  type1Target: '1型目标：70–180 mg/dL（3.9–10.0 mmol/L）',
  type2Target: '2型目标：80–180 mg/dL（4.4–10.0 mmol/L）',
  noData: '等待读数',
  updatedAgo: '更新于',
};

const ja: GlucoseDisplayCopy = {
  unitField: 'グルコース単位',
  unitMgDl: 'mg/dL（米国）',
  unitMmol: 'mmol/L（欧州・国際）',
  unitHint: 'アプリ全体での数値表示を選びます。',
  trendChart: 'グルコース推移',
  rangeGauge: '今の位置',
  inTarget: '目標範囲内',
  belowTarget: '目標より低い',
  aboveTarget: '目標より高い',
  targetBand: '目標範囲',
  lowZone: '低い',
  highZone: '高い',
  lastReadings: '直近約1時間',
  currentReading: '現在のグルコース',
  timeInRange: '最近の範囲内',
  type1Target: '1型目標：70–180 mg/dL（3.9–10.0 mmol/L）',
  type2Target: '2型目標：80–180 mg/dL（4.4–10.0 mmol/L）',
  noData: '測定値を待っています',
  updatedAgo: '更新',
};

const pt: GlucoseDisplayCopy = {
  unitField: 'Unidades de glicose',
  unitMgDl: 'mg/dL (EUA)',
  unitMmol: 'mmol/L (UE e internacional)',
  unitHint: 'Escolha como os números aparecem em todo o app.',
  trendChart: 'Tendência da glicose',
  rangeGauge: 'Onde você está',
  inTarget: 'Na meta',
  belowTarget: 'Abaixo da meta',
  aboveTarget: 'Acima da meta',
  targetBand: 'Faixa alvo',
  lowZone: 'Baixo',
  highZone: 'Alto',
  lastReadings: 'Última ~hora',
  currentReading: 'Glicose atual',
  timeInRange: 'Na meta recentemente',
  type1Target: 'Meta T1: 70–180 mg/dL (3,9–10,0 mmol/L)',
  type2Target: 'Meta T2: 80–180 mg/dL (4,4–10,0 mmol/L)',
  noData: 'Aguardando leitura',
  updatedAgo: 'Atualizado',
};

const he: GlucoseDisplayCopy = {
  unitField: 'יחידות גלוקוז',
  unitMgDl: 'mg/dL (ארה"ב)',
  unitMmol: 'mmol/L (אירופה ובינלאומי)',
  unitHint: 'בחרו איך המספרים מוצגים בכל האפליקציה.',
  trendChart: 'מגמת גלוקוז',
  rangeGauge: 'איפה אתם עכשיו',
  inTarget: 'בטווח היעד',
  belowTarget: 'מתחת ליעד',
  aboveTarget: 'מעל היעד',
  targetBand: 'טווח יעד',
  lowZone: 'נמוך',
  highZone: 'גבוה',
  lastReadings: 'שעה אחרונה',
  currentReading: 'גלוקוז נוכחי',
  timeInRange: 'בטווח לאחרונה',
  type1Target: 'יעד סוג 1: 70–180 mg/dL (3.9–10.0 mmol/L)',
  type2Target: 'יעד סוג 2: 80–180 mg/dL (4.4–10.0 mmol/L)',
  noData: 'ממתין לקריאה',
  updatedAgo: 'עודכן',
};

const ar: GlucoseDisplayCopy = {
  unitField: 'وحدات الجلوكوز',
  unitMgDl: 'mg/dL (أمريكا)',
  unitMmol: 'mmol/L (أوروبا والعالم)',
  unitHint: 'اختر كيف تظهر الأرقام في التطبيق بالكامل.',
  trendChart: 'اتجاه الجلوكوز',
  rangeGauge: 'موقعك الآن',
  inTarget: 'ضمن الهدف',
  belowTarget: 'أقل من الهدف',
  aboveTarget: 'أعلى من الهدف',
  targetBand: 'النطاق المستهدف',
  lowZone: 'منخفض',
  highZone: 'مرتفع',
  lastReadings: 'آخر ~ساعة',
  currentReading: 'الجلوكوز الحالي',
  timeInRange: 'ضمن النطاق مؤخرًا',
  type1Target: 'هدف النوع 1: 70–180 mg/dL (3.9–10.0 mmol/L)',
  type2Target: 'هدف النوع 2: 80–180 mg/dL (4.4–10.0 mmol/L)',
  noData: 'بانتظار قراءة',
  updatedAgo: 'تم التحديث',
};

export const GLUCOSE_DISPLAY_COPY: Record<Language, GlucoseDisplayCopy> = {
  en,
  ru,
  uk,
  es,
  fr,
  de,
  zh,
  ja,
  pt,
  he,
  ar,
};

export const glucoseUnitOptionLabel = (lang: Language, unit: GlucoseUnit): string => {
  const copy = GLUCOSE_DISPLAY_COPY[lang];
  return unit === 'mmol/L' ? copy.unitMmol : copy.unitMgDl;
};
