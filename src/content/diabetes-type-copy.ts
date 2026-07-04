import type { DiabetesType, Language } from '../types';

export interface DiabetesTypeOptionCopy {
  label: string;
  description: string;
}

export interface DiabetesTypeCopy {
  field: string;
  type1: DiabetesTypeOptionCopy;
  type2: DiabetesTypeOptionCopy;
}

export const DIABETES_TYPE_COPY: Record<Language, DiabetesTypeCopy> = {
  en: {
    field: 'Diabetes type',
    type1: { label: 'Type 1', description: 'Insulin-dependent support with tighter low-glucose watch.' },
    type2: { label: 'Type 2', description: 'Daily support for adults — meals, highs, and a calmer rhythm.' },
  },
  ru: {
    field: 'Тип диабета',
    type1: { label: 'Тип 1', description: 'Поддержка с более чутким контролем низкой глюкозы.' },
    type2: { label: 'Тип 2', description: 'Ежедневная поддержка для взрослых — еда, высокие значения и спокойный ритм.' },
  },
  uk: {
    field: 'Тип діабету',
    type1: { label: 'Тип 1', description: 'Підтримка з чуткішим контролем низької глюкози.' },
    type2: { label: 'Тип 2', description: 'Сімейна підтримка з акцентом на ширші коливання та високі значення.' },
  },
  es: {
    field: 'Tipo de diabetes',
    type1: { label: 'Tipo 1', description: 'Apoyo con vigilancia más estricta de la glucosa baja.' },
    type2: { label: 'Tipo 2', description: 'Apoyo familiar ajustado a patrones más amplios y glucosa alta.' },
  },
  fr: {
    field: 'Type de diabète',
    type1: { label: 'Type 1', description: 'Soutien avec surveillance plus serrée de l’hypoglycémie.' },
    type2: { label: 'Type 2', description: 'Soutien familial adapté aux variations plus larges et aux hyperglycémies.' },
  },
  de: {
    field: 'Diabetes-Typ',
    type1: { label: 'Typ 1', description: 'Unterstützung mit engem Blick auf niedrige Glukose.' },
    type2: { label: 'Typ 2', description: 'Familienunterstützung für breitere Muster und hohe Werte.' },
  },
  zh: {
    field: '糖尿病类型',
    type1: { label: '1 型', description: '更关注低血糖的胰岛素依赖型支持。' },
    type2: { label: '2 型', description: '面向更宽波动和高血糖的家庭支持。' },
  },
  ja: {
    field: '糖尿病のタイプ',
    type1: { label: '1 型', description: '低血糖をより厳密に見守るインスリン依存型向けサポート。' },
    type2: { label: '2 型', description: '幅広い変動と高値に合わせた家族サポート。' },
  },
  pt: {
    field: 'Tipo de diabetes',
    type1: { label: 'Tipo 1', description: 'Apoio com vigilância mais apertada da glicose baixa.' },
    type2: { label: 'Tipo 2', description: 'Apoio familiar ajustado a padrões mais amplos e glicose alta.' },
  },
  he: {
    field: 'סוג הסוכרת',
    type1: { label: 'סוג 1', description: 'תמיכה עם מעקב הדוק יותר אחרי סוכר נמוך.' },
    type2: { label: 'סוג 2', description: 'תמיכה משפחתית מותאמת לתנודות רחבות יותר ולערכים גבוהים.' },
  },
  ar: {
    field: 'نوع السكري',
    type1: { label: 'النوع 1', description: 'دعم مع مراقبة أدق للسكر المنخفض.' },
    type2: { label: 'النوع 2', description: 'دعم عائلي مضبوط لأنماط أوسع وارتفاع السكر.' },
  },
};

export const diabetesTypeKey = (type: DiabetesType): keyof Pick<DiabetesTypeCopy, 'type1' | 'type2'> =>
  type === 'type2' ? 'type2' : 'type1';
