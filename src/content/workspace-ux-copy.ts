import type { Language } from '../types';
import type { ActionId, SupportActionId } from '../lib/api';
import type { WorkspaceSectionId } from './workspace-nav-copy';

type SectionHeader = { title: string; subtitle: string };

export const WORKSPACE_SECTION_HEADERS: Record<Language, Record<WorkspaceSectionId, SectionHeader>> = {
  en: {
    now: { title: 'Right now', subtitle: 'What matters in this moment — and what to do next.' },
    nutrition: { title: 'Meal scan', subtitle: 'Point your camera at the plate — see carbs, calories, and how it fits your day.' },
    timeline: { title: 'What happened', subtitle: 'A simple step-by-step log of recent safety events.' },
    system: { title: 'Sensor connection', subtitle: 'Choose your device and see whether readings are flowing.' },
    alerts: { title: 'Alerts & backup', subtitle: 'Who gets notified, when backup joins, and what was sent.' },
    settings: { title: 'Your preferences', subtitle: 'How tight support should feel during the day and at night.' },
    family: { title: 'Your family circle', subtitle: 'Who is in the household and how to invite someone new.' },
    history: { title: 'Past days', subtitle: 'Short summaries of completed days — tap one to see more.' },
  },
  ru: {
    now: { title: 'Сейчас', subtitle: 'Главное в этот момент — и что делать дальше.' },
    nutrition: { title: 'Скан еды', subtitle: 'Наведите камеру на тарелку — увидите углеводы, калории и связь с глюкозой.' },
    timeline: { title: 'Что произошло', subtitle: 'Простой пошаговый журнал последних событий.' },
    system: { title: 'Подключение датчика', subtitle: 'Выберите устройство и проверьте, идут ли показания.' },
    alerts: { title: 'Сигналы и резерв', subtitle: 'Кому приходит оповещение, когда подключается резерв и что уже отправлено.' },
    settings: { title: 'Ваши настройки', subtitle: 'Насколько плотной должна быть поддержка днём и ночью.' },
    family: { title: 'Ваша семья', subtitle: 'Кто уже в круге и как пригласить нового человека.' },
    history: { title: 'Прошлые дни', subtitle: 'Короткие итоги завершённых дней — нажмите, чтобы открыть подробности.' },
  },
  uk: {
    now: { title: 'Зараз', subtitle: 'Головне в цей момент — і що робити далі.' },
    nutrition: { title: 'Скан їжі', subtitle: 'Наведіть камеру на тарілку — побачите вуглеводи, калорії та зв’язок із глюкозою.' },
    timeline: { title: 'Що сталося', subtitle: 'Простий покроковий журнал останніх подій.' },
    system: { title: 'Підключення датчика', subtitle: 'Оберіть пристрій і перевірте, чи йдуть показники.' },
    alerts: { title: 'Сигнали та резерв', subtitle: 'Кому надходить сповіщення, коли підключається резерв і що вже надіслано.' },
    settings: { title: 'Ваші налаштування', subtitle: 'Наскільки щільною має бути підтримка вдень і вночі.' },
    family: { title: 'Ваша сім’я', subtitle: 'Хто вже в колі та як запросити нову людину.' },
    history: { title: 'Минулі дні', subtitle: 'Короткі підсумки завершених днів — натисніть, щоб відкрити деталі.' },
  },
  es: {
    now: { title: 'Ahora mismo', subtitle: 'Lo importante en este momento y qué hacer después.' },
    nutrition: { title: 'Escanear comida', subtitle: 'Apunta la cámara al plato — carbohidratos, calorías e impacto en la glucosa.' },
    timeline: { title: 'Qué pasó', subtitle: 'Un registro sencillo paso a paso.' },
    system: { title: 'Conexión del sensor', subtitle: 'Elige el dispositivo y comprueba si llegan lecturas.' },
    alerts: { title: 'Alertas y respaldo', subtitle: 'Quién recibe avisos, cuándo entra el respaldo y qué se envió.' },
    settings: { title: 'Tus preferencias', subtitle: 'Qué tan cercano debe sentirse el apoyo de día y de noche.' },
    family: { title: 'Tu círculo familiar', subtitle: 'Quién ya está dentro y cómo invitar a alguien nuevo.' },
    history: { title: 'Días anteriores', subtitle: 'Resúmenes cortos — toca uno para ver más.' },
  },
  fr: {
    now: { title: 'Maintenant', subtitle: 'L’essentiel en ce moment — et la suite.' },
    nutrition: { title: 'Scan repas', subtitle: 'Pointez la caméra vers l’assiette — glucides, calories et lien avec la glycémie.' },
    timeline: { title: 'Ce qui s’est passé', subtitle: 'Un journal simple, étape par étape.' },
    system: { title: 'Connexion capteur', subtitle: 'Choisissez l’appareil et vérifiez si les données arrivent.' },
    alerts: { title: 'Alertes et relais', subtitle: 'Qui est prévenu, quand le relais entre et ce qui a été envoyé.' },
    settings: { title: 'Vos préférences', subtitle: 'À quel point le soutien doit être serré jour et nuit.' },
    family: { title: 'Votre cercle familial', subtitle: 'Qui fait déjà partie du foyer et comment inviter quelqu’un.' },
    history: { title: 'Jours passés', subtitle: 'Courts résumés — touchez pour voir plus.' },
  },
  de: {
    now: { title: 'Gerade jetzt', subtitle: 'Was jetzt wichtig ist — und der nächste Schritt.' },
    nutrition: { title: 'Mahlzeit scannen', subtitle: 'Kamera auf den Teller — Kohlenhydrate, Kalorien und Glukose-Einfluss.' },
    timeline: { title: 'Was passiert ist', subtitle: 'Ein einfaches Schritt-für-Schritt-Protokoll.' },
    system: { title: 'Sensorverbindung', subtitle: 'Gerät wählen und prüfen, ob Werte ankommen.' },
    alerts: { title: 'Alarme & Reserve', subtitle: 'Wer benachrichtigt wird, wann die Reserve kommt und was gesendet wurde.' },
    settings: { title: 'Ihre Einstellungen', subtitle: 'Wie eng die Unterstützung tags und nachts sein soll.' },
    family: { title: 'Ihr Familienkreis', subtitle: 'Wer dabei ist und wie Sie jemand Neues einladen.' },
    history: { title: 'Vergangene Tage', subtitle: 'Kurze Zusammenfassungen — tippen für mehr.' },
  },
  zh: {
    now: { title: '现在', subtitle: '此刻最重要的事 — 以及下一步。' },
    nutrition: { title: '餐食扫描', subtitle: '对准餐盘 — 查看碳水、热量与血糖影响。' },
    timeline: { title: '发生了什么', subtitle: '简单的逐步记录。' },
    system: { title: '传感器连接', subtitle: '选择设备并查看读数是否正常。' },
    alerts: { title: '提醒与后备', subtitle: '谁收到通知、何时加入后备、已发送什么。' },
    settings: { title: '您的偏好', subtitle: '白天和夜间支持应有多紧密。' },
    family: { title: '您的家庭圈', subtitle: '已有成员及如何邀请新成员。' },
    history: { title: '过往天数', subtitle: '简短总结 — 点击查看更多。' },
  },
  ja: {
    now: { title: 'いま', subtitle: 'この瞬間に大切なこと — 次にすること。' },
    nutrition: { title: '食事スキャン', subtitle: 'カメラを食事に向ける — 炭水化物・カロリー・血糖への影響。' },
    timeline: { title: '起きたこと', subtitle: '最近の出来事を順番に。' },
    system: { title: 'センサー接続', subtitle: 'デバイスを選び、データが届いているか確認。' },
    alerts: { title: '通知とバックアップ', subtitle: '誰に届くか、いつ補助が入るか、何が送られたか。' },
    settings: { title: '設定', subtitle: '昼と夜のサポートの強さ。' },
    family: { title: '家族の輪', subtitle: '参加メンバーと新しい人の招待方法。' },
    history: { title: '過去の日', subtitle: '短いまとめ — タップで詳細。' },
  },
  pt: {
    now: { title: 'Agora', subtitle: 'O que importa neste momento — e o próximo passo.' },
    nutrition: { title: 'Scan de refeição', subtitle: 'Aponte a câmera ao prato — carboidratos, calorias e impacto na glicose.' },
    timeline: { title: 'O que aconteceu', subtitle: 'Um registro simples passo a passo.' },
    system: { title: 'Conexão do sensor', subtitle: 'Escolha o dispositivo e veja se as leituras chegam.' },
    alerts: { title: 'Alertas e apoio', subtitle: 'Quem recebe, quando o apoio entra e o que foi enviado.' },
    settings: { title: 'Suas preferências', subtitle: 'Quão próximo o apoio deve ser de dia e de noite.' },
    family: { title: 'Seu círculo familiar', subtitle: 'Quem já está dentro e como convidar alguém novo.' },
    history: { title: 'Dias anteriores', subtitle: 'Resumos curtos — toque para ver mais.' },
  },
  he: {
    now: { title: 'עכשיו', subtitle: 'מה חשוב ברגע הזה — ומה הצעד הבא.' },
    nutrition: { title: 'סריקת ארוחה', subtitle: 'כוונו את המצלמה לצלחת — פחמימות, קלוריות והשפעה על הסוכר.' },
    timeline: { title: 'מה קרה', subtitle: 'יומן פשוט צעד אחר צעד.' },
    system: { title: 'חיבור חיישן', subtitle: 'בחרו מכשיר ובדקו אם הנתונים מגיעים.' },
    alerts: { title: 'התראות וגיבוי', subtitle: 'מי מקבל, מתי הגיבוי נכנס ומה נשלח.' },
    settings: { title: 'ההעדפות שלכם', subtitle: 'כמה צמודה התמיכה ביום ובלילה.' },
    family: { title: 'מעגל המשפחה', subtitle: 'מי כבר בפנים ואיך להזמין מישהו חדש.' },
    history: { title: 'ימים קודמים', subtitle: 'סיכומים קצרים — הקישו לפרטים.' },
  },
  ar: {
    now: { title: 'الآن', subtitle: 'ما يهم في هذه اللحظة — والخطوة التالية.' },
    nutrition: { title: 'مسح الوجبة', subtitle: 'وجّه الكاميرا إلى الطبق — تحليل كامل للوجبة وتأثيرها على السكر.' },
    timeline: { title: 'ما حدث', subtitle: 'سجل بسيط خطوة بخطوة.' },
    system: { title: 'اتصال المستشعر', subtitle: 'اختر الجهاز وتحقق من وصول القراءات.' },
    alerts: { title: 'التنبيهات والدعم', subtitle: 'من يُبلَّغ ومتى يدخل الدعم وما أُرسل.' },
    settings: { title: 'تفضيلاتك', subtitle: 'مدى قرب الدعم نهارًا وليلًا.' },
    family: { title: 'دائرة العائلة', subtitle: 'من موجود وكيف تدعو شخصًا جديدًا.' },
    history: { title: 'الأيام السابقة', subtitle: 'ملخصات قصيرة — اضغط للمزيد.' },
  },
};

type ActionFeedback = { title: string; body: string; next: string };

type ActionFeedbackKey = SupportActionId | 'DONE' | 'all_ok';

const actionFeedbackEn: Record<ActionFeedbackKey, ActionFeedback> = {
  parent_handling: { title: 'You confirmed you are handling this', body: 'Steady keeps watching while you respond. Backup stays ready if needed.', next: 'See the updated timeline below.' },
  parent_escalate: { title: 'Backup support was called in', body: 'The backup adult will be notified next.', next: 'Check the timeline for the new step.' },
  parent_mark_with_adult: { title: 'Recovery watch started', body: 'The child is with an adult. Steady stays in recovery mode.', next: 'Timeline updated — keep watching until stable.' },
  caregiver_take_over: { title: 'You took over', body: 'The family knows backup is active now.', next: 'See what changed in the timeline.' },
  caregiver_called_parent: { title: 'Parent was contacted', body: 'The primary parent is being looped in.', next: 'Timeline updated.' },
  caregiver_on_way: { title: 'On the way — noted', body: 'The household sees that help is coming.', next: 'Check the timeline.' },
  adult_self_monitor: { title: 'Self-monitoring confirmed', body: 'Steady keeps a closer watch while you track yourself.', next: 'Timeline updated.' },
  adult_treated_low: { title: 'Low treated — recovery watch', body: 'Steady stays with you until things look stable.', next: 'See the new timeline step.' },
  adult_need_help: { title: 'Backup help requested', body: 'Another adult in the circle will be alerted.', next: 'Check the timeline.' },
  adult_noting_high: { title: 'High glucose noted', body: 'Steady keeps watching post-meal trends with your logged meals.', next: 'See the timeline for the new step.' },
  parent_noting_high: { title: 'High reading noted', body: 'The household sees that a high glucose reading is being watched.', next: 'Check the timeline.' },
  DONE: { title: 'Response recorded', body: 'Steady moved to recovery watch. The situation stays covered.', next: 'Open the timeline to see what changed.' },
  all_ok: { title: 'All clear — noted', body: 'Monitoring continues calmly. No further action needed right now.', next: 'You can scan a meal or check the timeline anytime.' },
};

const actionFeedbackRu: Record<ActionFeedbackKey, ActionFeedback> = {
  parent_handling: { title: 'Вы подтвердили, что берёте ситуацию', body: 'Steady продолжает наблюдать, пока вы отвечаете. Резерв готов, если понадобится.', next: 'Ниже — обновлённая хронология.' },
  parent_escalate: { title: 'Подключён резервный взрослый', body: 'Следующим получит оповещение резервный контакт.', next: 'Смотрите новый шаг в хронологии.' },
  parent_mark_with_adult: { title: 'Начато наблюдение за восстановлением', body: 'Ребёнок с взрослым. Steady остаётся в режиме восстановления.', next: 'Хронология обновлена — следите до стабилизации.' },
  caregiver_take_over: { title: 'Вы взяли управление', body: 'Семья видит, что резерв активен.', next: 'Смотрите изменения в хронологии.' },
  caregiver_called_parent: { title: 'Родитель уведомлён', body: 'Основной родитель подключается к ситуации.', next: 'Хронология обновлена.' },
  caregiver_on_way: { title: 'Вы в пути — записано', body: 'Семья видит, что помощь уже едет.', next: 'Проверьте хронологию.' },
  adult_self_monitor: { title: 'Самоконтроль подтверждён', body: 'Steady внимательнее следит, пока вы контролируете себя.', next: 'Хронология обновлена.' },
  adult_treated_low: { title: 'Низ обработан — наблюдение', body: 'Steady остаётся с вами, пока показатели не стабилизируются.', next: 'Новый шаг в хронологии.' },
  adult_need_help: { title: 'Запрошена помощь', body: 'Другой взрослый в круге получит сигнал.', next: 'Смотрите хронологию.' },
  adult_noting_high: { title: 'Высокий сахар зафиксирован', body: 'Steady следит за динамикой после еды вместе с вашими приёмами пищи.', next: 'Смотрите новый шаг в хронологии.' },
  parent_noting_high: { title: 'Высокое значение отмечено', body: 'Семья видит, что высокая глюкоза под наблюдением.', next: 'Проверьте хронологию.' },
  DONE: { title: 'Ответ зафиксирован', body: 'Steady перешёл в режим восстановления. Семья остаётся под прикрытием.', next: 'Откройте хронологию, чтобы увидеть изменения.' },
  all_ok: { title: 'Всё в порядке — записано', body: 'Наблюдение продолжается спокойно. Сейчас ничего делать не нужно.', next: 'Можно отсканировать еду или посмотреть хронологию.' },
};

export const WORKSPACE_ACTION_FEEDBACK: Record<Language, Record<ActionFeedbackKey, ActionFeedback>> = {
  en: actionFeedbackEn,
  ru: actionFeedbackRu,
  uk: { ...actionFeedbackRu, parent_handling: { ...actionFeedbackRu.parent_handling, title: 'Ви підтвердили, що берете ситуацію' } },
  es: { ...actionFeedbackEn, DONE: { title: 'Respuesta registrada', body: 'Steady pasó a seguimiento de recuperación.', next: 'Abre la línea de tiempo.' } },
  fr: { ...actionFeedbackEn, DONE: { title: 'Réponse enregistrée', body: 'Steady est passé en suivi de récupération.', next: 'Ouvrez la chronologie.' } },
  de: { ...actionFeedbackEn, DONE: { title: 'Antwort gespeichert', body: 'Steady ist in Erholungsüberwachung.', next: 'Timeline öffnen.' } },
  zh: { ...actionFeedbackEn, DONE: { title: '已记录响应', body: 'Steady 进入恢复监测。', next: '查看时间线。' } },
  ja: { ...actionFeedbackEn, DONE: { title: '対応を記録しました', body: 'Steady は回復モードに入りました。', next: 'タイムラインを確認。' } },
  pt: { ...actionFeedbackEn, DONE: { title: 'Resposta registrada', body: 'Steady entrou em monitoramento de recuperação.', next: 'Veja a linha do tempo.' } },
  he: { ...actionFeedbackEn, DONE: { title: 'התגובה נרשמה', body: 'Steady עבר למעקב התאוששות.', next: 'פתחו את ציר הזמן.' } },
  ar: { ...actionFeedbackEn, DONE: { title: 'تم تسجيل الاستجابة', body: 'انتقل Steady إلى متابعة التعافي.', next: 'افتح الخط الزمني.' } },
};

export const WORKSPACE_INVITE_COPY: Record<Language, { title: string; body: string; copyLabel: string; copied: string }> = {
  en: { title: 'Invite someone to your circle', body: 'Share this code with a parent, caregiver, or trusted adult. They enter it during sign-up to join your family — no separate setup needed.', copyLabel: 'Copy code', copied: 'Copied!' },
  ru: { title: 'Пригласить человека в семью', body: 'Отправьте этот код родителю, опекуну или другому взрослому. Его вводят при регистрации — отдельная настройка не нужна.', copyLabel: 'Скопировать код', copied: 'Скопировано!' },
  uk: { title: 'Запросити людину в сім’ю', body: 'Надішліть цей код батьку, опікуну або дорослому. Його вводять під час реєстрації.', copyLabel: 'Скопіювати код', copied: 'Скопійовано!' },
  es: { title: 'Invitar a alguien', body: 'Comparte este código con un adulto de confianza. Lo ingresa al registrarse.', copyLabel: 'Copiar código', copied: '¡Copiado!' },
  fr: { title: 'Inviter quelqu’un', body: 'Partagez ce code avec un adulte de confiance. Il le saisit à l’inscription.', copyLabel: 'Copier le code', copied: 'Copié !' },
  de: { title: 'Jemanden einladen', body: 'Teilen Sie diesen Code mit einer vertrauenswürdigen Person. Sie gibt ihn bei der Anmeldung ein.', copyLabel: 'Code kopieren', copied: 'Kopiert!' },
  zh: { title: '邀请家人', body: '将此码分享给可信赖的成年人，注册时输入即可加入。', copyLabel: '复制邀请码', copied: '已复制！' },
  ja: { title: '家族を招待', body: '信頼できる大人にこのコードを共有。登録時に入力します。', copyLabel: 'コードをコピー', copied: 'コピーしました' },
  pt: { title: 'Convidar alguém', body: 'Compartilhe este código com um adulto de confiança. Ele digita ao criar conta.', copyLabel: 'Copiar código', copied: 'Copiado!' },
  he: { title: 'להזמין מישהו', body: 'שתפו את הקוד עם מבוגר מהימן. הוא מזין אותו בהרשמה.', copyLabel: 'העתק קוד', copied: 'הועתק!' },
  ar: { title: 'دعوة شخص', body: 'شارك هذا الرمز مع شخص بالغ موثوق. يدخله عند التسجيل.', copyLabel: 'نسخ الرمز', copied: 'تم النسخ!' },
};

export const resolveActionFeedback = (lang: Language, action: ActionId): ActionFeedback => {
  const key = action === 'DONE' || action === 'all_ok' ? action : action;
  return WORKSPACE_ACTION_FEEDBACK[lang][key as ActionFeedbackKey];
};
