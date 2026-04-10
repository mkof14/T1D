import { AlertTriangle, BellRing, HeartHandshake, MoonStar, ShieldAlert, TimerReset, Workflow } from 'lucide-react';
import type { Language } from '../types';

import type { LegalPage } from './legal-copy';
import type { KnowledgePage } from './knowledge-copy';

export type CorePage = 'home' | 'system' | 'night' | 'family' | 'trust';
export type Page = CorePage | Exclude<LegalPage, 'trust'> | KnowledgePage;

type Copy = {
  brand: string;
  nav: Record<CorePage, string>;
  signIn: string;
  titleByPage: Record<CorePage, string>;
  footerSections: {
    product: string;
    legal: string;
    account: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primary: string;
    secondary: string;
    note: string;
  };
  principle: {
    title: string;
    body: string;
  };
  product: {
    title: string;
    body: string;
    points: string[];
  };
  architecture: {
    title: string;
    items: Array<{ title: string; body: string }>;
  };
  states: {
    title: string;
    items: Array<{ name: string; body: string }>;
  };
  night: {
    title: string;
    intro: string;
    points: string[];
    escalationTitle: string;
    escalation: string[];
  };
  family: {
    title: string;
    intro: string;
    points: string[];
  };
  trust: {
    title: string;
    intro: string;
    legalTitle: string;
    legal: string[];
    mvpTitle: string;
    mvpIn: string[];
    mvpOut: string[];
  };
  summary: {
    title: string;
    body: string;
  };
  footer: {
    disclaimer: string;
    legal: string;
    accountLabel: string;
  };
  ui: {
    biomathCore: string;
    mvpIn: string;
    mvpOut: string;
    selectLanguage: string;
    changeLanguage: string;
    activateLightMode: string;
    activateDarkMode: string;
    switchToLightMode: string;
    switchToDarkMode: string;
  };
};

export const HOME_TERMS: Record<Language, {
  childRole: string;
  parentRole: string;
  supportRole: string;
  step1: string;
  step2: string;
  step3: string;
}> = {
  en: { childRole: 'Child', parentRole: 'Parent', supportRole: 'Support Adult', step1: '1. Notice', step2: '2. Check Again', step3: '3. Call For Backup' },
  ru: { childRole: 'Ребёнок', parentRole: 'Родитель', supportRole: 'Помогающий Взрослый', step1: '1. Сигнал', step2: '2. Повторная Проверка', step3: '3. Вызов Поддержки' },
  uk: { childRole: 'Дитина', parentRole: 'Батьки', supportRole: 'Дорослий Для Підтримки', step1: '1. Сигнал', step2: '2. Повторна Перевірка', step3: '3. Виклик Підтримки' },
  es: { childRole: 'Niño', parentRole: 'Padre O Madre', supportRole: 'Adulto De Apoyo', step1: '1. Aviso', step2: '2. Revisar De Nuevo', step3: '3. Pedir Apoyo' },
  fr: { childRole: 'Enfant', parentRole: 'Parent', supportRole: 'Adulte De Soutien', step1: '1. Alerte', step2: '2. Reverification', step3: '3. Appeler Du Renfort' },
  de: { childRole: 'Kind', parentRole: 'Elternteil', supportRole: 'Unterstutzender Erwachsener', step1: '1. Hinweis', step2: '2. Erneut Prufen', step3: '3. Unterstutzung Holen' },
  zh: { childRole: '孩子', parentRole: '家长', supportRole: '支援大人', step1: '1. 发现风险', step2: '2. 再次确认', step3: '3. 呼叫支援' },
  ja: { childRole: '子ども', parentRole: '保護者', supportRole: '支える大人', step1: '1. 気づく', step2: '2. もう一度確認', step3: '3. 支援を呼ぶ' },
  pt: { childRole: 'Crianca', parentRole: 'Responsavel', supportRole: 'Adulto De Apoio', step1: '1. Aviso', step2: '2. Conferir De Novo', step3: '3. Chamar Apoio' },
  he: { childRole: 'ילד או ילדה', parentRole: 'הורה', supportRole: 'מבוגר תומך', step1: '1. איתור', step2: '2. בדיקה נוספת', step3: '3. קריאה לתמיכה' },
  ar: { childRole: 'الطفل', parentRole: 'ولي الامر', supportRole: 'شخص بالغ داعم', step1: '1. ملاحظة الخطر', step2: '2. تحقق مرة اخرى', step3: '3. طلب دعم' },
};

export const PUBLIC_UI_COPY: Record<Language, {
  howItWorks: string;
  nightSupport: string;
  familySupport: string;
  limits: string;
  shortSummary: string;
  coreIdea: string;
  whatYouGet: string;
}> = {
  en: {
    howItWorks: 'How It Works',
    nightSupport: 'Night Support',
    familySupport: 'For Families',
    limits: 'Limits',
    shortSummary: 'Short Daily Note',
    coreIdea: 'Core Idea',
    whatYouGet: 'What You Get',
  },
  ru: {
    howItWorks: 'Как Это Работает',
    nightSupport: 'Ночная Поддержка',
    familySupport: 'Для Семьи',
    limits: 'Границы',
    shortSummary: 'Короткий Итог',
    coreIdea: 'Главная Идея',
    whatYouGet: 'Что Это Даёт',
  },
  uk: {
    howItWorks: 'Як Це Працює',
    nightSupport: 'Нічна Підтримка',
    familySupport: 'Для Сімʼї',
    limits: 'Межі',
    shortSummary: 'Короткий Підсумок',
    coreIdea: 'Головна Ідея',
    whatYouGet: 'Що Це Дає',
  },
  es: {
    howItWorks: 'Como Funciona',
    nightSupport: 'Apoyo Nocturno',
    familySupport: 'Para La Familia',
    limits: 'Limites',
    shortSummary: 'Nota Corta Del Dia',
    coreIdea: 'Idea Central',
    whatYouGet: 'Lo Que Te Da',
  },
  fr: {
    howItWorks: 'Comment Ca Marche',
    nightSupport: 'Soutien De Nuit',
    familySupport: 'Pour La Famille',
    limits: 'Limites',
    shortSummary: 'Note Courte Du Jour',
    coreIdea: 'Idee Centrale',
    whatYouGet: 'Ce Que Ca Apporte',
  },
  de: {
    howItWorks: 'So Funktioniert Es',
    nightSupport: 'Nacht Hilfe',
    familySupport: 'Fur Familien',
    limits: 'Grenzen',
    shortSummary: 'Kurze Tagesnotiz',
    coreIdea: 'Kernidee',
    whatYouGet: 'Was Es Bringt',
  },
  zh: {
    howItWorks: '怎么运作',
    nightSupport: '夜间支持',
    familySupport: '给家庭',
    limits: '边界',
    shortSummary: '简短摘要',
    coreIdea: '核心思路',
    whatYouGet: '你会得到什么',
  },
  ja: {
    howItWorks: 'しくみ',
    nightSupport: '夜の支え',
    familySupport: '家族のために',
    limits: '境界',
    shortSummary: '短い日次メモ',
    coreIdea: '大事な考え方',
    whatYouGet: 'できること',
  },
  pt: {
    howItWorks: 'Como Funciona',
    nightSupport: 'Apoio Noturno',
    familySupport: 'Para A Familia',
    limits: 'Limites',
    shortSummary: 'Nota Curta Do Dia',
    coreIdea: 'Ideia Central',
    whatYouGet: 'O Que Você Recebe',
  },
  he: {
    howItWorks: 'איך זה עובד',
    nightSupport: 'תמיכה בלילה',
    familySupport: 'בשביל המשפחה',
    limits: 'גבולות',
    shortSummary: 'סיכום קצר',
    coreIdea: 'הרעיון המרכזי',
    whatYouGet: 'מה זה נותן',
  },
  ar: {
    howItWorks: 'كيف يعمل',
    nightSupport: 'دعم الليل',
    familySupport: 'للعائلة',
    limits: 'الحدود',
    shortSummary: 'ملخص قصير',
    coreIdea: 'الفكرة الأساسية',
    whatYouGet: 'ما الذي يقدمه',
  },
};

export const PUBLIC_MICROCOPY: Record<Language, {
  homeSubtitle: string;
  homeNote: string;
  systemIntro: string;
  nightIntro: string;
  familyIntro: string;
  limitsIntro: string;
}> = {
  en: {
    homeSubtitle: 'T1D helps families notice change sooner, understand what matters now, and stay steady through the next step.',
    homeNote: 'Made to stay simple: clear signal, clear next step, clear recovery.',
    systemIntro: 'The system takes in data, checks what changed, and turns it into one clear next step.',
    nightIntro: 'At night, support gets closer and faster without turning everything into noise.',
    familyIntro: 'Everyone sees the same picture, and it stays clear who is responding now.',
    limitsIntro: 'The system helps people act, but it does not replace medical care or live judgment.',
  },
  ru: {
    homeSubtitle: 'T1D помогает семье раньше замечать изменения, быстро понимать главное и спокойнее проходить следующий шаг.',
    homeNote: 'Всё устроено просто: понятный сигнал, понятный следующий шаг, понятное восстановление.',
    systemIntro: 'Система получает данные, замечает изменения и превращает их в один понятный следующий шаг.',
    nightIntro: 'Ночью поддержка становится внимательнее и быстрее, но не превращает всё в шум.',
    familyIntro: 'Все видят одну и ту же картину, и всегда понятно, кто отвечает сейчас.',
    limitsIntro: 'Система помогает действовать, но не заменяет медицинскую помощь и живое решение человека.',
  },
  uk: {
    homeSubtitle: 'T1D допомагає сімʼї раніше помічати зміни, швидко розуміти головне і спокійніше проходити наступний крок.',
    homeNote: 'Усе зроблено просто: зрозумілий сигнал, зрозумілий наступний крок, зрозуміле відновлення.',
    systemIntro: 'Система бере дані, помічає зміни й перетворює їх на один зрозумілий наступний крок.',
    nightIntro: 'Уночі підтримка стає уважнішою й швидшою, але не перетворює все на шум.',
    familyIntro: 'Усі бачать ту саму картину, і завжди зрозуміло, хто відповідає зараз.',
    limitsIntro: 'Система допомагає діяти, але не замінює медичну допомогу та живе рішення людини.',
  },
  es: {
    homeSubtitle: 'T1D ayuda a la familia a notar cambios antes, entender qué importa ahora y pasar el siguiente paso con más calma.',
    homeNote: 'Hecho para seguir simple: señal clara, siguiente paso claro y recuperación clara.',
    systemIntro: 'El sistema toma los datos, detecta el cambio y lo convierte en un siguiente paso claro.',
    nightIntro: 'Por la noche el apoyo se vuelve más cercano y rápido, sin convertir todo en ruido.',
    familyIntro: 'Todos ven la misma situación y siempre queda claro quién responde ahora.',
    limitsIntro: 'El sistema ayuda a actuar, pero no sustituye la atención médica ni el juicio humano.',
  },
  fr: {
    homeSubtitle: 'T1D aide la famille a voir le changement plus tot, comprendre l essentiel et traverser la suite avec plus de calme.',
    homeNote: 'Concu pour rester simple: signal clair, suite claire, recuperation claire.',
    systemIntro: 'Le systeme prend les donnees, repere le changement et le transforme en une suite claire.',
    nightIntro: 'La nuit, le soutien devient plus proche et plus rapide sans transformer tout en bruit.',
    familyIntro: 'Tout le monde voit la meme situation et il reste clair qui repond maintenant.',
    limitsIntro: 'Le systeme aide a agir, mais il ne remplace ni le soin medical ni le jugement humain.',
  },
  de: {
    homeSubtitle: 'T1D hilft Familien, Veranderungen fruher zu sehen, das Wichtige jetzt zu verstehen und ruhiger durch den nachsten Schritt zu gehen.',
    homeNote: 'Bewusst einfach: klares Signal, klarer nachster Schritt, klare Erholung.',
    systemIntro: 'Das System nimmt Daten auf, erkennt Veranderung und macht daraus einen klaren nachsten Schritt.',
    nightIntro: 'Nachts wird die Unterstutzung naher und schneller, ohne alles in Larm zu verwandeln.',
    familyIntro: 'Alle sehen dasselbe Bild und es bleibt klar, wer gerade reagiert.',
    limitsIntro: 'Das System hilft beim Handeln, ersetzt aber weder medizinische Versorgung noch menschliches Urteil.',
  },
  zh: {
    homeSubtitle: 'T1D 帮助家庭更早发现变化，更快看懂重点，也更平稳地走到下一步。',
    homeNote: '它刻意保持简单：信号清楚，下一步清楚，恢复也清楚。',
    systemIntro: '系统接收数据，发现变化，然后把它变成一个清楚的下一步。',
    nightIntro: '夜间支持会更近、更快，但不会把整晚都变成噪音。',
    familyIntro: '每个人看到的是同一幅画面，也始终清楚谁正在响应。',
    limitsIntro: '系统帮助人采取行动，但不替代医疗照护，也不替代人的判断。',
  },
  ja: {
    homeSubtitle: 'T1D は家族が変化に早く気づき、今大事なことを理解し、次の一歩を落ち着いて進めるのを助けます。',
    homeNote: 'わかりやすさを大切にしています。合図も、次の一歩も、回復もシンプルです。',
    systemIntro: 'この仕組みはデータを受け取り、変化を見つけて、次の一歩をわかりやすく示します。',
    nightIntro: '夜は支え方がより近く、より早くなりますが、画面を騒がしくはしません。',
    familyIntro: 'みんなが同じ状況を見て、今だれが動いているかもはっきりします。',
    limitsIntro: 'この仕組みは行動を助けますが、医療や人の判断の代わりにはなりません。',
  },
  pt: {
    homeSubtitle: 'T1D ajuda a familia a notar mudancas mais cedo, entender o que importa agora e passar pelo proximo passo com mais calma.',
    homeNote: 'Feito para ficar simples: sinal claro, proximo passo claro e recuperacao clara.',
    systemIntro: 'O sistema recebe os dados, percebe a mudanca e transforma isso em um proximo passo claro.',
    nightIntro: 'A noite, o apoio fica mais proximo e mais rapido, sem transformar tudo em ruido.',
    familyIntro: 'Todos veem a mesma situacao e fica claro quem esta respondendo agora.',
    limitsIntro: 'O sistema ajuda a agir, mas nao substitui cuidado medico nem julgamento humano.',
  },
  he: {
    homeSubtitle: 'T1D עוזר למשפחה לזהות שינוי מוקדם יותר, להבין מהר מה חשוב עכשיו ולעבור את הצעד הבא בצורה רגועה יותר.',
    homeNote: 'המערכת נשארת פשוטה: סימן ברור, צעד הבא ברור והתאוששות ברורה.',
    systemIntro: 'המערכת מקבלת נתונים, מזהה שינוי והופכת אותו לצעד הבא בצורה ברורה.',
    nightIntro: 'בלילה התמיכה נעשית קרובה ומהירה יותר, בלי להפוך את הכול לרעש.',
    familyIntro: 'כולם רואים את אותה תמונה, ותמיד ברור מי מגיב עכשיו.',
    limitsIntro: 'המערכת עוזרת לפעול, אבל לא מחליפה טיפול רפואי או שיקול דעת אנושי.',
  },
  ar: {
    homeSubtitle: 'يساعد T1D العائلة على ملاحظة التغير مبكرًا وفهم ما يهم الآن وعبور الخطوة التالية بهدوء أكبر.',
    homeNote: 'النظام يبقى بسيطًا: إشارة واضحة، خطوة تالية واضحة، وتعافٍ واضح.',
    systemIntro: 'يأخذ النظام البيانات ويلاحظ التغير ثم يحول ذلك إلى خطوة تالية واضحة.',
    nightIntro: 'في الليل يصبح الدعم أقرب وأسرع من دون أن يحول كل شيء إلى ضجيج.',
    familyIntro: 'يرى الجميع الصورة نفسها، ويظل واضحًا من الذي يستجيب الآن.',
    limitsIntro: 'يساعد النظام الناس على التحرك، لكنه لا يبدل الرعاية الطبية ولا الحكم البشري.',
  },
};

// All new copy in this project must be added for every supported language.
export const COPY: Record<Language, Copy> = {
  en: {
    brand: 'T1D',
    nav: {
      home: 'Home',
      system: 'System',
      night: 'Night Mode',
      family: 'Family',
      trust: 'Trust',
    },
    signIn: 'Open Access',
    titleByPage: {
      home: 'T1D Support System',
      system: 'System Architecture',
      night: 'Night Mode',
      family: 'Family Model',
      trust: 'Trust And Limits',
    },
    footerSections: {
      product: 'Product',
      legal: 'Legal',
      account: 'Account',
    },
    hero: {
      eyebrow: 'Daily safety support for families living with T1D',
      title: 'See what matters sooner. Know what to do next. Stay supported day and night.',
      subtitle:
        'T1D helps parents, adults living with T1D, and support adults stay clear on what is happening, when something needs attention, and when recovery is being monitored.',
      primary: 'Create Account',
      secondary: 'Open System',
      note: 'Built to stay simple: clear signal, clear action, clear recovery.',
    },
    principle: {
      title: 'Core Principle',
      body: 'Keep the night clear, calm, and actionable.',
    },
    product: {
      title: 'What You Get',
      body:
        'One place to understand the current situation, respond when needed, and stay on top of recovery without overload.',
      points: [
        'A clearer night view with less guesswork.',
        'Shared visibility for child, parent, and the adults helping.',
        'Simple next steps during a risky moment.',
        'A short summary the next morning.',
      ],
    },
    architecture: {
      title: 'Architecture',
      items: [
        { title: 'Data Layer', body: 'CGM sources such as Dexcom, with mobile signals reserved for future expansion.' },
        { title: 'Normalization Layer', body: 'Unified format, time synchronization, and confidence evaluation.' },
        { title: 'State Engine', body: 'Core states: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Trend analysis, rate of change, and a 15-30 minute short forecast.' },
        { title: 'Signal Logic', body: 'Decides when to notify, how strongly to notify, and what should happen next.' },
        { title: 'Notifications', body: 'Push, repeat, extra backup, and clear confirmation when someone responds.' },
      ],
    },
    states: {
      title: 'State Logic',
      items: [
        { name: 'NORMAL', body: 'Stable state with minimal display.' },
        { name: 'FALLING', body: 'A drop is detected. Attention without panic.' },
        { name: 'RISK', body: 'Dangerous threshold may be reached soon. Recommendation is shown.' },
        { name: 'CRITICAL', body: 'High risk or already dangerous state. Immediate action is required.' },
        { name: 'RECOVERY', body: 'Observation after intervention until stabilization is confirmed.' },
      ],
    },
    night: {
      title: 'Night Mode',
      intro: 'Night mode is the heart of the product. It should catch danger early without turning the whole night into noise.',
      points: [
        'More sensitive thresholds.',
        'Accelerated escalation.',
        'Mandatory critical alerts.',
        'Future voice mode for sleep-time interventions.',
      ],
      escalationTitle: 'Signal Steps',
      escalation: ['1. Signal', '2. Repeat', '3. Stronger Signal', '4. Bring In Backup'],
    },
    family: {
      title: 'Family Model',
      intro: 'The product is built for one shared support flow across the whole day.',
      points: [
        'Child, parent, and support adult stay in the same picture.',
        'Responsibility stays visible and clear.',
        'The screen shows who is responding right now.',
        'The morning summary stays short and easy to read.',
      ],
    },
    trust: {
      title: 'Trust And Limits',
      intro: 'The system supports action, but it is not a medical device and does not replace a physician.',
      legalTitle: 'Trust Boundaries',
      legal: [
        'Not a medical instrument.',
        'Does not diagnose or treat.',
        'Does not guarantee prevention of events.',
        'Depends on device quality, incoming data, and user response.',
      ],
      mvpTitle: 'Current Focus',
      mvpIn: ['CGM', 'Night support', 'Critical signal', 'Extra backup', 'Recovery', 'Family support'],
      mvpOut: ['Type 2 mode', 'Physical device', 'AI layer', 'Analytics dashboards', 'Complex settings'],
    },
    summary: {
      title: 'Simple Morning Summary',
      body: '1 signal. Parent responded. Child recovered.',
    },
    footer: {
      disclaimer:
        'This system is not a medical device, not a diagnostic tool, and not a substitute for physician care. It depends on device data and timely user response.',
      legal: 'Trust And Legal Limits',
      accountLabel: 'Theme',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'In Current Focus',
      mvpOut: 'Outside Current Focus',
      selectLanguage: 'Select Language',
      changeLanguage: 'Change language',
      activateLightMode: 'Activate light mode',
      activateDarkMode: 'Activate dark mode',
      switchToLightMode: 'Switch to Light Mode',
      switchToDarkMode: 'Switch to Dark Mode',
    },
  },
  ru: {
    brand: 'T1D',
    nav: {
      home: 'Главная',
      system: 'Система',
      night: 'Ночной режим',
      family: 'Семья',
      trust: 'Trust',
    },
    signIn: 'Открыть доступ',
    titleByPage: {
      home: 'Система Поддержки T1D',
      system: 'Архитектура Системы',
      night: 'Ночной Режим',
      family: 'Семейная Модель',
      trust: 'Доверие И Границы',
    },
    footerSections: {
      product: 'Продукт',
      legal: 'Юридические границы',
      account: 'Аккаунт',
    },
    hero: {
      eyebrow: 'Ежедневная поддержка безопасности для семей, живущих с T1D',
      title: 'Раньше увидеть важное. Быстро понять, что делать дальше. Оставаться в поддержке днём и ночью.',
      subtitle:
        'T1D помогает родителям, взрослым с T1D и помогающим взрослым быстро понимать, что происходит, когда нужно внимание и когда система просто следит за восстановлением.',
      primary: 'Создать аккаунт',
      secondary: 'Открыть систему',
      note: 'Всё построено просто: понятный сигнал, понятное действие и понятное восстановление.',
    },
    principle: {
      title: 'Ключевой Принцип',
      body: 'Ночь должна быть понятной, спокойной и управляемой.',
    },
    product: {
      title: 'Что Даёт Продукт',
      body:
        'Одно место, где можно быстро понять текущую ситуацию, отреагировать, если это нужно, и не потерять момент восстановления.',
      points: [
        'Более ясную картину ночью без лишней суеты.',
        'Общую картину для ребёнка и взрослых рядом.',
        'Простые следующие шаги в рискованный момент.',
        'Короткий итог утром.',
      ],
    },
    architecture: {
      title: 'Архитектура',
      items: [
        { title: 'Data Layer', body: 'Источники CGM, такие как Dexcom, и в будущем мобильные сигналы.' },
        { title: 'Normalization Layer', body: 'Единый формат, синхронизация по времени и оценка достоверности.' },
        { title: 'State Engine', body: 'Состояния: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Анализ тренда, скорости изменения и короткий прогноз на 15-30 минут.' },
        { title: 'Логика Сигналов', body: 'Решает, когда уведомлять, насколько заметно и что делать дальше.' },
        { title: 'Уведомления', body: 'Push, повтор, подключение резерва и понятное подтверждение, когда кто-то ответил.' },
      ],
    },
    states: {
      title: 'Логика Состояний',
      items: [
        { name: 'NORMAL', body: 'Стабильное состояние с минимальным отображением.' },
        { name: 'FALLING', body: 'Обнаружено снижение. Внимание без паники.' },
        { name: 'RISK', body: 'Опасный уровень может быть достигнут скоро. Появляется рекомендация.' },
        { name: 'CRITICAL', body: 'Высокий риск или уже опасное состояние. Требуется немедленное действие.' },
        { name: 'RECOVERY', body: 'Наблюдение после вмешательства до подтвержденной стабилизации.' },
      ],
    },
    night: {
      title: 'Ночной Режим',
      intro: 'Ночной режим - сердце продукта. Он должен раньше замечать риск, но не превращать всю ночь в шум.',
      points: [
        'Более чувствительные пороги.',
        'Более быстрое подключение резерва.',
        'Обязательные критические сигналы.',
        'Будущий voice-режим для ночного сценария.',
      ],
      escalationTitle: 'Шаги Сигнала',
      escalation: ['1. Сигнал', '2. Повтор', '3. Усиление', '4. Подключение Резерва'],
    },
    family: {
      title: 'Семейная Модель',
      intro: 'Продукт построен как единый сценарий поддержки для всей семьи в течение дня.',
      points: [
        'Ребёнок, родитель и помогающий взрослый видят одну и ту же ситуацию.',
        'Передача ответственности видна и понятна.',
        'Экран показывает, кто отвечает прямо сейчас.',
        'Утренний итог остаётся коротким и простым.',
      ],
    },
    trust: {
      title: 'Доверие И Границы',
      intro: 'Система поддерживает действия, но не является медицинским устройством и не заменяет врача.',
      legalTitle: 'Границы Доверия',
      legal: [
        'Не является медицинским инструментом.',
        'Не ставит диагнозы и не лечит.',
        'Не гарантирует предотвращение событий.',
        'Зависит от качества устройств, данных и реакции пользователя.',
      ],
      mvpTitle: 'Текущий Фокус',
      mvpIn: ['CGM', 'Ночная поддержка', 'Критический сигнал', 'Подключение резерва', 'Восстановление', 'Семейная поддержка'],
      mvpOut: ['Режим T2', 'Физическое устройство', 'AI слой', 'Аналитические панели', 'Сложные настройки'],
    },
    summary: {
      title: 'Простой Утренний Итог',
      body: '1 сигнал. Родитель ответил. Ребёнок восстановился.',
    },
    footer: {
      disclaimer:
        'Система не является медицинским устройством, диагностическим инструментом и не заменяет врача. Она зависит от качества данных устройств и своевременной реакции пользователя.',
      legal: 'Доверие И Юридические Границы',
      accountLabel: 'Тема',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'В Текущем Фокусе',
      mvpOut: 'Вне Текущего Фокуса',
      selectLanguage: 'Выбор Языка',
      changeLanguage: 'Сменить язык',
      activateLightMode: 'Включить светлую тему',
      activateDarkMode: 'Включить тёмную тему',
      switchToLightMode: 'Переключить на светлую тему',
      switchToDarkMode: 'Переключить на тёмную тему',
    },
  },
  uk: {
    brand: 'T1D',
    nav: {
      home: 'Головна',
      system: 'Система',
      night: 'Нічний режим',
      family: 'Сімʼя',
      trust: 'Довіра',
    },
    signIn: 'Відкрити доступ',
    titleByPage: {
      home: 'Система Підтримки T1D',
      system: 'Архітектура Системи',
      night: 'Нічний Режим',
      family: 'Сімейна Модель',
      trust: 'Довіра Та Межі',
    },
    footerSections: {
      product: 'Продукт',
      legal: 'Юридичні межі',
      account: 'Акаунт',
    },
    hero: {
      eyebrow: 'Нічна підтримка для сімей, які живуть з T1D',
      title: 'Раніше побачити ризик. Зрозуміти, хто відповідає. Спокійніше пройти ніч.',
      subtitle:
        'T1D допомагає дитині, батькам і дорослому для підтримки діяти як одна команда, коли вночі падає цукор. Одразу видно, що відбувається, що робити далі і хто взяв відповідальність.',
      primary: 'Створити акаунт',
      secondary: 'Відкрити систему',
      note: 'Просто за змістом: зрозумілий сигнал, зрозуміла передача відповідальності, короткий ранковий підсумок.',
    },
    principle: {
      title: 'Ключовий Принцип',
      body: 'Ніч має бути зрозумілою, спокійною і керованою.',
    },
    product: {
      title: 'Що Дає Продукт',
      body:
        'Одне місце, де можна побачити нічну ситуацію, зрозуміти, хто вже реагує, і передати підтримку далі, якщо це потрібно.',
      points: [
        'Більш ясну картину вночі без зайвої метушні.',
        'Спільну видимість для дитини, батьків і дорослого для підтримки.',
        'Прості наступні кроки в ризикований момент.',
        'Короткий підсумок зранку.',
      ],
    },
    architecture: {
      title: 'Архітектура',
      items: [
        { title: 'Data Layer', body: 'Джерела CGM, такі як Dexcom, і в майбутньому мобільні сигнали.' },
        { title: 'Normalization Layer', body: 'Єдиний формат, синхронізація за часом і оцінка достовірності.' },
        { title: 'State Engine', body: 'Стани: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Аналіз тренду, швидкості зміни і короткий прогноз на 15-30 хвилин.' },
        { title: 'Логіка Сигналів', body: 'Вирішує, коли сповіщати, наскільки помітно і що має статися далі.' },
        { title: 'Сповіщення', body: 'Push, повтор, підключення резерву і зрозуміле підтвердження, коли хтось відповів.' },
      ],
    },
    states: {
      title: 'Логіка Станів',
      items: [
        { name: 'NORMAL', body: 'Стабільний стан з мінімальним відображенням.' },
        { name: 'FALLING', body: 'Виявлено зниження. Увага без паніки.' },
        { name: 'RISK', body: 'Небезпечний рівень може бути досягнутий скоро. Зʼявляється рекомендація.' },
        { name: 'CRITICAL', body: 'Високий ризик або вже небезпечний стан. Потрібна негайна дія.' },
        { name: 'RECOVERY', body: 'Спостереження після втручання до підтвердженої стабілізації.' },
      ],
    },
    night: {
      title: 'Нічний Режим',
      intro: 'Нічний режим - серце продукту. Він має раніше помічати ризик, але не перетворювати всю ніч на шум.',
      points: [
        'Більш чутливі пороги.',
        'Швидше підключення резерву.',
        'Обовʼязкові критичні сигнали.',
        'Майбутній voice-режим для нічного сценарію.',
      ],
      escalationTitle: 'Кроки Сигналу',
      escalation: ['1. Сигнал', '2. Повтор', '3. Посилення', '4. Підключення Резерву'],
    },
    family: {
      title: 'Сімейна Модель',
      intro: 'Продукт побудований як єдиний нічний сценарій для сімʼї.',
      points: [
        'Дитина, батьки й дорослий для підтримки бачать ту саму ситуацію.',
        'Передача відповідальності видима і зрозуміла.',
        'Екран показує, хто відповідає прямо зараз.',
        'Ранковий підсумок залишається коротким і простим.',
      ],
    },
    trust: {
      title: 'Довіра Та Межі',
      intro: 'Система підтримує дії, але не є медичним пристроєм і не замінює лікаря.',
      legalTitle: 'Межі Довіри',
      legal: [
        'Не є медичним інструментом.',
        'Не ставить діагнози та не лікує.',
        'Не гарантує запобігання подіям.',
        'Залежить від якості пристроїв, даних і реакції користувача.',
      ],
      mvpTitle: 'Поточний Фокус',
      mvpIn: ['CGM', 'Нічна підтримка', 'Критичний сигнал', 'Підключення резерву', 'Відновлення', 'Сімейна підтримка'],
      mvpOut: ['Режим T2', 'Фізичний пристрій', 'AI шар', 'Аналітичні панелі', 'Складні налаштування'],
    },
    summary: {
      title: 'Простий Ранковий Підсумок',
      body: '1 сигнал. Батьки відповіли. Дитина відновилася.',
    },
    footer: {
      disclaimer:
        'Система не є медичним пристроєм, діагностичним інструментом і не замінює лікаря. Вона залежить від якості даних пристроїв і своєчасної реакції користувача.',
      legal: 'Довіра Та Юридичні Межі',
      accountLabel: 'Тема',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'У Поточному Фокусі',
      mvpOut: 'Поза Поточним Фокусом',
      selectLanguage: 'Вибір Мови',
      changeLanguage: 'Змінити мову',
      activateLightMode: 'Увімкнути світлу тему',
      activateDarkMode: 'Увімкнути темну тему',
      switchToLightMode: 'Перемкнути на світлу тему',
      switchToDarkMode: 'Перемкнути на темну тему',
    },
  },
  es: {
    brand: 'T1D',
    nav: {
      home: 'Inicio',
      system: 'Sistema',
      night: 'Modo Nocturno',
      family: 'Familia',
      trust: 'Confianza',
    },
    signIn: 'Abrir Acceso',
    titleByPage: {
      home: 'Sistema De Soporte T1D',
      system: 'Arquitectura Del Sistema',
      night: 'Modo Nocturno',
      family: 'Modelo Familiar',
      trust: 'Confianza Y Límites',
    },
    footerSections: {
      product: 'Producto',
      legal: 'Legal',
      account: 'Cuenta',
    },
    hero: {
      eyebrow: 'Apoyo nocturno para familias que viven con T1D',
      title: 'Ver el riesgo antes. Saber quién responde. Pasar la noche con menos caos.',
      subtitle:
        'T1D ayuda al niño, al padre o madre y al cuidador a actuar como un solo equipo cuando la glucosa baja por la noche. Muestra qué está pasando, qué hacer ahora y quién tomó la responsabilidad.',
      primary: 'Crear Cuenta',
      secondary: 'Abrir Sistema',
      note: 'Simple a propósito: alertas claras, relevo claro y un resumen corto por la mañana.',
    },
    principle: {
      title: 'Principio Central',
      body: 'La noche debe sentirse clara, tranquila y manejable.',
    },
    product: {
      title: 'Qué Te Da',
      body:
        'Un solo lugar para ver la noche, confirmar quién está respondiendo y pasar el apoyo a otra persona si hace falta.',
      points: [
        'Una visión nocturna más clara y con menos dudas.',
        'Visibilidad compartida para niño, familia y cuidador.',
        'Pasos simples en un momento de riesgo.',
        'Un resumen corto a la mañana siguiente.',
      ],
    },
    architecture: {
      title: 'Arquitectura',
      items: [
        { title: 'Data Layer', body: 'Fuentes CGM como Dexcom y futuras señales móviles.' },
        { title: 'Normalization Layer', body: 'Formato unificado, sincronización temporal y evaluación de confianza.' },
        { title: 'State Engine', body: 'Estados centrales: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Análisis de tendencia, velocidad de cambio y pronóstico corto de 15 a 30 minutos.' },
        { title: 'Señales De Aviso', body: 'Decide cuándo avisar, con qué intensidad y qué tipo de respuesta iniciar.' },
        { title: 'Flujo De Avisos', body: 'Push, repetición, refuerzo, paso a un adulto de apoyo y confirmación obligatoria.' },
      ],
    },
    states: {
      title: 'Lógica De Estados',
      items: [
        { name: 'NORMAL', body: 'Estado estable con visualización mínima.' },
        { name: 'FALLING', body: 'Se detecta una bajada. Atención sin pánico.' },
        { name: 'RISK', body: 'Un nivel peligroso puede alcanzarse pronto. Se muestra una recomendación.' },
        { name: 'CRITICAL', body: 'Alto riesgo o estado ya peligroso. Se requiere acción inmediata.' },
        { name: 'RECOVERY', body: 'Observación posterior a la intervención hasta confirmar estabilización.' },
      ],
    },
    night: {
      title: 'Modo Nocturno',
      intro: 'El modo nocturno es el centro del producto. Debe detectar el riesgo a tiempo sin convertir toda la noche en ruido.',
      points: [
        'Umbrales más sensibles.',
        'Refuerzo más rápido.',
        'Avisos críticos obligatorios.',
        'Futuro modo voice para escenarios nocturnos.',
      ],
      escalationTitle: 'Cómo Sube El Aviso',
      escalation: ['1. Aviso', '2. Repetir', '3. Reforzar', '4. Pasar a un adulto de apoyo'],
    },
    family: {
      title: 'Modelo Familiar',
      intro: 'El producto está pensado como un solo flujo nocturno para la familia.',
      points: [
        'Niño, padre o madre y cuidador ven la misma situación.',
        'El relevo de responsabilidad es visible y claro.',
        'La pantalla muestra quién responde en este momento.',
        'El resumen de la mañana sigue siendo corto y fácil de leer.',
      ],
    },
    trust: {
      title: 'Confianza Y Límites',
      intro: 'El sistema apoya la acción, pero no es un dispositivo médico ni sustituye a un médico.',
      legalTitle: 'Límites De Confianza',
      legal: [
        'No es un instrumento médico.',
        'No diagnostica ni trata.',
        'No garantiza la prevención de eventos.',
        'Depende de la calidad del dispositivo, los datos entrantes y la respuesta del usuario.',
      ],
      mvpTitle: 'Lo Que Incluye Hoy',
      mvpIn: ['CGM', 'Escenario nocturno', 'Aviso crítico', 'Refuerzo del aviso', 'Seguimiento de recuperación', 'Modo familiar'],
      mvpOut: ['Modo T2', 'Dispositivo físico', 'Capa AI', 'Paneles analíticos', 'Configuración compleja'],
    },
    summary: {
      title: 'Resumen Simple De La Mañana',
      body: '1 alerta. La familia respondió. El niño se recuperó.',
    },
    footer: {
      disclaimer:
        'Este sistema no es un dispositivo médico, no es una herramienta de diagnóstico y no sustituye la atención médica. Depende de los datos del dispositivo y de una respuesta oportuna del usuario.',
      legal: 'Confianza Y Límites Legales',
      accountLabel: 'Tema',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'Incluido Hoy',
      mvpOut: 'Fuera Del Enfoque Actual',
      selectLanguage: 'Seleccionar Idioma',
      changeLanguage: 'Cambiar idioma',
      activateLightMode: 'Activar modo claro',
      activateDarkMode: 'Activar modo oscuro',
      switchToLightMode: 'Cambiar al modo claro',
      switchToDarkMode: 'Cambiar al modo oscuro',
    },
  },
  fr: {
    brand: 'T1D',
    nav: {
      home: 'Accueil',
      system: 'Systeme',
      night: 'Mode Nuit',
      family: 'Famille',
      trust: 'Confiance',
    },
    signIn: 'Ouvrir L Acces',
    titleByPage: {
      home: 'Systeme De Support T1D',
      system: 'Architecture Du Systeme',
      night: 'Mode Nuit',
      family: 'Modele Familial',
      trust: 'Confiance Et Limites',
    },
    footerSections: {
      product: 'Produit',
      legal: 'Juridique',
      account: 'Compte',
    },
    hero: {
      eyebrow: 'Soutien nocturne pour les familles vivant avec un T1D',
      title: 'Voir le risque plus tot. Savoir qui repond. Traverser la nuit avec moins de chaos.',
      subtitle:
        'T1D aide l enfant, le parent et l aidant a agir comme une seule equipe quand le glucose baisse la nuit. Il montre ce qui se passe, quoi faire ensuite et qui a pris la responsabilite.',
      primary: 'Creer Un Compte',
      secondary: 'Ouvrir Le Systeme',
      note: 'Simple par choix: alertes claires, relais clair, resume court le matin.',
    },
    principle: {
      title: 'Principe Central',
      body: 'La nuit doit rester claire, calme et gerable.',
    },
    product: {
      title: 'Ce Que Vous Obtenez',
      body:
        'Un seul endroit pour suivre la nuit, confirmer qui repond et passer le relais si necessaire.',
      points: [
        'Une vue de nuit plus claire avec moins d incertitude.',
        'Une visibilite partagee pour l enfant, le parent et l aidant.',
        'Des etapes simples dans un moment a risque.',
        'Un resume court le lendemain matin.',
      ],
    },
    architecture: {
      title: 'Architecture',
      items: [
        { title: 'Data Layer', body: 'Sources CGM comme Dexcom, avec extension future aux signaux mobiles.' },
        { title: 'Normalization Layer', body: 'Format unifie, synchronisation temporelle et evaluation de la fiabilite.' },
        { title: 'State Engine', body: 'Etats centraux: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Analyse de tendance, vitesse de variation et prevision courte de 15 a 30 minutes.' },
        { title: 'Signaux D Alerte', body: 'Decide quand prevenir, avec quelle intensite et quel type de reponse lancer.' },
        { title: 'Flux Des Alertes', body: 'Push, repetition, renforcement, passage a un adulte de soutien et confirmation obligatoire.' },
      ],
    },
    states: {
      title: 'Logique Des Etats',
      items: [
        { name: 'NORMAL', body: 'Etat stable avec affichage minimal.' },
        { name: 'FALLING', body: 'Une baisse est detectee. Attention sans panique.' },
        { name: 'RISK', body: 'Un seuil dangereux peut etre atteint bientot. Une recommandation apparait.' },
        { name: 'CRITICAL', body: 'Risque eleve ou etat deja dangereux. Une action immediate est requise.' },
        { name: 'RECOVERY', body: 'Observation apres intervention jusqu a confirmation de la stabilisation.' },
      ],
    },
    night: {
      title: 'Mode Nuit',
      intro: 'Le mode nuit est le coeur du produit. Il doit voir le risque tot sans transformer toute la nuit en bruit.',
      points: [
        'Seuils plus sensibles.',
        'Renforcement plus rapide.',
        'Alertes critiques obligatoires.',
        'Mode voice futur pour les scenarios de nuit.',
      ],
      escalationTitle: 'Comment L Alerte Monte',
      escalation: ['1. Alerte', '2. Repetition', '3. Renforcement', '4. Passage a un adulte de soutien'],
    },
    family: {
      title: 'Modele Familial',
      intro: 'Le produit est pense comme un seul flux de reponse nocturne pour la famille.',
      points: [
        'L enfant, le parent et l aidant voient la meme situation.',
        'Le passage de responsabilite est visible et clair.',
        'L ecran montre qui repond en ce moment.',
        'Le resume du matin reste court et facile a lire.',
      ],
    },
    trust: {
      title: 'Confiance Et Limites',
      intro: 'Le systeme soutient l action, mais ce n est pas un dispositif medical et il ne remplace pas un medecin.',
      legalTitle: 'Limites De Confiance',
      legal: [
        'Ce n est pas un instrument medical.',
        'Ne diagnostique pas et ne traite pas.',
        'Ne garantit pas la prevention des evenements.',
        'Depend de la qualite de l appareil, des donnees et de la reponse de l utilisateur.',
      ],
      mvpTitle: 'Ce Qui Est Inclus Aujourd Hui',
      mvpIn: ['CGM', 'Scenario de nuit', 'Alerte critique', 'Renforcement de l alerte', 'Suivi de recuperation', 'Mode familial'],
      mvpOut: ['Mode T2', 'Appareil physique', 'Couche AI', 'Tableaux analytiques', 'Parametres complexes'],
    },
    summary: {
      title: 'Resume Simple Du Matin',
      body: '1 alerte. Le parent a repondu. L enfant a recupere.',
    },
    footer: {
      disclaimer:
        'Ce systeme n est pas un dispositif medical, ni un outil de diagnostic, et ne remplace pas un medecin. Il depend des donnees des appareils et de la reponse rapide de l utilisateur.',
      legal: 'Confiance Et Limites Juridiques',
      accountLabel: 'Theme',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'Inclus Aujourd Hui',
      mvpOut: 'Hors Du Focus Actuel',
      selectLanguage: 'Choisir La Langue',
      changeLanguage: 'Changer la langue',
      activateLightMode: 'Activer le mode clair',
      activateDarkMode: 'Activer le mode sombre',
      switchToLightMode: 'Passer en mode clair',
      switchToDarkMode: 'Passer en mode sombre',
    },
  },
  de: {
    brand: 'T1D',
    nav: {
      home: 'Start',
      system: 'System',
      night: 'Nachtmodus',
      family: 'Familie',
      trust: 'Vertrauen',
    },
    signIn: 'Zugang Offnen',
    titleByPage: {
      home: 'T1D Support System',
      system: 'Systemarchitektur',
      night: 'Nachtmodus',
      family: 'Familienmodell',
      trust: 'Vertrauen Und Grenzen',
    },
    footerSections: {
      product: 'Produkt',
      legal: 'Rechtliches',
      account: 'Konto',
    },
    hero: {
      eyebrow: 'Nachtunterstutzung fur Familien mit T1D',
      title: 'Risiken fruher sehen. Wissen, wer reagiert. Ruhiger durch die Nacht kommen.',
      subtitle:
        'T1D hilft Kind, Elternteil und Betreuungsperson, nachts als ein Team zu handeln, wenn der Glukosewert fallt. Es zeigt, was passiert, was als Nachstes zu tun ist und wer die Verantwortung ubernommen hat.',
      primary: 'Konto Erstellen',
      secondary: 'System Offnen',
      note: 'Bewusst einfach: klare Warnung, klare Ubergabe, kurze Morgenubersicht.',
    },
    principle: {
      title: 'Kernprinzip',
      body: 'Die Nacht sollte klar, ruhig und handhabbar bleiben.',
    },
    product: {
      title: 'Was Sie Bekommen',
      body:
        'Ein Ort, um die Nacht zu sehen, zu bestatigen, wer reagiert, und Unterstutzung weiterzugeben, wenn es notig ist.',
      points: [
        'Ein klarerer Blick auf die Nacht mit weniger Unsicherheit.',
        'Geteilte Sicht fur Kind, Eltern und Betreuung.',
        'Einfache nachste Schritte in einem riskanten Moment.',
        'Eine kurze Zusammenfassung am Morgen.',
      ],
    },
    architecture: {
      title: 'Architektur',
      items: [
        { title: 'Data Layer', body: 'CGM-Quellen wie Dexcom und zukunftig mobile Signale.' },
        { title: 'Normalization Layer', body: 'Einheitliches Format, Zeitsynchronisierung und Vertrauensbewertung.' },
        { title: 'State Engine', body: 'Kernzustande: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Trendanalyse, Anderungsgeschwindigkeit und Kurzprognose fur 15 bis 30 Minuten.' },
        { title: 'Warnsignale', body: 'Entscheidet, wann ein Hinweis kommt, wie stark er ist und welche Reaktion beginnt.' },
        { title: 'Hinweis Ablauf', body: 'Push, Wiederholung, Verstarkung, Weitergabe an eine unterstutzende Person und verpflichtende Bestatigung.' },
      ],
    },
    states: {
      title: 'Zustandslogik',
      items: [
        { name: 'NORMAL', body: 'Stabiler Zustand mit minimaler Darstellung.' },
        { name: 'FALLING', body: 'Ein Abfall wird erkannt. Aufmerksamkeit ohne Panik.' },
        { name: 'RISK', body: 'Ein gefahrlicher Schwellenwert kann bald erreicht werden. Eine Empfehlung wird angezeigt.' },
        { name: 'CRITICAL', body: 'Hohes Risiko oder bereits gefahrlicher Zustand. Sofortiges Handeln ist erforderlich.' },
        { name: 'RECOVERY', body: 'Beobachtung nach der Intervention bis die Stabilisierung bestatigt ist.' },
      ],
    },
    night: {
      title: 'Nachtmodus',
      intro: 'Der Nachtmodus ist das Herz des Produkts. Er soll Risiken fruh erkennen, ohne die ganze Nacht in Larm zu verwandeln.',
      points: [
        'Empfindlichere Schwellenwerte.',
        'Schnellere Verstarkung.',
        'Verpflichtende kritische Hinweise.',
        'Zukunftiger voice-Modus fur Nachtszenarien.',
      ],
      escalationTitle: 'Wie Der Hinweis Starker Wird',
      escalation: ['1. Hinweis', '2. Wiederholen', '3. Verstarken', '4. An eine unterstutzende Person ubergeben'],
    },
    family: {
      title: 'Familienmodell',
      intro: 'Das Produkt ist als ein gemeinsamer Nachtablauf fur die Familie gedacht.',
      points: [
        'Kind, Eltern und Betreuung sehen dieselbe Situation.',
        'Die Ubergabe von Verantwortung ist sichtbar und klar.',
        'Der Bildschirm zeigt, wer gerade reagiert.',
        'Die Morgenubersicht bleibt kurz und leicht lesbar.',
      ],
    },
    trust: {
      title: 'Vertrauen Und Grenzen',
      intro: 'Das System unterstutzt Handlungen, ist aber kein Medizinprodukt und ersetzt keinen Arzt.',
      legalTitle: 'Vertrauensgrenzen',
      legal: [
        'Kein medizinisches Instrument.',
        'Diagnostiziert oder behandelt nicht.',
        'Garantiert keine Verhinderung von Ereignissen.',
        'Abhangig von Geratequalitat, eingehenden Daten und Nutzerreaktion.',
      ],
      mvpTitle: 'Was Heute Dabei Ist',
      mvpIn: ['CGM', 'Nachtszenario', 'Kritischer Hinweis', 'Verstarkter Hinweis', 'Beobachtung der Erholung', 'Familienmodus'],
      mvpOut: ['T2 Modus', 'Physisches Gerat', 'AI Schicht', 'Analyse Dashboards', 'Komplexe Einstellungen'],
    },
    summary: {
      title: 'Einfache Morgenubersicht',
      body: '1 Alarm. Elternteil hat reagiert. Kind hat sich erholt.',
    },
    footer: {
      disclaimer:
        'Dieses System ist kein Medizinprodukt, kein Diagnosewerkzeug und kein Ersatz fur arztliche Versorgung. Es hangt von Geratedaten und der rechtzeitigen Reaktion des Nutzers ab.',
      legal: 'Vertrauen Und Rechtliche Grenzen',
      accountLabel: 'Thema',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'Heute Dabei',
      mvpOut: 'Außerhalb Des Aktuellen Fokus',
      selectLanguage: 'Sprache Wählen',
      changeLanguage: 'Sprache ändern',
      activateLightMode: 'Hellmodus aktivieren',
      activateDarkMode: 'Dunkelmodus aktivieren',
      switchToLightMode: 'Zum Hellmodus wechseln',
      switchToDarkMode: 'Zum Dunkelmodus wechseln',
    },
  },
  zh: {
    brand: 'T1D',
    nav: {
      home: '主页',
      system: '系统',
      night: '夜间模式',
      family: '家庭',
      trust: '信任',
    },
    signIn: '打开访问',
    titleByPage: {
      home: 'T1D 支持系统',
      system: '系统架构',
      night: '夜间模式',
      family: '家庭模式',
      trust: '信任与边界',
    },
    footerSections: {
      product: '产品',
      legal: '法律',
      account: '账户',
    },
    hero: {
      eyebrow: '为 T1D 家庭准备的夜间支持',
      title: '更早看到风险。知道谁在回应。让夜晚少一点混乱。',
      subtitle:
        '当夜间血糖下降时，T1D 帮助孩子、家长和照护者像一个团队一样协作。它会清楚显示正在发生什么、下一步该做什么，以及谁已经接手。',
      primary: '创建账户',
      secondary: '打开系统',
      note: '刻意保持简单：清楚的提醒、清楚的交接、简短的晨间总结。',
    },
    principle: {
      title: '核心原则',
      body: '夜晚应该清楚、平静、可处理。',
    },
    product: {
      title: '你会得到什么',
      body:
        '在一个地方看到夜间情况，确认谁正在回应，并在需要时把支持交给下一位家人。',
      points: [
        '更清楚的夜间视图，减少猜测。',
        '孩子、家长和照护者共享同一情况。',
        '在风险时刻给出简单下一步。',
        '第二天早上有简短总结。',
      ],
    },
    architecture: {
      title: '架构',
      items: [
        { title: 'Data Layer', body: 'CGM 数据源，如 Dexcom，以及未来的移动信号。' },
        { title: 'Normalization Layer', body: '统一格式、时间同步和可信度评估。' },
        { title: 'State Engine', body: '核心状态：NORMAL、FALLING、RISK、CRITICAL、RECOVERY。' },
        { title: 'Risk Engine', body: '趋势分析、变化速率和未来 15 到 30 分钟的短期预测。' },
        { title: '提醒信号', body: '决定何时提醒、提醒强度，以及启动哪一种响应。' },
        { title: '提醒流程', body: 'Push、重复、加强、转交给支持的大人，以及强制确认。' },
      ],
    },
    states: {
      title: '状态逻辑',
      items: [
        { name: 'NORMAL', body: '稳定状态，界面最小化展示。' },
        { name: 'FALLING', body: '检测到下降。提醒但不过度惊扰。' },
        { name: 'RISK', body: '危险阈值可能很快达到。显示建议。' },
        { name: 'CRITICAL', body: '高风险或已进入危险状态。需要立即行动。' },
        { name: 'RECOVERY', body: '干预后持续观察，直到确认稳定。' },
      ],
    },
    night: {
      title: '夜间模式',
      intro: '夜间模式是产品的核心。它需要更早发现风险，但不要把整晚都变成噪音。',
      points: [
        '更敏感的阈值。',
        '更快加强提醒。',
        '关键提醒必须确认。',
        '未来用于夜间场景的 voice 模式。',
      ],
      escalationTitle: '提醒如何升级',
      escalation: ['1. 提醒', '2. 重复', '3. 加强', '4. 转交给支持的大人'],
    },
    family: {
      title: '家庭模式',
      intro: '产品被设计成一个共享的家庭夜间响应流程。',
      points: [
        '孩子、家长和照护者看到同一情况。',
        '责任交接清楚可见。',
        '界面会显示现在是谁在处理。',
        '晨间总结保持简短、易读。',
      ],
    },
    trust: {
      title: '信任与边界',
      intro: '系统支持行动，但它不是医疗器械，也不能替代医生。',
      legalTitle: '信任边界',
      legal: [
        '不是医疗工具。',
        '不进行诊断或治疗。',
        '不保证防止事件发生。',
        '取决于设备质量、输入数据和用户响应。',
      ],
      mvpTitle: '当前包含内容',
      mvpIn: ['CGM', '夜间场景', '关键提醒', '提醒升级', '恢复观察', '家庭模式'],
      mvpOut: ['T2 模式', '实体设备', 'AI 层', '分析仪表板', '复杂设置'],
    },
    summary: {
      title: '简洁晨间总结',
      body: '1 次提醒。家长已回应。孩子已恢复。',
    },
    footer: {
      disclaimer:
        '本系统不是医疗器械，不是诊断工具，也不能替代医生。它依赖设备数据和用户及时反应。',
      legal: '信任与法律边界',
      accountLabel: '主题',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: '当前包含',
      mvpOut: '不在当前重点内',
      selectLanguage: '选择语言',
      changeLanguage: '切换语言',
      activateLightMode: '启用浅色模式',
      activateDarkMode: '启用深色模式',
      switchToLightMode: '切换到浅色模式',
      switchToDarkMode: '切换到深色模式',
    },
  },
  ja: {
    brand: 'T1D',
    nav: {
      home: 'ホーム',
      system: 'システム',
      night: 'ナイトモード',
      family: '家族',
      trust: '信頼',
    },
    signIn: 'アクセスを開く',
    titleByPage: {
      home: 'T1D サポートシステム',
      system: 'システム構成',
      night: 'ナイトモード',
      family: '家族モデル',
      trust: '信頼と境界',
    },
    footerSections: {
      product: 'プロダクト',
      legal: '法的情報',
      account: 'アカウント',
    },
    hero: {
      eyebrow: 'T1D と暮らす家族のための夜間サポート',
      title: 'リスクを早く知る。誰が対応しているか分かる。夜をもっと落ち着いて乗り切る。',
      subtitle:
        '夜に血糖が下がったとき、T1D は子ども、保護者、ケア提供者が一つのチームとして動けるようにします。何が起きているか、次に何をするか、誰が引き受けたかがすぐ分かります。',
      primary: 'アカウント作成',
      secondary: 'システムを開く',
      note: '意図的にシンプルです。分かりやすい通知、分かりやすい引き継ぎ、短い朝のまとめ。',
    },
    principle: {
      title: 'コア原則',
      body: '夜は、分かりやすく、落ち着いて、対応しやすくあるべきです。',
    },
    product: {
      title: '得られること',
      body:
        '夜の状況を一か所で見て、誰が対応しているかを確認し、必要ならサポートを引き継げます。',
      points: [
        '夜の見通しがより分かりやすくなります。',
        '子ども、保護者、ケア提供者で状況を共有できます。',
        'リスク時に次の一歩がシンプルに分かります。',
        '朝には短いまとめが残ります。',
      ],
    },
    architecture: {
      title: 'アーキテクチャ',
      items: [
        { title: 'Data Layer', body: 'Dexcom などの CGM ソースと、将来のモバイル信号。' },
        { title: 'Normalization Layer', body: '統一フォーマット、時刻同期、信頼度評価。' },
        { title: 'State Engine', body: '中核状態: NORMAL、FALLING、RISK、CRITICAL、RECOVERY。' },
        { title: 'Risk Engine', body: 'トレンド分析、変化速度、次の 15 から 30 分の短期予測。' },
        { title: '注意の合図', body: 'いつ知らせるか、どの強さにするか、どの対応を始めるかを決めます。' },
        { title: '通知の流れ', body: 'Push、繰り返し、強化、支える大人への引き継ぎ、必須確認を扱います。' },
      ],
    },
    states: {
      title: '状態ロジック',
      items: [
        { name: 'NORMAL', body: '安定した状態。表示は最小限。' },
        { name: 'FALLING', body: '低下を検知。パニックではなく注意喚起。' },
        { name: 'RISK', body: '危険なしきい値に近づく可能性がある。推奨が表示される。' },
        { name: 'CRITICAL', body: '高リスクまたはすでに危険な状態。即時対応が必要。' },
        { name: 'RECOVERY', body: '介入後、安定が確認されるまで観察する。' },
      ],
    },
    night: {
      title: 'ナイトモード',
      intro: 'ナイトモードはこのプロダクトの中心です。リスクを早く見つけつつ、夜じゅう騒がしくしないことが大切です。',
      points: [
        'より敏感なしきい値。',
        'より早い強化。',
        '重要な通知は必ず確認。',
        '夜間シナリオ向けの将来の voice モード。',
      ],
      escalationTitle: '通知が強くなる流れ',
      escalation: ['1. 通知', '2. 再通知', '3. 強化', '4. 支える大人へ引き継ぐ'],
    },
    family: {
      title: '家族モデル',
      intro: 'このプロダクトは、家族で共有する夜間対応フローとして設計されています。',
      points: [
        '子ども、保護者、ケア提供者が同じ状況を見ます。',
        '責任の引き継ぎが見えて分かりやすいです。',
        '画面には今誰が対応しているかが表示されます。',
        '朝のまとめは短く、読みやすく保たれます。',
      ],
    },
    trust: {
      title: '信頼と境界',
      intro: 'このシステムは行動を支援しますが、医療機器ではなく、医師の代わりにもなりません。',
      legalTitle: '信頼の境界',
      legal: [
        '医療機器ではない。',
        '診断や治療はしない。',
        'イベント防止を保証しない。',
        'デバイス品質、入力データ、ユーザー対応に依存する。',
      ],
      mvpTitle: 'いま含まれるもの',
      mvpIn: ['CGM', '夜間シナリオ', '重要な通知', '通知の強化', '回復の見守り', '家族モード'],
      mvpOut: ['T2 モード', '物理デバイス', 'AI レイヤー', '分析ダッシュボード', '複雑な設定'],
    },
    summary: {
      title: 'シンプルな朝のまとめ',
      body: '1 回のアラート。保護者が対応。子どもは回復。',
    },
    footer: {
      disclaimer:
        'このシステムは医療機器でも診断ツールでもなく、医師の代わりにもなりません。デバイスデータとユーザーの迅速な対応に依存します。',
      legal: '信頼と法的境界',
      accountLabel: 'テーマ',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'いま含まれる',
      mvpOut: 'いまの重点の外',
      selectLanguage: '言語を選択',
      changeLanguage: '言語を変更',
      activateLightMode: 'ライトモードを有効化',
      activateDarkMode: 'ダークモードを有効化',
      switchToLightMode: 'ライトモードに切り替え',
      switchToDarkMode: 'ダークモードに切り替え',
    },
  },
  pt: {
    brand: 'T1D',
    nav: {
      home: 'Inicio',
      system: 'Sistema',
      night: 'Modo Noturno',
      family: 'Familia',
      trust: 'Confianca',
    },
    signIn: 'Abrir Acesso',
    titleByPage: {
      home: 'Sistema De Suporte T1D',
      system: 'Arquitetura Do Sistema',
      night: 'Modo Noturno',
      family: 'Modelo Familiar',
      trust: 'Confianca E Limites',
    },
    footerSections: {
      product: 'Produto',
      legal: 'Legal',
      account: 'Conta',
    },
    hero: {
      eyebrow: 'Apoio noturno para familias que vivem com T1D',
      title: 'Ver o risco mais cedo. Saber quem esta respondendo. Passar a noite com menos caos.',
      subtitle:
        'O T1D ajuda a crianca, o responsavel e o cuidador a agir como uma so equipe quando a glicose cai durante a noite. Mostra o que esta acontecendo, o que fazer em seguida e quem assumiu a responsabilidade.',
      primary: 'Criar Conta',
      secondary: 'Abrir Sistema',
      note: 'Simples de proposito: aviso claro, passagem clara e um resumo curto pela manha.',
    },
    principle: {
      title: 'Principio Central',
      body: 'A noite deve parecer clara, calma e controlavel.',
    },
    product: {
      title: 'O Que Voce Recebe',
      body:
        'Um so lugar para ver a noite, confirmar quem esta respondendo e passar o apoio adiante quando necessario.',
      points: [
        'Uma visao noturna mais clara e com menos duvida.',
        'Visibilidade compartilhada para crianca, familia e cuidador.',
        'Proximos passos simples em um momento de risco.',
        'Um resumo curto na manha seguinte.',
      ],
    },
    architecture: {
      title: 'Arquitetura',
      items: [
        { title: 'Data Layer', body: 'Fontes CGM como Dexcom e futuros sinais moveis.' },
        { title: 'Normalization Layer', body: 'Formato unificado, sincronizacao temporal e avaliacao de confianca.' },
        { title: 'State Engine', body: 'Estados centrais: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'Risk Engine', body: 'Analise de tendencia, velocidade de mudanca e previsao curta de 15 a 30 minutos.' },
        { title: 'Sinais De Aviso', body: 'Decide quando avisar, com que intensidade e qual resposta iniciar.' },
        { title: 'Fluxo De Avisos', body: 'Push, repeticao, reforco, transferencia para um adulto de apoio e confirmacao obrigatoria.' },
      ],
    },
    states: {
      title: 'Logica De Estados',
      items: [
        { name: 'NORMAL', body: 'Estado estavel com exibicao minima.' },
        { name: 'FALLING', body: 'Queda detectada. Atencao sem panico.' },
        { name: 'RISK', body: 'Um nivel perigoso pode ser atingido em breve. Uma recomendacao e mostrada.' },
        { name: 'CRITICAL', body: 'Alto risco ou estado ja perigoso. Acao imediata e necessaria.' },
        { name: 'RECOVERY', body: 'Observacao apos a intervencao ate a estabilizacao ser confirmada.' },
      ],
    },
    night: {
      title: 'Modo Noturno',
      intro: 'O modo noturno e o coracao do produto. Ele precisa ver o risco cedo sem transformar a noite inteira em ruido.',
      points: [
        'Limiares mais sensiveis.',
        'Reforco mais rapido.',
        'Avisos criticos obrigatorios.',
        'Futuro modo voice para cenarios noturnos.',
      ],
      escalationTitle: 'Como O Aviso Sobe',
      escalation: ['1. Aviso', '2. Repetir', '3. Reforcar', '4. Transferir para um adulto de apoio'],
    },
    family: {
      title: 'Modelo Familiar',
      intro: 'O produto foi desenhado como um fluxo noturno compartilhado para a familia.',
      points: [
        'Crianca, responsavel e cuidador veem a mesma situacao.',
        'A passagem de responsabilidade fica visivel e clara.',
        'A tela mostra quem esta respondendo agora.',
        'O resumo da manha continua curto e facil de ler.',
      ],
    },
    trust: {
      title: 'Confianca E Limites',
      intro: 'O sistema apoia a acao, mas nao e um dispositivo medico e nao substitui um medico.',
      legalTitle: 'Limites De Confianca',
      legal: [
        'Nao e um instrumento medico.',
        'Nao diagnostica nem trata.',
        'Nao garante a prevencao de eventos.',
        'Depende da qualidade do dispositivo, dos dados recebidos e da resposta do usuario.',
      ],
      mvpTitle: 'O Que Entra Hoje',
      mvpIn: ['CGM', 'Cenario noturno', 'Aviso critico', 'Reforco do aviso', 'Acompanhamento da recuperacao', 'Modo familia'],
      mvpOut: ['Modo T2', 'Dispositivo fisico', 'Camada AI', 'Dashboards analiticos', 'Configuracoes complexas'],
    },
    summary: {
      title: 'Resumo Simples Da Manha',
      body: '1 alerta. A familia respondeu. A crianca se recuperou.',
    },
    footer: {
      disclaimer:
        'Este sistema nao e um dispositivo medico, nao e uma ferramenta diagnostica e nao substitui o cuidado medico. Ele depende dos dados do dispositivo e da resposta oportuna do usuario.',
      legal: 'Confianca E Limites Legais',
      accountLabel: 'Tema',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'Incluído Hoje',
      mvpOut: 'Fora Do Foco Atual',
      selectLanguage: 'Selecionar Idioma',
      changeLanguage: 'Mudar idioma',
      activateLightMode: 'Ativar modo claro',
      activateDarkMode: 'Ativar modo escuro',
      switchToLightMode: 'Mudar para modo claro',
      switchToDarkMode: 'Mudar para modo escuro',
    },
  },
  he: {
    brand: 'T1D',
    nav: {
      home: 'בית',
      system: 'מערכת',
      night: 'מצב לילה',
      family: 'משפחה',
      trust: 'אמון',
    },
    signIn: 'פתח גישה',
    titleByPage: {
      home: 'מערכת התמיכה T1D',
      system: 'ארכיטקטורת המערכת',
      night: 'מצב לילה',
      family: 'המודל המשפחתי',
      trust: 'אמון וגבולות',
    },
    footerSections: {
      product: 'מוצר',
      legal: 'משפטי',
      account: 'חשבון',
    },
    hero: {
      eyebrow: 'תמיכת לילה למשפחות שחיות עם T1D',
      title: 'לראות סיכון מוקדם יותר. לדעת מי מגיב. לעבור את הלילה עם פחות כאוס.',
      subtitle:
        'T1D עוזר לילד, להורה ולמטפל לפעול כמו צוות אחד כשהגלוקוז יורד בלילה. רואים מה קורה, מה הצעד הבא ומי לקח אחריות.',
      primary: 'יצירת חשבון',
      secondary: 'פתח מערכת',
      note: 'פשוט בכוונה: התרעה ברורה, העברה ברורה וסיכום קצר בבוקר.',
    },
    principle: {
      title: 'עיקרון ליבה',
      body: 'הלילה צריך להיות ברור, רגוע וניתן לניהול.',
    },
    product: {
      title: 'מה מקבלים',
      body:
        'מקום אחד לראות בו את הלילה, להבין מי מגיב, ולהעביר תמיכה הלאה אם צריך.',
      points: [
        'תמונה לילית ברורה יותר עם פחות חוסר ודאות.',
        'ראות משותפת לילד, להורה ולמטפל.',
        'צעדים פשוטים ברגע של סיכון.',
        'סיכום קצר בבוקר.',
      ],
    },
    architecture: {
      title: 'ארכיטקטורה',
      items: [
        { title: 'שכבת נתונים', body: 'מקורות CGM כמו Dexcom, עם אותות מובייל שמורים להרחבה עתידית.' },
        { title: 'שכבת נרמול', body: 'פורמט אחיד, סנכרון זמן והערכת אמינות.' },
        { title: 'מנוע מצבים', body: 'מצבי ליבה: NORMAL, FALLING, RISK, CRITICAL, RECOVERY.' },
        { title: 'מנוע סיכון', body: 'ניתוח מגמות, קצב שינוי ותחזית קצרה של 15-30 דקות.' },
        { title: 'מנוע התראות', body: 'מחליט מתי להתריע, באיזו עוצמה ואיזה תרחיש להפעיל.' },
        { title: 'שכבת התראות', body: 'Push, חזרות, הסלמה, העברה למטפל ולולאות אישור חובה.' },
      ],
    },
    states: {
      title: 'לוגיקת מצבים',
      items: [
        { name: 'NORMAL', body: 'מצב יציב עם תצוגה מינימלית.' },
        { name: 'FALLING', body: 'זוהתה ירידה. תשומת לב בלי פאניקה.' },
        { name: 'RISK', body: 'סף מסוכן עשוי להתרחש בקרוב. מוצגת המלצה.' },
        { name: 'CRITICAL', body: 'סיכון גבוה או מצב מסוכן בפועל. נדרשת פעולה מיידית.' },
        { name: 'RECOVERY', body: 'מעקב לאחר התערבות עד לאישור התייצבות.' },
      ],
    },
    night: {
      title: 'מצב לילה',
      intro: 'מצב לילה הוא הלב של המוצר. הוא צריך לזהות סיכון מוקדם בלי להפוך את כל הלילה לרעש.',
      points: [
        'ספים רגישים יותר.',
        'הסלמה מואצת.',
        'התראות קריטיות חובה.',
        'מצב קול עתידי להתערבויות בזמן שינה.',
      ],
      escalationTitle: 'התראה והסלמה',
      escalation: ['1. התראה', '2. חזרה', '3. הגברת עוצמה', '4. העברה למטפל'],
    },
    family: {
      title: 'המודל המשפחתי',
      intro: 'המוצר בנוי כזרימת תגובה לילית אחת לכל המשפחה.',
      points: [
        'ילד, הורה ומטפל רואים את אותה תמונה.',
        'העברת האחריות גלויה וברורה.',
        'המסך מראה מי מגיב עכשיו.',
        'סיכום הבוקר נשאר קצר וקל לקריאה.',
      ],
    },
    trust: {
      title: 'אמון וגבולות',
      intro: 'המערכת תומכת בפעולה, אך איננה מכשיר רפואי ואינה מחליפה רופא.',
      legalTitle: 'גבולות האמון',
      legal: [
        'לא מכשיר רפואי.',
        'לא מאבחנת ולא מטפלת.',
        'לא מבטיחה מניעת אירועים.',
        'תלויה באיכות המכשיר, בנתונים הנכנסים ובתגובת המשתמש.',
      ],
      mvpTitle: 'המיקוד הנוכחי',
      mvpIn: ['CGM', 'תרחיש לילה', 'התראה קריטית', 'הסלמה', 'התאוששות', 'מצב משפחה'],
      mvpOut: ['מצב סוג 2', 'מכשיר פיזי', 'שכבת AI', 'דשבורדי אנליטיקה', 'הגדרות מורכבות'],
    },
    summary: {
      title: 'סיכום בוקר פשוט',
      body: 'התראה אחת. ההורה הגיב. הילד התאושש.',
    },
    footer: {
      disclaimer:
        'המערכת הזו אינה מכשיר רפואי, אינה כלי אבחוני ואינה תחליף לטיפול רפואי. היא תלויה בנתוני המכשיר ובתגובה בזמן של המשתמש.',
      legal: 'אמון וגבולות משפטיים',
      accountLabel: 'ערכת נושא',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'בתוך המיקוד הנוכחי',
      mvpOut: 'מחוץ למיקוד הנוכחי',
      selectLanguage: 'בחירת שפה',
      changeLanguage: 'שינוי שפה',
      activateLightMode: 'הפעלת מצב בהיר',
      activateDarkMode: 'הפעלת מצב כהה',
      switchToLightMode: 'מעבר למצב בהיר',
      switchToDarkMode: 'מעבר למצב כהה',
    },
  },
  ar: {
    brand: 'T1D',
    nav: {
      home: 'الرئيسية',
      system: 'النظام',
      night: 'الوضع الليلي',
      family: 'العائلة',
      trust: 'الثقة',
    },
    signIn: 'افتح الوصول',
    titleByPage: {
      home: 'نظام دعم T1D',
      system: 'بنية النظام',
      night: 'الوضع الليلي',
      family: 'النموذج العائلي',
      trust: 'الثقة والحدود',
    },
    footerSections: {
      product: 'المنتج',
      legal: 'القانوني',
      account: 'الحساب',
    },
    hero: {
      eyebrow: 'دعم ليلي للعائلات التي تعيش مع T1D',
      title: 'رؤية الخطر مبكرًا. معرفة من يستجيب. عبور الليل بهدوء أكبر.',
      subtitle:
        'يساعد T1D الطفل وولي الأمر ومقدم الرعاية على العمل كفريق واحد عندما ينخفض السكر ليلًا. يوضح ما يحدث الآن، وما الخطوة التالية، ومن تولى المسؤولية.',
      primary: 'إنشاء حساب',
      secondary: 'افتح النظام',
      note: 'البساطة مقصودة: تنبيه واضح، تسليم واضح، وملخص قصير في الصباح.',
    },
    principle: {
      title: 'المبدأ الأساسي',
      body: 'يجب أن يكون الليل واضحًا وهادئًا وقابلًا للإدارة.',
    },
    product: {
      title: 'ماذا يقدم لك',
      body:
        'مكان واحد لرؤية ما يحدث ليلًا، وتأكيد من يستجيب، وتمرير الدعم إلى شخص آخر عند الحاجة.',
      points: [
        'صورة أوضح لليل مع تخمين أقل.',
        'رؤية مشتركة للطفل وولي الأمر ومقدم الرعاية.',
        'خطوات بسيطة في لحظة الخطر.',
        'ملخص قصير في صباح اليوم التالي.',
      ],
    },
    architecture: {
      title: 'البنية',
      items: [
        { title: 'طبقة البيانات', body: 'مصادر CGM مثل Dexcom، مع إشارات الهاتف محفوظة للتوسع المستقبلي.' },
        { title: 'طبقة التطبيع', body: 'تنسيق موحد، مزامنة زمنية، وتقييم للموثوقية.' },
        { title: 'محرك الحالات', body: 'الحالات الأساسية: NORMAL وFALLING وRISK وCRITICAL وRECOVERY.' },
        { title: 'محرك المخاطر', body: 'تحليل الاتجاه، سرعة التغير، وتوقع قصير من 15 إلى 30 دقيقة.' },
        { title: 'محرك التنبيهات', body: 'يقرر متى يرسل التنبيه، وبأي شدة، وأي سيناريو يجب تشغيله.' },
        { title: 'طبقة الإشعارات', body: 'Push، تكرار، تصعيد، تحويل إلى مقدم رعاية، وحلقات تأكيد إلزامية.' },
      ],
    },
    states: {
      title: 'منطق الحالات',
      items: [
        { name: 'NORMAL', body: 'حالة مستقرة مع عرض بسيط.' },
        { name: 'FALLING', body: 'تم اكتشاف هبوط. انتباه بدون هلع.' },
        { name: 'RISK', body: 'قد يتم الوصول إلى مستوى خطير قريبًا. تظهر توصية.' },
        { name: 'CRITICAL', body: 'خطر مرتفع أو حالة خطيرة بالفعل. الإجراء الفوري مطلوب.' },
        { name: 'RECOVERY', body: 'مراقبة بعد التدخل حتى يتم تأكيد الاستقرار.' },
      ],
    },
    night: {
      title: 'الوضع الليلي',
      intro: 'الوضع الليلي هو قلب المنتج. يجب أن يلاحظ الخطر مبكرًا من دون تحويل الليل كله إلى ضجيج.',
      points: [
        'عتبات أكثر حساسية.',
        'تصعيد أسرع.',
        'تنبيهات حرجة إلزامية.',
        'وضع صوتي مستقبلي لتدخلات وقت النوم.',
      ],
      escalationTitle: 'التنبيه والتصعيد',
      escalation: ['1. تنبيه', '2. تكرار', '3. زيادة الشدة', '4. تحويل إلى مقدم رعاية'],
    },
    family: {
      title: 'النموذج العائلي',
      intro: 'المنتج مصمم كتدفق ليلي واحد مشترك للعائلة.',
      points: [
        'الطفل وولي الأمر ومقدم الرعاية يرون الصورة نفسها.',
        'تسليم المسؤولية واضح ومرئي.',
        'تعرض الشاشة من يستجيب الآن.',
        'يبقى ملخص الصباح قصيرًا وسهل القراءة.',
      ],
    },
    trust: {
      title: 'الثقة والحدود',
      intro: 'يدعم النظام اتخاذ الإجراء، لكنه ليس جهازًا طبيًا ولا يحل محل الطبيب.',
      legalTitle: 'حدود الثقة',
      legal: [
        'ليس أداة طبية.',
        'لا يشخص ولا يعالج.',
        'لا يضمن منع الأحداث.',
        'يعتمد على جودة الجهاز والبيانات الواردة واستجابة المستخدم.',
      ],
      mvpTitle: 'التركيز الحالي',
      mvpIn: ['CGM', 'سيناريو الليل', 'تنبيه حرج', 'تصعيد', 'تعافٍ', 'وضع العائلة'],
      mvpOut: ['وضع النوع الثاني', 'جهاز فعلي', 'طبقة AI', 'لوحات تحليلية', 'إعدادات معقدة'],
    },
    summary: {
      title: 'ملخص صباحي بسيط',
      body: 'تنبيه واحد. استجابت العائلة. تعافى الطفل.',
    },
    footer: {
      disclaimer:
        'هذا النظام ليس جهازًا طبيًا ولا أداة تشخيصية ولا بديلًا عن رعاية الطبيب. وهو يعتمد على بيانات الجهاز واستجابة المستخدم في الوقت المناسب.',
      legal: 'الثقة والحدود القانونية',
      accountLabel: 'السمة',
    },
    ui: {
      biomathCore: 'BioMath Core',
      mvpIn: 'ضمن التركيز الحالي',
      mvpOut: 'خارج التركيز الحالي',
      selectLanguage: 'اختيار اللغة',
      changeLanguage: 'تغيير اللغة',
      activateLightMode: 'تفعيل الوضع الفاتح',
      activateDarkMode: 'تفعيل الوضع الداكن',
      switchToLightMode: 'التبديل إلى الوضع الفاتح',
      switchToDarkMode: 'التبديل إلى الوضع الداكن',
    },
  },
  };

export const pageOrder: CorePage[] = ['home', 'system', 'night', 'family'];

const normalizeBasePath = (basePath?: string) => {
  if (!basePath || basePath === '/') return '';
  return basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
};

export const buildPagePaths = (basePath?: string): Record<Page, string> => {
  const normalizedBase = normalizeBasePath(basePath);
  return {
    home: normalizedBase || '/',
    system: `${normalizedBase}/system` || '/system',
    night: `${normalizedBase}/night` || '/night',
    family: `${normalizedBase}/family` || '/family',
    how: `${normalizedBase}/how-it-works` || '/how-it-works',
    faq: `${normalizedBase}/faq` || '/faq',
    learn: `${normalizedBase}/learning-center` || '/learning-center',
    news: `${normalizedBase}/news` || '/news',
    trust: `${normalizedBase}/trust` || '/trust',
    privacy: `${normalizedBase}/privacy` || '/privacy',
    terms: `${normalizedBase}/terms` || '/terms',
    medical: `${normalizedBase}/medical-disclaimer` || '/medical-disclaimer',
    compliance: `${normalizedBase}/compliance` || '/compliance',
  };
};

export const resolvePage = (pathname: string, pagePaths: Record<Page, string>): Page => {
  if (pathname === pagePaths.system) return 'system';
  if (pathname === pagePaths.night) return 'night';
  if (pathname === pagePaths.family) return 'family';
  if (pathname === pagePaths.how) return 'how';
  if (pathname === pagePaths.faq) return 'faq';
  if (pathname === pagePaths.learn) return 'learn';
  if (pathname === pagePaths.news) return 'news';
  if (pathname === pagePaths.trust) return 'trust';
  if (pathname === pagePaths.privacy) return 'privacy';
  if (pathname === pagePaths.terms) return 'terms';
  if (pathname === pagePaths.medical) return 'medical';
  if (pathname === pagePaths.compliance) return 'compliance';
  return 'home';
};

export const pageIcons = [Workflow, ShieldAlert, MoonStar, HeartHandshake, BellRing, TimerReset, AlertTriangle];
