import React, { useEffect, useState } from 'react';
import { AlertTriangle, BellRing, HeartHandshake, MoonStar, ShieldAlert, Siren, TimerReset, Users, Workflow } from 'lucide-react';
import { Language, RTL_LANGUAGES } from '../types';
import LanguageSelector from './LanguageSelector';
import ThemeToggle from './ThemeToggle';
import { COPY, HOME_TERMS, PUBLIC_MICROCOPY, PUBLIC_UI_COPY, buildPagePaths, pageIcons, pageOrder, resolvePage, type Page } from '../content/landing-copy';
import { LEGAL_PAGE_CONTENT, LEGAL_PAGE_LABELS, LEGAL_PAGE_ORDER, LEGAL_UI_COPY, type LegalPage } from '../content/legal-copy';
import { FAQ_ITEMS, GLOSSARY_TERMS, HOW_IT_WORKS_CONTENT, KNOWLEDGE_LABELS, LEARNING_ARTICLES, NEWS_ITEMS } from '../content/knowledge-copy';
import { applySeo } from '../lib/seo';

interface T1DPublicLandingViewProps {
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onSignIn: () => void;
  onSignUp: () => void;
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
  const publicUi = PUBLIC_UI_COPY[lang];
  const publicMicro = PUBLIC_MICROCOPY[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const pagePaths = buildPagePaths(basePath);
  const legalLabels = LEGAL_PAGE_LABELS[lang];
  const legalUi = LEGAL_UI_COPY[lang];
  const knowledgeLabels = KNOWLEDGE_LABELS.footer[lang];
  const knowledgePageLabels = KNOWLEDGE_LABELS.pages[lang];
  const howContent = HOW_IT_WORKS_CONTENT[lang];
  const faqItems = FAQ_ITEMS[lang];
  const learningArticles = LEARNING_ARTICLES[lang];
  const glossaryTerms = GLOSSARY_TERMS[lang];
  const newsItems = NEWS_ITEMS[lang];
  const [activePage, setActivePage] = useState<Page>(() => {
    if (typeof window === 'undefined') return 'home';
    return resolvePage(window.location.pathname, pagePaths);
  });
  const [faqOpen, setFaqOpen] = useState<string | null>(faqItems[0]?.question || null);
  const [learningQuery, setLearningQuery] = useState('');
  const [newsQuery, setNewsQuery] = useState('');
  const [openArticleId, setOpenArticleId] = useState<string | null>(learningArticles[0]?.id || null);
  const [learningCategory, setLearningCategory] = useState<string>('all');
  const [newsCategory, setNewsCategory] = useState<string>('all');

  const knowledgeUiCopy = {
    learningIntro: {
      en: 'A structured library for families, adults, and support participants: disease basics, daily safety, device understanding, family response, and a large term glossary that can keep expanding.',
      ru: 'Структурированная библиотека для семей, взрослых и поддерживающих участников: основы болезни, ежедневная безопасность, понимание устройств, семейная реакция и большой глоссарий, который можно постоянно расширять.',
      uk: 'Структурована бібліотека для родин, дорослих і учасників підтримки: основи хвороби, щоденна безпека, розуміння пристроїв, реакція родини та великий глосарій, який можна постійно розширювати.',
      es: 'Una biblioteca estructurada para familias, adultos y participantes de apoyo: fundamentos de la enfermedad, seguridad diaria, comprensión de dispositivos, respuesta familiar y un amplio glosario que puede seguir creciendo.',
      fr: 'Une bibliothèque structurée pour les familles, les adultes et les personnes de soutien: bases de la maladie, sécurité quotidienne, compréhension des dispositifs, réponse familiale et grand glossaire pouvant continuer à s’élargir.',
      de: 'Eine strukturierte Bibliothek für Familien, Erwachsene und unterstützende Personen: Krankheitsgrundlagen, tägliche Sicherheit, Geräteverständnis, familiäre Reaktion und ein großes Glossar, das weiter wachsen kann.',
      zh: '这是一套面向家庭、成年人和支持参与者的结构化资料库，涵盖疾病基础、日常安全、设备理解、家庭响应，以及可持续扩展的大型术语库。',
      ja: '家族、成人当事者、支援に関わる人のための整理されたライブラリです。病気の基礎、日々の安全、機器の理解、家族の対応、大きく広げていける用語集を含みます。',
      pt: 'Uma biblioteca estruturada para famílias, adultos e participantes de apoio: fundamentos da doença, segurança diária, entendimento dos dispositivos, resposta da família e um grande glossário que pode continuar crescendo.',
      he: 'ספרייה מסודרת למשפחות, למבוגרים ולאנשי תמיכה: יסודות המחלה, בטיחות יומיומית, הבנת המכשירים, תגובת המשפחה ומילון מונחים רחב שיכול להמשיך להתרחב.',
      ar: 'مكتبة منظّمة للعائلات والبالغين والمشاركين في الدعم: أساسيات المرض، السلامة اليومية، فهم الأجهزة، استجابة الأسرة، ومكتبة مصطلحات كبيرة يمكن توسيعها مع الوقت.',
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
      en: 'A curated product-facing news layer for diabetes progress: research directions, treatment progress, device innovation, automation, and realistic near-term vs long-term movement.',
      ru: 'Кураторский новостной слой о прогрессе в диабете: направления исследований, развитие лечения, инновации устройств, автоматизация и реалистичный взгляд на ближние и дальние горизонты.',
      uk: 'Кураторський новинний шар про прогрес у сфері діабету: напрями досліджень, розвиток лікування, інновації пристроїв, автоматизація і реалістичний погляд на близькі та дальні горизонти.',
      es: 'Una capa editorial de noticias sobre el progreso en diabetes: direcciones de investigación, avances en tratamiento, innovación en dispositivos, automatización y una visión realista del corto y largo plazo.',
      fr: 'Une couche éditoriale d’actualités sur les progrès du diabète: orientations de recherche, avancées de traitement, innovation des dispositifs, automatisation et vision réaliste du court et du long terme.',
      de: 'Eine kuratierte Nachrichtenebene zu Fortschritten bei Diabetes: Forschungsrichtungen, Behandlungsfortschritte, Geräteinnovation, Automatisierung und ein realistischer Blick auf kurze und lange Horizonte.',
      zh: '一层面向产品视角的糖尿病进展资讯：研究方向、治疗进展、设备创新、自动化，以及对近期与长期变化的现实判断。',
      ja: '糖尿病分野の進展を扱う編集型ニュースレイヤーです。研究の方向性、治療の進歩、機器の革新、自動化、そして近い将来と長期の動きを現実的に整理します。',
      pt: 'Uma camada editorial de notícias sobre o progresso em diabetes: direções de pesquisa, avanço do tratamento, inovação em dispositivos, automação e uma visão realista do curto e do longo prazo.',
      he: 'שכבת חדשות ערוכה על התקדמות בתחום הסוכרת: כיווני מחקר, התקדמות בטיפול, חדשנות במכשירים, אוטומציה והסתכלות מציאותית על טווח קצר וארוך.',
      ar: 'طبقة أخبار تحريرية عن التقدم في مجال السكري: اتجاهات البحث، تطور العلاج، ابتكار الأجهزة، الأتمتة، ونظرة واقعية إلى المدى القريب والبعيد.',
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
      activePage === 'how' ? howContent.heroBody :
      activePage === 'faq' ? faqItems[0]?.answer || publicMicro.homeSubtitle :
      activePage === 'learn' ? learningArticles[0]?.summary || publicMicro.homeSubtitle :
      activePage === 'news' ? knowledgePageLabels.newsNote :
      activePage === 'trust' ? publicMicro.limitsIntro :
      activePage === 'privacy' ? LEGAL_PAGE_CONTENT.privacy.intro :
      activePage === 'terms' ? LEGAL_PAGE_CONTENT.terms.intro :
      activePage === 'medical' ? LEGAL_PAGE_CONTENT.medical.intro :
      activePage === 'compliance' ? LEGAL_PAGE_CONTENT.compliance.intro :
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

  const shellTone = theme === 'dark' ? 'bg-[#09111a] text-slate-100' : 'bg-[#f3f8fb] text-slate-900';
  const cardTone = theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(18,32,48,0.92),rgba(21,38,58,0.88))] t1d-soft-card' : 'border-slate-200 bg-white/92 t1d-soft-card';
  const sectionLabelTone = theme === 'dark' ? 'text-sky-300' : 'text-sky-700';
  const subtleTextTone = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const mutedTextTone = theme === 'dark' ? 'text-slate-400' : 'text-slate-600';
  const homeTerms = HOME_TERMS[lang];

  const architectureCards = copy.architecture.items.map((item, index) => {
    const Icon = pageIcons[index % pageIcons.length];
    return { ...item, Icon };
  });

  const headerPages = pageOrder.filter((page) => page !== 'trust');
  const footerProductLinks = pageOrder.map((page) => ({ id: page, label: copy.nav[page] }));
  const footerKnowledgeLinks = [
    { id: 'how' as const, label: knowledgeLabels.how },
    { id: 'faq' as const, label: knowledgeLabels.faq },
    { id: 'learn' as const, label: knowledgeLabels.learn },
    { id: 'news' as const, label: knowledgeLabels.news },
  ];
  const footerLegalLinks = LEGAL_PAGE_ORDER.map((page) => ({ id: page, label: legalLabels[page] }));
  const isLegalPage = activePage === 'trust' || activePage === 'privacy' || activePage === 'terms' || activePage === 'medical' || activePage === 'compliance';
  const activePageLabel =
    activePage === 'how' ? knowledgeLabels.how :
    activePage === 'faq' ? knowledgeLabels.faq :
    activePage === 'learn' ? knowledgeLabels.learn :
    activePage === 'news' ? knowledgeLabels.news :
    activePage === 'privacy' ? legalLabels.privacy :
    activePage === 'terms' ? legalLabels.terms :
    activePage === 'medical' ? legalLabels.medical :
    activePage === 'compliance' ? legalLabels.compliance :
    activePage === 'trust' ? legalLabels.trust :
    copy.titleByPage[activePage];
  const roleCards = [
    { title: homeTerms.childRole, body: copy.family.intro, Icon: ShieldAlert },
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
  const footerActionClass = `${isRTL ? 'text-right' : 'text-left'} transition-colors ${theme === 'dark' ? 'hover:text-sky-200' : 'hover:text-slate-950'}`;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen w-full relative overflow-hidden ${shellTone} ${isRTL ? 'text-right' : 'text-left'}`}>
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -top-24 -left-20 h-[28rem] w-[28rem] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-sky-500/18' : 'bg-sky-200/70'}`} />
        <div className={`absolute top-1/4 -right-24 h-[26rem] w-[26rem] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-emerald-500/12' : 'bg-emerald-100/75'}`} />
        <div className={`absolute -bottom-20 left-1/3 h-[22rem] w-[22rem] rounded-full blur-[120px] ${theme === 'dark' ? 'bg-amber-400/10' : 'bg-amber-100/70'}`} />
        <div className={`absolute top-[18%] left-[8%] h-40 w-40 rounded-full blur-[90px] ${theme === 'dark' ? 'bg-cyan-400/10' : 'bg-cyan-100/80'}`} />
        <div className={`absolute bottom-[12%] right-[8%] h-44 w-44 rounded-full blur-[90px] ${theme === 'dark' ? 'bg-rose-300/8' : 'bg-rose-100/70'}`} />
        <div className={`absolute inset-0 opacity-[0.18] ${theme === 'dark' ? 'bg-[radial-gradient(circle_at_top,rgba(125,211,252,0.12),transparent_30%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]' : 'bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.14),transparent_30%),linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)]'} bg-[size:auto,36px_36px,36px_36px]`} />
      </div>

      <div className={`relative z-20 h-2 ${theme === 'dark' ? 'bg-gradient-to-r from-sky-500/70 via-cyan-400/60 to-emerald-400/60' : 'bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300'}`} />

      <header className={`sticky top-0 z-30 border-b backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,20,34,0.88),rgba(12,22,38,0.82))] shadow-[0_14px_40px_rgba(2,6,23,0.32)]' : 'border-slate-200/80 bg-white/82 shadow-[0_14px_40px_rgba(148,163,184,0.12)]'}`}>
        <div className={`max-w-[1160px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button type="button" onClick={() => setActivePage('home')} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${theme === 'dark' ? 'border-sky-400/30 bg-sky-400/10 text-sky-300' : 'border-sky-200 bg-sky-50 text-sky-700'}`}>
              <ShieldAlert size={18} />
            </span>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{copy.ui.biomathCore}</p>
              <p className="text-lg font-black tracking-tight">{copy.brand}</p>
            </div>
          </button>
          <nav className={`hidden md:flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {headerPages.map((page, index) => (
              <React.Fragment key={page}>
                {index > 0 ? <span className={theme === 'dark' ? 'text-slate-600' : 'text-slate-300'}>·</span> : null}
                <button
                  onClick={() => setActivePage(page)}
                  className={`text-[0.98rem] transition-colors ${
                    activePage === page
                      ? theme === 'dark'
                        ? 'text-sky-200'
                        : 'text-slate-950'
                      : theme === 'dark'
                        ? 'text-slate-300 hover:text-sky-200'
                        : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {copy.nav[page]}
                </button>
              </React.Fragment>
            ))}
          </nav>
          <div className={`hidden md:flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageSelector current={lang} onSelect={setLang} label={copy.ui.selectLanguage} buttonLabel={copy.ui.changeLanguage} rtl={isRTL} />
            <ThemeToggle
              theme={theme}
              toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              activateLightLabel={copy.ui.activateLightMode}
              activateDarkLabel={copy.ui.activateDarkMode}
              switchToLightTitle={copy.ui.switchToLightMode}
              switchToDarkTitle={copy.ui.switchToDarkMode}
            />
            <button
              onClick={onSignIn}
              className={`rounded-full px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-colors ${theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
            >
              {copy.signIn}
            </button>
          </div>
          <div className={`md:hidden flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <LanguageSelector current={lang} onSelect={setLang} label={copy.ui.selectLanguage} buttonLabel={copy.ui.changeLanguage} rtl={isRTL} />
            <ThemeToggle
              theme={theme}
              toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              activateLightLabel={copy.ui.activateLightMode}
              activateDarkLabel={copy.ui.activateDarkMode}
              switchToLightTitle={copy.ui.switchToLightMode}
              switchToDarkTitle={copy.ui.switchToDarkMode}
            />
            <button
              onClick={onSignIn}
              className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] ${theme === 'dark' ? 'bg-sky-300 text-slate-950' : 'bg-slate-950 text-white'}`}
            >
              {copy.signIn}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-[1160px] mx-auto px-4 md:px-6 pt-6 md:pt-10 pb-16 md:pb-24 space-y-10">
        <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${sectionLabelTone}`}>{activePage === 'system' ? publicUi.howItWorks : activePage === 'night' ? publicUi.nightSupport : activePage === 'family' ? publicUi.familySupport : activePage === 'home' ? copy.titleByPage.home : activePageLabel}</p>
        </div>

        {activePage === 'home' ? (
          <section className="space-y-8">
            <section className={`rounded-[2.8rem] border t1d-soft-shell ${theme === 'dark' ? 'border-sky-400/15 t1d-frost-dark' : 'border-white/70 t1d-frost-light'} p-7 md:p-10`}>
              <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-8 items-start">
                <div className="space-y-6">
                  <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black uppercase tracking-[0.24em] ${theme === 'dark' ? 'border-sky-400/20 bg-sky-400/10 text-sky-200 shadow-[0_8px_24px_rgba(56,189,248,0.08)]' : 'border-sky-200 bg-white/80 text-sky-700 shadow-[0_8px_24px_rgba(56,189,248,0.08)]'} ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <ShieldAlert size={14} />
                    <span>{copy.hero.eyebrow}</span>
                  </div>
                  <h1 className={`t1d-hero-title max-w-[12ch] ${theme === 'dark' ? 'text-slate-50 drop-shadow-[0_10px_34px_rgba(56,189,248,0.08)]' : 'text-slate-950'}`}>{copy.hero.title}</h1>
                  <p className={`max-w-2xl text-[0.98rem] md:text-[1.05rem] font-medium leading-relaxed ${subtleTextTone}`}>{publicMicro.homeSubtitle}</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={onSignUp}
                      className={`rounded-full px-7 py-3 text-sm font-black uppercase tracking-[0.08em] shadow-[0_16px_36px_rgba(14,165,233,0.18)] ${theme === 'dark' ? 'bg-sky-300 text-slate-950 hover:bg-sky-200' : 'bg-slate-950 text-white hover:bg-slate-800'}`}
                    >
                      {copy.hero.primary}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePage('system')}
                      className={`rounded-full border px-7 py-3 text-sm font-black uppercase tracking-[0.08em] ${theme === 'dark' ? 'border-slate-700 bg-slate-900/70 text-slate-100 hover:border-sky-400 shadow-[0_16px_36px_rgba(2,6,23,0.28)]' : 'border-slate-300 bg-white text-slate-900 hover:border-sky-500 shadow-[0_12px_28px_rgba(148,163,184,0.16)]'}`}
                    >
                      {copy.hero.secondary}
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {promiseCards.map(({ value, Icon }) => (
                      <div
                        key={value}
                        className={`rounded-[1.35rem] border px-4 py-4 t1d-soft-card ${theme === 'dark' ? 'border-white/10 bg-white/[0.08]' : 'border-slate-200 bg-white/84'}`}
                      >
                        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-sky-300/12 text-sky-200' : 'bg-sky-100 text-sky-700'}`}>
                          <Icon size={17} />
                        </span>
                        <p className="mt-3 text-sm font-bold leading-relaxed">{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className={`max-w-xl text-sm leading-relaxed ${mutedTextTone}`}>{publicMicro.homeNote}</p>
                </div>

                <div className="grid gap-4">
                  <div className={`rounded-[2.2rem] border t1d-soft-card-strong ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(19,34,52,0.94),rgba(15,28,44,0.92))]' : 'border-slate-200 bg-white/90'} p-5 md:p-6`}>
                    <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{publicUi.shortSummary}</p>
                        <p className="mt-2 text-2xl md:text-3xl font-black tracking-tight">{copy.summary.body}</p>
                      </div>
                      <span className={`inline-flex h-14 w-14 items-center justify-center rounded-[1.3rem] ${theme === 'dark' ? 'bg-rose-400/10 text-rose-200' : 'bg-rose-50 text-rose-700'}`}>
                        <BellRing size={22} />
                      </span>
                    </div>
                    <p className={`mt-4 text-sm leading-relaxed ${subtleTextTone}`}>{publicMicro.nightIntro}</p>
                    <div className="mt-5 space-y-3">
                      {homeSteps.map((step, index) => (
                        <div key={step} className={`rounded-2xl border px-4 py-4 t1d-soft-card ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-slate-50/90'}`}>
                          <div className={`flex items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div>
                              <p className="text-sm font-black tracking-tight">{step}</p>
                              <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>
                                {index === 0 ? copy.product.points[2] : index === 1 ? copy.family.points[1] : copy.family.points[2]}
                              </p>
                            </div>
                            <span className={`inline-flex h-8 min-w-8 items-center justify-center rounded-full text-[10px] font-black uppercase tracking-[0.12em] ${theme === 'dark' ? 'bg-sky-300 text-slate-950' : 'bg-slate-950 text-white'}`}>
                              {index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {confidenceCards.map((item, index) => (
                      <article
                        key={item.label}
                        className={`rounded-[1.6rem] border p-4 t1d-soft-card ${index === 2 ? 'sm:col-span-2' : ''} ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}
                      >
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${sectionLabelTone}`}>{item.label}</p>
                        <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {roleCards.map(({ title, body, Icon }) => (
                  <article key={title} className={`rounded-[1.9rem] border ${cardTone} p-6 md:p-7`}>
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-sky-400/12 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                      <Icon size={18} />
                    </span>
                    <h2 className="mt-4 text-2xl font-black tracking-tight">{title}</h2>
                    <p className={`mt-3 text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{body}</p>
                  </article>
                ))}
              </div>
              <article className={`rounded-[2rem] border t1d-soft-shell ${theme === 'dark' ? 'border-slate-800 t1d-frost-dark' : 'border-slate-200 t1d-frost-light'} p-6 md:p-7`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{publicUi.coreIdea}</p>
                <p className="mt-4 text-2xl md:text-3xl font-black tracking-tight">{copy.principle.body}</p>
                <div className="mt-6 grid gap-3">
                  {copy.product.points.map((point) => (
                    <div key={point} className={`rounded-2xl border px-4 py-3 text-sm font-semibold t1d-soft-card ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}>
                      {point}
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {concernCards.map(({ title, body, Icon }, index) => (
                <article
                  key={title}
                  className={`rounded-[1.8rem] border p-5 md:p-6 ${index === 0 ? theme === 'dark' ? 'border-emerald-400/20 bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))] t1d-soft-card-strong' : 'border-emerald-200 bg-emerald-50/70 t1d-soft-card-strong' : cardTone}`}
                >
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${index === 0 ? theme === 'dark' ? 'bg-emerald-400/12 text-emerald-300' : 'bg-emerald-100 text-emerald-700' : theme === 'dark' ? 'bg-sky-400/12 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                    <Icon size={18} />
                  </span>
                  <h2 className="mt-4 text-xl font-black tracking-tight">{title}</h2>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{body}</p>
                </article>
              ))}
            </section>

            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-7`}>
              <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{publicUi.limits}</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">{publicMicro.limitsIntro}</h2>
                </div>
                <span className={`hidden md:inline-flex h-12 w-12 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-slate-900 text-slate-200 border border-slate-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  <AlertTriangle size={18} />
                </span>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {copy.trust.legal.map((item) => (
                  <article key={item} className={`rounded-[1.35rem] border p-4 t1d-soft-card ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(24,36,53,0.9),rgba(20,31,46,0.86))]' : 'border-slate-200 bg-slate-50/90'}`}>
                    <p className="text-sm font-semibold leading-relaxed">{item}</p>
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        {activePage === 'system' ? (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                <article className={`rounded-[1.7rem] border p-5 md:p-6 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))]' : 'border-slate-200 bg-slate-50/90'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{publicUi.coreIdea}</p>
                  <h2 className="mt-3 text-3xl md:text-4xl font-black tracking-tight">{publicUi.howItWorks}</h2>
                  <p className={`mt-4 text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{publicMicro.systemIntro}</p>
                </article>
                <div className="grid gap-4 sm:grid-cols-3">
                  {copy.states.items.slice(0, 3).map((item) => (
                    <article key={item.name} className={`rounded-[1.4rem] border p-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.07]' : 'border-slate-200 bg-white/85'}`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${sectionLabelTone}`}>{item.name}</p>
                      <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {architectureCards.map(({ title, body, Icon }) => (
                <article key={title} className={`rounded-[1.6rem] border p-5 md:p-6 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(18,32,49,0.92),rgba(16,28,43,0.88))]' : 'border-slate-200 bg-white/95'}`}>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-sky-400/12 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
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
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.02fr_0.98fr]">
              <article className={`rounded-[2rem] border ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.94),rgba(18,31,49,0.92))]' : 'border-slate-200 bg-slate-950 text-white'} p-6 md:p-8`}>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{publicUi.nightSupport}</h2>
                <p className="mt-3 max-w-2xl text-sm md:text-[15px] leading-relaxed text-slate-200/90">{publicMicro.nightIntro}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {copy.night.points.slice(0, 3).map((item) => (
                    <div key={item} className="rounded-[1.4rem] bg-white/[0.12] px-4 py-4 text-sm font-semibold text-slate-100/92">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
              <article className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{publicUi.shortSummary}</p>
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
              <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{copy.night.escalationTitle}</p>
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
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.96fr_1.04fr]">
                <article>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{publicUi.familySupport}</h2>
                  <p className={`mt-3 text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{publicMicro.familyIntro}</p>
                </article>
                <div className="grid gap-4 sm:grid-cols-3">
                  {roleCards.map(({ title, body, Icon }) => (
                    <article key={title} className={`rounded-[1.4rem] border p-4 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))]' : 'border-slate-200 bg-slate-50/90'}`}>
                      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-sky-400/12 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                        <Icon size={16} />
                      </span>
                      <h3 className="mt-3 text-base font-black tracking-tight">{title}</h3>
                      <p className={`mt-2 text-sm leading-relaxed ${subtleTextTone}`}>{body}</p>
                    </article>
                  ))}
                </div>
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
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="max-w-4xl space-y-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{knowledgeLabels.how}</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{howContent.heroTitle}</h2>
                <p className={`text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{howContent.heroBody}</p>
              </div>
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {howContent.steps.map((step) => (
                <article key={step.title} className={`rounded-[1.6rem] border p-5 md:p-6 ${cardTone}`}>
                  <h3 className="text-xl font-black tracking-tight">{step.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{step.body}</p>
                </article>
              ))}
            </section>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
        ) : null}

        {activePage === 'faq' ? (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="max-w-4xl space-y-4">
                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{knowledgeLabels.faq}</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{knowledgePageLabels.faqTitle}</h2>
                <p className={`text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{knowledgePageLabels.accordionHint}</p>
              </div>
            </section>
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
        ) : null}

        {activePage === 'learn' ? (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{knowledgeLabels.learn}</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{knowledgePageLabels.learnTitle}</h2>
                  <p className={`text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>
                    {knowledgeUiCopy.learningIntro[lang]}
                  </p>
                  <p className={`text-sm leading-relaxed ${mutedTextTone}`}>{knowledgePageLabels.articleHint}</p>
                </div>
                <div className={`rounded-[1.6rem] border p-5 ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(24,36,53,0.9),rgba(20,31,46,0.86))]' : 'border-slate-200 bg-slate-50/90'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${sectionLabelTone}`}>{knowledgePageLabels.search}</p>
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
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-sky-300 text-slate-950'
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
                                  ? 'border border-sky-400/20 bg-sky-400/10 text-sky-100'
                                  : 'border border-sky-200 bg-sky-50 text-sky-700'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <div className={`mt-6 rounded-[1.5rem] border p-4 md:p-5 ${theme === 'dark' ? 'border-white/10 bg-white/[0.06]' : 'border-slate-200 bg-white/80'}`}>
                <div className={`flex items-center justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${sectionLabelTone}`}>{knowledgePageLabels.explore}</p>
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
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] ${
                        index === 0
                          ? theme === 'dark'
                            ? 'bg-sky-300 text-slate-950'
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
                        ? 'border-sky-400/20 bg-[linear-gradient(160deg,rgba(30,53,83,0.55),rgba(20,36,57,0.62))]'
                        : 'border-sky-200 bg-sky-50/80'
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
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'bg-sky-400/12 text-sky-200' : 'bg-sky-100 text-sky-700'}`}>{article.category}</span>
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
                                    ? 'border-sky-400/15 bg-[linear-gradient(160deg,rgba(29,52,80,0.42),rgba(20,36,57,0.52))]'
                                    : 'border-sky-200 bg-sky-50/80'
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
                          <span className={`text-[10px] font-black uppercase tracking-[0.16em] ${sectionLabelTone}`}>{item.category}</span>
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
                              ? 'border-sky-400/15 bg-[linear-gradient(160deg,rgba(29,52,80,0.42),rgba(20,36,57,0.52))]'
                              : 'border-sky-200 bg-sky-50/80'
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
        ) : null}

        {activePage === 'news' ? (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{knowledgeLabels.news}</p>
                  <h2 className="text-3xl md:text-4xl font-black tracking-tight">{knowledgePageLabels.newsTitle}</h2>
                  <p className={`text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>
                    {knowledgeUiCopy.newsIntro[lang]}
                  </p>
                  <p className={`text-sm leading-relaxed ${mutedTextTone}`}>{knowledgePageLabels.newsNote}</p>
                </div>
                <div className={`rounded-[1.6rem] border p-5 ${theme === 'dark' ? 'border-cyan-400/15 bg-[linear-gradient(160deg,rgba(30,53,83,0.52),rgba(20,36,57,0.62))]' : 'border-sky-200 bg-sky-50/90'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-[0.22em] ${sectionLabelTone}`}>{knowledgePageLabels.searchNews}</p>
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
                      className={`rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-[0.14em] transition-colors ${
                        isActive
                          ? theme === 'dark'
                            ? 'bg-sky-300 text-slate-950'
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
                                  ? 'border border-sky-400/20 bg-sky-400/10 text-sky-100'
                                  : 'border border-sky-200 bg-sky-50 text-sky-700'
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
                    ? 'border-sky-400/20 bg-[linear-gradient(160deg,rgba(30,53,83,0.56),rgba(21,37,58,0.66))]'
                    : 'border-sky-200 bg-sky-50/90'
                }`}>
                  <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'bg-white/12 text-sky-100' : 'bg-white text-sky-700'}`}>{featuredNews.category}</span>
                    <span className={`text-xs ${theme === 'dark' ? 'text-sky-100/80' : 'text-sky-700/80'}`}>{featuredNews.horizon}</span>
                  </div>
                  <p className={`mt-5 text-[10px] font-black uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-sky-100/80' : 'text-sky-700'}`}>{knowledgePageLabels.updated}</p>
                  <h3 className="mt-3 max-w-3xl text-3xl md:text-4xl font-black tracking-tight">{featuredNews.title}</h3>
                  <p className={`mt-4 max-w-3xl text-sm md:text-[15px] leading-relaxed ${theme === 'dark' ? 'text-sky-50/88' : 'text-slate-700'}`}>{featuredNews.summary}</p>
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
                            ? 'border-sky-400/20 bg-[linear-gradient(160deg,rgba(30,53,83,0.55),rgba(20,36,57,0.62))]'
                            : 'border-sky-200 bg-sky-50/80'
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
                        ? 'border-sky-400/20 bg-[linear-gradient(160deg,rgba(30,53,83,0.55),rgba(20,36,57,0.62))]'
                        : 'border-sky-200 bg-sky-50/80'
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
                        ? 'border-sky-400/20 bg-[linear-gradient(160deg,rgba(30,53,83,0.48),rgba(21,37,58,0.58))]'
                        : 'border-sky-200 bg-sky-50/85'
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
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${theme === 'dark' ? 'bg-sky-400/12 text-sky-200' : 'bg-sky-100 text-sky-700'}`}>{item.category}</span>
                    <span className={`text-xs ${mutedTextTone}`}>{item.horizon}</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-black tracking-tight">{item.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${subtleTextTone}`}>{item.summary}</p>
                  <div className={`mt-5 rounded-[1.25rem] border px-4 py-4 ${theme === 'dark' ? 'border-white/10 bg-white/[0.09]' : 'border-slate-200 bg-white/90'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.18em] ${sectionLabelTone}`}>{knowledgePageLabels.updated}</p>
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
        ) : null}

        {activePage === 'trust' ? (
          <section className="space-y-6">
            <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">{publicUi.limits}</h2>
              <p className={`mt-3 max-w-3xl text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{publicMicro.limitsIntro}</p>
            </section>
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <article className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{copy.trust.legalTitle}</p>
                <div className="mt-4 grid gap-3">
                  {copy.trust.legal.map((item) => (
                    <div key={item} className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${theme === 'dark' ? 'border-slate-700/80 bg-[linear-gradient(160deg,rgba(23,38,58,0.92),rgba(18,31,49,0.88))] text-slate-200' : 'border-slate-200 bg-slate-50/90 text-slate-700'}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </article>
              <article className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{copy.trust.mvpTitle}</p>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`rounded-[1.4rem] p-5 ${theme === 'dark' ? 'bg-[linear-gradient(160deg,rgba(24,56,54,0.45),rgba(18,38,44,0.55))]' : 'bg-emerald-50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'}`}>{copy.ui.mvpIn}</p>
                    <div className="mt-3 space-y-2">
                      {copy.trust.mvpIn.map((item) => (
                        <p key={item} className="text-sm font-semibold">{item}</p>
                      ))}
                    </div>
                  </div>
                  <div className={`rounded-[1.4rem] p-5 ${theme === 'dark' ? 'bg-[linear-gradient(160deg,rgba(66,32,48,0.42),rgba(44,22,34,0.52))]' : 'bg-rose-50'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${theme === 'dark' ? 'text-rose-300' : 'text-rose-700'}`}>{copy.ui.mvpOut}</p>
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
          <section className="space-y-6">
            {(() => {
              const legalPage = activePage as LegalPage;
              const legalContent = LEGAL_PAGE_CONTENT[legalPage];

              return (
                <>
                  <section className={`rounded-[2rem] border ${cardTone} p-6 md:p-8`}>
                    <div className="max-w-4xl space-y-4">
                      <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{legalLabels[legalPage]}</p>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight">{legalContent.title}</h2>
                      <p className={`text-sm md:text-[15px] leading-relaxed ${subtleTextTone}`}>{legalContent.intro}</p>
                    </div>
                  </section>
                  <section className="grid grid-cols-1 gap-4 xl:grid-cols-[0.32fr_0.68fr]">
                    <aside className={`rounded-[1.6rem] border p-5 md:p-6 xl:sticky xl:top-24 self-start ${cardTone}`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{knowledgePageLabels.explore}</p>
                      <div className="mt-4 grid gap-2">
                        {legalContent.sections.map((section, index) => (
                          <button
                            key={`${legalPage}-toc-${section.title}`}
                            type="button"
                            onClick={() => jumpToPageSection(`${legalPage}-section-${index}`)}
                            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${isRTL ? 'text-right' : 'text-left'} ${
                              theme === 'dark'
                                ? 'border-white/10 bg-white/[0.06] text-slate-200 hover:border-sky-400/25 hover:bg-sky-400/10'
                                : 'border-slate-200 bg-white/85 text-slate-700 hover:border-sky-300 hover:bg-sky-50/80'
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
                                  <span className={`mt-1 h-2 w-2 rounded-full ${theme === 'dark' ? 'bg-sky-300' : 'bg-sky-600'}`} />
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
        ) : null}
      </main>

      <footer className={`w-full border-t py-14 px-6 mt-auto relative overflow-hidden ${theme === 'dark' ? 'border-white/10 bg-[linear-gradient(180deg,rgba(7,15,25,0.4),rgba(9,17,26,0.82))]' : 'border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,255,255,0.8))]'}`}>
        <div className={`pointer-events-none absolute -top-16 left-1/4 w-52 h-52 rounded-full blur-[95px] ${theme === 'dark' ? 'bg-sky-500/12' : 'bg-sky-100/70'}`} />
        <div className={`pointer-events-none absolute bottom-0 right-1/4 w-56 h-56 rounded-full blur-[100px] ${theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-100/70'}`} />
        <div className="max-w-7xl mx-auto space-y-10 relative z-10">
          <div className={`grid grid-cols-1 gap-10 border-b pb-10 ${theme === 'dark' ? 'border-white/10' : 'border-slate-200'} md:grid-cols-[1.15fr_0.8fr_0.8fr_0.9fr_0.85fr]`}>
            <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${theme === 'dark' ? 'bg-sky-400/12 text-sky-300' : 'bg-sky-100 text-sky-700'}`}>
                  <ShieldAlert size={20} />
                </span>
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${sectionLabelTone}`}>{copy.ui.biomathCore}</p>
                  <p className="text-2xl font-black tracking-tight">{copy.brand}</p>
                </div>
              </div>
              <p className={`text-base font-semibold ${mutedTextTone}`}>{copy.hero.eyebrow}</p>
              <p className={`max-w-md text-sm leading-relaxed ${subtleTextTone}`}>{legalUi.classicNote}</p>
            </div>

            <nav className="space-y-4">
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${mutedTextTone}`}>{copy.footerSections.product}</p>
              <div className={`flex flex-col gap-3 text-[13px] ${subtleTextTone}`}>
                {footerProductLinks.map((page) => (
                  <button key={page.id} onClick={() => setActivePage(page.id)} className={footerActionClass}>
                    {page.label}
                  </button>
                ))}
              </div>
            </nav>

            <nav className="space-y-4">
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${mutedTextTone}`}>{knowledgePageLabels.explore}</p>
              <div className={`flex flex-col gap-3 text-[13px] ${subtleTextTone}`}>
                {footerKnowledgeLinks.map((page) => (
                  <button key={page.id} onClick={() => setActivePage(page.id)} className={footerActionClass}>
                    {page.label}
                  </button>
                ))}
              </div>
            </nav>

            <nav className="space-y-4">
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${mutedTextTone}`}>{copy.footerSections.legal}</p>
              <div className={`flex flex-col gap-3 text-[13px] ${subtleTextTone}`}>
                {footerLegalLinks.map((page) => (
                  <button key={page.id} onClick={() => setActivePage(page.id)} className={footerActionClass}>
                    {page.label}
                  </button>
                ))}
              </div>
            </nav>

            <div className="space-y-4">
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${mutedTextTone}`}>{copy.footer.legal}</p>
              <div className={`space-y-3 text-[13px] leading-relaxed ${subtleTextTone}`}>
                <p>{copy.footer.disclaimer}</p>
              </div>
            </div>

            <nav className="space-y-4">
              <p className={`text-xs font-black uppercase tracking-[0.3em] ${mutedTextTone}`}>{copy.footerSections.account}</p>
              <div className="flex flex-col gap-4">
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-[13px] ${subtleTextTone}`}>{copy.footer.accountLabel}</span>
                  <ThemeToggle
                    theme={theme}
                    toggle={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                    activateLightLabel={copy.ui.activateLightMode}
                    activateDarkLabel={copy.ui.activateDarkMode}
                    switchToLightTitle={copy.ui.switchToLightMode}
                    switchToDarkTitle={copy.ui.switchToDarkMode}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={onSignIn}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${theme === 'dark' ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-slate-300'}`}
                  >
                    {copy.signIn}
                  </button>
                  <button
                    onClick={onSignUp}
                    className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.14em] ${theme === 'dark' ? 'bg-sky-300 text-slate-950' : 'bg-slate-950 text-white'}`}
                  >
                    {copy.hero.primary}
                  </button>
                </div>
              </div>
            </nav>
          </div>

          <div className={`flex flex-col gap-3 text-[12px] ${mutedTextTone} md:flex-row md:items-center md:justify-between ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <p>{legalUi.copyright} © 2026 {copy.brand}. {legalUi.reserved}</p>
            <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span className="opacity-70">{activePageLabel}</span>
              <span className="opacity-40">•</span>
              <span className="opacity-70">{copy.hero.eyebrow}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default T1DPublicLandingView;
