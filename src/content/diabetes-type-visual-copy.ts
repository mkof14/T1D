import type { DiabetesType, Language } from '../types';

export type DiabetesTypeVisualCopy = {
  ribbonTag: Record<DiabetesType, string>;
};

const en: DiabetesTypeVisualCopy = {
  ribbonTag: {
    type1: 'Family path · lows & protective nights',
    type2: 'Adult path · meals, highs & calm rhythm',
  },
};

const ru: DiabetesTypeVisualCopy = {
  ribbonTag: {
    type1: 'Семейный путь · низкие значения и бережная ночь',
    type2: 'Взрослый путь · еда, высокие значения и спокойный ритм',
  },
};

export const DIABETES_TYPE_VISUAL_COPY: Record<Language, DiabetesTypeVisualCopy> = {
  en,
  ru,
  uk: {
    ribbonTag: {
      type1: 'Сімейний шлях · низькі та захисна ніч',
      type2: 'Дорослий шлях · їжа, високі та спокійний ритм',
    },
  },
  es: {
    ribbonTag: {
      type1: 'Camino familiar · hipos y noches protectoras',
      type2: 'Camino adulto · comidas, hiperglucemias y ritmo calmado',
    },
  },
  fr: {
    ribbonTag: {
      type1: 'Parcours familial · hypos et nuits protectrices',
      type2: 'Parcours adulte · repas, hyperglycémies et rythme calme',
    },
  },
  de: {
    ribbonTag: {
      type1: 'Familienpfad · Tiefwerte und schützende Nächte',
      type2: 'Erwachsenenpfad · Mahlzeiten, hohe Werte und ruhiger Rhythmus',
    },
  },
  zh: {
    ribbonTag: {
      type1: '家庭路径 · 低血糖与夜间保护',
      type2: '成人路径 · 餐食、高血糖与平稳节奏',
    },
  },
  ja: {
    ribbonTag: {
      type1: '家族パス · 低値と保護的な夜',
      type2: '成人パス · 食事・高値・穏やかなリズム',
    },
  },
  pt: {
    ribbonTag: {
      type1: 'Caminho familiar · baixas e noites protetoras',
      type2: 'Caminho adulto · refeições, altas e ritmo calmo',
    },
  },
  he: {
    ribbonTag: {
      type1: 'מסלול משפחתי · ערכים נמוכים ולילה מגן',
      type2: 'מסלול למבוגרים · ארוחות, ערכים גבוהים וקצב רגוע',
    },
  },
  ar: {
    ribbonTag: {
      type1: 'مسار عائلي · انخفاضات وليل وقائي',
      type2: 'مسار للبالغين · وجبات وارتفاعات وإيقاع هادئ',
    },
  },
};
