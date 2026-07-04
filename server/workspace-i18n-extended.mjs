import { pick, mk } from './workspace-i18n-data.mjs';

export { pick, mk };

export const guidanceWatch = {
  parent: mk(
    'Watch for delayed data, repeated alerts, or a shift from stable monitoring into backup support.',
    'Следите за задержкой данных, повторными сигналами или переходом из спокойного мониторинга в резервную поддержку.',
    'Стежте за затримкою даних, повторними сигналами або переходом із спокійного моніторингу в резервну підтримку.',
    'Observa retrasos de datos, alertas repetidas o un paso del monitoreo estable al apoyo de respaldo.',
    'Surveillez les retards de données, alertes répétées ou le passage d’un monitoring stable au relais.',
    'Achten Sie auf verzögerte Daten, wiederholte Alarme oder den Wechsel vom stabilen Monitoring zur Reserve.',
    '关注数据延迟、重复提醒，或从稳定监控转入后备支持。',
    'データ遅延、繰り返しアラート、安定監視から補助への移行に注意してください。',
    'Observe atrasos de dados, alertas repetidos ou a passagem do monitoramento estável para o reforço.',
    'עקבו אחר עיכוב בנתונים, התראות חוזרות או מעבר ממעקב יציב לגיבוי.',
    'راقب تأخر البيانات والتنبيهات المتكررة أو الانتقال من المراقبة المستقرة إلى الدعم الاحتياطي.'
  ),
  caregiver: mk(
    'Watch who is responding, whether recovery is moving, and whether data confidence is dropping.',
    'Следите, кто отвечает, движется ли восстановление и не падает ли достоверность данных.',
    'Стежте, хто відповідає, чи рухається відновлення і чи не падає достовірність даних.',
    'Observa quién responde, si la recuperación avanza y si baja la confianza en los datos.',
    'Surveillez qui répond, si la reprise progresse et si la confiance dans les données baisse.',
    'Achten Sie darauf, wer reagiert, ob sich die Erholung bewegt und ob das Datenvertrauen sinkt.',
    '关注谁在响应、恢复是否在推进、数据可信度是否在下降。',
    '誰が対応しているか、回復が進んでいるか、データ信頼度が下がっていないかを見てください。',
    'Observe quem responde, se a recuperação avança e se a confiança nos dados cai.',
    'עקבו אחר מי מגיב, האם ההתאוששות מתקדמת והאם הביטחון בנתונים יורד.',
    'راقب من يستجيب وهل يتقدم التعافي وهل تنخفض ثقة البيانات.'
  ),
  adult: mk(
    'Watch for falling confidence, delayed data, and whether recovery is actually stabilizing.',
    'Следите за падением достоверности, задержкой данных и тем, стабилизируется ли восстановление.',
    'Стежте за падінням достовірності, затримкою даних і тим, чи стабілізується відновлення.',
    'Observa la confianza en baja, datos retrasados y si la recuperación se estabiliza de verdad.',
    'Surveillez la baisse de confiance, les données retardées et si la reprise se stabilise vraiment.',
    'Achten Sie auf sinkendes Vertrauen, verzögerte Daten und ob sich die Erholung wirklich stabilisiert.',
    '关注可信度下降、数据延迟，以及恢复是否真正在稳定。',
    '信頼度の低下、データ遅延、回復が本当に安定しているかを見てください。',
    'Observe confiança em queda, dados atrasados e se a recuperação está realmente estabilizando.',
    'עקבו אחר ירידה בביטחון, עיכוב בנתונים והאם ההתאוששות באמת מתייצבת.',
    'راقب انخفاض الثقة وتأخر البيانات وما إذا كان التعافي يستقر فعلاً.'
  ),
};

export const guidanceFallback = {
  broken_auth: mk(
    'Restore Dexcom authorization before relying on live sync again.',
    'Восстановите авторизацию Dexcom, прежде чем снова полагаться на живую синхронизацию.',
    'Відновіть авторизацію Dexcom, перш ніж знову покладатися на живу синхронізацію.',
    'Restaura la autorización de Dexcom antes de confiar otra vez en la sincronización en vivo.',
    'Restaurez l’autorisation Dexcom avant de compter à nouveau sur la sync live.',
    'Stellen Sie die Dexcom-Autorisierung wieder her, bevor Sie wieder auf Live-Sync setzen.',
    '在再次依赖实时同步之前，请先恢复 Dexcom 授权。',
    'ライブ同期を再び頼る前に Dexcom 認可を復旧してください。',
    'Restaure a autorização Dexcom antes de confiar novamente na sincronização ao vivo.',
    'שחזרו הרשאת Dexcom לפני שסומכים שוב על סנכרון חי.',
    'استعد تفويض Dexcom قبل الاعتماد على المزامنة المباشرة مرة أخرى.'
  ),
  rate_limited: mk(
    'Wait through the cooldown window and avoid forcing extra refreshes.',
    'Дождитесь окончания паузы и не форсируйте лишние обновления.',
    'Зачекайте завершення паузи й не форсуйте зайві оновлення.',
    'Espera la ventana de enfriamiento y evita forzar actualizaciones extra.',
    'Attendez la pause et évitez de forcer des rafraîchissements supplémentaires.',
    'Warten Sie das Cooldown-Fenster ab und erzwingen Sie keine Extra-Aktualisierungen.',
    '等待冷却窗口结束，避免强制额外刷新。',
    'クールダウンが終わるまで待ち、追加更新を強制しないでください。',
    'Aguarde a janela de pausa e evite forçar atualizações extras.',
    'המתינו לסיום ההמתנה ואל תכפו רענונים נוספים.',
    'انتظر نافذة التهدئة وتجنب فرض تحديثات إضافية.'
  ),
  degraded_data: mk(
    'Treat sensor data as lower confidence until fresher readings arrive.',
    'Считайте данные сенсора менее надёжными, пока не придут более свежие показания.',
    'Вважайте дані сенсора менш надійними, доки не надійдуть свіжіші показники.',
    'Trata los datos del sensor con menor confianza hasta que lleguen lecturas más frescas.',
    'Traitez les données capteur avec moins de confiance jusqu’à des lectures plus fraîches.',
    'Behandeln Sie Sensordaten als weniger vertrauenswürdig, bis frischere Werte kommen.',
    '在获得更新读数之前，请将传感器数据视为较低可信度。',
    'より新しい測定値が来るまで、センサーデータの信頼度を下げて扱ってください。',
    'Trate os dados do sensor com menor confiança até chegarem leituras mais recentes.',
    'התייחסו לנתוני החיישן כפחות אמינים עד שיגיעו קריאות טריות יותר.',
    'عامل بيانات المستشعر بثقة أقل حتى تصل قراءات أحدث.'
  ),
  repeated_failures: mk(
    'Stay in a safer fallback mode while the system retries in the background.',
    'Оставайтесь в более безопасном режиме, пока система повторяет попытки в фоне.',
    'Залишайтеся в безпечнішому режимі, поки система повторює спроби у фоні.',
    'Mantente en un modo de respaldo más seguro mientras el sistema reintenta en segundo plano.',
    'Restez en mode de secours plus sûr pendant que le système réessaie en arrière-plan.',
    'Bleiben Sie im sichereren Fallback-Modus, während das System im Hintergrund erneut versucht.',
    '在系统在后台重试期间，保持在更安全的后备模式。',
    'システムがバックグラウンドで再試行している間は、より安全なフォールバックモードを保ってください。',
    'Permaneça em um modo de fallback mais seguro enquanto o sistema tenta novamente em segundo plano.',
    'הישארו במצב גיבוי בטוח יותר בזמן שהמערכת מנסה שוב ברקע.',
    'ابقَ في وضع احتياطي أكثر أمانًا بينما يعيد النظام المحاولة في الخلفية.'
  ),
  ok: mk(
    'Keep the routine simple and let the system continue in normal mode.',
    'Держите рутину простой и позвольте системе работать в обычном режиме.',
    'Тримайте рутину простою й дозвольте системі працювати в звичайному режимі.',
    'Mantén la rutina simple y deja que el sistema siga en modo normal.',
    'Gardez la routine simple et laissez le système continuer en mode normal.',
    'Halten Sie die Routine einfach und lassen Sie das System im Normalmodus weiterlaufen.',
    '保持日常简单，让系统继续正常运行。',
    'ルーティンをシンプルに保ち、システムを通常モードで続けてください。',
    'Mantenha a rotina simples e deixe o sistema continuar no modo normal.',
    'השאירו את השגרה פשוטה ותנו למערכת להמשיך במצב רגיל.',
    'اجعل الروتين بسيطًا ودع النظام يستمر في الوضع العادي.'
  ),
};

export const guidanceChecklists = {
  parent: [
    mk('Keep treatment and backup contact details easy to reach.', 'Держите лечение и контакты резерва на виду.', 'Тримайте лікування та контакти резерву на виду.', 'Mantén el tratamiento y los contactos de respaldo a mano.', 'Gardez traitement et contacts de relais faciles d’accès.', 'Halten Sie Behandlung und Backup-Kontakte griffbereit.', '把处理和后备联系方式放在容易拿到的地方。', '治療と補助連絡先をすぐ取り出せる状態に保ってください。', 'Mantenha tratamento e contatos de reforço fáceis de alcançar.', 'השאירו טיפול ואנשי קשר לגיבוי נגישים.', 'اجعل العلاج وجهات الاتصال الاحتياطية في متناول اليد.'),
    mk('Confirm who is responding before escalating further.', 'Уточните, кто отвечает, прежде чем усиливать эскалацию.', 'Уточніть, хто відповідає, перш ніж посилювати ескалацію.', 'Confirma quién responde antes de escalar más.', 'Confirmez qui répond avant d’escalader davantage.', 'Klären Sie, wer reagiert, bevor Sie weiter eskalieren.', '在进一步升级之前，先确认谁在响应。', 'さらにエスカレーションする前に、誰が対応しているか確認してください。', 'Confirme quem responde antes de escalar mais.', 'אשרו מי מגיב לפני הסלמה נוספת.', 'أكد من يستجيب قبل التصعيد أكثر.'),
    mk('If data confidence drops, check the sensor connection before reacting hard.', 'Если достоверность данных падает, проверьте связь с сенсором, прежде чем резко реагировать.', 'Якщо достовірність даних падає, перевірте зв’язок із сенсором, перш ніж різко реагувати.', 'Si baja la confianza en los datos, revisa la conexión del sensor antes de reaccionar con fuerza.', 'Si la confiance baisse, vérifiez la connexion capteur avant de réagir fort.', 'Sinkt das Datenvertrauen, prüfen Sie die Sensorverbindung vor harter Reaktion.', '如果数据可信度下降，在强烈反应前先检查传感器连接。', 'データ信頼度が下がったら、強く反応する前にセンサー接続を確認してください。', 'Se a confiança nos dados cair, verifique a conexão do sensor antes de reagir com força.', 'אם הביטחון בנתונים יורד, בדקו את חיבור החיישן לפני תגובה חזקה.', 'إذا انخفضت ثقة البيانات، تحقق من اتصال المستشعر قبل التفاعل بقوة.'),
  ],
  caregiver: [
    mk('Confirm the current responder before stepping in.', 'Уточните текущего ответственного, прежде чем подключаться.', 'Уточніть поточного відповідального, перш ніж підключатися.', 'Confirma quién responde ahora antes de intervenir.', 'Confirmez le répondant actuel avant d’intervenir.', 'Klären Sie den aktuellen Verantwortlichen, bevor Sie eingreifen.', '介入前先确认当前响应者。', '入る前に現在の対応者を確認してください。', 'Confirme quem responde agora antes de entrar.', 'אשרו את המגיב הנוכחי לפני שאתם נכנסים.', 'أكد المستجيب الحالي قبل التدخل.'),
    mk('Keep your phone available during the current watch window.', 'Держите телефон доступным в текущем окне наблюдения.', 'Тримайте телефон доступним у поточному вікні спостереження.', 'Mantén el teléfono disponible durante la ventana de vigilancia actual.', 'Gardez votre téléphone disponible pendant la fenêtre de surveillance actuelle.', 'Halten Sie Ihr Telefon während des aktuellen Beobachtungsfensters erreichbar.', '在当前观察窗口内保持手机可用。', '現在の見守り時間帯は電話を手元に置いてください。', 'Mantenha o telefone disponível durante a janela de vigilância atual.', 'השאירו את הטלפון זמין במהלך חלון המעקב הנוכחי.', 'أبقِ هاتفك متاحًا خلال نافذة المراقبة الحالية.'),
    mk('Use fallback support if data quality drops or the parent misses the response.', 'Подключайте резерв, если качество данных падает или родитель не ответил.', 'Підключайте резерв, якщо якість даних падає або батько не відповів.', 'Usa el respaldo si baja la calidad de datos o el padre no responde.', 'Utilisez le relais si la qualité des données baisse ou si le parent ne répond pas.', 'Nutzen Sie die Reserve, wenn die Datenqualität sinkt oder der Elternteil nicht reagiert.', '如果数据质量下降或家长未响应，请启用后备支持。', 'データ品質が下がるか保護者が応答しない場合は補助を使ってください。', 'Use o reforço se a qualidade dos dados cair ou o responsável não responder.', 'השתמשו בגיבוי אם איכות הנתונים יורדת או שההורה לא הגיב.', 'استخدم الدعم الاحتياطي إذا انخفضت جودة البيانات أو فات الوالد الاستجابة.'),
  ],
  adult: [
    mk('Keep treatment close during watch or recovery states.', 'Держите лечение рядом в режимах наблюдения или восстановления.', 'Тримайте лікування поруч у режимах спостереження або відновлення.', 'Mantén el tratamiento cerca durante estados de vigilancia o recuperación.', 'Gardez le traitement à portée pendant les états de surveillance ou de reprise.', 'Halten Sie die Behandlung in Watch- oder Erholungsphasen griffbereit.', '在观察或恢复状态下，把处理用品放在身边。', '見守りや回復中は治療を近くに置いてください。', 'Mantenha o tratamento por perto durante vigilância ou recuperação.', 'החזיקו טיפול קרוב במצבי מעקב או התאוששות.', 'أبقِ العلاج قريبًا أثناء المراقبة أو التعافي.'),
    mk('Use DONE only after you have actually responded.', 'Нажимайте DONE только после реального ответа.', 'Натискайте DONE лише після реальної відповіді.', 'Usa DONE solo después de haber respondido de verdad.', 'Utilisez DONE seulement après avoir réellement répondu.', 'Nutzen Sie DONE erst, nachdem Sie wirklich reagiert haben.', '只有在真正响应后才使用 DONE。', '実際に対応した後にだけ DONE を使ってください。', 'Use DONE somente depois de realmente responder.', 'השתמשו ב-DONE רק אחרי שבאמת הגבתם.', 'استخدم DONE فقط بعد أن تستجيب فعلاً.'),
    mk('Slow down decisions when data is stale or offline.', 'Не торопитесь с решениями, если данные устарели или офлайн.', 'Не поспішайте з рішеннями, якщо дані застарілі або офлайн.', 'Ve más despacio con las decisiones si los datos están obsoletos o offline.', 'Ralentissez les décisions quand les données sont obsolètes ou hors ligne.', 'Entschleunigen Sie Entscheidungen bei veralteten oder offline Daten.', '数据陈旧或离线时，放慢决策。', 'データが古いかオフラインのときは判断を急がないでください。', 'Desacelere decisões quando os dados estiverem antigos ou offline.', 'האטו החלטות כשהנתונים מיושנים או offline.', 'تمهل في القرارات عندما تكون البيانات قديمة أو غير متصلة.'),
  ],
};

export const eventLogCopy = {
  monitoring_active: {
    step: mk('Monitoring active', 'Мониторинг активен', 'Моніторинг активний', 'Monitoreo activo', 'Surveillance active', 'Monitoring aktiv', '监控进行中', '監視中', 'Monitoramento ativo', 'מעקב פעיל', 'المراقبة نشطة'),
    detail: mk(
      'The household is in steady monitoring. No active alert right now.',
      'Семья в спокойном мониторинге. Сейчас нет активного сигнала.',
      'Сім’я в спокійному моніторингу. Зараз немає активного сигналу.',
      'La familia está en monitoreo estable. No hay alerta activa ahora.',
      'Le foyer est en surveillance stable. Aucune alerte active pour l’instant.',
      'Der Haushalt ist im stabilen Monitoring. Derzeit keine aktive Warnung.',
      '家庭处于稳定监控中，当前没有活跃提醒。',
      '世帯は安定監視中です。今はアクティブなアラートはありません。',
      'A família está em monitoramento estável. Nenhum alerta ativo agora.',
      'המשפחה במעקב יציב. אין התראה פעילה כרגע.',
      'الأسرة في مراقبة مستقرة. لا يوجد تنبيه نشط الآن.'
    ),
  },
  first_alert: {
    step: mk('First alert sent', 'Первый сигнал отправлен', 'Перший сигнал надіслано', 'Primera alerta enviada', 'Première alerte envoyée', 'Erster Alarm gesendet', '已发送首次提醒', '最初のアラート送信', 'Primeiro alerta enviado', 'התראה ראשונה נשלחה', 'تم إرسال أول تنبيه'),
    detail: mk(
      'The first safety alert was delivered and the case is open.',
      'Первый сигнал безопасности доставлен, случай открыт.',
      'Перший сигнал безпеки доставлено, випадок відкрито.',
      'La primera alerta de seguridad fue entregada y el caso está abierto.',
      'La première alerte de sécurité a été livrée et le cas est ouvert.',
      'Der erste Sicherheitsalarm wurde zugestellt und der Fall ist offen.',
      '首次安全提醒已送达，案例已打开。',
      '最初の安全アラートが届き、ケースが開いています。',
      'O primeiro alerta de segurança foi entregue e o caso está aberto.',
      'התראת הבטיחות הראשונה נמסרה והמקרה פתוח.',
      'تم تسليم أول تنبيه أمان والحالة مفتوحة.'
    ),
  },
  parent_handling: { step: mk('Parent handling confirmed', 'Родитель подтвердил ответ', 'Батько підтвердив відповідь', 'Padre confirmó respuesta', 'Parent a confirmé la réponse', 'Elternteil bestätigte Reaktion', '家长已确认响应', '保護者が対応を確認', 'Responsável confirmou resposta', 'ההורה אישר תגובה', 'أكد الوالد الاستجابة') },
  caregiver_escalated: { step: mk('Caregiver escalated', 'Подключён резервный опекун', 'Підключено резервного опікуна', 'Cuidador escalado', 'Aidant activé en relais', 'Betreuer eskaliert', '已升级至照护者', 'ケアギバーにエスカレーション', 'Cuidador escalado', 'מטפל הועבר לגיבוי', 'تم تصعيد مقدم الرعاية') },
  recovery_watch_started: { step: mk('Recovery watch started', 'Начато наблюдение восстановления', 'Розпочато спостереження відновлення', 'Vigilancia de recuperación iniciada', 'Surveillance de reprise démarrée', 'Erholungsbeobachtung gestartet', '已开始恢复观察', '回復見守り開始', 'Vigilância de recuperação iniciada', 'מעקב התאוששות החל', 'بدأت مراقبة التعافي') },
  caregiver_take_over: { step: mk('Caregiver took over', 'Опекун взял управление', 'Опікун взяв керування', 'Cuidador tomó el control', 'L’aidant a pris le relais', 'Betreuer übernahm', '照护者已接管', 'ケアギバーが引き継ぎ', 'Cuidador assumiu', 'מטפל לקח פיקוד', 'تولى مقدم الرعاية المسؤولية') },
  caregiver_called_parent: { step: mk('Caregiver contacted parent', 'Опекун связался с родителем', 'Опікун зв’язався з батьком', 'Cuidador contactó al padre', 'L’aidant a contacté le parent', 'Betreuer kontaktierte Elternteil', '照护者已联系家长', 'ケアギバーが保護者に連絡', 'Cuidador contatou responsável', 'מטפל יצר קשר עם ההורה', 'تواصل مقدم الرعاية مع الوالد') },
  caregiver_on_way: { step: mk('Caregiver on the way', 'Опекун в пути', 'Опікун у дорозі', 'Cuidador en camino', 'L’aidant est en route', 'Betreuer ist unterwegs', '照护者正在赶来', 'ケアギバーが向かっています', 'Cuidador a caminho', 'מטפל בדרך', 'مقدم الرعاية في الطريق') },
  adult_self_monitor: { step: mk('Adult self-monitoring', 'Взрослый ведёт самонаблюдение', 'Дорослий веде самоспостереження', 'Adulto en automonitoreo', 'Adulte en auto-surveillance', 'Erwachsener im Selbstmonitoring', '成人自我监控中', '成人が自己モニタリング', 'Adulto em automonitoramento', 'מבוגר במעקב עצמי', 'البالغ يراقب نفسه') },
  adult_treated_low: { step: mk('Adult treated low', 'Взрослый провёл лечение при низком сахаре', 'Дорослий провів лікування при низькому цукрі', 'Adulto trató la baja', 'Adulte a traité l’hypo', 'Erwachsener behandelte Unterzuckerung', '成人已处理低血糖', '成人が低値を処理', 'Adulto tratou baixa', 'מבוגר טיפל בערך נמוך', 'عالج البالغ انخفاض السكر') },
  adult_need_help: { step: mk('Adult requested backup', 'Взрослый запросил резервную помощь', 'Дорослий запросив резервну допомогу', 'Adulto pidió respaldo', 'Adulte a demandé du relais', 'Erwachsener bat um Backup', '成人请求后备帮助', '成人が補助を要請', 'Adulto pediu reforço', 'מבוגר ביקש גיבוי', 'طلب البالغ دعمًا احتياطيًا') },
};

export const inferReviewHeadlineKey = (payload) => {
  const deliveryStatus = payload.notificationSummary?.deliveryStatus;
  if (deliveryStatus === 'escalated') return 'delivery_escalated';
  if (deliveryStatus === 'retrying') return 'delivery_retrying';
  if (payload.currentState?.level === 'recovery') return 'recovery_review';
  return 'stable_path';
};

export const reviewHeadlines = {
  delivery_escalated: mk('Delivery needed backup to keep this cycle covered.', 'Для закрытия цикла доставке понадобился резерв.', 'Для закриття циклу доставці знадобився резерв.', 'La entrega necesitó respaldo para cubrir este ciclo.', 'La livraison a eu besoin de relais pour couvrir ce cycle.', 'Die Zustellung brauchte Backup, um diesen Zyklus abzudecken.', '本次循环的送达需要后备支持才能完成覆盖。', 'このサイクルの配信は補助が必要でした。', 'A entrega precisou de reforço para cobrir este ciclo.', 'המסירה נזקקה לגיבוי כדי לכסות את המחזור.', 'احتاج التسليم إلى دعم احتياطي لتغطية هذه الدورة.'),
  delivery_retrying: mk('Delivery is still in progress and being watched closely.', 'Доставка ещё идёт и находится под пристальным наблюдением.', 'Доставка ще триває і перебуває під уважним спостереженням.', 'La entrega sigue en curso y se vigila de cerca.', 'La livraison est encore en cours et surveillée de près.', 'Die Zustellung läuft noch und wird genau beobachtet.', '送达仍在进行中，并被密切观察。', '配信はまだ進行中で、注意深く見守られています。', 'A entrega ainda está em andamento e sendo acompanhada de perto.', 'המסירה עדיין מתבצעת ונמצאת תחת מעקב קרוב.', 'التسليم ما زال جاريًا ويُراقب عن كثب.'),
  recovery_review: mk('This cycle is now in review and recovery.', 'Этот цикл перешёл в обзор и восстановление.', 'Цей цикл перейшов у перегляд і відновлення.', 'Este ciclo está ahora en revisión y recuperación.', 'Ce cycle est maintenant en revue et reprise.', 'Dieser Zyklus ist jetzt in Review und Erholung.', '本周期已进入回顾与恢复。', 'このサイクルはレビューと回復に入りました。', 'Este ciclo está agora em revisão e recuperação.', 'המחזור הזה עבר לסקירה והתאוששות.', 'انتقلت هذه الدورة إلى المراجعة والتعافي.'),
  stable_path: mk('This cycle is moving with a stable response path.', 'Цикл идёт по стабильному пути ответа.', 'Цикл рухається стабільним шляхом відповіді.', 'Este ciclo avanza con una ruta de respuesta estable.', 'Ce cycle avance avec un chemin de réponse stable.', 'Dieser Zyklus läuft mit einem stabilen Reaktionspfad.', '本周期正沿稳定的响应路径推进。', 'このサイクルは安定した対応経路で進んでいます。', 'Este ciclo segue com um caminho de resposta estável.', 'המחזור הזה מתקדם במסלול תגובה יציב.', 'تسير هذه الدورة بمسار استجابة مستقر.'),
};

export const reviewNotes = {
  delivery_escalated: mk('Delivery had to escalate to keep the household covered.', 'Доставке пришлось эскалировать, чтобы семья оставалась под прикрытием.', 'Доставці довелося ескалувати, щоб сім’я залишалася під прикриттям.', 'La entrega tuvo que escalar para mantener la familia cubierta.', 'La livraison a dû escalader pour garder le foyer couvert.', 'Die Zustellung musste eskalieren, um den Haushalt abzudecken.', '送达不得不升级以维持家庭覆盖。', '世帯をカバーするため配信はエスカレーションしました。', 'A entrega precisou escalar para manter a família coberta.', 'המסירה נאלצה להסלים כדי להשאיר את המשפחה מכוסה.', 'اضطر التسليم للتصعيد للحفاظ على تغطية الأسرة.'),
  delivery_retrying: mk('Delivery needed at least one repeat before the loop settled.', 'Доставке понадобился хотя бы один повтор, прежде чем цикл успокоился.', 'Доставці знадобився хоча б один повтор, перш ніж цикл заспокоївся.', 'La entrega necesitó al menos un repetido antes de que el ciclo se calmara.', 'La livraison a eu besoin d’au moins une répétition avant que le cycle se stabilise.', 'Die Zustellung brauchte mindestens eine Wiederholung, bevor sich der Zyklus beruhigte.', '循环稳定前，送达至少需要一次重复。', 'ループが落ち着く前に配信は少なくとも1回の再送が必要でした。', 'A entrega precisou de pelo menos uma repetição antes do ciclo se acalmar.', 'המסירה נזקקה לפחות חזרה אחת לפני שהלולאה התייצבה.', 'احتاج التسليم إلى تكرار واحد على الأقل قبل أن تستقر الدورة.'),
  delivery_clean: mk('Delivery reached the intended responder cleanly.', 'Доставка дошла до нужного ответственного без сбоев.', 'Доставка дійшла до потрібного відповідального без збоїв.', 'La entrega llegó limpiamente al respondedor previsto.', 'La livraison a atteint proprement le répondant prévu.', 'Die Zustellung erreichte den vorgesehenen Verantwortlichen sauber.', '送达已顺利触达目标响应者。', '配信は想定どおりの対応者に届きました。', 'A entrega chegou limpa ao respondedor previsto.', 'המסירה הגיעה נקי למגיב המיועד.', 'وصل التسليم إلى المستجيب المقصود بسلاسة.'),
  backup_used: mk('Backup support was part of this response cycle.', 'Резервная поддержка участвовала в этом цикле ответа.', 'Резервна підтримка брала участь у цьому циклі відповіді.', 'El apoyo de respaldo formó parte de este ciclo de respuesta.', 'Le soutien de relais faisait partie de ce cycle de réponse.', 'Reserve-Unterstützung war Teil dieses Reaktionszyklus.', '后备支持参与了本次响应循环。', '補助サポートがこの対応サイクルに含まれました。', 'O apoio reserva fez parte deste ciclo de resposta.', 'תמיכת גיבוי הייתה חלק ממחזור התגובה הזה.', 'كان الدعم الاحتياطي جزءًا من دورة الاستجابة هذه.'),
  primary_stable: mk('The primary response path stayed stable through the cycle.', 'Основной путь ответа оставался стабильным весь цикл.', 'Основний шлях відповіді залишався стабільним увесь цикл.', 'La ruta principal de respuesta se mantuvo estable durante el ciclo.', 'Le chemin de réponse principal est resté stable tout au long du cycle.', 'Der primäre Reaktionspfad blieb durch den gesamten Zyklus stabil.', '整个周期内，主要响应路径保持稳定。', '主要な対応経路はサイクル全体を通じて安定していました。', 'O caminho principal de resposta permaneceu estável durante o ciclo.', 'מסלול התגובה הראשי נשאר יציב לאורך המחזור.', 'ظل مسار الاستجابة الأساسي مستقرًا طوال الدورة.'),
};

export const reviewNextFocus = {
  review_routing: mk('Review routing and backup readiness before the next critical cycle.', 'Проверьте маршрутизацию и готовность резерва перед следующим критическим циклом.', 'Перевірте маршрутизацію й готовність резерву перед наступним критичним циклом.', 'Revisa el enrutamiento y la preparación del respaldo antes del próximo ciclo crítico.', 'Revoyez le routage et la préparation du relais avant le prochain cycle critique.', 'Prüfen Sie Routing und Backup-Bereitschaft vor dem nächsten kritischen Zyklus.', '在下一次关键周期前，回顾路由和后备准备度。', '次の重要サイクルの前にルーティングと補助の準備を見直してください。', 'Revise o roteamento e a prontidão do reforço antes do próximo ciclo crítico.', 'סקרו ניתוב ומוכנות גיבוי לפני המחזור הקריטי הבא.', 'راجع التوجيه وجاهزية الدعم الاحتياطي قبل الدورة الحرجة التالية.'),
  review_sensitivity: mk('Review sensitivity and timing before this pattern repeats.', 'Проверьте чувствительность и тайминг, прежде чем паттерн повторится.', 'Перевірте чутливість і таймінг, перш ніж патерн повториться.', 'Revisa sensibilidad y tiempos antes de que se repita este patrón.', 'Revoyez sensibilité et timing avant que ce schéma se répète.', 'Prüfen Sie Empfindlichkeit und Timing, bevor sich das Muster wiederholt.', '在该模式重复之前，回顾敏感度和时机。', 'このパターンが繰り返される前に感度とタイミングを見直してください。', 'Revise sensibilidade e timing antes que este padrão se repita.', 'סקרו רגישות ותזמון לפני שהדפוס הזה חוזר.', 'راجع الحساسية والتوقيت قبل أن يتكرر هذا النمط.'),
  keep_setup: mk('Keep the same setup and watch only for repeated patterns.', 'Сохраните текущую настройку и следите только за повторяющимися паттернами.', 'Збережіть поточне налаштування й стежте лише за повторюваними патернами.', 'Mantén la misma configuración y observa solo patrones repetidos.', 'Gardez la même configuration et surveillez seulement les schémas répétés.', 'Behalten Sie die gleiche Konfiguration und achten Sie nur auf wiederholte Muster.', '保持相同设置，只关注重复出现的模式。', '同じ設定を保ち、繰り返しパターンだけを見てください。', 'Mantenha a mesma configuração e observe apenas padrões repetidos.', 'השאירו את אותה הגדרה ועקבו רק אחר דפוסים חוזרים.', 'أبقِ الإعداد نفسه وراقب الأنماط المتكررة فقط.'),
};

export const localizeMorningHeadline = (lang, childName, alertsCount, escalationCount) =>
  pick(lang, {
    en: `${childName} had ${alertsCount} alerts and ${escalationCount} escalation checks today.`,
    ru: `У ${childName} сегодня было ${alertsCount} сигналов и ${escalationCount} проверок эскалации.`,
    uk: `У ${childName} сьогодні було ${alertsCount} сигналів і ${escalationCount} перевірок ескалації.`,
    es: `${childName} tuvo ${alertsCount} alertas y ${escalationCount} comprobaciones de escalada hoy.`,
    fr: `${childName} a eu ${alertsCount} alertes et ${escalationCount} contrôles d’escalade aujourd’hui.`,
    de: `${childName} hatte heute ${alertsCount} Alarme und ${escalationCount} Eskalationsprüfungen.`,
    zh: `${childName} 今天有 ${alertsCount} 次提醒和 ${escalationCount} 次升级检查。`,
    ja: `${childName} は今日 ${alertsCount} 件のアラートと ${escalationCount} 件のエスカレーション確認がありました。`,
    pt: `${childName} teve ${alertsCount} alertas e ${escalationCount} verificações de escalada hoje.`,
    he: `ל-${childName} היו היום ${alertsCount} התראות ו-${escalationCount} בדיקות הסלמה.`,
    ar: `كان لدى ${childName} ${alertsCount} تنبيهات و${escalationCount} فحوصات تصعيد اليوم.`,
  });

export const morningOutcome = mk(
  'Recovery was monitored and the household stayed covered through the day.',
  'Восстановление отслеживалось, семья оставалась под прикрытием весь день.',
  'Відновлення відстежувалося, сім’я залишалася під прикриттям увесь день.',
  'La recuperación se monitoreó y la familia permaneció cubierta durante el día.',
  'La reprise a été surveillée et le foyer est resté couvert toute la journée.',
  'Die Erholung wurde überwacht und der Haushalt blieb den ganzen Tag abgedeckt.',
  '恢复受到监控，家庭全天保持覆盖。',
  '回復は見守られ、世帯は一日中カバーされました。',
  'A recuperação foi monitorada e a família permaneceu coberta durante o dia.',
  'ההתאוששות נעקבה והמשפחה נשארה מכוסה לאורך היום.',
  'تمت مراقبة التعافي وظلت الأسرة مغطاة طوال اليوم.'
);
