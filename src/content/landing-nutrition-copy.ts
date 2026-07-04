import type { Language } from '../types';

export interface LandingNutritionCopy {
  eyebrow: string;
  title: string;
  body: string;
  scanLabel: string;
  scanHint: string;
  sampleMeal: string;
  sampleTime: string;
  impactLabel: string;
  impactValue: string;
  features: [string, string, string];
}

export const LANDING_NUTRITION_COPY: Record<Language, LandingNutritionCopy> = {
  en: {
    eyebrow: 'Meals in Steady',
    title: 'Point your camera at the plate — see carbs, calories, and more.',
    body: 'Scan a meal or upload a photo. Steady estimates nutrition and shows how it may connect to your glucose readings.',
    scanLabel: 'Camera scan',
    scanHint: 'Center the plate. Good light helps.',
    sampleMeal: 'Grain bowl with greens',
    sampleTime: 'Example · lunch',
    impactLabel: 'Glucose impact',
    impactValue: 'Moderate',
    features: ['Carbs, calories, protein, fiber', 'Linked to your daily timeline', 'Works for type 1 and type 2 paths'],
  },
  ru: {
    eyebrow: 'Еда в Steady',
    title: 'Наведите камеру на тарелку — увидите углеводы, калории и другое.',
    body: 'Сканируйте приём пищи или загрузите фото. Steady оценит питание и покажет, как оно может связаться с вашими показателями глюкозы.',
    scanLabel: 'Скан камерой',
    scanHint: 'Держите тарелку в центре. Хороший свет помогает.',
    sampleMeal: 'Боул с крупой и зеленью',
    sampleTime: 'Пример · обед',
    impactLabel: 'Влияние на сахар',
    impactValue: 'Умеренное',
    features: ['Углеводы, калории, белок, клетчатка', 'Связь с дневной лентой', 'Для путей типа 1 и типа 2'],
  },
  uk: {
    eyebrow: 'Їжа в Steady',
    title: 'Наведіть камеру на тарілку — побачите вуглеводи, калорії та інше.',
    body: 'Скануйте прийом їжі або завантажте фото. Steady оцінить харчування і покаже звʼязок із глюкозою.',
    scanLabel: 'Скан камерою',
    scanHint: 'Тримайте тарілку в центрі.',
    sampleMeal: 'Боул із крупою',
    sampleTime: 'Приклад · обід',
    impactLabel: 'Вплив на цукор',
    impactValue: 'Помірний',
    features: ['Вуглеводи, калорії, білок, клітковина', 'Звʼязок із стрічкою дня', 'Для шляхів типу 1 і 2'],
  },
  es: {
    eyebrow: 'Comidas en Steady',
    title: 'Apunta la cámara al plato — mira carbohidratos, calorías y más.',
    body: 'Escanea una comida o sube una foto. Steady estima la nutrición y la conecta con tus lecturas.',
    scanLabel: 'Escaneo con cámara',
    scanHint: 'Centra el plato. Buena luz ayuda.',
    sampleMeal: 'Bowl de granos y verduras',
    sampleTime: 'Ejemplo · almuerzo',
    impactLabel: 'Impacto en glucosa',
    impactValue: 'Moderado',
    features: ['Carbohidratos, calorías, proteína, fibra', 'En la línea de tiempo diaria', 'Para caminos tipo 1 y 2'],
  },
  fr: {
    eyebrow: 'Repas dans Steady',
    title: 'Pointez la caméra vers l’assiette — carbs, calories et plus.',
    body: 'Scannez un repas ou importez une photo. Steady estime la nutrition et le lien avec la glycémie.',
    scanLabel: 'Scan caméra',
    scanHint: 'Centrez l’assiette. Bonne lumière.',
    sampleMeal: 'Bol de grains et légumes',
    sampleTime: 'Exemple · déjeuner',
    impactLabel: 'Impact glycémique',
    impactValue: 'Modéré',
    features: ['Glucides, calories, protéines, fibres', 'Lié à la timeline du jour', 'Pour parcours type 1 et 2'],
  },
  de: {
    eyebrow: 'Mahlzeiten in Steady',
    title: 'Kamera auf den Teller — Kohlenhydrate, Kalorien und mehr.',
    body: 'Mahlzeit scannen oder Foto hochladen. Steady schätzt Nährwerte und verbindet sie mit Glukose.',
    scanLabel: 'Kamera-Scan',
    scanHint: 'Teller zentrieren. Gutes Licht hilft.',
    sampleMeal: 'Grain Bowl mit Gemüse',
    sampleTime: 'Beispiel · Mittag',
    impactLabel: 'Glukose-Einfluss',
    impactValue: 'Moderat',
    features: ['KH, Kalorien, Protein, Ballaststoffe', 'Im Tagesverlauf verknüpft', 'Für Typ 1 und Typ 2'],
  },
  zh: {
    eyebrow: 'Steady 饮食',
    title: '相机对准餐盘 — 查看碳水、卡路里等。',
    body: '扫描或上传照片。Steady 估算营养并与血糖读数关联。',
    scanLabel: '相机扫描',
    scanHint: '餐盘居中，光线充足。',
    sampleMeal: '谷物蔬菜碗',
    sampleTime: '示例 · 午餐',
    impactLabel: '血糖影响',
    impactValue: '中等',
    features: ['碳水、卡路里、蛋白质、纤维', '关联每日时间线', '适用于 1 型与 2 型路径'],
  },
  ja: {
    eyebrow: 'Steady の食事',
    title: 'カメラを皿に向ける — 炭水化物、カロリーなどが見えます。',
    body: '食事をスキャンまたは写真をアップロード。栄養を推定し、血糖とつなげます。',
    scanLabel: 'カメラスキャン',
    scanHint: '皿を中央に。明るい場所がおすすめ。',
    sampleMeal: 'グレインボウル',
    sampleTime: '例 · 昼食',
    impactLabel: '血糖への影響',
    impactValue: '中程度',
    features: ['炭水化物、カロリー、タンパク質、食物繊維', 'デイリータイムラインと連携', '1 型・2 型パス対応'],
  },
  pt: {
    eyebrow: 'Refeições no Steady',
    title: 'Aponte a câmera ao prato — veja carboidratos, calorias e mais.',
    body: 'Escaneie uma refeição ou envie uma foto. Steady estima a nutrição e conecta à glicose.',
    scanLabel: 'Scan com câmera',
    scanHint: 'Centralize o prato. Boa luz ajuda.',
    sampleMeal: 'Bowl de grãos e verduras',
    sampleTime: 'Exemplo · almoço',
    impactLabel: 'Impacto na glicose',
    impactValue: 'Moderado',
    features: ['Carboidratos, calorias, proteína, fibra', 'Na linha do tempo diária', 'Para caminhos tipo 1 e 2'],
  },
  he: {
    eyebrow: 'ארוחות ב-Steady',
    title: 'כוונו את המצלמה לצלחת — רואים פחמימות, קלוריות ועוד.',
    body: 'סרקו ארוחה או העלו תמונה. Steady מעריך תזונה ומחבר לקריאות הסוכר.',
    scanLabel: 'סריקת מצלמה',
    scanHint: 'מרכזו את הצלחת. אור טוב עוזר.',
    sampleMeal: 'קערת דגנים וירקות',
    sampleTime: 'דוגמה · צהריים',
    impactLabel: 'השפעה על הסוכר',
    impactValue: 'בינונית',
    features: ['פחמימות, קלוריות, חלבון, סיבים', 'מקושר לציר היום', 'למסלולי סוג 1 ו-2'],
  },
  ar: {
    eyebrow: 'الوجبات في Steady',
    title: 'وجّه الكاميرا نحو الطبق — شاهد الكربohydrates والسعرات والمزيد.',
    body: 'امسح الوجبة أو ارفع صورة. Steady يقدّر التغذية ويربطها بقراءات السكر.',
    scanLabel: 'مسح بالكاميرا',
    scanHint: 'ضع الطبق في المنتصف. الإضاءة الجيدة تساعد.',
    sampleMeal: 'وعاء حبوب وخضار',
    sampleTime: 'مثال · غداء',
    impactLabel: 'تأثير على السكر',
    impactValue: 'متوسط',
    features: ['الكربohydrates والسعرات والبروtein والألياف', 'مرتبط بخط زمني يومي', 'للمسارات 1 و2'],
  },
};

export const LANDING_NUTRITION_DEMO = {
  calories: 420,
  carbs: 38,
  protein: 22,
  fiber: 9,
};
