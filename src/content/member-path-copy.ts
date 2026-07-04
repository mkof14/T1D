import type { DiabetesType, Language } from '../types';

interface MemberPathCopy {
  badge: Record<DiabetesType, string>;
  access: Record<'signin' | 'signup', Record<DiabetesType, { title: string; subtitle: string }>>;
  setup: Record<DiabetesType, { title: string; subtitle: string }>;
}

export const MEMBER_PATH_COPY: Record<Language, MemberPathCopy> = {
  en: {
    badge: { type1: 'Type 1 path', type2: 'Type 2 path' },
    access: {
      signin: {
        type1: { title: 'Welcome back to your type 1 circle', subtitle: 'Open your family daily view — lows, nights, and shared support.' },
        type2: { title: 'Welcome back to your type 2 path', subtitle: 'Open your daily view — highs, meals, and calm support.' },
      },
      signup: {
        type1: { title: 'Create your type 1 family space', subtitle: 'For parents, children, and support adults — built around fast lows and protective nights.' },
        type2: { title: 'Create your type 2 account', subtitle: 'For adults and partners — built around highs, meals, and a softer daily rhythm.' },
      },
    },
    setup: {
      type1: { title: 'Set up your type 1 support circle', subtitle: 'Add your child, parent, backup adult, and night window before support starts.' },
      type2: { title: 'Set up your type 2 support circle', subtitle: 'Add the person with diabetes, a partner, backup support, and your night window.' },
    },
  },
  ru: {
    badge: { type1: 'Путь типа 1', type2: 'Путь типа 2' },
    access: {
      signin: {
        type1: { title: 'Снова в круге поддержки типа 1', subtitle: 'Откройте дневную картину — низкий сахар, ночь и общая поддержка.' },
        type2: { title: 'Снова на пути типа 2', subtitle: 'Откройте дневную картину — высокий сахар, еда и спокойная поддержка.' },
      },
      signup: {
        type1: { title: 'Создайте семейное пространство типа 1', subtitle: 'Для родителей, ребёнка и близких — вокруг быстрых низких и бережной ночи.' },
        type2: { title: 'Создайте аккаунт типа 2', subtitle: 'Для взрослых и партнёров — вокруг высоких значений, еды и мягкого дневного ритма.' },
      },
    },
    setup: {
      type1: { title: 'Настройте круг поддержки типа 1', subtitle: 'Добавьте ребёнка, родителя, резервного взрослого и ночное окно.' },
      type2: { title: 'Настройте круг поддержки типа 2', subtitle: 'Добавьте человека с диабетом, партнёра, резервную поддержку и ночное окно.' },
    },
  },
  uk: {
    badge: { type1: 'Шлях типу 1', type2: 'Шлях типу 2' },
    access: {
      signin: {
        type1: { title: 'Знову в колі підтримки типу 1', subtitle: 'Відкрийте денну картину — низькі, ніч і спільна підтримка.' },
        type2: { title: 'Знову на шляху типу 2', subtitle: 'Відкрийте денну картину — високі, їжа і спокійна підтримка.' },
      },
      signup: {
        type1: { title: 'Створіть простір типу 1', subtitle: 'Для батьків, дитини та близьких — навколо швидких низьких.' },
        type2: { title: 'Створіть акаунт типу 2', subtitle: 'Для дорослих і партнерів — навколо високих і мʼякого ритму.' },
      },
    },
    setup: {
      type1: { title: 'Налаштуйте коло типу 1', subtitle: 'Додайте дитину, батьків, резерв і нічне вікно.' },
      type2: { title: 'Налаштуйте коло типу 2', subtitle: 'Додайте людину з діабетом, партнера, резерв і нічне вікно.' },
    },
  },
  es: {
    badge: { type1: 'Camino tipo 1', type2: 'Camino tipo 2' },
    access: {
      signin: {
        type1: { title: 'Bienvenido de nuevo al círculo tipo 1', subtitle: 'Abre tu vista diaria — hipos, noches y apoyo compartido.' },
        type2: { title: 'Bienvenido de nuevo al camino tipo 2', subtitle: 'Abre tu vista diaria — hiperglucemias, comidas y apoyo calmado.' },
      },
      signup: {
        type1: { title: 'Crea tu espacio familiar tipo 1', subtitle: 'Para padres, niños y apoyo — pensado en hipos rápidas.' },
        type2: { title: 'Crea tu cuenta tipo 2', subtitle: 'Para adultos y parejas — pensado en hiperglucemias y comidas.' },
      },
    },
    setup: {
      type1: { title: 'Configura tu círculo tipo 1', subtitle: 'Añade al niño, padres, apoyo de reserva y ventana nocturna.' },
      type2: { title: 'Configura tu círculo tipo 2', subtitle: 'Añade a la persona con diabetes, pareja, reserva y ventana nocturna.' },
    },
  },
  fr: {
    badge: { type1: 'Parcours type 1', type2: 'Parcours type 2' },
    access: {
      signin: {
        type1: { title: 'Bon retour dans le cercle type 1', subtitle: 'Ouvrez votre vue quotidienne — hypoglycémies, nuits et soutien partagé.' },
        type2: { title: 'Bon retour sur le parcours type 2', subtitle: 'Ouvrez votre vue quotidienne — hyperglycémies, repas et soutien calme.' },
      },
      signup: {
        type1: { title: 'Créez votre espace type 1', subtitle: 'Pour parents, enfant et proches — autour des hypoglycémies rapides.' },
        type2: { title: 'Créez votre compte type 2', subtitle: 'Pour adultes et partenaires — autour des hyperglycémies et des repas.' },
      },
    },
    setup: {
      type1: { title: 'Configurez le cercle type 1', subtitle: 'Ajoutez l’enfant, les parents, le relais et la plage nocturne.' },
      type2: { title: 'Configurez le cercle type 2', subtitle: 'Ajoutez la personne, le partenaire, le relais et la plage nocturne.' },
    },
  },
  de: {
    badge: { type1: 'Typ-1-Weg', type2: 'Typ-2-Weg' },
    access: {
      signin: {
        type1: { title: 'Willkommen zurück im Typ-1-Kreis', subtitle: 'Öffnen Sie Ihre Tagesansicht — Tiefs, Nächte und geteilte Unterstützung.' },
        type2: { title: 'Willkommen zurück auf dem Typ-2-Weg', subtitle: 'Öffnen Sie Ihre Tagesansicht — Hohe Werte, Mahlzeiten und ruhige Unterstützung.' },
      },
      signup: {
        type1: { title: 'Erstellen Sie Ihren Typ-1-Familienraum', subtitle: 'Für Eltern, Kind und Unterstützung — um schnelle Tiefwerte.' },
        type2: { title: 'Erstellen Sie Ihr Typ-2-Konto', subtitle: 'Für Erwachsene und Partner — um Hohe Werte und Mahlzeiten.' },
      },
    },
    setup: {
      type1: { title: 'Typ-1-Unterstützungskreis einrichten', subtitle: 'Kind, Eltern, Reserve und Nachtfenster hinzufügen.' },
      type2: { title: 'Typ-2-Unterstützungskreis einrichten', subtitle: 'Person, Partner, Reserve und Nachtfenster hinzufügen.' },
    },
  },
  zh: {
    badge: { type1: '1 型路径', type2: '2 型路径' },
    access: {
      signin: {
        type1: { title: '欢迎回到 1 型支持圈', subtitle: '打开日常视图 — 低血糖、夜间与共享支持。' },
        type2: { title: '欢迎回到 2 型路径', subtitle: '打开日常视图 — 高血糖、饮食与平静支持。' },
      },
      signup: {
        type1: { title: '创建 1 型家庭空间', subtitle: '为家长、孩子与支持者 — 围绕快速低血糖。' },
        type2: { title: '创建 2 型账号', subtitle: '为成年人与伴侣 — 围绕高血糖与饮食。' },
      },
    },
    setup: {
      type1: { title: '设置 1 型支持圈', subtitle: '添加孩子、家长、后备支持与夜间窗口。' },
      type2: { title: '设置 2 型支持圈', subtitle: '添加患者、伴侣、后备支持与夜间窗口。' },
    },
  },
  ja: {
    badge: { type1: '1 型パス', type2: '2 型パス' },
    access: {
      signin: {
        type1: { title: '1 型サポートサークルへおかえりなさい', subtitle: 'デイリー表示を開く — 低値、夜、共有サポート。' },
        type2: { title: '2 型パスへおかえりなさい', subtitle: 'デイリー表示を開く — 高値、食事、落ち着いたサポート。' },
      },
      signup: {
        type1: { title: '1 型ファミリースペースを作成', subtitle: '保護者、子ども、サポート向け — 急な低値中心。' },
        type2: { title: '2 型アカウントを作成', subtitle: '大人とパートナー向け — 高値と食事中心。' },
      },
    },
    setup: {
      type1: { title: '1 型サポートサークルを設定', subtitle: '子ども、保護者、予備、夜間ウィンドウを追加。' },
      type2: { title: '2 型サポートサークルを設定', subtitle: '本人、パートナー、予備、夜間ウィンドウを追加。' },
    },
  },
  pt: {
    badge: { type1: 'Caminho tipo 1', type2: 'Caminho tipo 2' },
    access: {
      signin: {
        type1: { title: 'Bem-vindo de volta ao círculo tipo 1', subtitle: 'Abra sua visão diária — hipos, noites e apoio compartilhado.' },
        type2: { title: 'Bem-vindo de volta ao caminho tipo 2', subtitle: 'Abra sua visão diária — altos, refeições e apoio calmo.' },
      },
      signup: {
        type1: { title: 'Crie seu espaço familiar tipo 1', subtitle: 'Para pais, criança e apoio — em torno de hipos rápidas.' },
        type2: { title: 'Crie sua conta tipo 2', subtitle: 'Para adultos e parceiros — em torno de altos e refeições.' },
      },
    },
    setup: {
      type1: { title: 'Configure o círculo tipo 1', subtitle: 'Adicione criança, pais, reserva e janela noturna.' },
      type2: { title: 'Configure o círculo tipo 2', subtitle: 'Adicione a pessoa, parceiro, reserva e janela noturna.' },
    },
  },
  he: {
    badge: { type1: 'מסלול סוג 1', type2: 'מסלול סוג 2' },
    access: {
      signin: {
        type1: { title: 'ברוכים השבים למעגל סוג 1', subtitle: 'פתחו את התצוגה היומית — נמוכים, לילה ותמיכה משותפת.' },
        type2: { title: 'ברוכים השבים למסלול סוג 2', subtitle: 'פתחו את התצוגה היומית — גבוהים, ארוחות ותמיכה רגועה.' },
      },
      signup: {
        type1: { title: 'צרו מרחב משפחתי סוג 1', subtitle: 'להורים, ילד ותומכים — סביב ירידות מהירות.' },
        type2: { title: 'צרו חשבון סוג 2', subtitle: 'למבוגרים ובני זוג — סביב גבוהים וארוחות.' },
      },
    },
    setup: {
      type1: { title: 'הגדירו מעגל סוג 1', subtitle: 'הוסיפו ילד, הורים, גיבוי וחלון לילה.' },
      type2: { title: 'הגדירו מעגל סוג 2', subtitle: 'הוסיפו את האדם, בן/בת זוג, גיבוי וחלון לילה.' },
    },
  },
  ar: {
    badge: { type1: 'مسار النوع 1', type2: 'مسار النوع 2' },
    access: {
      signin: {
        type1: { title: 'مرحبًا بعودتك إلى دائرة النوع 1', subtitle: 'افتح العرض اليومي — الانخفاض، الليل، والدعم المشترك.' },
        type2: { title: 'مرحبًا بعودتك إلى مسار النوع 2', subtitle: 'افتح العرض اليومي — الارتفاع، الوجبات، والدعم الهادئ.' },
      },
      signup: {
        type1: { title: 'أنشئ مساحة عائلية للنوع 1', subtitle: 'للآباء والطفل والداعمين — حول الانخفاض السريع.' },
        type2: { title: 'أنشئ حساب النوع 2', subtitle: 'للبالغين والشركاء — حول الارتفاع والوجبات.' },
      },
    },
    setup: {
      type1: { title: 'إعداد دائرة النوع 1', subtitle: 'أضف الطفل والوالدين والاحتياط ونافذة الليل.' },
      type2: { title: 'إعداد دائرة النوع 2', subtitle: 'أضف الشخص والشريك والاحتياط ونافذة الليل.' },
    },
  },
};

export const TYPE2_SETUP_FIELDS: Record<Language, {
  childName: string;
  childAgeBand: string;
  householdName: string;
  primaryParent: string;
  caregiverName: string;
  placeholders: {
    householdName: string;
    childName: string;
    childAgeBand: string;
    primaryParent: string;
    caregiverName: string;
    nightWindow: string;
  };
}> = {
  en: {
    childName: 'Person With Diabetes',
    childAgeBand: 'Age Range',
    householdName: 'Support Circle Name',
    primaryParent: 'Partner Or Primary Contact',
    caregiverName: 'Trusted Backup Contact',
    placeholders: {
      householdName: 'Alex Support Circle',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam Rivera',
      caregiverName: 'Jordan Lee',
      nightWindow: '10:00 PM - 7:00 AM',
    },
  },
  ru: {
    childName: 'Человек С Диабетом',
    childAgeBand: 'Возраст',
    householdName: 'Название Круга Поддержки',
    primaryParent: 'Партнёр Или Основной Контакт',
    caregiverName: 'Доверенный Резервный Контакт',
    placeholders: {
      householdName: 'Круг Поддержки Алекса',
      childName: 'Алекс',
      childAgeBand: '40-55',
      primaryParent: 'Сэм Ривера',
      caregiverName: 'Джордан Ли',
      nightWindow: '22:00 - 07:00',
    },
  },
  uk: {
    childName: 'Людина З Діабетом',
    childAgeBand: 'Вік',
    householdName: 'Назва Кола Підтримки',
    primaryParent: 'Партнер Або Основний Контакт',
    caregiverName: 'Довірений Резервний Контакт',
    placeholders: {
      householdName: 'Коло Підтримки Олекса',
      childName: 'Олекс',
      childAgeBand: '40-55',
      primaryParent: 'Сем',
      caregiverName: 'Джордан',
      nightWindow: '22:00 - 07:00',
    },
  },
  es: {
    childName: 'Persona Con Diabetes',
    childAgeBand: 'Rango De Edad',
    householdName: 'Nombre Del Círculo',
    primaryParent: 'Pareja O Contacto Principal',
    caregiverName: 'Contacto De Reserva',
    placeholders: {
      householdName: 'Círculo De Apoyo De Alex',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  fr: {
    childName: 'Personne Avec Diabète',
    childAgeBand: 'Tranche D’âge',
    householdName: 'Nom Du Cercle',
    primaryParent: 'Partenaire Ou Contact Principal',
    caregiverName: 'Contact De Secours',
    placeholders: {
      householdName: 'Cercle De Soutien D’Alex',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  de: {
    childName: 'Person Mit Diabetes',
    childAgeBand: 'Altersbereich',
    householdName: 'Name Des Unterstützungskreises',
    primaryParent: 'Partner Oder Hauptkontakt',
    caregiverName: 'Vertrauensvoller Reservekontakt',
    placeholders: {
      householdName: 'Alex Unterstützungskreis',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  zh: {
    childName: '糖尿病患者',
    childAgeBand: '年龄段',
    householdName: '支持圈名称',
    primaryParent: '伴侣或主要联系人',
    caregiverName: '可信后备联系人',
    placeholders: {
      householdName: 'Alex 支持圈',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  ja: {
    childName: '糖尿病の方',
    childAgeBand: '年齢層',
    householdName: 'サポートサークル名',
    primaryParent: 'パートナーまたは主な連絡先',
    caregiverName: '信頼できる予備連絡先',
    placeholders: {
      householdName: 'Alex サポートサークル',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  pt: {
    childName: 'Pessoa Com Diabetes',
    childAgeBand: 'Faixa Etária',
    householdName: 'Nome Do Círculo',
    primaryParent: 'Parceiro Ou Contato Principal',
    caregiverName: 'Contato De Reserva',
    placeholders: {
      householdName: 'Círculo De Apoio De Alex',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  he: {
    childName: 'אדם עם סוכרת',
    childAgeBand: 'טווח גיל',
    householdName: 'שם מעגל התמיכה',
    primaryParent: 'בן/בת זוג או איש קשר ראשי',
    caregiverName: 'איש קשר גיבוי',
    placeholders: {
      householdName: 'מעגל התמיכה של Alex',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
  ar: {
    childName: 'الشخص المصاب بالسكري',
    childAgeBand: 'الفئة العمرية',
    householdName: 'اسم دائرة الدعm',
    primaryParent: 'الشريك أو جهة الاتصال الأساسية',
    caregiverName: 'جهة اتصال احتياطية',
    placeholders: {
      householdName: 'دائرة دعم Alex',
      childName: 'Alex',
      childAgeBand: '40-55',
      primaryParent: 'Sam',
      caregiverName: 'Jordan',
      nightWindow: '22:00 - 07:00',
    },
  },
};

export const TYPE2_ACCESS_LABELS: Record<Language, {
  signupPrimary: string;
  joinCreate: string;
  partnerRole: string;
  trustedContactRole: string;
  householdSectionTitle: string;
  householdSectionSubtitle: string;
}> = {
  en: {
    signupPrimary: 'Create account & support circle',
    joinCreate: 'Create new circle',
    partnerRole: 'Partner',
    trustedContactRole: 'Trusted Contact',
    householdSectionTitle: 'Your support circle',
    householdSectionSubtitle: 'Fill once — account and circle on the same screen.',
  },
  ru: {
    signupPrimary: 'Создать аккаунт и круг поддержки',
    joinCreate: 'Создать новый круг',
    partnerRole: 'Партнёр',
    trustedContactRole: 'Доверенный Контакт',
    householdSectionTitle: 'Ваш круг поддержки',
    householdSectionSubtitle: 'Заполните один раз — аккаунт и круг на одном экране.',
  },
  uk: {
    signupPrimary: 'Створити акаунт і коло підтримки',
    joinCreate: 'Створити нове коло',
    partnerRole: 'Партнер',
    trustedContactRole: 'Довірений Контакт',
    householdSectionTitle: 'Ваше коло підтримки',
    householdSectionSubtitle: 'Заповніть один раз — акаунт і коло на одному екрані.',
  },
  es: {
    signupPrimary: 'Crear cuenta y círculo de apoyo',
    joinCreate: 'Crear nuevo círculo',
    partnerRole: 'Pareja',
    trustedContactRole: 'Contacto De Confianza',
    householdSectionTitle: 'Su círculo de apoyo',
    householdSectionSubtitle: 'Complete una vez — cuenta y círculo en la misma pantalla.',
  },
  fr: {
    signupPrimary: 'Créer un compte et un cercle',
    joinCreate: 'Créer un nouveau cercle',
    partnerRole: 'Partenaire',
    trustedContactRole: 'Contact De Confiance',
    householdSectionTitle: 'Votre cercle de soutien',
    householdSectionSubtitle: 'Remplissez une fois — compte et cercle sur le même écran.',
  },
  de: {
    signupPrimary: 'Konto und Unterstützungskreis erstellen',
    joinCreate: 'Neuen Kreis erstellen',
    partnerRole: 'Partner',
    trustedContactRole: 'Vertrauensperson',
    householdSectionTitle: 'Ihr Unterstützungskreis',
    householdSectionSubtitle: 'Einmal ausfüllen — Konto und Kreis auf einem Bildschirm.',
  },
  zh: {
    signupPrimary: '创建账号和支持圈',
    joinCreate: '创建新支持圈',
    partnerRole: '伴侣',
    trustedContactRole: '可信联系人',
    householdSectionTitle: '您的支持圈',
    householdSectionSubtitle: '一次填写 — 账号与支持圈在同一页。',
  },
  ja: {
    signupPrimary: 'アカウントとサポートサークルを作成',
    joinCreate: '新しいサークルを作成',
    partnerRole: 'パートナー',
    trustedContactRole: '信頼できる連絡先',
    householdSectionTitle: 'サポートサークル',
    householdSectionSubtitle: '一度に入力 — アカウントとサークルを同じ画面で。',
  },
  pt: {
    signupPrimary: 'Criar conta e círculo de apoio',
    joinCreate: 'Criar novo círculo',
    partnerRole: 'Parceiro',
    trustedContactRole: 'Contato De Confiança',
    householdSectionTitle: 'Seu círculo de apoio',
    householdSectionSubtitle: 'Preencha uma vez — conta e círculo na mesma tela.',
  },
  he: {
    signupPrimary: 'יצירת חשבון ומעגל תמיכה',
    joinCreate: 'יצירת מעגל חדש',
    partnerRole: 'בן/בת זוג',
    trustedContactRole: 'איש קשר מהימן',
    householdSectionTitle: 'מעגל התמיכה שלך',
    householdSectionSubtitle: 'ממלאים פעם אחת — חשבון ומעגל במסך אחד.',
  },
  ar: {
    signupPrimary: 'إنشاء حساب ودائرة دعm',
    joinCreate: 'إنشاء دائرة جديدة',
    partnerRole: 'الشريك',
    trustedContactRole: 'جهة اتصال موثوقة',
    householdSectionTitle: 'دائرة دعمك',
    householdSectionSubtitle: 'املأ مرة واحدة — الحساب والدائرة في شاشة واحدة.',
  },
};
