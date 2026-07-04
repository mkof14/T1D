import type { Language } from '../types';

export type WorkspaceVisualCopy = {
  readiness: string;
  quickRead: string;
  checklist: string;
  nowFocus: string;
  watchFocus: string;
  fallbackFocus: string;
  timeInRange: string;
  dayChart: string;
  alertsFlow: string;
  primaryContact: string;
  backupContact: string;
  delay: string;
  pushChannel: string;
  deliveryStatus: string;
  dayPath: string;
  nightPath: string;
  mealMarker: string;
  carbsToday: string;
  lastMeal: string;
  postMealWindow: string;
  lowThreshold: string;
  highThreshold: string;
  nightMode: string;
  dayMode: string;
  watchState: string;
  collapse: string;
  avgGlucose: string;
  alertsShort: string;
};

const en: WorkspaceVisualCopy = {
  readiness: 'Circle readiness',
  quickRead: 'Quick read',
  checklist: 'Today checklist',
  nowFocus: 'Focus now',
  watchFocus: 'Keep watching',
  fallbackFocus: 'If data weakens',
  timeInRange: 'Time in range',
  dayChart: 'Glucose through the day',
  alertsFlow: 'How alerts move',
  primaryContact: 'First contact',
  backupContact: 'Backup joins',
  delay: 'Delay',
  pushChannel: 'Push alert',
  deliveryStatus: 'Delivery',
  dayPath: 'Day path',
  nightPath: 'Night path',
  mealMarker: 'Meal',
  carbsToday: 'Carbs today',
  lastMeal: 'Last meal',
  postMealWindow: 'Post-meal watch',
  lowThreshold: 'Low watch line',
  highThreshold: 'High watch line',
  nightMode: 'Night mode',
  dayMode: 'Day mode',
  watchState: 'Needs watch',
  collapse: 'Collapse',
  avgGlucose: 'Average',
  alertsShort: 'Alerts',
};

const ru: WorkspaceVisualCopy = {
  readiness: 'Готовность круга',
  quickRead: 'Быстрый смысл',
  checklist: 'Чеклист на сегодня',
  nowFocus: 'Фокус сейчас',
  watchFocus: 'Держать в поле зрения',
  fallbackFocus: 'Если данные ослабнут',
  timeInRange: 'Время в диапазоне',
  dayChart: 'Глюкоза за день',
  alertsFlow: 'Как идут сигналы',
  primaryContact: 'Первый контакт',
  backupContact: 'Подключается резерв',
  delay: 'Задержка',
  pushChannel: 'Push-оповещение',
  deliveryStatus: 'Доставка',
  dayPath: 'Дневной путь',
  nightPath: 'Ночной путь',
  mealMarker: 'Еда',
  carbsToday: 'Углеводы сегодня',
  lastMeal: 'Последний приём',
  postMealWindow: 'Контроль после еды',
  lowThreshold: 'Линия низких',
  highThreshold: 'Линия высоких',
  nightMode: 'Ночной режим',
  dayMode: 'Дневной режим',
  watchState: 'Нужно наблюдение',
  collapse: 'Свернуть',
  avgGlucose: 'Среднее',
  alertsShort: 'Сигналы',
};

export const WORKSPACE_VISUAL_COPY: Record<Language, WorkspaceVisualCopy> = {
  en,
  ru,
  uk: { ...ru, readiness: 'Готовність кола', quickRead: 'Швидкий зміст', checklist: 'Чеклист на сьогодні', nowFocus: 'Фокус зараз', watchFocus: 'Тримати на оку', fallbackFocus: 'Якщо дані ослабнуть', timeInRange: 'Час у діапазоні', dayChart: 'Глюкоза за день', alertsFlow: 'Як ідуть сигнали', primaryContact: 'Перший контакт', backupContact: 'Підключається резерв', delay: 'Затримка', pushChannel: 'Push-сповіщення', deliveryStatus: 'Доставка', dayPath: 'Денний шлях', nightPath: 'Нічний шлях', mealMarker: 'Їжа', carbsToday: 'Вуглеводи сьогодні', lastMeal: 'Останній прийом', postMealWindow: 'Контроль після їжі', lowThreshold: 'Лінія низьких', highThreshold: 'Лінія високих', nightMode: 'Нічний режим', dayMode: 'Денний режим', watchState: 'Потрібне спостереження', collapse: 'Згорнути', avgGlucose: 'Середнє', alertsShort: 'Сигнали' },
  es: { ...en, readiness: 'Preparación del círculo', quickRead: 'Lectura rápida', checklist: 'Lista de hoy', nowFocus: 'Enfoque ahora', watchFocus: 'Seguir mirando', fallbackFocus: 'Si los datos se debilitan', timeInRange: 'Tiempo en rango', dayChart: 'Glucosa del día', alertsFlow: 'Cómo fluyen las alertas', primaryContact: 'Primer contacto', backupContact: 'Entra respaldo', delay: 'Demora', pushChannel: 'Alerta push', deliveryStatus: 'Entrega', dayPath: 'Ruta de día', nightPath: 'Ruta de noche', mealMarker: 'Comida', carbsToday: 'Carbos hoy', lastMeal: 'Última comida', postMealWindow: 'Control post-comida', lowThreshold: 'Línea baja', highThreshold: 'Línea alta', nightMode: 'Modo noche', dayMode: 'Modo día', watchState: 'Vigilar', collapse: 'Contraer', avgGlucose: 'Promedio', alertsShort: 'Alertas' },
  fr: { ...en, readiness: 'Préparation du cercle', quickRead: 'Lecture rapide', checklist: 'Liste du jour', nowFocus: 'Focus maintenant', watchFocus: 'À garder en vue', fallbackFocus: 'Si les données faiblissent', timeInRange: 'Temps dans la cible', dayChart: 'Glycémie de la journée', alertsFlow: 'Comment passent les alertes', primaryContact: 'Premier contact', backupContact: 'Le relais entre', delay: 'Délai', pushChannel: 'Alerte push', deliveryStatus: 'Livraison', dayPath: 'Parcours jour', nightPath: 'Parcours nuit', mealMarker: 'Repas', carbsToday: 'Glucides du jour', lastMeal: 'Dernier repas', postMealWindow: 'Suivi post-repas', lowThreshold: 'Seuil bas', highThreshold: 'Seuil haut', nightMode: 'Mode nuit', dayMode: 'Mode jour', watchState: 'À surveiller', collapse: 'Réduire', avgGlucose: 'Moyenne', alertsShort: 'Alertes' },
  de: { ...en, readiness: 'Kreis-Bereitschaft', quickRead: 'Kurzüberblick', checklist: 'Heutige Checkliste', nowFocus: 'Fokus jetzt', watchFocus: 'Im Blick behalten', fallbackFocus: 'Wenn Daten schwächer werden', timeInRange: 'Zeit im Bereich', dayChart: 'Glukose über den Tag', alertsFlow: 'So laufen Alarme', primaryContact: 'Erster Kontakt', backupContact: 'Reserve kommt', delay: 'Verzögerung', pushChannel: 'Push-Alarm', deliveryStatus: 'Zustellung', dayPath: 'Tagespfad', nightPath: 'Nachtpfad', mealMarker: 'Mahlzeit', carbsToday: 'Kohlenhydrate heute', lastMeal: 'Letzte Mahlzeit', postMealWindow: 'Kontrolle nach dem Essen', lowThreshold: 'Untere Linie', highThreshold: 'Obere Linie', nightMode: 'Nachtmodus', dayMode: 'Tagmodus', watchState: 'Beobachten', collapse: 'Einklappen', avgGlucose: 'Durchschnitt', alertsShort: 'Alarme' },
  zh: { ...en, readiness: '家庭准备', quickRead: '快速查看', checklist: '今日清单', nowFocus: '当前重点', watchFocus: '继续留意', fallbackFocus: '数据变弱时', timeInRange: '范围内时间', dayChart: '全天葡萄糖', alertsFlow: '提醒如何流转', primaryContact: '第一联系人', backupContact: '后备加入', delay: '延迟', pushChannel: '推送提醒', deliveryStatus: '送达', dayPath: '白天路径', nightPath: '夜间路径', mealMarker: '餐食', carbsToday: '今日碳水', lastMeal: '最近一餐', postMealWindow: '餐后观察', lowThreshold: '偏低线', highThreshold: '偏高线', nightMode: '夜间模式', dayMode: '白天模式', watchState: '需要观察', collapse: '收起', avgGlucose: '平均', alertsShort: '提醒' },
  ja: { ...en, readiness: 'サークルの準備', quickRead: 'クイック表示', checklist: '今日のチェック', nowFocus: 'いまの焦点', watchFocus: '見続ける', fallbackFocus: 'データが弱くなったら', timeInRange: '範囲内の時間', dayChart: '1日のグルコース', alertsFlow: '通知の流れ', primaryContact: '最初の連絡先', backupContact: '補助が入る', delay: '遅延', pushChannel: 'プッシュ通知', deliveryStatus: '配信', dayPath: '昼の経路', nightPath: '夜の経路', mealMarker: '食事', carbsToday: '今日の炭水化物', lastMeal: '直近の食事', postMealWindow: '食後フォロー', lowThreshold: '低値ライン', highThreshold: '高値ライン', nightMode: '夜モード', dayMode: '昼モード', watchState: '要見守り', collapse: '閉じる', avgGlucose: '平均', alertsShort: 'アラート' },
  pt: { ...en, readiness: 'Prontidão do círculo', quickRead: 'Leitura rápida', checklist: 'Checklist de hoje', nowFocus: 'Foco agora', watchFocus: 'Fique de olho', fallbackFocus: 'Se os dados ficarem fracos', timeInRange: 'Tempo na meta', dayChart: 'Glicose do dia', alertsFlow: 'Como os alertas fluem', primaryContact: 'Primeiro contato', backupContact: 'Apoio entra', delay: 'Atraso', pushChannel: 'Alerta push', deliveryStatus: 'Entrega', dayPath: 'Caminho do dia', nightPath: 'Caminho da noite', mealMarker: 'Refeição', carbsToday: 'Carbos hoje', lastMeal: 'Última refeição', postMealWindow: 'Acompanhamento pós-refeição', lowThreshold: 'Linha baixa', highThreshold: 'Linha alta', nightMode: 'Modo noite', dayMode: 'Modo dia', watchState: 'Precisa atenção', collapse: 'Recolher', avgGlucose: 'Média', alertsShort: 'Alertas' },
  he: { ...en, readiness: 'מוכנות המעגל', quickRead: 'מבט מהיר', checklist: 'רשימה להיום', nowFocus: 'מיקוד עכשיו', watchFocus: 'להמשיך לעקוב', fallbackFocus: 'אם הנתונים נחלשים', timeInRange: 'זמן בטווח', dayChart: 'גלוקוז לאורך היום', alertsFlow: 'איך ההתראות זורמות', primaryContact: 'איש קשר ראשון', backupContact: 'גיבוי נכנס', delay: 'השהייה', pushChannel: 'התראת פוש', deliveryStatus: 'מסירה', dayPath: 'מסלול יום', nightPath: 'מסלול לילה', mealMarker: 'ארוחה', carbsToday: 'פחמימות היום', lastMeal: 'ארוחה אחרונה', postMealWindow: 'מעקב אחרי ארוחה', lowThreshold: 'קו נמוך', highThreshold: 'קו גבוה', nightMode: 'מצב לילה', dayMode: 'מצב יום', watchState: 'דורש מעקב', collapse: 'כווץ', avgGlucose: 'ממוצע', alertsShort: 'התראות' },
  ar: { ...en, readiness: 'جاهزية الدائرة', quickRead: 'قراءة سريعة', checklist: 'قائمة اليوم', nowFocus: 'التركيز الآن', watchFocus: 'استمر بالمتابعة', fallbackFocus: 'إذا ضعفت البيانات', timeInRange: 'الوقت ضمن النطاق', dayChart: 'الجلوكوز خلال اليوم', alertsFlow: 'كيف تتحرك التنبيهات', primaryContact: 'أول جهة اتصال', backupContact: 'يدخل الدعم الاحتياطي', delay: 'تأخير', pushChannel: 'تنبيه دفع', deliveryStatus: 'التسليم', dayPath: 'مسار النهار', nightPath: 'مسار الليل', mealMarker: 'وجبة', carbsToday: 'النشويات اليوم', lastMeal: 'آخر وجبة', postMealWindow: 'متابعة بعد الوجبة', lowThreshold: 'خط منخفض', highThreshold: 'خط مرتفع', nightMode: 'وضع الليل', dayMode: 'وضع النهار', watchState: 'يحتاج مراقبة', collapse: 'طي', avgGlucose: 'المتوسط', alertsShort: 'تنبيهات' },
};
