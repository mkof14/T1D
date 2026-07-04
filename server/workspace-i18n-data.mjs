import { normalizeLang } from './backend-i18n.mjs';

const mk = (en, ru, uk, es, fr, de, zh, ja, pt, he, ar) => ({ en, ru, uk, es, fr, de, zh, ja, pt, he, ar });

export { mk };

export const pick = (lang, table) => {
  if (!table) return '';
  const normalized = normalizeLang(lang);
  return table[normalized] || table.en || '';
};

export const dexcomHealthHeadlines = {
  broken_auth: mk(
    'Dexcom needs a fresh authorization.',
    'Dexcom требует повторной авторизации.',
    'Dexcom потребує повторної авторизації.',
    'Dexcom necesita una nueva autorización.',
    'Dexcom nécessite une nouvelle autorisation.',
    'Dexcom benötigt eine neue Autorisierung.',
    'Dexcom 需要重新授权。',
    'Dexcom は再認可が必要です。',
    'O Dexcom precisa de uma nova autorização.',
    'Dexcom דורש הרשאה מחודשת.',
    'Dexcom يحتاج إلى إذن جديد.'
  ),
  repeated_failures: mk(
    'Dexcom has repeated failures and needs attention.',
    'Dexcom сообщает о повторных сбоях и требует внимания.',
    'Dexcom повідомляє про повторні збої і потребує уваги.',
    'Dexcom tiene fallos repetidos y necesita atención.',
    'Dexcom signale des échecs répétés et demande attention.',
    'Dexcom meldet wiederholte Fehler und braucht Aufmerksamkeit.',
    'Dexcom 出现多次失败，需要关注。',
    'Dexcom で連続失敗が発生しており、注意が必要です。',
    'O Dexcom teve falhas repetidas e precisa de atenção.',
    'Dexcom מדווח על כשלים חוזרים ודורש תשומת לב.',
    'Dexcom يبلغ عن أعطال متكررة ويحتاج إلى انتباه.'
  ),
  rate_limited: mk(
    'Dexcom is rate limited and backing off.',
    'Dexcom ограничен по частоте запросов и делает паузу.',
    'Dexcom обмежений за частотою запитів і робить паузу.',
    'Dexcom está limitado por frecuencia y hace una pausa.',
    'Dexcom est limité en fréquence et fait une pause.',
    'Dexcom ist ratenbegrenzt und pausiert.',
    'Dexcom 已被限流并正在退避。',
    'Dexcom はレート制限中で待機しています。',
    'O Dexcom está limitado por taxa e fazendo pausa.',
    'Dexcom מוגבל בקצב ונכנס להמתנה.',
    'Dexcom مقيد بالمعدل ويتوقف مؤقتًا.'
  ),
  request_failed: mk(
    'Dexcom requests are failing and being watched.',
    'Запросы Dexcom не проходят, система следит за ситуацией.',
    'Запити Dexcom не проходять, система стежить за ситуацією.',
    'Las solicitudes a Dexcom fallan y se están vigilando.',
    'Les requêtes Dexcom échouent et sont surveillées.',
    'Dexcom-Anfragen schlagen fehl und werden beobachtet.',
    'Dexcom 请求失败，系统正在监控。',
    'Dexcom リクエストが失敗しており、監視中です。',
    'As solicitações ao Dexcom estão falhando e sendo monitoradas.',
    'בקשות Dexcom נכשלות והמערכת עוקבת.',
    'طلبات Dexcom تفشل ويتم مراقبتها.'
  ),
  degraded_data: mk(
    'Dexcom data confidence is reduced.',
    'Достоверность данных Dexcom снижена.',
    'Достовірність даних Dexcom знижена.',
    'La confianza en los datos de Dexcom está reducida.',
    'La confiance dans les données Dexcom est réduite.',
    'Das Vertrauen in Dexcom-Daten ist reduziert.',
    'Dexcom 数据可信度降低。',
    'Dexcom データの信頼度が下がっています。',
    'A confiança nos dados do Dexcom está reduzida.',
    'רמת הביטחון בנתוני Dexcom ירדה.',
    'ثقة بيانات Dexcom منخفضة.'
  ),
  ok: mk(
    'Dexcom sync is healthy.',
    'Синхронизация Dexcom в норме.',
    'Синхронізація Dexcom у нормі.',
    'La sincronización con Dexcom está bien.',
    'La synchronisation Dexcom est saine.',
    'Die Dexcom-Synchronisation ist stabil.',
    'Dexcom 同步正常。',
    'Dexcom 同期は正常です。',
    'A sincronização Dexcom está saudável.',
    'סנכרון Dexcom תקין.',
    'مزامنة Dexcom سليمة.'
  ),
};

export const guidanceTitles = {
  parent: mk(
    'Parent Daily Guidance',
    'Ежедневные рекомендации для родителя',
    'Щоденні рекомендації для батька',
    'Guía diaria para padres',
    'Guide quotidien parent',
    'Tägliche Eltern-Empfehlung',
    '家长每日指引',
    '保護者向け毎日のガイド',
    'Orientação diária para pais',
    'הנחיה יומית להורה',
    'إرشاد يومي للوالد'
  ),
  caregiver: mk(
    'Caregiver Daily Guidance',
    'Ежедневные рекомендации для опекуна',
    'Щоденні рекомендації для опікуна',
    'Guía diaria para cuidador',
    'Guide quotidien aidant',
    'Tägliche Betreuungs-Empfehlung',
    '照护者每日指引',
    'ケアギバー向け毎日のガイド',
    'Orientação diária para cuidador',
    'הנחיה יומית למטפל',
    'إرشاد يومي لمقدم الرعاية'
  ),
  adult: mk(
    'Daily Guidance',
    'Ежедневные рекомендации',
    'Щоденні рекомендації',
    'Guía diaria',
    'Guide quotidien',
    'Tägliche Empfehlung',
    '每日指引',
    '毎日のガイド',
    'Orientação diária',
    'הנחיה יומית',
    'إرشاد يومي'
  ),
};

export const guidanceNow = {
  parent: (child) => ({
    en: `Keep ${child}'s current state, responder, and recovery path clear at a glance.`,
    ru: `Держите текущее состояние ${child}, ответственного и путь восстановления на виду.`,
    uk: `Тримайте поточний стан ${child}, відповідального та шлях відновлення на виду.`,
    es: `Mantén a la vista el estado actual de ${child}, quién responde y el camino de recuperación.`,
    fr: `Gardez en vue l'état actuel de ${child}, le répondant et le chemin de reprise.`,
    de: `Behalten Sie Zustand, Verantwortlichen und Erholungsweg von ${child} im Blick.`,
    zh: `一眼看清 ${child} 的当前状态、响应者和恢复路径。`,
    ja: `${child} の現在の状態、対応者、回復の流れを一目で把握してください。`,
    pt: `Mantenha à vista o estado atual de ${child}, quem responde e o caminho de recuperação.`,
    he: `השאירו במבט את מצב ${child}, המגיב והדרך להתאוששות.`,
    ar: `أبقِ حالة ${child} والمستجيب ومسار التعافي واضحين في نظرك.`,
  }),
  caregiver: (child) => ({
    en: `Stay ready to support ${child} if the primary responder needs backup.`,
    ru: `Будьте готовы поддержать ${child}, если основному ответственному нужен резерв.`,
    uk: `Будьте готові підтримати ${child}, якщо основному відповідальному потрібен резерв.`,
    es: `Prepárate para apoyar a ${child} si quien responde primero necesita respaldo.`,
    fr: `Restez prêt à soutenir ${child} si le répondant principal a besoin de relais.`,
    de: `Seien Sie bereit, ${child} zu unterstützen, wenn die Hauptperson Backup braucht.`,
    zh: `若主要响应者需要后备，请准备好支持 ${child}。`,
    ja: `主担当が補助を必要としたら、${child} を支えられる状態を保ってください。`,
    pt: `Fique pronto para apoiar ${child} se quem responde primeiro precisar de reforço.`,
    he: `היו מוכנים לתמוך ב-${child} אם למגיב הראשי צריך גיבוי.`,
    ar: `كن مستعدًا لدعم ${child} إذا احتاج المستجيب الأساسي إلى احتياط.`,
  }),
  adult: mk(
    'Keep the current state simple: know the reading, the trend, and the next safe action.',
    'Держите текущее состояние простым: знайте показание, тренд и следующий безопасный шаг.',
    'Тримайте поточний стан простим: знайте показник, тренд і наступний безпечний крок.',
    'Mantén el estado actual simple: conoce la lectura, la tendencia y el siguiente paso seguro.',
    'Gardez l’état actuel simple : lecture, tendance et prochaine action sûre.',
    'Halten Sie den aktuellen Zustand einfach: Wert, Trend und nächster sicherer Schritt.',
    '保持当前状态简单：知道读数、趋势和下一个安全动作。',
    '現在の状態をシンプルに：値、トレンド、次の安全な行動を把握してください。',
    'Mantenha o estado atual simples: leitura, tendência e próxima ação segura.',
    'השאירו את המצב הנוכחי פשוט: קריאה, מגמה והפעולה הבטוחה הבאה.',
    'اجعل الحالة الحالية بسيطة: اعرف القراءة والاتجاه والخطوة الآمنة التالية.'
  ),
};

export const readinessHeadlines = {
  ready: mk(
    'The household is ready for the current safety cycle.',
    'Семья готова к текущему циклу безопасности.',
    'Сім’я готова до поточного циклу безпеки.',
    'La familia está lista para el ciclo de seguridad actual.',
    'Le foyer est prêt pour le cycle de sécurité actuel.',
    'Der Haushalt ist bereit für den aktuellen Sicherheitszyklus.',
    '家庭已准备好进入当前安全周期。',
    '世帯は現在の安全サイクルに備えています。',
    'A família está pronta para o ciclo de segurança atual.',
    'המשפחה מוכנה למחזור הבטיחות הנוכחי.',
    'الأسرة جاهزة لدورة الأمان الحالية.'
  ),
  watch: mk(
    'The household is covered, but one part of readiness still needs watching.',
    'Семья под прикрытием, но одна часть готовности всё ещё требует внимания.',
    'Сім’я під прикриттям, але одна частина готовності ще потребує уваги.',
    'La familia está cubierta, pero una parte de la preparación aún necesita vigilancia.',
    'Le foyer est couvert, mais un aspect de la préparation reste à surveiller.',
    'Der Haushalt ist abgedeckt, aber ein Teil der Bereitschaft braucht noch Aufmerksamkeit.',
    '家庭已有覆盖，但准备度中仍有一部分需要关注。',
    '世帯はカバーされていますが、準備の一部はまだ見守りが必要です。',
    'A família está coberta, mas uma parte da prontidão ainda precisa de atenção.',
    'המשפחה מכוסה, אך חלק מהמוכנות עדיין דורש מעקב.',
    'الأسرة مغطاة، لكن جزءًا من الجاهزية ما زال يحتاج متابعة.'
  ),
  needs_attention: mk(
    'The household needs attention before this safety cycle is fully covered.',
    'Семье нужно внимание, прежде чем цикл безопасности будет полностью закрыт.',
    'Сім’ї потрібна увага, перш ніж цикл безпеки буде повністю закритий.',
    'La familia necesita atención antes de que este ciclo quede totalmente cubierto.',
    'Le foyer a besoin d’attention avant que ce cycle soit pleinement couvert.',
    'Der Haushalt braucht Aufmerksamkeit, bevor dieser Zyklus vollständig abgedeckt ist.',
    '在本安全周期完全覆盖之前，家庭还需要关注。',
    'この安全サイクルが完全にカバーされる前に、世帯への注意が必要です。',
    'A família precisa de atenção antes que este ciclo fique totalmente coberto.',
    'המשפחה זקוקה לתשומת לב לפני שהמחזור מכוסה לגמרי.',
    'الأسرة تحتاج إلى انتباه قبل أن تُغطى دورة الأمان هذه بالكامل.'
  ),
};

export const contextualSummaries = {
  broken_auth: {
    headline: mk(
      'Live sync needs to be restored.',
      'Живая синхронизация требует восстановления.',
      'Живу синхронізацію потрібно відновити.',
      'Hay que restaurar la sincronización en vivo.',
      'La synchronisation live doit être restaurée.',
      'Die Live-Synchronisation muss wiederhergestellt werden.',
      '需要恢复实时同步。',
      'ライブ同期を復旧する必要があります。',
      'A sincronização ao vivo precisa ser restaurada.',
      'יש לשחזר סנכרון חי.',
      'يجب استعادة المزامنة المباشرة.'
    ),
    detail: mk(
      'Dexcom authorization is no longer active, so treat sensor support as unavailable until OAuth is restored.',
      'Авторизация Dexcom больше не активна — считайте поддержку сенсора недоступной, пока OAuth не восстановлен.',
      'Авторизація Dexcom більше не активна — вважайте підтримку сенсора недоступною, доки OAuth не відновлено.',
      'La autorización de Dexcom ya no está activa; trata el soporte del sensor como no disponible hasta restaurar OAuth.',
      'L’autorisation Dexcom n’est plus active ; considérez le capteur indisponible jusqu’à restauration OAuth.',
      'Die Dexcom-Autorisierung ist nicht mehr aktiv; behandeln Sie den Sensor bis zur OAuth-Wiederherstellung als nicht verfügbar.',
      'Dexcom 授权已失效，在恢复 OAuth 之前请将传感器支持视为不可用。',
      'Dexcom 認可が無効です。OAuth を復旧するまでセンサー支援は利用不可としてください。',
      'A autorização Dexcom não está mais ativa; trate o sensor como indisponível até restaurar o OAuth.',
      'הרשאת Dexcom אינה פעילה; התייחסו לתמיכת החיישן כלא זמינה עד ש-OAuth ישוחזר.',
      'تفويض Dexcom لم يعد نشطًا؛ اعتبر دعم المستشعر غير متاح حتى استعادة OAuth.'
    ),
  },
  rate_limited: {
    headline: mk(
      'The system is cooling down after too many Dexcom requests.',
      'Система остывает после слишком частых запросов к Dexcom.',
      'Система охолоджується після занадто частих запитів до Dexcom.',
      'El sistema se enfría tras demasiadas solicitudes a Dexcom.',
      'Le système se calme après trop de requêtes Dexcom.',
      'Das System kühlt nach zu vielen Dexcom-Anfragen ab.',
      '系统在 Dexcom 请求过多后正在冷却。',
      'Dexcom への要求が多すぎたため、システムは冷却中です。',
      'O sistema está esfriando após muitas solicitações ao Dexcom.',
      'המערכת נרגעת אחרי יותר מדי בקשות Dexcom.',
      'النظام يهدأ بعد طلبات Dexcom الكثيرة.'
    ),
    detail: mk(
      'The next sync is already scheduled. There is no need to force extra refreshes right now.',
      'Следующая синхронизация уже запланирована. Сейчас не нужно форсировать обновления.',
      'Наступна синхронізація вже запланована. Зараз не потрібно форсувати оновлення.',
      'La próxima sincronización ya está programada. No hace falta forzar más actualizaciones ahora.',
      'La prochaine synchronisation est déjà planifiée. Inutile de forcer des rafraîchissements maintenant.',
      'Die nächste Synchronisation ist bereits geplant. Zusätzliche Aktualisierungen sind jetzt nicht nötig.',
      '下一次同步已安排，现在无需强制额外刷新。',
      '次の同期はすでに予定されています。今は追加更新を強制する必要はありません。',
      'A próxima sincronização já está agendada. Não é preciso forçar atualizações extras agora.',
      'הסנכרון הבא כבר מתוזמן. אין צורך לכפות רענונים נוספים עכשיו.',
      'المزامنة التالية مجدولة بالفعل. لا حاجة لفرض تحديثات إضافية الآن.'
    ),
  },
  steady: {
    headline: mk(
      'The household is in a steady daily support state.',
      'Семья в спокойном режиме ежедневной поддержки.',
      'Сім’я в спокійному режимі щоденної підтримки.',
      'La familia está en un estado estable de apoyo diario.',
      'Le foyer est dans un état stable de soutien quotidien.',
      'Der Haushalt befindet sich in einem stabilen täglichen Unterstützungszustand.',
      '家庭处于稳定的日常支持状态。',
      '世帯は安定した日常サポート状態です。',
      'A família está em um estado estável de apoio diário.',
      'המשפחה במצב יציב של תמיכה יומית.',
      'الأسرة في حالة دعم يومي مستقرة.'
    ),
  },
};

export const inferContextualSummaryKey = (payload) => {
  const { dexcomHealth, currentState, householdReadiness, user } = payload;
  if (dexcomHealth?.reason === 'broken_auth') return 'broken_auth';
  if (dexcomHealth?.reason === 'rate_limited') return 'rate_limited';
  if (currentState?.level === 'recovery') return user?.role === 'caregiver' ? 'recovery_caregiver' : 'recovery';
  if (currentState?.dataStatus === 'offline' || currentState?.dataStatus === 'delayed') return 'reduced_data';
  if (householdReadiness?.state === 'needs_attention' || currentState?.level === 'critical') {
    return user?.role === 'caregiver' ? 'needs_attention_caregiver' : 'needs_attention';
  }
  if (currentState?.level === 'watch' || currentState?.level === 'risk') return 'watch_cycle';
  return user?.role === 'adult' ? 'steady_adult' : 'steady';
};
