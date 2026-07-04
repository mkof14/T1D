import type { Language } from '../types';

export type LegalPage = 'trust' | 'privacy' | 'terms' | 'medical' | 'compliance';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageContent = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export const LEGAL_PAGE_ORDER: LegalPage[] = ['trust', 'privacy', 'terms', 'medical', 'compliance'];

export const LEGAL_PAGE_LABELS: Record<Language, Record<LegalPage, string>> = {
  en: { trust: 'Trust & Limits', privacy: 'Privacy Policy', terms: 'Terms Of Use', medical: 'Medical Disclaimer', compliance: 'Compliance Notice' },
  ru: { trust: 'Доверие И Границы', privacy: 'Политика Конфиденциальности', terms: 'Условия Использования', medical: 'Медицинский Дисклеймер', compliance: 'Уведомление О Комплайнс' },
  uk: { trust: 'Довіра Та Межі', privacy: 'Політика Конфіденційності', terms: 'Умови Використання', medical: 'Медичний Дисклеймер', compliance: 'Повідомлення Про Комплаєнс' },
  es: { trust: 'Confianza Y Límites', privacy: 'Política De Privacidad', terms: 'Términos De Uso', medical: 'Aviso Médico', compliance: 'Aviso De Cumplimiento' },
  fr: { trust: 'Confiance Et Limites', privacy: 'Politique De Confidentialité', terms: 'Conditions D’Utilisation', medical: 'Avertissement Médical', compliance: 'Avis De Conformité' },
  de: { trust: 'Vertrauen Und Grenzen', privacy: 'Datenschutzerklärung', terms: 'Nutzungsbedingungen', medical: 'Medizinischer Hinweis', compliance: 'Compliance-Hinweis' },
  zh: { trust: '信任与边界', privacy: '隐私政策', terms: '使用条款', medical: '医疗免责声明', compliance: '合规说明' },
  ja: { trust: '信頼と境界', privacy: 'プライバシーポリシー', terms: '利用規約', medical: '医療に関する免責', compliance: 'コンプライアンス通知' },
  pt: { trust: 'Confiança E Limites', privacy: 'Política De Privacidade', terms: 'Termos De Uso', medical: 'Aviso Médico', compliance: 'Aviso De Conformidade' },
  he: { trust: 'אמון וגבולות', privacy: 'מדיניות פרטיות', terms: 'תנאי שימוש', medical: 'הבהרה רפואית', compliance: 'הודעת תאימות' },
  ar: { trust: 'الثقة والحدود', privacy: 'سياسة الخصوصية', terms: 'شروط الاستخدام', medical: 'إخلاء مسؤولية طبية', compliance: 'إشعار الامتثال' },
};

export const LEGAL_UI_COPY: Record<Language, { copyright: string; reserved: string; classicNote: string }> = {
  en: { copyright: 'Copyright', reserved: 'All rights reserved.', classicNote: 'Clear policies, clear limits, clear responsibility.' },
  ru: { copyright: 'Копирайт', reserved: 'Все права защищены.', classicNote: 'Понятные правила, понятные границы, понятная ответственность.' },
  uk: { copyright: 'Копірайт', reserved: 'Усі права захищені.', classicNote: 'Зрозумілі правила, зрозумілі межі, зрозуміла відповідальність.' },
  es: { copyright: 'Copyright', reserved: 'Todos los derechos reservados.', classicNote: 'Políticas claras, límites claros y responsabilidad clara.' },
  fr: { copyright: 'Copyright', reserved: 'Tous droits réservés.', classicNote: 'Politiques claires, limites claires, responsabilité claire.' },
  de: { copyright: 'Copyright', reserved: 'Alle Rechte vorbehalten.', classicNote: 'Klare Regeln, klare Grenzen, klare Verantwortung.' },
  zh: { copyright: '版权', reserved: '保留所有权利。', classicNote: '规则清楚，边界清楚，责任清楚。' },
  ja: { copyright: '著作権', reserved: 'All rights reserved.', classicNote: '方針も、境界も、責任もわかりやすく。' },
  pt: { copyright: 'Copyright', reserved: 'Todos os direitos reservados.', classicNote: 'Políticas claras, limites claros, responsabilidade clara.' },
  he: { copyright: 'זכויות יוצרים', reserved: 'כל הזכויות שמורות.', classicNote: 'כללים ברורים, גבולות ברורים, אחריות ברורה.' },
  ar: { copyright: 'حقوق النشر', reserved: 'جميع الحقوق محفوظة.', classicNote: 'سياسات واضحة، حدود واضحة، ومسؤولية واضحة.' },
};
