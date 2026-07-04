import React, { useEffect, useState } from 'react';
import { AlertTriangle, BellRing, Heart, HeartHandshake, MoonStar, ShieldAlert, Siren, TimerReset, Users, Workflow } from 'lucide-react';
import { Language, RTL_LANGUAGES, type DiabetesType } from '../types';
import { COPY, HOME_TERMS, PUBLIC_MICROCOPY, PUBLIC_UI_COPY, buildPagePaths, pageIcons, resolvePage, type Page } from '../content/landing-copy';
import { LANDING_TYPE_COPY } from '../content/landing-type-copy';
import { LEGAL_PAGE_LABELS, LEGAL_UI_COPY, type LegalPage } from '../content/legal-labels';
import { KNOWLEDGE_LABELS } from '../content/knowledge-labels';
import { applyOrganizationJsonLd, applySeo } from '../lib/seo';
import { t1dWarmNote } from '../lib/t1d-ui';
import { T1DPageBackdrop } from './layout/T1DPageBackdrop';
import { T1DFooter } from './layout/T1DFooter';
import { T1DTopbar } from './layout/T1DTopbar';
import { buildPublicSiteChrome } from '../lib/public-site-chrome';
import { DOWNLOAD_COPY } from '../content/download-copy';
import { LandingNutritionShowcase } from './landing/LandingNutritionShowcase';
import { DownloadInstallPanel } from './download/DownloadInstallPanel';
import { PageHeroBanner, type PageHeroVariant } from './layout/PageHeroBanner';
import { HeroIllustration } from './layout/hero-art/HeroIllustrations';

interface T1DPublicLandingViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onSignIn: () => void;
  onSignUp: (type: DiabetesType) => void;
  basePath?: string;
}
export const T1DPublicLandingView: React.FC<T1DPublicLandingViewProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  onSignIn,
  onSignUp,
  basePath,
}) => {
  const copy = COPY[lang];
  const downloadCopy = DOWNLOAD_COPY[lang];
  const typeCopy = LANDING_TYPE_COPY[lang];
  const publicUi = PUBLIC_UI_COPY[lang];
  const publicMicro = PUBLIC_MICROCOPY[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const pagePaths = buildPagePaths(basePath);
  const siteChrome = buildPublicSiteChrome(lang, basePath);
  const legalLabels = LEGAL_PAGE_LABELS[lang];
  const legalUi = LEGAL_UI_COPY[lang];
  const knowledgeLabels = KNOWLEDGE_LABELS.footer[lang];
  const knowledgePageLabels = KNOWLEDGE_LABELS.pages[lang];
  const [knowledgeBundle, setKnowledgeBundle] = useState<Awaited<typeof import('../content/knowledge-copy')> | null>(null);
  const [legalBundle, setLegalBundle] = useState<Awaited<typeof import('../content/legal-copy')> | null>(null);
  const howContent = knowledgeBundle?.HOW_IT_WORKS_CONTENT[lang];
  const faqItems = knowledgeBundle?.FAQ_ITEMS[lang] ?? [];
  const learningArticles = knowledgeBundle?.LEARNING_ARTICLES[lang] ?? [];
  const glossaryTerms = knowledgeBundle?.GLOSSARY_TERMS[lang] ?? [];
  const newsItems = knowledgeBundle?.NEWS_ITEMS[lang] ?? [];
  const legalPageContent = legalBundle?.LEGAL_PAGE_CONTENT;
  const [activePage, setActivePage] = useState<Page>(() => {
    if (typeof window === 'undefined') return 'home';
    return resolvePage(window.location.pathname, pagePaths);
  });
  const [faqOpen, setFaqOpen] = useState<string | null>(null);
  const [learningQuery, setLearningQuery] = useState('');
  const [newsQuery, setNewsQuery] = useState('');
  const [openArticleId, setOpenArticleId] = useState<string | null>(null);
  const [learningCategory, setLearningCategory] = useState<string>('all');
  const [newsCategory, setNewsCategory] = useState<string>('all');
  const needsKnowledgeContent = activePage === 'how' || activePage === 'faq' || activePage === 'learn' || activePage === 'news';
  const needsLegalContent = activePage === 'privacy' || activePage === 'terms' || activePage === 'medical' || activePage === 'compliance' || activePage === 'trust';
  const contentPending = (needsKnowledgeContent && !knowledgeBundle) || (needsLegalContent && !legalBundle);

  useEffect(() => {
    applyOrganizationJsonLd();
  }, []);

  useEffect(() => {
    if (!needsKnowledgeContent || knowledgeBundle) return;
    let cancelled = false;
    import('../content/knowledge-copy').then((module) => {
      if (!cancelled) setKnowledgeBundle(module);
    });
    return () => {
      cancelled = true;
    };
  }, [needsKnowledgeContent, knowledgeBundle]);

  useEffect(() => {
    if (!needsLegalContent || legalBundle) return;
    let cancelled = false;
    import('../content/legal-copy').then((module) => {
      if (!cancelled) setLegalBundle(module);
    });
    return () => {
      cancelled = true;
    };
  }, [needsLegalContent, legalBundle]);

  const knowledgeUiCopy = {
    learningIntro: {
      en: 'Basics, daily safety, devices, family response, and a growing glossary.',
      ru: 'Основы, безопасность, устройства, семейная реакция и растущий глоссарий.',
      uk: 'Основи, безпека, пристрої, реакція родини та глосарій.',
      es: 'Fundamentos, seguridad diaria, dispositivos, respuesta familiar y glosario.',
      fr: 'Bases, sécurité quotidienne, appareils, réponse familiale et glossaire.',
      de: 'Grundlagen, Sicherheit, Geräte, Familienreaktion und Glossar.',
      zh: '基础、日常安全、设备、家庭响应和术语库。',
      ja: '基礎、日常の安全、機器、家族の対応、用語集。',
      pt: 'Fundamentos, segurança diária, dispositivos, resposta familiar e glossário.',
      he: 'יסודות, בטיחות יומית, מכשירים, תגובת משפחה ומילון מונחים.',
      ar: 'أساسيات، السلامة اليومية، الأجهزة، استجابة الأسرة، ومسرد مصطلحات.',
    },
    learningTopics: {
      en: [
        { title: 'Foundations', body: 'Core disease understanding, daily meaning, and why signal clarity matters.' },
        { title: 'Safety', body: 'Lows, highs, risk, recovery, and unstable days.' },
        { title: 'Devices & Data', body: 'CGM, trend arrows, stale signals, and device confidence.' },
        { title: 'Family & Daily Life', body: 'Meals, school, travel, sports, and support planning.' },
      ],
      ru: [
        { title: 'Основы', body: 'Базовое понимание болезни, повседневного значения и того, почему важна ясность сигнала.' },
        { title: 'Безопасность', body: 'Низкий и высокий сахар, риск, восстановление и нестабильные дни.' },
        { title: 'Устройства И Данные', body: 'CGM, стрелки тренда, устаревшие сигналы и доверие к устройству.' },
        { title: 'Семья И Повседневность', body: 'Еда, школа, поездки, спорт и план поддержки.' },
      ],
      uk: [
        { title: 'Основи', body: 'Базове розуміння хвороби, щоденного значення і того, чому важлива ясність сигналу.' },
        { title: 'Безпека', body: 'Низький і високий цукор, ризик, відновлення та нестабільні дні.' },
        { title: 'Пристрої І Дані', body: 'CGM, стрілки тренду, застарілі сигнали та довіра до пристрою.' },
        { title: 'Родина І Щоденне Життя', body: 'Їжа, школа, подорожі, спорт і план підтримки.' },
      ],
      es: [
        { title: 'Fundamentos', body: 'Comprensión básica de la enfermedad, significado diario y por qué importa la claridad de la señal.' },
        { title: 'Seguridad', body: 'Bajadas, subidas, riesgo, recuperación y días inestables.' },
        { title: 'Dispositivos Y Datos', body: 'CGM, flechas de tendencia, señales antiguas y confianza en el dispositivo.' },
        { title: 'Familia Y Vida Diaria', body: 'Comidas, escuela, viajes, deporte y planificación del apoyo.' },
      ],
      fr: [
        { title: 'Fondamentaux', body: 'Compréhension de base de la maladie, du quotidien et de l’importance d’un signal clair.' },
        { title: 'Sécurité', body: 'Hypoglycémies, hyperglycémies, risque, récupération et journées instables.' },
        { title: 'Appareils Et Données', body: 'CGM, flèches de tendance, signaux vieillissants et confiance dans l’appareil.' },
        { title: 'Famille Et Quotidien', body: 'Repas, école, voyage, sport et plan de soutien.' },
      ],
      de: [
        { title: 'Grundlagen', body: 'Grundverständnis der Erkrankung, des Alltags und warum Signalklarheit wichtig ist.' },
        { title: 'Sicherheit', body: 'Unterzuckerungen, Überzuckerungen, Risiko, Erholung und instabile Tage.' },
        { title: 'Geräte Und Daten', body: 'CGM, Trendpfeile, veraltete Signale und Vertrauen in das Gerät.' },
        { title: 'Familie Und Alltag', body: 'Mahlzeiten, Schule, Reisen, Sport und Unterstützungsplanung.' },
      ],
      zh: [
        { title: '基础', body: '疾病的核心理解、日常意义，以及为什么清晰的信号很重要。' },
        { title: '安全', body: '低血糖、高血糖、风险、恢复以及不稳定的日子。' },
        { title: '设备与数据', body: 'CGM、趋势箭头、过旧信号以及对设备的信任度。' },
        { title: '家庭与日常生活', body: '饮食、学校、出行、运动和支持计划。' },
      ],
      ja: [
        { title: '基礎', body: '病気の基本的な理解、日々の意味、そして信号の明確さが大切な理由。' },
        { title: '安全', body: '低血糖、高血糖、リスク、回復、不安定な日。' },
        { title: '機器とデータ', body: 'CGM、トレンド矢印、古い信号、機器への信頼。' },
        { title: '家族と日常生活', body: '食事、学校、移動、スポーツ、支援計画。' },
      ],
      pt: [
        { title: 'Fundamentos', body: 'Compreensão central da doença, significado diário e por que a clareza do sinal importa.' },
        { title: 'Segurança', body: 'Baixas, altas, risco, recuperação e dias instáveis.' },
        { title: 'Dispositivos E Dados', body: 'CGM, setas de tendência, sinais desatualizados e confiança no dispositivo.' },
        { title: 'Família E Vida Diária', body: 'Refeições, escola, viagens, esportes e planejamento do apoio.' },
      ],
      he: [
        { title: 'יסודות', body: 'הבנה בסיסית של המחלה, של החיים היומיומיים ושל החשיבות של אות ברור.' },
        { title: 'בטיחות', body: 'נמוכים, גבוהים, סיכון, התאוששות וימים לא יציבים.' },
        { title: 'מכשירים ונתונים', body: 'CGM, חיצי מגמה, אותות ישנים ואמון במכשיר.' },
        { title: 'משפחה וחיי יום יום', body: 'ארוחות, בית ספר, נסיעות, ספורט ותכנון תמיכה.' },
      ],
      ar: [
        { title: 'الأساسيات', body: 'فهم أساسي للمرض، ومعناه اليومي، ولماذا تهم وضوح الإشارة.' },
        { title: 'السلامة', body: 'الانخفاضات، الارتفاعات، الخطر، التعافي، والأيام غير المستقرة.' },
        { title: 'الأجهزة والبيانات', body: 'CGM، أسهم الاتجاه، الإشارات القديمة، ومدى الثقة في الجهاز.' },
        { title: 'الأسرة والحياة اليومية', body: 'الوجبات، المدرسة، السفر، الرياضة، وخطة الدعم.' },
      ],
    },
    pathways: {
      en: [
        'Foundations and daily understanding',
        'Safety, lows, highs, and recovery',
        'Devices, data quality, and signal trust',
        'Meals, activity, school, travel, and sick days',
      ],
      ru: [
        'Основы и ежедневное понимание',
        'Безопасность, низкий и высокий сахар, восстановление',
        'Устройства, качество данных и доверие к сигналу',
        'Еда, активность, школа, поездки и дни болезни',
      ],
      uk: [
        'Основи й щоденне розуміння',
        'Безпека, низький і високий цукор, відновлення',
        'Пристрої, якість даних і довіра до сигналу',
        'Їжа, активність, школа, подорожі та дні хвороби',
      ],
      es: [
        'Fundamentos y comprensión diaria',
        'Seguridad, bajadas, subidas y recuperación',
        'Dispositivos, calidad de datos y confianza en la señal',
        'Comidas, actividad, escuela, viajes y días de enfermedad',
      ],
      fr: [
        'Fondamentaux et compréhension du quotidien',
        'Sécurité, hypoglycémies, hyperglycémies et récupération',
        'Appareils, qualité des données et confiance dans le signal',
        'Repas, activité, école, voyage et jours de maladie',
      ],
      de: [
        'Grundlagen und tägliches Verständnis',
        'Sicherheit, Unterzuckerung, Überzuckerung und Erholung',
        'Geräte, Datenqualität und Vertrauen in das Signal',
        'Mahlzeiten, Aktivität, Schule, Reisen und Krankheitstage',
      ],
      zh: [
        '基础知识与日常理解',
        '安全、低血糖、高血糖与恢复',
        '设备、数据质量与信号可信度',
        '饮食、活动、学校、出行与生病日',
      ],
      ja: [
        '基礎と日々の理解',
        '安全、低血糖、高血糖、回復',
        '機器、データ品質、信号への信頼',
        '食事、活動、学校、移動、体調不良の日',
      ],
      pt: [
        'Fundamentos e compreensão diária',
        'Segurança, baixas, altas e recuperação',
        'Dispositivos, qualidade dos dados e confiança no sinal',
        'Refeições, atividade, escola, viagens e dias de doença',
      ],
      he: [
        'יסודות והבנה יומיומית',
        'בטיחות, נמוכים, גבוהים והתאוששות',
        'מכשירים, איכות נתונים ואמון באות',
        'ארוחות, פעילות, בית ספר, נסיעות וימי מחלה',
      ],
      ar: [
        'الأساسيات والفهم اليومي',
        'السلامة، الانخفاضات، الارتفاعات، والتعافي',
        'الأجهزة، جودة البيانات، والثقة في الإشارة',
        'الوجبات، النشاط، المدرسة، السفر، وأيام المرض',
      ],
    },
    newsIntro: {
      en: 'Diabetes progress: research, treatment, devices, and realistic timelines.',
      ru: 'Прогресс в диабете: исследования, лечение, устройства и реалистичные сроки.',
      uk: 'Прогрес у діабеті: дослідження, лікування, пристрої та реалістичні терміни.',
      es: 'Progreso en diabetes: investigación, tratamiento, dispositivos y plazos realistas.',
      fr: 'Progrès du diabète: recherche, traitement, appareils et échéances réalistes.',
      de: 'Diabetes-Fortschritt: Forschung, Behandlung, Geräte und realistische Zeitrahmen.',
      zh: '糖尿病进展：研究、治疗、设备和现实时间表。',
      ja: '糖尿病の進展：研究、治療、機器、現実的なタイムライン。',
      pt: 'Progresso em diabetes: pesquisa, tratamento, dispositivos e prazos realistas.',
      he: 'התקדמות בסוכרת: מחקר, טיפול, מכשירים ולוחות זמנים ריאליים.',
      ar: 'تقدم السكري: البحث، العلاج، الأجهزة، والجداول الزمنية الواقعية.',
    },
    newsTopics: {
      en: [
        { title: 'Research', body: 'Longer-horizon work on biology, durable treatment, and real breakthroughs.', tone: 'sky' },
        { title: 'Technology', body: 'CGM, automation, connected support, and smarter device ecosystems.', tone: 'emerald' },
        { title: 'Care Models', body: 'What is changing in practical support, family workflows, and clinical use.', tone: 'amber' },
        { title: 'Policy', body: 'Privacy, compliance, and the rules shaping what products can safely promise.', tone: 'rose' },
      ],
      ru: [
        { title: 'Исследования', body: 'Долгосрочная работа над биологией болезни, устойчивым лечением и реальными прорывами.', tone: 'sky' },
        { title: 'Технологии', body: 'CGM, автоматизация, связанная поддержка и более умные экосистемы устройств.', tone: 'emerald' },
        { title: 'Модели Поддержки', body: 'Что меняется в практической поддержке, семейных сценариях и клиническом применении.', tone: 'amber' },
        { title: 'Политика', body: 'Конфиденциальность, комплайнс и правила, определяющие, что продукт может обещать безопасно.', tone: 'rose' },
      ],
      uk: [
        { title: 'Дослідження', body: 'Довгострокова робота над біологією хвороби, стійким лікуванням і реальними проривами.', tone: 'sky' },
        { title: 'Технології', body: 'CGM, автоматизація, підключена підтримка та розумніші екосистеми пристроїв.', tone: 'emerald' },
        { title: 'Моделі Підтримки', body: 'Що змінюється в практичній підтримці, сімейних сценаріях і клінічному використанні.', tone: 'amber' },
        { title: 'Політика', body: 'Конфіденційність, комплаєнс і правила, що визначають, які обіцянки продукт може давати безпечно.', tone: 'rose' },
      ],
      es: [
        { title: 'Investigación', body: 'Trabajo a más largo plazo sobre biología, tratamientos duraderos y avances reales.', tone: 'sky' },
        { title: 'Tecnología', body: 'CGM, automatización, apoyo conectado y ecosistemas de dispositivos más inteligentes.', tone: 'emerald' },
        { title: 'Modelos De Atención', body: 'Qué está cambiando en el apoyo práctico, los flujos familiares y el uso clínico.', tone: 'amber' },
        { title: 'Política', body: 'Privacidad, cumplimiento y reglas que dan forma a lo que un producto puede prometer con seguridad.', tone: 'rose' },
      ],
      fr: [
        { title: 'Recherche', body: 'Travail à plus long terme sur la biologie, les traitements durables et les vraies avancées.', tone: 'sky' },
        { title: 'Technologie', body: 'CGM, automatisation, soutien connecté et écosystèmes d’appareils plus intelligents.', tone: 'emerald' },
        { title: 'Modèles De Soins', body: 'Ce qui change dans le soutien pratique, les flux familiaux et l’usage clinique.', tone: 'amber' },
        { title: 'Politique', body: 'Confidentialité, conformité et règles qui déterminent ce qu’un produit peut promettre sans risque.', tone: 'rose' },
      ],
      de: [
        { title: 'Forschung', body: 'Längerfristige Arbeit an Biologie, dauerhaften Behandlungen und echten Durchbrüchen.', tone: 'sky' },
        { title: 'Technologie', body: 'CGM, Automatisierung, vernetzte Unterstützung und intelligentere Geräteökosysteme.', tone: 'emerald' },
        { title: 'Versorgungsmodelle', body: 'Was sich in praktischer Unterstützung, Familienabläufen und klinischer Nutzung verändert.', tone: 'amber' },
        { title: 'Politik', body: 'Datenschutz, Compliance und Regeln, die prägen, was ein Produkt sicher versprechen kann.', tone: 'rose' },
      ],
      zh: [
        { title: '研究', body: '围绕疾病生物学、持久治疗和真正突破的长期工作。', tone: 'sky' },
        { title: '技术', body: 'CGM、自动化、连接式支持以及更聪明的设备生态。', tone: 'emerald' },
        { title: '照护模式', body: '实践支持、家庭流程和临床使用正在发生哪些变化。', tone: 'amber' },
        { title: '政策', body: '隐私、合规以及决定产品能安全承诺什么的规则。', tone: 'rose' },
      ],
      ja: [
        { title: '研究', body: '病気の生物学、持続的治療、実際の突破口に向けた長期的な取り組み。', tone: 'sky' },
        { title: '技術', body: 'CGM、自動化、つながる支援、より賢い機器エコシステム。', tone: 'emerald' },
        { title: 'ケアモデル', body: '実務的な支援、家族の流れ、臨床利用で何が変わっているか。', tone: 'amber' },
        { title: '方針', body: 'プライバシー、コンプライアンス、そして製品が安全に約束できる範囲を形作るルール。', tone: 'rose' },
      ],
      pt: [
        { title: 'Pesquisa', body: 'Trabalho de horizonte mais longo sobre biologia, tratamento duradouro e avanços reais.', tone: 'sky' },
        { title: 'Tecnologia', body: 'CGM, automação, apoio conectado e ecossistemas de dispositivos mais inteligentes.', tone: 'emerald' },
        { title: 'Modelos De Cuidado', body: 'O que está mudando no apoio prático, nos fluxos familiares e no uso clínico.', tone: 'amber' },
        { title: 'Política', body: 'Privacidade, conformidade e regras que moldam o que um produto pode prometer com segurança.', tone: 'rose' },
      ],
      he: [
        { title: 'מחקר', body: 'עבודה ארוכת טווח על ביולוגיית המחלה, טיפול עמיד ופריצות דרך אמיתיות.', tone: 'sky' },
        { title: 'טכנולוגיה', body: 'CGM, אוטומציה, תמיכה מחוברת ומערכות מכשירים חכמות יותר.', tone: 'emerald' },
        { title: 'מודלי טיפול', body: 'מה משתנה בתמיכה המעשית, בזרימות המשפחתיות ובשימוש הקליני.', tone: 'amber' },
        { title: 'מדיניות', body: 'פרטיות, ציות וכללים שמעצבים מה מוצר יכול להבטיח בבטחה.', tone: 'rose' },
      ],
      ar: [
        { title: 'الأبحاث', body: 'عمل طويل الأفق على بيولوجيا المرض، والعلاج المستدام، والاختراقات الحقيقية.', tone: 'sky' },
        { title: 'التقنية', body: 'CGM، الأتمتة، الدعم المتصل، وأنظمة الأجهزة الأكثر ذكاءً.', tone: 'emerald' },
        { title: 'نماذج الرعاية', body: 'ما الذي يتغير في الدعم العملي، وتدفقات الأسرة، والاستخدام السريري.', tone: 'amber' },
        { title: 'السياسة', body: 'الخصوصية، والامتثال، والقواعد التي تحدد ما الذي يمكن للمنتج أن يعد به بأمان.', tone: 'rose' },
      ],
    },
    noResults: {
      en: 'No results yet. Try a broader word or clear the search.',
      ru: 'Пока ничего не найдено. Попробуй более широкое слово или очисти поиск.',
      uk: 'Поки нічого не знайдено. Спробуй ширше слово або очисть пошук.',
      es: 'Aún no hay resultados. Prueba una palabra más amplia o limpia la búsqueda.',
      fr: 'Aucun résultat pour le moment. Essaie un mot plus large ou efface la recherche.',
      de: 'Noch keine Ergebnisse. Versuche ein allgemeineres Wort oder lösche die Suche.',
      zh: '暂时没有结果。试试更宽泛的词，或清除搜索。',
      ja: 'まだ結果がありません。もう少し広い言葉にするか、検索をクリアしてください。',
      pt: 'Ainda não há resultados. Tente uma palavra mais ampla ou limpe a busca.',
      he: 'עדיין אין תוצאות. כדאי לנסות מילה רחבה יותר או לנקות את החיפוש.',
      ar: 'لا توجد نتائج بعد. جرّب كلمة أوسع أو امسح البحث.',
    },
  } as const;

  const normalizedLearningQuery = learningQuery.trim().toLowerCase();
  const learningCategories = [knowledgePageLabels.all, ...Array.from(new Set(learningArticles.map((article) => article.category)))];
  const filteredArticles = learningArticles.filter((article) => {
    if (learningCategory !== 'all' && article.category !== learningCategory) return false;
    if (!normalizedLearningQuery) return true;
    return [article.title, article.summary, article.category, ...article.terms, ...article.sections.map((section) => `${section.title} ${section.body}`)]
      .join(' ')
      .toLowerCase()
      .includes(normalizedLearningQuery);
  });
  const filteredGlossary = glossaryTerms.filter((item) => {
    if (!normalizedLearningQuery) return true;
    return [item.term, item.short, item.category].join(' ').toLowerCase().includes(normalizedLearningQuery);
  });
  const normalizedNewsQuery = newsQuery.trim().toLowerCase();
  const newsCategories = [knowledgePageLabels.all, ...Array.from(new Set(newsItems.map((item) => item.category)))];
  const filteredNews = newsItems.filter((item) => {
    if (newsCategory !== 'all' && item.category !== newsCategory) return false;
    if (!normalizedNewsQuery) return true;
    return [item.title, item.summary, item.category, item.status, item.horizon].join(' ').toLowerCase().includes(normalizedNewsQuery);
  });
  const featuredNews = filteredNews[0] ?? null;
  const secondaryNews = featuredNews ? filteredNews.slice(1) : filteredNews;

  const jumpToPageSection = (id: string) => {
    if (typeof document === 'undefined') return;
    const element = document.getElementById(id);
    if (!element) return;
    const y = element.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => setActivePage(resolvePage(window.location.pathname, pagePaths));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pagePaths]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activePage]);

  useEffect(() => {
    if (!faqItems.length) {
      setFaqOpen(null);
      return;
    }
    if (!faqItems.some((item) => item.question === faqOpen)) {
      setFaqOpen(faqItems[0].question);
    }
  }, [faqItems, faqOpen]);

  useEffect(() => {
    setLearningCategory('all');
    setNewsCategory('all');
  }, [lang]);

  useEffect(() => {
    if (!filteredArticles.length) {
      setOpenArticleId(null);
      return;
    }
    if (!filteredArticles.some((article) => article.id === openArticleId)) {
      setOpenArticleId(filteredArticles[0].id);
    }
  }, [filteredArticles, openArticleId]);

  useEffect(() => {
    const path = pagePaths[activePage];
    const pageDescription =
      activePage === 'system' ? publicMicro.systemIntro :
      activePage === 'night' ? publicMicro.nightIntro :
      activePage === 'family' ? publicMicro.familyIntro :
      activePage === 'how' ? howContent?.heroBody || publicMicro.homeSubtitle :
      activePage === 'faq' ? faqItems[0]?.answer || publicMicro.homeSubtitle :
      activePage === 'learn' ? learningArticles[0]?.summary || publicMicro.homeSubtitle :
      activePage === 'news' ? knowledgePageLabels.newsNote :
      activePage === 'trust' ? publicMicro.limitsIntro :
      activePage === 'privacy' ? legalPageContent?.privacy.intro || publicMicro.homeSubtitle :
      activePage === 'terms' ? legalPageContent?.terms.intro || publicMicro.homeSubtitle :
      activePage === 'medical' ? legalPageContent?.medical.intro || publicMicro.homeSubtitle :
      activePage === 'compliance' ? legalPageContent?.compliance.intro || publicMicro.homeSubtitle :
      activePage === 'downloadDesktop' ? downloadCopy.desktop.subtitle :
      activePage === 'downloadMobile' ? downloadCopy.mobile.subtitle :
      publicMicro.homeSubtitle;
    const pageTitle =
      activePage === 'how' ? knowledgeLabels.how :
      activePage === 'faq' ? knowledgeLabels.faq :
      activePage === 'learn' ? knowledgeLabels.learn :
      activePage === 'news' ? knowledgeLabels.news :
      activePage === 'privacy' ? legalLabels.privacy :
      activePage === 'terms' ? legalLabels.terms :
      activePage === 'medical' ? legalLabels.medical :
      activePage === 'compliance' ? legalLabels.compliance :
      activePage === 'trust' ? legalLabels.trust :
      activePage === 'downloadDesktop' ? downloadCopy.desktop.title :
      activePage === 'downloadMobile' ? downloadCopy.mobile.title :
      copy.titleByPage[activePage];

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }

    applySeo({
      title: `${pageTitle} | ${copy.brand}`,
      description: pageDescription,
      path,
    });
  }, [activePage, copy, legalLabels, pagePaths, publicMicro]);

  const shellTone = theme === 'dark' ? 't1d-page-shell t1d-page-shell--dark text-slate-100' : 't1d-page-shell text-slate-900';
  const cardTone = theme === 'dark' ? 't1d-home-card t1d-home-card--dark' : 't1d-home-card t1d-home-card--light';
  const sectionLabelTone = theme === 'dark' ? 'text-amber-200' : 'text-amber-800';
  const softLabelClass = theme === 'dark' ? 't1d-soft-label t1d-soft-label--dark' : 't1d-soft-label t1d-soft-label--light';
  const primaryButtonClass = theme === 'dark' ? 't1d-btn-warm-primary t1d-btn-warm-primary--dark' : 't1d-btn-warm-primary t1d-btn-warm-primary--light';
  const secondaryButtonClass = theme === 'dark' ? 't1d-btn-warm-secondary t1d-btn-warm-secondary--dark' : 't1d-btn-warm-secondary t1d-btn-warm-secondary--light';
  const heroBadgeClass = theme === 'dark' ? 't1d-hero-badge t1d-hero-badge--dark' : 't1d-hero-badge t1d-hero-badge--light';
  const subtleTextTone = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const mutedTextTone = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const homeTerms = HOME_TERMS[lang];

  const architectureCards = copy.architecture.items.map((item, index) => {
    const Icon = pageIcons[index % pageIcons.length];
    return { ...item, Icon };
  });

  const headerPages = siteChrome.headerPages;
  const footerProductLinks = siteChrome.footerProductLinks;
  const footerKnowledgeLinks = siteChrome.footerKnowledgeLinks;
  const footerLegalLinks = siteChrome.footerLegalLinks;
  const footerDownloadLinks = siteChrome.footerDownloadLinks;
  const isLegalPage = activePage === 'trust' || activePage === 'privacy' || activePage === 'terms' || activePage === 'medical' || activePage === 'compliance';
  const activePageLabel = siteChrome.resolveActivePageLabel(activePage);
  const roleCards = [
    { title: homeTerms.childRole, body: copy.family.intro, Icon: Heart },
    { title: homeTerms.parentRole, body: copy.family.points[1], Icon: MoonStar },
    { title: homeTerms.supportRole, body: copy.family.points[2], Icon: HeartHandshake },
  ];
  const promiseCards = [
    { value: copy.night.points[0], Icon: MoonStar },
    { value: copy.night.points[1], Icon: BellRing },
    { value: copy.night.points[2], Icon: Siren },
  ];
  const homeSteps = [homeTerms.step1, homeTerms.step2, homeTerms.step3];
  const concernCards = [
    { title: publicUi.whatYouGet, body: copy.product.body, Icon: Workflow },
    { title: publicUi.nightSupport, body: copy.night.intro, Icon: BellRing },
    { title: publicUi.familySupport, body: copy.family.intro, Icon: Users },
    { title: publicUi.shortSummary, body: copy.summary.body, Icon: TimerReset },
  ];
  const confidenceCards = [
    { label: copy.states.items[1].name, body: copy.states.items[1].body },
    { label: copy.states.items[2].name, body: copy.states.items[2].body },
    { label: copy.states.items[4].name, body: copy.states.items[4].body },
  ];

  const homeCardClass = theme === 'dark' ? 't1d-home-card t1d-home-card--dark' : 't1d-home-card t1d-home-card--light';
  const homeAccentCardClass = theme === 'dark' ? 't1d-home-card t1d-home-card--accent-dark' : 't1d-home-card t1d-home-card--accent-light';
  const homeMintCardClass = theme === 'dark' ? 't1d-home-card t1d-home-card--mint-dark' : 't1d-home-card t1d-home-card--mint-light';
  const homeChipClass = theme === 'dark' ? 't1d-home-chip t1d-home-chip--dark' : 't1d-home-chip t1d-home-chip--light';
  const homeFlowStepClass = theme === 'dark' ? 't1d-home-flow-step t1d-home-flow-step--dark' : 't1d-home-flow-step t1d-home-flow-step--light';
  const homeStateClass = theme === 'dark' ? 't1d-home-state t1d-home-state--dark' : 't1d-home-state t1d-home-state--light';
  const homeTypePointClass = theme === 'dark' ? 't1d-home-type-point t1d-home-type-point--dark' : 't1d-home-type-point t1d-home-type-point--light';
  const homePointClass = theme === 'dark' ? 't1d-home-point t1d-home-point--dark' : 't1d-home-point t1d-home-point--light';

  const typePageNote = (page: keyof typeof typeCopy.pages) => {
    const note = typeCopy.pages[page];
    return (
      <div className={t1dWarmNote(theme)}>
        <p className={softLabelClass}>{note.eyebrow}</p>
        <p className={`mt-3 text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{note.body}</p>
      </div>
    );
  };

  const pageHero = ((): { variant: PageHeroVariant; eyebrow?: string; title: string; subtitle?: string } | null => {
    switch (activePage) {
      case 'home':
        return null;
      case 'system':
        return { variant: 'system', eyebrow: publicUi.howItWorks, title: copy.titleByPage.system, subtitle: publicMicro.systemIntro };
      case 'night':
        return { variant: 'night', eyebrow: publicUi.nightSupport, title: copy.titleByPage.night, subtitle: publicMicro.nightIntro };
      case 'family':
        return { variant: 'family', eyebrow: publicUi.familySupport, title: copy.titleByPage.family, subtitle: publicMicro.familyIntro };
      case 'how':
        return {
          variant: 'how',
          eyebrow: knowledgeLabels.how,
          title: howContent?.heroTitle ?? knowledgePageLabels.explore,
          subtitle: howContent?.heroBody ?? publicMicro.homeSubtitle,
        };
      case 'faq':
        return { variant: 'faq', eyebrow: knowledgeLabels.faq, title: knowledgePageLabels.faqTitle, subtitle: knowledgePageLabels.accordionHint };
      case 'learn':
        return { variant: 'learn', eyebrow: knowledgeLabels.learn, title: knowledgePageLabels.learnTitle, subtitle: knowledgeUiCopy.learningIntro[lang] };
      case 'news':
        return { variant: 'news', eyebrow: knowledgeLabels.news, title: knowledgePageLabels.newsTitle, subtitle: knowledgeUiCopy.newsIntro[lang] };
      case 'trust':
        return { variant: 'trust', eyebrow: publicUi.limits, title: copy.titleByPage.trust, subtitle: publicMicro.limitsIntro };
      case 'privacy':
      case 'terms':
      case 'medical':
      case 'compliance':
        return {
          variant: activePage,
          eyebrow: legalLabels[activePage],
          title: legalPageContent?.[activePage].title ?? legalLabels[activePage],
          subtitle: legalPageContent?.[activePage].intro ?? publicMicro.limitsIntro,
        };
      case 'downloadDesktop':
        return { variant: 'how', eyebrow: downloadCopy.footerSection, title: downloadCopy.desktop.title, subtitle: downloadCopy.desktop.subtitle };
      case 'downloadMobile':
        return { variant: 'how', eyebrow: downloadCopy.footerSection, title: downloadCopy.mobile.title, subtitle: downloadCopy.mobile.subtitle };
      default:
        return null;
    }
  })();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen w-full relative flex flex-col ${shellTone} ${isRTL ? 'text-right' : 'text-left'}`}>
      <T1DPageBackdrop theme={theme} />

      <div className={`t1d-accent-bar ${theme === 'dark' ? 't1d-accent-bar--dark' : ''}`} />

      <T1DTopbar
        lang={lang}
        theme={theme}
        isRTL={isRTL}
        brand={copy.brand}
        nav={copy.nav}
        headerPages={headerPages}
        activePage={headerPages.includes(activePage as typeof headerPages[number]) ? activePage as typeof headerPages[number] : null}
        accountLabel={copy.signIn}
        onAccountAction={onSignIn}
        onBrandClick={() => setActivePage('home')}
        onNavigate={(page) => setActivePage(page)}
        setLang={setLang}
        setTheme={setTheme}
        uiCopy={copy.ui}
      />

      <main className={`t1d-container relative z-10 ${activePage === 'home' ? 'pt-4 md:pt-5 pb-14 md:pb-16' : 'pt-2 md:pt-4 pb-16 md:pb-24 space-y-10'}`}>
        {pageHero ? (
          <PageHeroBanner
            variant={pageHero.variant}
            theme={theme}
            isRTL={isRTL}
            priority
            eyebrow={pageHero.eyebrow}
            title={pageHero.title}
            subtitle={pageHero.subtitle}
          />
        ) : null}

        {activePage === 'home' ? (
          <section className="t1d-home">
            <div id="choose-type" className="t1d-home-entry t1d-home-entry--top space-y-4 scroll-mt-24">
              <div className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                <div>
                  <h1 className={`max-w-3xl text-2xl md:text-3xl font-black tracking-tight ${theme === 'dark' ? 'text-slate-50' : 'text-stone-900'}`}>
                    {typeCopy.home.sectionTitle}
                  </h1>
                  <p className={`mt-2 max-w-3xl text-sm md:text-base leading-relaxed ${subtleTextTone}`}>{typeCopy.home.intro}</p>
                </div>
                <p className={`text-xs font-semibold ${mutedTextTone}`}>{typeCopy.home.footnote}</p>
              </div>
              <div className="t1d-home-grid t1d-home-grid--entry">
                {(['type1', 'type2'] as const).map((typeKey) => {
                  const card = typeCopy.home[typeKey];
                  const typeCardClass = typeKey === 'type1'
                    ? `${homeMintCardClass} t1d-home-entry-gate--type1`
                    : `${homeAccentCardClass} t1d-home-entry-gate--type2`;
                  const entryButtonClass = typeKey === 'type1'
                    ? theme === 'dark' ? 't1d-btn-mint-primary t1d-btn-mint-primary--dark' : 't1d-btn-mint-primary t1d-btn-mint-primary--light'
                    : primaryButtonClass;
                  return (
                    <article key={typeKey} className={`${typeCardClass} t1d-home-entry-gate`}>
                      <div className="t1d-home-entry-gate__visual" aria-hidden="true">
                        <HeroIllustration
                          variant={typeKey === 'type1' ? 'family' : 'workspace'}
                          theme={theme}
                          diabetesType={typeKey}
                        />
                      </div>
                      <p className={`t1d-home-type-chip t1d-home-type-chip--${typeKey} ${theme === 'dark' ? 't1d-home-type-chip--dark' : ''}`}>{card.label}</p>
                      <h2 className="mt-2 text-lg font-black tracking-tight">{card.title}</h2>
                      <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{card.body}</p>
                      <div className="t1d-home-type-points">
                        {card.points.map((point) => (
                          <div key={point} className={homeTypePointClass}>{point}</div>
                        ))}
                      </div>
                      <button type="button" onClick={() => onSignUp(typeKey)} className={`${entryButtonClass} t1d-home-entry-gate__cta`}>
                        {card.cta}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="t1d-home-panel t1d-home-panel--hero">
              <div className="t1d-home-hero-split" aria-hidden="true">
                <div className="t1d-home-hero-split__pane t1d-home-hero-split__pane--type1">
                  <HeroIllustration variant="home" theme={theme} diabetesType="type1" priority />
                  <span className="t1d-home-hero-split__label t1d-home-hero-split__label--type1">{typeCopy.home.type1.label}</span>
                </div>
                <div className="t1d-home-hero-split__pane t1d-home-hero-split__pane--type2">
                  <HeroIllustration variant="workspace" theme={theme} diabetesType="type2" priority />
                  <span className="t1d-home-hero-split__label t1d-home-hero-split__label--type2">{typeCopy.home.type2.label}</span>
                </div>
              </div>
              <div className="t1d-home-hero-fade" aria-hidden="true" />
              <div className="t1d-home-grid t1d-home-grid--hero">
                <div className="flex flex-col gap-5">
                  <div className={`t1d-home-hero-copy-panel ${theme === 'dark' ? 't1d-home-hero-copy-panel--dark' : 't1d-home-hero-copy-panel--light'}`}>
                    <div className={`${heroBadgeClass} ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Heart size={14} />
                      <span>{copy.hero.eyebrow}</span>
                    </div>
                    <div className="space-y-3">
                      <p className={`text-xl md:text-2xl font-black tracking-tight max-w-[22ch] ${theme === 'dark' ? 'text-slate-50' : 'text-stone-900'}`}>{copy.hero.title}</p>
                      <p className={`max-w-2xl text-[0.98rem] md:text-[1.02rem] font-medium leading-relaxed ${subtleTextTone}`}>{publicMicro.homeSubtitle}</p>
                      <p className={`text-sm font-semibold ${mutedTextTone}`}>{publicMicro.homeNote}</p>
                    </div>
                    <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button type="button" onClick={() => setActivePage('system')} className={secondaryButtonClass}>
                        {copy.hero.secondary}
                      </button>
                    </div>
                    <div className="t1d-home-chip-row">
                      {promiseCards.map(({ value, Icon }) => (
                        <span key={value} className={homeChipClass}>
                          <Icon size={13} />
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <article className={`${homeAccentCardClass} gap-4`}>
                  <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                      <p className={softLabelClass}>{publicUi.shortSummary}</p>
                      <p className="mt-2 text-xl md:text-2xl font-bold tracking-tight leading-snug">{copy.summary.body}</p>
                    </div>
                    <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-rose-400/10 text-rose-200' : 'bg-rose-50 text-rose-700'}`}>
                      <BellRing size={20} />
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${subtleTextTone}`}>{publicMicro.nightIntro}</p>
                  <div className="t1d-home-flow">
                    {homeSteps.map((step, index) => (
                      <div key={step} className={homeFlowStepClass}>
                        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${theme === 'dark' ? 'bg-amber-300 text-stone-950' : 'bg-orange-600 text-white'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-sm font-black tracking-tight">{step}</p>
                          <p className={`mt-1 text-sm leading-relaxed ${subtleTextTone}`}>
                            {index === 0 ? copy.product.points[2] : index === 1 ? copy.family.points[1] : copy.family.points[2]}
                          </p>
                        </div>
                        <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>
                          {index === 0 ? <BellRing size={15} /> : index === 1 ? <Users size={15} /> : <HeartHandshake size={15} />}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="t1d-home-states">
                    {confidenceCards.map((item) => (
                      <div key={item.label} className={homeStateClass}>
                        <p className={softLabelClass}>{item.label}</p>
                        <p className={`mt-1 text-[11px] leading-snug font-semibold ${subtleTextTone}`}>{item.body}</p>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            </div>

            <LandingNutritionShowcase lang={lang} theme={theme} isRTL={isRTL} />

            <div className="t1d-home-grid t1d-home-grid--features">
              {concernCards.map(({ title, body, Icon }, index) => (
                <article key={title} className={index === 0 ? homeMintCardClass : homeCardClass}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${index === 0 ? theme === 'dark' ? 'bg-emerald-400/12 text-emerald-300' : 'bg-emerald-100 text-emerald-700' : theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>
                    <Icon size={17} />
                  </span>
                  <h2 className="mt-3 text-lg font-black tracking-tight">{title}</h2>
                  <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{body}</p>
                </article>
              ))}
            </div>

            <div className="t1d-home-grid t1d-home-grid--roles">
              {roleCards.map(({ title, body, Icon }) => (
                <article key={title} className={homeCardClass}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>
                    <Icon size={17} />
                  </span>
                  <h2 className="mt-3 text-base font-black tracking-tight">{title}</h2>
                  <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{body}</p>
                </article>
              ))}
              <article className={homeAccentCardClass}>
                <p className={softLabelClass}>{publicUi.coreIdea}</p>
                <p className="mt-2 text-xl font-black tracking-tight leading-tight">{copy.principle.body}</p>
                <div className="t1d-home-point-list">
                  {copy.product.points.map((point) => (
                    <div key={point} className={homePointClass}>{point}</div>
                  ))}
                </div>
              </article>
            </div>

            <article className={`${homeCardClass} gap-4`}>
              <div className={`flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className={softLabelClass}>{publicUi.limits}</p>
                  <h2 className="mt-2 text-lg md:text-xl font-black tracking-tight leading-snug">{publicMicro.limitsIntro}</h2>
                </div>
                <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-slate-900 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  <AlertTriangle size={17} />
                </span>
              </div>
              <div className="t1d-home-legal-grid">
                {copy.trust.legal.map((item) => (
                  <div key={item} className={homePointClass}>{item}</div>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {activePage === 'system' ? (
          <section className="space-y-6">
            {typePageNote('system')}
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid gap-4 sm:grid-cols-3">
                {copy.states.items.slice(0, 3).map((item) => (
                    <article key={item.name} className={`rounded-[1.4rem] border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}>
                      <p className={softLabelClass}>{item.name}</p>
                      <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                    </article>
                  ))}
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {architectureCards.map(({ title, body, Icon }) => (
                <article key={title} className={`rounded-[1.6rem] border p-5 md:p-6 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(18,32,49,0.92),rgba(16,28,43,0.88))]' : 'border-slate-200 bg-white/95'}`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-lg font-black tracking-tight">{title}</h3>
                  <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{body}</p>
                </article>
              ))}
            </section>
          </section>
        ) : null}

        {activePage === 'night' ? (
          <section className="space-y-6">
            {typePageNote('night')}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <article className={`rounded-[2rem] border ${theme === 'dark' ? 'border-indigo-500/25 bg-[linear-gradient(160deg,rgba(49,46,129,0.55),rgba(30,27,75,0.72))]' : 'border-indigo-200 bg-indigo-950 text-white'} p-6 md:p-8`}>
                <p className={softLabelClass}>{copy.night.escalationTitle}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {copy.night.points.slice(0, 3).map((item) => (
                    <div key={item} className="rounded-[1.4rem] bg-white/[0.12] px-4 py-4 text-sm font-semibold text-slate-100/92">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
              <article className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                <p className={softLabelClass}>{publicUi.shortSummary}</p>
                <p className="mt-3 text-3xl font-black tracking-tight">{copy.summary.body}</p>
                <div className="mt-5 grid gap-4">
                  {copy.states.items.slice(2, 5).map((item) => (
                    <article key={item.name} className={`rounded-[1.35rem] border p-4 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))]' : 'border-slate-200 bg-slate-50/90'}`}>
                      <p className="text-sm font-black tracking-tight">{item.name}</p>
                      <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                    </article>
                  ))}
                </div>
              </article>
            </section>
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <p className={softLabelClass}>{copy.night.escalationTitle}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {copy.night.escalation.map((item, index) => (
                  <div key={item} className={`rounded-[1.35rem] border p-4 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))] text-slate-200' : 'border-slate-200 bg-slate-50/90 text-slate-700'}`}>
                    <p className="text-sm font-black tracking-tight">{item}</p>
                    <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>
                      {index === 0 ? copy.states.items[1].body : index === 1 ? copy.states.items[2].body : index === 2 ? copy.states.items[3].body : copy.family.points[1]}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {activePage === 'family' ? (
          <section className="space-y-6">
            {typePageNote('family')}
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid gap-4 sm:grid-cols-3">
                {roleCards.map(({ title, body, Icon }) => (
                    <article key={title} className={`rounded-[1.4rem] border p-4 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))]' : 'border-slate-200 bg-slate-50/90'}`}>
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>
                        <Icon size={16} />
                      </span>
                      <h3 className="mt-3 text-base font-black tracking-tight">{title}</h3>
                      <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{body}</p>
                    </article>
                  ))}
              </div>
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {copy.family.points.map((item, index) => (
                <article key={item} className={`rounded-[1.5rem] border p-5 ${index === 3 ? theme === 'dark' ? 'border-emerald-400/20 bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))]' : 'border-emerald-200 bg-emerald-50/70' : theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))]' : 'border-slate-200 bg-slate-50/90'}`}>
                  <p className="text-sm font-semibold leading-relaxed">{item}</p>
                </article>
              ))}
            </section>
          </section>
        ) : null}

        {activePage === 'how' ? (
          contentPending || !howContent ? (
            <section className={`rounded-[2rem] border ${cardTone} p-8 md:p-10`}>
              <p className={softLabelClass}>{knowledgePageLabels.explore}</p>
            </section>
          ) : (
          <section className="space-y-6">
            {typePageNote('system')}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {howContent.steps.map((step) => (
                <article key={step.title} className={`rounded-[1.6rem] border p-5 md:p-6 ${cardTone}`}>
                  <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{step.body}</p>
                </article>
              ))}
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {howContent.columns.map((column) => (
                <article key={column.title} className={`rounded-[1.8rem] border p-5 md:p-6 ${cardTone}`}>
                  <h3 className="text-2xl font-black tracking-tight">{column.title}</h3>
                  <div className="mt-4 space-y-3">
                    {column.bullets.map((bullet) => (
                      <div key={bullet} className={`rounded-2xl border px-4 py-3 text-sm leading-relaxed ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}>
                        {bullet}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          </section>
          )
        ) : null}

        {activePage === 'faq' ? (
          contentPending ? (
            <section className={`rounded-[2rem] border ${cardTone} p-8 md:p-10`}>
              <p className={softLabelClass}>{knowledgeLabels.faq}</p>
            </section>
          ) : (
          <section className="space-y-6">
            <section className="space-y-3">
              {faqItems.map((item) => {
                const open = faqOpen === item.question;
                return (
                  <article key={item.question} className={`rounded-[1.5rem] border ${cardTone}`}>
                    <button
                      type="button"
                      onClick={() => setFaqOpen(open ? null : item.question)}
                      className={`w-full px-5 py-4 text-left ${isRTL ? 'text-right' : 'text-left'} flex items-center justify-between gap-4`}
                    >
                      <span className="text-base md:text-lg font-black tracking-tight">{item.question}</span>
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-slate-600 bg-white/[0.06] text-slate-200' : 'border-slate-300 bg-white text-slate-700'}`}>
                        {open ? '−' : '+'}
                      </span>
                    </button>
                    {open ? (
                      <div className={`px-5 pb-5 text-sm leading-relaxed ${subtleTextTone}`}>
                        {item.answer}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </section>
          </section>
          )
        ) : null}

        {activePage === 'learn' ? (
          contentPending ? (
            <section className={`rounded-[2rem] border ${cardTone} p-8 md:p-10`}>
              <p className={softLabelClass}>{knowledgeLabels.learn}</p>
            </section>
          ) : (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <p className={`text-sm leading-relaxed ${mutedTextTone}`}>{knowledgePageLabels.articleHint}</p>
                <div className={`rounded-[1.6rem] border p-5 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(24,36,53,0.9),rgba(20,31,46,0.86))]' : 'border-slate-200 bg-slate-50/90'}`}>
                  <p className={softLabelClass}>{knowledgePageLabels.search}</p>
                  <input
                    value={learningQuery}
                    onChange={(event) => setLearningQuery(event.target.value)}
                    placeholder={knowledgePageLabels.search}
                    className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {learningCategories.map((category, index) => {
                  const isActive = (category === knowledgePageLabels.all && learningCategory === 'all') || category === learningCategory;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setLearningCategory(category === knowledgePageLabels.all ? 'all' : category)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-950 text-white'
                          : index % 4 === 1
                            ? theme === 'dark'
                              ? 'border border-rose-400/20 bg-rose-400/10 text-rose-100'
                              : 'border border-rose-200 bg-rose-50 text-rose-700'
                            : index % 4 === 2
                              ? theme === 'dark'
                                ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                                : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                              : index % 4 === 3
                                ? theme === 'dark'
                                  ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100'
                                  : 'border border-amber-200 bg-amber-50 text-amber-700'
                                : theme === 'dark'
                                  ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100'
                                  : 'border border-orange-200 bg-orange-50 text-orange-800'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <div className={`mt-6 rounded-[1.5rem] border p-4 md:p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.06]' : 'border-slate-200 bg-white/80'}`}>
                <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <p className={softLabelClass}>{knowledgePageLabels.explore}</p>
                  <span className={`text-xs ${mutedTextTone}`}>{knowledgePageLabels.learnTitle}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    { id: 'learn-library', label: knowledgePageLabels.library },
                    { id: 'learn-glossary', label: knowledgePageLabels.glossary },
                    { id: 'learn-pathways', label: knowledgePageLabels.pathways },
                  ].map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => jumpToPageSection(item.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        index === 0
                          ? theme === 'dark'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-950 text-white'
                          : index === 1
                            ? theme === 'dark'
                              ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : theme === 'dark'
                              ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100'
                              : 'border border-amber-200 bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {knowledgeUiCopy.learningTopics[lang].map((item, index) => (
                <article
                  key={item.title}
                  className={`rounded-[1.6rem] border p-5 md:p-6 ${
                    index === 0
                      ? theme === 'dark'
                        ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(42,28,24,0.55),rgba(28,22,34,0.62))]'
                        : 'border-orange-200 bg-orange-50/80'
                      : index === 1
                        ? theme === 'dark'
                          ? 'border-rose-400/20 bg-[linear-gradient(160deg,rgba(70,34,52,0.45),rgba(44,24,36,0.55))]'
                          : 'border-rose-200 bg-rose-50/80'
                        : index === 2
                          ? theme === 'dark'
                            ? 'border-emerald-400/20 bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))]'
                            : 'border-emerald-200 bg-emerald-50/80'
                          : theme === 'dark'
                            ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(68,50,26,0.4),rgba(44,32,18,0.5))]'
                            : 'border-amber-200 bg-amber-50/80'
                  }`}
                >
                  <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <div id="learn-library" className="space-y-4">
                <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h3 className="text-2xl font-black tracking-tight">{knowledgePageLabels.library}</h3>
                  <span className={`text-sm ${mutedTextTone}`}>{filteredArticles.length}</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {filteredArticles.map((article) => (
                    <article key={article.id} className={`rounded-[1.7rem] border p-5 md:p-6 ${cardTone}`}>
                      <button
                        type="button"
                        onClick={() => setOpenArticleId(openArticleId === article.id ? null : article.id)}
                        className={`w-full ${isRTL ? 'text-right' : 'text-left'}`}
                      >
                        <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>{article.category}</span>
                          <span className={`text-xs ${mutedTextTone}`}>{article.terms.join(' · ')}</span>
                        </div>
                        <div className={`mt-4 flex items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div>
                            <h4 className="text-2xl font-black tracking-tight">{article.title}</h4>
                            <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{article.summary}</p>
                          </div>
                          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${theme === 'dark' ? 'border-slate-600 bg-white/[0.06] text-slate-200' : 'border-slate-300 bg-white text-slate-700'}`}>
                            {openArticleId === article.id ? '−' : '+'}
                          </span>
                        </div>
                      </button>
                      {openArticleId === article.id ? (
                        <div className="mt-5 space-y-4">
                          {article.sections.map((section, sectionIndex) => (
                            <div
                              key={section.title}
                              className={`rounded-[1.25rem] border px-4 py-4 ${
                                sectionIndex === 0
                                  ? theme === 'dark'
                                    ? 'border-amber-400/15 bg-[linear-gradient(160deg,rgba(42,28,24,0.42),rgba(28,22,34,0.52))]'
                                    : 'border-orange-200 bg-orange-50/80'
                                  : theme === 'dark'
                                    ? 'border-white/10 bg-white/[0.07]'
                                    : 'border-slate-200 bg-white/85'
                              }`}
                            >
                              <p className="text-sm font-black tracking-tight">{section.title}</p>
                              <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{section.body}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </article>
                  ))}
                  {filteredArticles.length === 0 ? (
                    <article className={`rounded-[1.7rem] border p-5 md:p-6 ${cardTone}`}>
                      <p className={`text-sm leading-relaxed ${subtleTextTone}`}>{knowledgeUiCopy.noResults[lang]}</p>
                    </article>
                  ) : null}
                </div>
              </div>

              <aside className="space-y-4 xl:sticky xl:top-24 self-start">
                <div id="learn-glossary" className={`rounded-[1.8rem] border p-5 md:p-6 ${cardTone}`}>
                  <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <h3 className="text-2xl font-black tracking-tight">{knowledgePageLabels.glossary}</h3>
                    <span className={`text-sm ${mutedTextTone}`}>{filteredGlossary.length}</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {filteredGlossary.map((item) => (
                      <div key={item.term} className={`rounded-[1.25rem] border px-4 py-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}>
                        <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <p className="text-base font-black tracking-tight">{item.term}</p>
                          <span className={`text-xs font-semibold ${softLabelClass}`}>{item.category}</span>
                        </div>
                        <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{item.short}</p>
                      </div>
                    ))}
                    {filteredGlossary.length === 0 ? (
                      <div className={`rounded-[1.25rem] border px-4 py-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}>
                        <p className={`text-sm leading-relaxed ${subtleTextTone}`}>{knowledgeUiCopy.noResults[lang]}</p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div id="learn-pathways" className={`rounded-[1.8rem] border p-5 md:p-6 ${cardTone}`}>
                  <h3 className="text-2xl font-black tracking-tight">{knowledgePageLabels.pathways}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {knowledgeUiCopy.pathways[lang].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-[1.25rem] border px-4 py-4 text-sm font-semibold ${
                          index === 0
                            ? theme === 'dark'
                              ? 'border-amber-400/15 bg-[linear-gradient(160deg,rgba(42,28,24,0.42),rgba(28,22,34,0.52))]'
                              : 'border-orange-200 bg-orange-50/80'
                            : index === 1
                              ? theme === 'dark'
                                ? 'border-rose-400/15 bg-[linear-gradient(160deg,rgba(70,34,52,0.38),rgba(44,24,36,0.48))]'
                                : 'border-rose-200 bg-rose-50/80'
                              : index === 2
                                ? theme === 'dark'
                                  ? 'border-emerald-400/15 bg-[linear-gradient(160deg,rgba(24,56,54,0.38),rgba(18,38,44,0.48))]'
                                  : 'border-emerald-200 bg-emerald-50/80'
                                : theme === 'dark'
                                  ? 'border-amber-400/15 bg-[linear-gradient(160deg,rgba(68,50,26,0.34),rgba(44,32,18,0.44))]'
                                  : 'border-amber-200 bg-amber-50/80'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </section>
          </section>
          )
        ) : null}

        {activePage === 'news' ? (
          contentPending ? (
            <section className={`rounded-[2rem] border ${cardTone} p-8 md:p-10`}>
              <p className={softLabelClass}>{knowledgeLabels.news}</p>
            </section>
          ) : (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <p className={`text-sm leading-relaxed ${mutedTextTone}`}>{knowledgePageLabels.newsNote}</p>
                <div className={`rounded-[1.6rem] border p-5 ${theme === 'dark' ? 'border-amber-400/15 bg-[linear-gradient(160deg,rgba(42,28,24,0.42),rgba(28,22,34,0.52))]' : 'border-orange-200 bg-orange-50/90'}`}>
                  <p className={softLabelClass}>{knowledgePageLabels.searchNews}</p>
                  <input
                    value={newsQuery}
                    onChange={(event) => setNewsQuery(event.target.value)}
                    placeholder={knowledgePageLabels.searchNews}
                    className={`mt-3 w-full rounded-2xl border px-4 py-3 text-sm ${theme === 'dark' ? 'border-slate-700 bg-slate-950/70 text-slate-100 placeholder:text-slate-400' : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400'}`}
                  />
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {newsCategories.map((category, index) => {
                  const isActive = (category === knowledgePageLabels.all && newsCategory === 'all') || category === newsCategory;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setNewsCategory(category === knowledgePageLabels.all ? 'all' : category)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-950 text-white'
                          : index % 4 === 1
                            ? theme === 'dark'
                              ? 'border border-emerald-400/20 bg-emerald-400/10 text-emerald-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : index % 4 === 2
                              ? theme === 'dark'
                                ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100'
                                : 'border border-amber-200 bg-amber-50 text-amber-700'
                              : index % 4 === 3
                                ? theme === 'dark'
                                  ? 'border border-rose-400/20 bg-rose-400/10 text-rose-100'
                                  : 'border border-rose-200 bg-rose-50 text-rose-700'
                                : theme === 'dark'
                                  ? 'border border-amber-400/20 bg-amber-400/10 text-amber-100'
                                  : 'border border-orange-200 bg-orange-50 text-orange-800'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </section>
            {featuredNews ? (
              <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                <article className={`rounded-[2rem] border p-6 md:p-8 ${
                  theme === 'dark'
                    ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(42,28,24,0.56),rgba(28,22,34,0.66))]'
                    : 'border-orange-200 bg-orange-50/90'
                }`}>
                  <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-white/12 text-amber-100' : 'bg-white text-orange-800'}`}>{featuredNews.category}</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-amber-100/80' : 'text-orange-800/80'}`}>{featuredNews.horizon}</span>
                  </div>
                  <p className={`mt-5 ${softLabelClass}`}>{knowledgePageLabels.updated}</p>
                  <h3 className="mt-3 max-w-3xl text-3xl md:text-4xl font-black tracking-tight">{featuredNews.title}</h3>
                  <p className={`mt-4 max-w-3xl text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{featuredNews.summary}</p>
                  <div className={`mt-6 inline-flex rounded-[1.2rem] border px-4 py-3 ${theme === 'dark' ? 'border-white/10 bg-white/[0.08] text-slate-100' : 'border-slate-200 bg-white text-slate-800'}`}>
                    <p className="text-sm font-semibold">{featuredNews.status}</p>
                  </div>
                </article>
                <div className="grid gap-4">
                  {knowledgeUiCopy.newsTopics[lang].slice(0, 2).map((item) => (
                    <article
                      key={`${item.title}-lead`}
                      className={`rounded-[1.8rem] border p-5 md:p-6 ${
                        item.tone === 'sky'
                          ? theme === 'dark'
                            ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(42,28,24,0.55),rgba(28,22,34,0.62))]'
                            : 'border-orange-200 bg-orange-50/80'
                          : theme === 'dark'
                            ? 'border-emerald-400/20 bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))]'
                            : 'border-emerald-200 bg-emerald-50/80'
                      }`}
                    >
                      <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                      <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {knowledgeUiCopy.newsTopics[lang].map((item) => (
                <article
                  key={item.title}
                  className={`rounded-[1.6rem] border p-5 md:p-6 ${
                    item.tone === 'sky'
                      ? theme === 'dark'
                        ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(42,28,24,0.55),rgba(28,22,34,0.62))]'
                        : 'border-orange-200 bg-orange-50/80'
                      : item.tone === 'emerald'
                        ? theme === 'dark'
                          ? 'border-emerald-400/20 bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))]'
                          : 'border-emerald-200 bg-emerald-50/80'
                        : item.tone === 'amber'
                          ? theme === 'dark'
                            ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(68,50,26,0.4),rgba(44,32,18,0.5))]'
                            : 'border-amber-200 bg-amber-50/80'
                          : theme === 'dark'
                            ? 'border-rose-400/20 bg-[linear-gradient(160deg,rgba(70,34,52,0.42),rgba(44,24,36,0.52))]'
                            : 'border-rose-200 bg-rose-50/80'
                  }`}
                >
                  <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                </article>
              ))}
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {secondaryNews.map((item, index) => (
                <article
                  key={item.id}
                  className={`rounded-[1.8rem] border p-5 md:p-6 ${
                    index % 4 === 0
                      ? theme === 'dark'
                        ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(42,28,24,0.48),rgba(28,22,34,0.58))]'
                        : 'border-orange-200 bg-orange-50/85'
                      : index % 4 === 1
                        ? theme === 'dark'
                          ? 'border-emerald-400/20 bg-[linear-gradient(160deg,rgba(24,56,54,0.42),rgba(18,38,44,0.52))]'
                          : 'border-emerald-200 bg-emerald-50/85'
                        : index % 4 === 2
                          ? theme === 'dark'
                            ? 'border-amber-400/20 bg-[linear-gradient(160deg,rgba(68,50,26,0.38),rgba(44,32,18,0.48))]'
                            : 'border-amber-200 bg-amber-50/85'
                          : theme === 'dark'
                            ? 'border-rose-400/20 bg-[linear-gradient(160deg,rgba(70,34,52,0.4),rgba(44,24,36,0.5))]'
                            : 'border-rose-200 bg-rose-50/85'
                  }`}
                >
                  <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${theme === 'dark' ? 'bg-amber-400/12 text-amber-200' : 'bg-orange-100 text-orange-800'}`}>{item.category}</span>
                    <span className={`text-xs ${mutedTextTone}`}>{item.horizon}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-tight">{item.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.summary}</p>
                  <div className={`mt-5 rounded-[1.25rem] border px-4 py-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.09]' : 'border-slate-200 bg-white/90'}`}>
                    <p className={softLabelClass}>{knowledgePageLabels.updated}</p>
                    <p className="mt-2 text-sm font-semibold">{item.status}</p>
                  </div>
                </article>
              ))}
              {filteredNews.length === 0 ? (
                <article className={`rounded-[1.8rem] border p-5 md:p-6 md:col-span-2 xl:col-span-3 ${cardTone}`}>
                  <p className={`text-sm leading-relaxed ${subtleTextTone}`}>{knowledgeUiCopy.noResults[lang]}</p>
                </article>
              ) : null}
            </section>
          </section>
          )
        ) : null}

        {activePage === 'trust' ? (
          <section className="space-y-6">
            {typePageNote('trust')}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <article className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                <p className={softLabelClass}>{copy.trust.legalTitle}</p>
                <div className="mt-4 grid gap-3">
                  {copy.trust.legal.map((item) => (
                    <div key={item} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))] text-slate-200' : 'border-slate-200 bg-slate-50/90 text-slate-700'}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </article>
              <article className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                <p className={softLabelClass}>{copy.trust.mvpTitle}</p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-[1.4rem] p-5 ${theme === 'dark' ? 'bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))]' : 'bg-emerald-50'}`}>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>{copy.ui.mvpIn}</p>
                    <div className="mt-3 space-y-2">
                      {copy.trust.mvpIn.map((item) => (
                        <p key={item} className="text-sm font-semibold">{item}</p>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-[1.4rem] p-5 ${theme === 'dark' ? 'bg-[linear-gradient(160deg,rgba(66,32,48,0.42),rgba(44,22,34,0.52))]' : 'bg-rose-50'}`}>
                    <p className={`text-sm font-semibold ${theme === 'dark' ? 'text-rose-300' : 'text-rose-700'}`}>{copy.ui.mvpOut}</p>
                    <div className="mt-3 space-y-2">
                      {copy.trust.mvpOut.map((item) => (
                        <p key={item} className="text-sm font-semibold">{item}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </section>
          </section>
        ) : null}

        {activePage === 'privacy' || activePage === 'terms' || activePage === 'medical' || activePage === 'compliance' ? (
          contentPending || !legalPageContent ? (
            <section className={`rounded-[2rem] border ${cardTone} p-8 md:p-10`}>
              <p className={softLabelClass}>{legalLabels[activePage as LegalPage]}</p>
            </section>
          ) : (
          <section className="space-y-6">
            {(() => {
              const legalPage = activePage as LegalPage;
              const legalContent = legalPageContent[legalPage];

              return (
                <>
                  <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.32fr_0.68fr]">
                    <aside className={`rounded-[1.6rem] border p-5 md:p-6 xl:sticky xl:top-24 self-start ${cardTone}`}>
                      <p className={softLabelClass}>{knowledgePageLabels.explore}</p>
                      <div className="mt-4 grid gap-2">
                        {legalContent.sections.map((section, index) => (
                          <button
                            key={`${legalPage}-toc-${section.title}`}
                            type="button"
                            onClick={() => jumpToPageSection(`${legalPage}-section-${index}`)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right' : 'text-left'} ${
                              theme === 'dark'
                                ? 'border-white/10 bg-white/[0.06] text-slate-200 hover:border-amber-400/25 hover:bg-amber-400/10'
                                : 'border-slate-200 bg-white/85 text-slate-700 hover:border-orange-300 hover:bg-orange-50/80'
                            }`}
                          >
                            {section.title}
                          </button>
                        ))}
                      </div>
                    </aside>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    {legalContent.sections.map((section, index) => (
                      <article id={`${legalPage}-section-${index}`} key={section.title} className={`rounded-[1.6rem] border p-5 md:p-6 ${cardTone}`}>
                        <h3 className="text-xl font-black tracking-tight">{section.title}</h3>
                        <div className="mt-4 space-y-3">
                          {section.paragraphs?.map((paragraph) => (
                            <p key={paragraph} className={`text-sm leading-relaxed ${subtleTextTone}`}>{paragraph}</p>
                          ))}
                          {section.bullets ? (
                            <ul className={`space-y-2 text-sm leading-relaxed ${subtleTextTone}`}>
                              {section.bullets.map((bullet) => (
                                <li key={bullet} className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                  <span className={`mt-1 h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-amber-300' : 'bg-orange-600'}`} />
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      </article>
                    ))}
                    </div>
                  </section>
                </>
              );
            })()}
          </section>
          )
        ) : null}

        {activePage === 'downloadDesktop' ? (
          <DownloadInstallPanel
            theme={theme}
            isRTL={isRTL}
            copy={downloadCopy.desktop}
            platform="desktop"
            otherPlatformHref={pagePaths.downloadMobile}
            otherPlatformLabel={downloadCopy.desktop.otherPlatformLabel}
            onOtherPlatform={() => setActivePage('downloadMobile')}
          />
        ) : null}

        {activePage === 'downloadMobile' ? (
          <DownloadInstallPanel
            theme={theme}
            isRTL={isRTL}
            copy={downloadCopy.mobile}
            platform="mobile"
            otherPlatformHref={pagePaths.downloadDesktop}
            otherPlatformLabel={downloadCopy.mobile.otherPlatformLabel}
            onOtherPlatform={() => setActivePage('downloadDesktop')}
          />
        ) : null}
      </main>

      <T1DFooter
        lang={lang}
        theme={theme}
        isRTL={isRTL}
        brand={copy.brand}
        heroEyebrow={copy.hero.eyebrow}
        signInLabel={copy.signIn}
        type1SignUpLabel={typeCopy.home.type1.cta}
        type2SignUpLabel={typeCopy.home.type2.cta}
        activePageLabel={activePageLabel}
        copyright={legalUi.copyright}
        reserved={legalUi.reserved}
        disclaimer={copy.footer.disclaimer}
        accountLabel={copy.footer.accountLabel}
        activateLightLabel={copy.ui.activateLightMode}
        activateDarkLabel={copy.ui.activateDarkMode}
        switchToLightTitle={copy.ui.switchToLightMode}
        switchToDarkTitle={copy.ui.switchToDarkMode}
        sectionProduct={copy.footerSections.product}
        sectionExplore={knowledgePageLabels.explore}
        sectionLegal={copy.footerSections.legal}
        sectionDownload={siteChrome.downloadSectionLabel}
        sectionAccount={copy.footerSections.account}
        legalNote={legalUi.classicNote}
        trustLegalLabel={copy.footer.legal}
        productLinks={footerProductLinks}
        knowledgeLinks={footerKnowledgeLinks}
        legalLinks={footerLegalLinks}
        downloadLinks={footerDownloadLinks}
        onNavigate={(pageId) => setActivePage(pageId as Page)}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      />
    </div>
  );
};

export default T1DPublicLandingView;
