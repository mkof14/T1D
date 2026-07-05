import type { Language } from '../types';

interface TypeCardCopy {
  label: string;
  title: string;
  body: string;
  points: [string, string];
  cta: string;
}

interface PageTypeNote {
  eyebrow: string;
  body: string;
}

export interface LandingTypeCopy {
  home: {
    sectionTitle: string;
    intro: string;
    heroPrompt: string;
    type1: TypeCardCopy;
    type2: TypeCardCopy;
    footnote: string;
  };
  pages: {
    system: PageTypeNote;
    night: PageTypeNote;
    family: PageTypeNote;
    trust: PageTypeNote;
  };
}

export const LANDING_TYPE_COPY: Record<Language, LandingTypeCopy> = {
  en: {
    home: {
      sectionTitle: 'Type 1 or type 2?',
      intro: 'Different thresholds. Pick yours, connect Dexcom, invite family.',
      heroPrompt: 'Choose your path below.',
      type1: {
        label: 'Type 1',
        title: 'Fast lows — especially at night',
        body: 'Insulin-dependent care when glucose drops quickly.',
        points: ['Calm day, protective night', 'Gentle alerts for lows and fast drops'],
        cta: 'Start — type 1',
      },
      type2: {
        label: 'Type 2',
        title: 'Notice highs sooner',
        body: 'Broader glucose patterns with earlier high alerts.',
        points: ['Gentle day, balanced night', 'Same caring backup and recovery flow'],
        cta: 'Start — type 2',
      },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'Separate paths', body: 'Type 1 and type 2 each get thresholds and support tuned to that diagnosis.' },
      night: { eyebrow: 'At night', body: 'Type 1: closer watch for lows. Type 2: balanced night with earlier high alerts.' },
      family: { eyebrow: 'Setup', body: 'Pick your path once at signup. Everyone who joins shares that household type.' },
      trust: { eyebrow: 'In focus now', body: 'Steady supports type 1 and type 2 families on separate, dedicated paths.' },
    },
  },
  ru: {
    home: {
      sectionTitle: 'Тип 1 или тип 2?',
      intro: 'Разные пороги. Выберите свой тип, подключите Dexcom, пригласите семью.',
      heroPrompt: 'Выберите путь ниже.',
      type1: {
        label: 'Тип 1',
        title: 'Быстрое падение — особенно ночью',
        body: 'Инсулинозависимый уход, когда сахар падает быстро.',
        points: ['Спокойный день, бережная ночь', 'Мягкие сигналы о низком и быстром падении'],
        cta: 'Начать — тип 1',
      },
      type2: {
        label: 'Тип 2',
        title: 'Раньше замечать высокий сахар',
        body: 'Широкие колебания с более ранними сигналами о высоком.',
        points: ['Мягкий день, сбалансированная ночь', 'Тот же заботливый резерв и восстановление'],
        cta: 'Начать — тип 2',
      },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'Отдельные пути', body: 'Тип 1 и тип 2 получают пороги и поддержку, настроенные под каждый диагноз.' },
      night: { eyebrow: 'Ночью', body: 'Тип 1: ближе следим за низким. Тип 2: сбалансированная ночь и более ранние высокие.' },
      family: { eyebrow: 'Настройка', body: 'Путь выбирается один раз при регистрации. Все, кто присоединится, делят тип семьи.' },
      trust: { eyebrow: 'Сейчас в фокусе', body: 'Steady поддерживает семьи с типом 1 и типом 2 на отдельных, выделенных путях.' },
    },
  },
  uk: {
    home: {
      sectionTitle: 'Оберіть тип діабету',
      intro: 'Діабет 1 і 2 типу — різні діагнози. Кожен шлях має свої пороги, мову та підтримку.',
      heroPrompt: 'Оберіть нижче шлях, що відповідає вашому діагнозу.',
      type1: { label: 'Діабет 1 типу', title: 'Захист від швидких низьких', body: 'Для інсулінозалежного догляду — особливо коли глюкоза падає швидко, зокрема вночі.', points: ['Спокійний день, бережна ніч', 'Мʼякі сигнали про низькі та швидке падіння'], cta: 'Почати з типом 1' },
      type2: { label: 'Діабет 2 типу', title: 'Раніше помічати високі', body: 'Для ширших коливань — з раннім увагою до високих значень.', points: ['Мʼякий день, збалансована ніч', 'Той самий резерв і відновлення'], cta: 'Почати з типом 2' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'За типом', body: 'Один engine. Пороги — під тип 1 або 2.' },
      night: { eyebrow: 'Ніч', body: 'Тип 1: строже до низьких. Тип 2: balanced, високі раніше.' },
      family: { eyebrow: 'Setup', body: 'Тип 1 або 2. Join успадковує тип.' },
      trust: { eyebrow: 'Фокус', body: 'Тип 1 і 2 — у поточному scope.' },
    },
  },
  es: {
    home: {
      sectionTitle: 'Elige tu tipo de diabetes',
      intro: 'La diabetes tipo 1 y tipo 2 son diagnósticos distintos. Cada camino tiene sus propios umbrales y apoyo.',
      heroPrompt: 'Elige abajo el camino que corresponda a tu diagnóstico.',
      type1: { label: 'Diabetes tipo 1', title: 'Protección ante hipos rápidas', body: 'Para cuidado con insulina — sobre todo cuando la glucosa baja rápido, incluso de noche.', points: ['Día calmado, noche protectora', 'Alertas suaves por hipos y caídas rápidas'], cta: 'Empezar con tipo 1' },
      type2: { label: 'Diabetes tipo 2', title: 'Atención más temprana a hiperglucemias', body: 'Para patrones más amplios — con hiperglucemias detectadas antes.', points: ['Día suave, noche equilibrada', 'El mismo respaldo y recuperación'], cta: 'Empezar con tipo 2' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'Por tipo', body: 'Un motor. Umbrales según tipo 1 o 2.' },
      night: { eyebrow: 'Noche', body: 'Tipo 1: bajos más estrictos. Tipo 2: balanced, altos antes.' },
      family: { eyebrow: 'Setup', body: 'Tipo 1 o 2. Join hereda el tipo.' },
      trust: { eyebrow: 'Scope', body: 'Tipo 1 y 2 — en foco ahora.' },
    },
  },
  fr: {
    home: {
      sectionTitle: 'Choisissez votre type de diabète',
      intro: 'Le diabète de type 1 et de type 2 sont des diagnostics distincts. Chaque parcours a ses propres seuils et soutien.',
      heroPrompt: 'Choisissez ci-dessous le parcours qui correspond à votre diagnostic.',
      type1: { label: 'Diabète de type 1', title: 'Protection face aux hypoglycémies rapides', body: 'Pour les soins insulinodépendants — surtout quand la glycémie baisse vite, y compris la nuit.', points: ['Jour calme, nuit protectrice', 'Alertes douces pour les bas et chutes rapides'], cta: 'Commencer avec le type 1' },
      type2: { label: 'Diabète de type 2', title: 'Attention plus précoce aux hyperglycémies', body: 'Pour des variations plus larges — avec des hauts repérés plus tôt.', points: ['Jour doux, nuit équilibrée', 'Même relais et reprise'], cta: 'Commencer avec le type 2' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'Par type', body: 'Un moteur. Seuils selon type 1 ou 2.' },
      night: { eyebrow: 'Nuit', body: 'Type 1 : bas plus serrés. Type 2 : balanced, hauts plus tôt.' },
      family: { eyebrow: 'Setup', body: 'Type 1 ou 2. Join hérite du type.' },
      trust: { eyebrow: 'Scope', body: 'Types 1 et 2 — dans le focus.' },
    },
  },
  de: {
    home: {
      sectionTitle: 'Wählen Sie Ihren Diabetes-Typ',
      intro: 'Typ 1 und Typ 2 sind unterschiedliche Diagnosen. Jeder Weg hat eigene Schwellen und Unterstützung.',
      heroPrompt: 'Wählen Sie unten den Weg, der zu Ihrer Diagnose passt.',
      type1: { label: 'Diabetes Typ 1', title: 'Schutz bei schnellen Tiefwerten', body: 'Für insulinabhängige Betreuung — besonders wenn Glukose schnell fällt, auch nachts.', points: ['Ruhiger Tag, schützende Nacht', 'Sanfte Hinweise bei Tiefs und schnellem Fall'], cta: 'Mit Typ 1 starten' },
      type2: { label: 'Diabetes Typ 2', title: 'Frühere Aufmerksamkeit bei hohen Werten', body: 'Für breitere Muster — mit früherer Erkennung hoher Werte.', points: ['Sanfter Tag, ausgewogene Nacht', 'Gleiche Reserve und Erholung'], cta: 'Mit Typ 2 starten' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'Nach Typ', body: 'Eine Engine. Schwellen folgen Typ 1 oder 2.' },
      night: { eyebrow: 'Nacht', body: 'Typ 1: engere Tiefs. Typ 2: balanced, Hohe früher.' },
      family: { eyebrow: 'Setup', body: 'Typ 1 oder 2. Join erbt den Typ.' },
      trust: { eyebrow: 'Scope', body: 'Typ 1 und 2 — im Fokus.' },
    },
  },
  zh: {
    home: {
      sectionTitle: '选择您的糖尿病类型',
      intro: '1 型和 2 型是不同的诊断。每条路径有各自的阈值和支持。',
      heroPrompt: '请在下方选择与您诊断相符的路径。',
      type1: { label: '1 型糖尿病', title: '应对快速低血糖', body: '适用于胰岛素依赖护理 — 尤其当血糖快速下降时，包括夜间。', points: ['白天平稳，夜间保护', '低血糖与快速下降的温和提醒'], cta: '从 1 型开始' },
      type2: { label: '2 型糖尿病', title: '更早关注高血糖', body: '适用于更宽的波动模式 — 更早发现高值。', points: ['白天轻柔，夜间平衡', '相同的后备与恢复流程'], cta: '从 2 型开始' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: '按类型', body: '同一引擎。阈值随 1 型或 2 型。' },
      night: { eyebrow: '夜间', body: '1 型：低值更严。2 型：balanced，高值更早。' },
      family: { eyebrow: '设置', body: '选 1 型或 2 型。加入者继承类型。' },
      trust: { eyebrow: '范围', body: '1 型与 2 型 — 当前重点。' },
    },
  },
  ja: {
    home: {
      sectionTitle: '糖尿病のタイプを選ぶ',
      intro: '1 型と 2 型は別の診断です。それぞれに専用のしきい値とサポートがあります。',
      heroPrompt: '下から、診断に合うパスを選んでください。',
      type1: { label: '1 型糖尿病', title: '急な低値から守る', body: 'インスリン依存のケア向け — 特に血糖が急に下がる夜にも。', points: ['落ち着いた昼、守る夜', '低値と急降下へのやさしい合図'], cta: '1 型で始める' },
      type2: { label: '2 型糖尿病', title: '高値をより早く', body: '幅広い変動向け — 高値を早めに気づく。', points: ['やわらかい昼、バランスの夜', '同じ補助と回復フロー'], cta: '2 型で始める' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'タイプ別', body: '同じ engine。しきい値は 1 型か 2 型。' },
      night: { eyebrow: '夜', body: '1 型：低値をより厳密。2 型：balanced、高値を早めに。' },
      family: { eyebrow: 'Setup', body: '1 型か 2 型。参加は同じタイプ。' },
      trust: { eyebrow: 'Scope', body: '1 型・2 型 — 現在の focus。' },
    },
  },
  pt: {
    home: {
      sectionTitle: 'Escolha o tipo de diabetes',
      intro: 'Diabetes tipo 1 e tipo 2 são diagnósticos distintos. Cada caminho tem seus próprios limites e apoio.',
      heroPrompt: 'Escolha abaixo o caminho que corresponde ao seu diagnóstico.',
      type1: { label: 'Diabetes tipo 1', title: 'Proteção quando a glicose cai rápido', body: 'Para cuidado com insulina — especialmente quando a glicose cai rápido, inclusive à noite.', points: ['Dia calmo, noite protetora', 'Alertas suaves para baixos e quedas rápidas'], cta: 'Começar com tipo 1' },
      type2: { label: 'Diabetes tipo 2', title: 'Atenção mais cedo aos altos', body: 'Para padrões mais amplos — com altos percebidos mais cedo.', points: ['Dia suave, noite equilibrada', 'Mesmo reforço e recuperação'], cta: 'Começar com tipo 2' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'Por tipo', body: 'Um motor. Limites seguem tipo 1 ou 2.' },
      night: { eyebrow: 'Noite', body: 'Tipo 1: baixos mais rígidos. Tipo 2: balanced, altos antes.' },
      family: { eyebrow: 'Setup', body: 'Tipo 1 ou 2. Join herda o tipo.' },
      trust: { eyebrow: 'Scope', body: 'Tipos 1 e 2 — em foco agora.' },
    },
  },
  he: {
    home: {
      sectionTitle: 'בחרו את סוג הסוכרת',
      intro: 'סוכרת סוג 1 וסוג 2 הן אבחנות שונות. לכל מסלול ספים ותמיכה משלו.',
      heroPrompt: 'בחרו למטה את המסלול שמתאים לאבחנה שלכם.',
      type1: { label: 'סוכרת סוג 1', title: 'הגנה כשהסוכר יורד מהר', body: 'לטיפול תלוי אינסולין — במיוחד כשהגלוקוז יורד מהר, גם בלילה.', points: ['יום רגוע, לילה מגן', 'התראות עדינות לנמוכים ולירידה מהירה'], cta: 'התחילו עם סוג 1' },
      type2: { label: 'סוכרת סוג 2', title: 'תשומת לב מוקדמת לגבוהים', body: 'לתנודות רחבות יותר — עם גבוהים שמזוהים מוקדם יותר.', points: ['יום רך, לילה מאוזן', 'אותו גיבוי והתאוששות'], cta: 'התחילו עם סוג 2' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'לפי סוג', body: 'engine אחד. ספים לפי סוג 1 או 2.' },
      night: { eyebrow: 'לילה', body: 'סוג 1: נמוכים הדוקים. סוג 2: balanced, גבוהים מוקדם.' },
      family: { eyebrow: 'Setup', body: 'סוג 1 או 2. join יורש את הסוג.' },
      trust: { eyebrow: 'Scope', body: 'סוג 1 ו-2 — ב-focus עכשיו.' },
    },
  },
  ar: {
    home: {
      sectionTitle: 'اختر نوع السكري',
      intro: 'النوع 1 والنوع 2 تشخيصان مختلفان. لكل مسار عتبات ودعم خاصان.',
      heroPrompt: 'اختر أدناه المسار الذي يناسب تشخيصك.',
      type1: { label: 'سكري النوع 1', title: 'حماية عند الهبوط السريع', body: 'للرعاية المعتمدة على الأنسولين — خاصة عندما ينخفض السكر بسرعة، بما في ذلك ليلًا.', points: ['نهار هادئ، ليل وقائي', 'تنبيهات لطيفة للانخفاض والهبوط السريع'], cta: 'ابدأ مع النوع 1' },
      type2: { label: 'سكري النوع 2', title: 'انتباه أبكر للارتفاع', body: 'لأنماط أوسع — مع ملاحظة المرتفع أبكر.', points: ['نهار أخف، ليل متوازن', 'نفس الاحتياط والتعافي'], cta: 'ابدأ مع النوع 2' },
      footnote: '',
    },
    pages: {
      system: { eyebrow: 'حسب النوع', body: 'محرك واحد. العتبات حسب النوع 1 أو 2.' },
      night: { eyebrow: 'الليل', body: 'النوع 1: انخفاض أشد. النوع 2: balanced، مرتفع أبكر.' },
      family: { eyebrow: 'الإعداد', body: 'النوع 1 أو 2. المنضم يرث النوع.' },
      trust: { eyebrow: 'النطاق', body: 'النوع 1 و2 — ضمن التركيز الآن.' },
    },
  },
};
