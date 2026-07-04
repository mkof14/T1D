import { normalizeLang } from './backend-i18n.mjs';
import { normalizeDiabetesType } from './diabetes-type.mjs';
import { guidanceNowType2, guidanceWatchType2 } from './workspace-i18n-type.mjs';
import {
  contextualSummaries,
  dexcomHealthHeadlines,
  guidanceNow,
  guidanceTitles,
  inferContextualSummaryKey,
  pick,
  readinessHeadlines,
} from './workspace-i18n-data.mjs';
import {
  eventLogCopy,
  guidanceChecklists,
  guidanceFallback,
  guidanceWatch,
  inferReviewHeadlineKey,
  localizeMorningHeadline,
  morningOutcome,
  reviewHeadlines,
  reviewNextFocus,
  reviewNotes,
} from './workspace-i18n-extended.mjs';

const childFallback = {
  en: 'your child',
  ru: 'вашего ребёнка',
  uk: 'вашої дитини',
  es: 'tu hijo',
  fr: 'votre enfant',
  de: 'Ihr Kind',
  zh: '您的孩子',
  ja: 'お子さん',
  pt: 'seu filho',
  he: 'ילדכם',
  ar: 'طفلك',
};

const localizeContextualSummary = (lang, payload) => {
  const key = inferContextualSummaryKey(payload);
  const childName = payload.household?.childName || pick(lang, childFallback);
  const normalized = normalizeLang(lang);

  const templates = {
    recovery: {
      headline: pick(lang, {
        en: 'Recovery is active and should stay calm.',
        ru: 'Активное восстановление — держите спокойный режим.',
        uk: 'Активне відновлення — тримайте спокійний режим.',
        es: 'La recuperación está activa y debe mantenerse calmada.',
        fr: 'La reprise est active et doit rester calme.',
        de: 'Die Erholung ist aktiv und sollte ruhig bleiben.',
        zh: '恢复进行中，请保持冷静。',
        ja: '回復中です。落ち着いた状態を保ってください。',
        pt: 'A recuperação está ativa e deve permanecer calma.',
        he: 'ההתאוששות פעילה — שמרו על רוגע.',
        ar: 'التعافي نشط ويجب أن يبقى هادئًا.',
      }),
      detail: pick(lang, {
        en: `Keep the current recovery watch simple and steady until the state clearly settles again.`,
        ru: `Держите текущее наблюдение за восстановлением простым и ровным, пока состояние не стабилизируется.`,
        uk: `Тримайте поточне спостереження за відновленням простим і рівним, доки стан не стабілізується.`,
        es: `Mantén la vigilancia de recuperación simple y estable hasta que el estado se estabilice.`,
        fr: `Gardez la surveillance de reprise simple et stable jusqu’à ce que l’état se stabilise.`,
        de: `Halten Sie die Erholungsbeobachtung einfach und ruhig, bis sich der Zustand stabilisiert.`,
        zh: `在状态明显稳定之前，保持恢复观察简单、平稳。`,
        ja: `状態がはっきり落ち着くまで、回復の見守りをシンプルで安定したものにしてください。`,
        pt: `Mantenha a vigilância de recuperação simples e estável até o estado se estabilizar.`,
        he: `השאירו את מעקב ההתאוששות פשוט ויציב עד שהמצב מתייצב.`,
        ar: `اجعل مراقبة التعافي بسيطة وثابتة حتى تستقر الحالة.`,
      }),
    },
    recovery_caregiver: {
      headline: pick(lang, {
        en: 'Recovery is active and should stay calm.',
        ru: 'Активное восстановление — держите спокойный режим.',
        uk: 'Активне відновлення — тримайте спокійний режим.',
        es: 'La recuperación está activa y debe mantenerse calmada.',
        fr: 'La reprise est active et doit rester calme.',
        de: 'Die Erholung ist aktiv und sollte ruhig bleiben.',
        zh: '恢复进行中，请保持冷静。',
        ja: '回復中です。落ち着いた状態を保ってください。',
        pt: 'A recuperação está ativa e deve permanecer calma.',
        he: 'ההתאוששות פעילה — שמרו על רוגע.',
        ar: 'التعافي نشط ويجب أن يبقى هادئًا.',
      }),
      detail: pick(lang, {
        en: `Stay available while ${childName} remains in recovery watch and avoid adding noise unless support is needed.`,
        ru: `Будьте на связи, пока ${childName} в режиме восстановления, и не добавляйте лишнего шума без необходимости.`,
        uk: `Будьте на зв’язку, поки ${childName} у режимі відновлення, і не додавайте зайвого шуму без потреби.`,
        es: `Permanece disponible mientras ${childName} sigue en recuperación y evita añadir ruido salvo que haga falta apoyo.`,
        fr: `Restez disponible pendant la reprise de ${childName} et évitez d’ajouter du bruit sans besoin.`,
        de: `Bleiben Sie erreichbar, während ${childName} in der Erholungsbeobachtung ist, und vermeiden Sie unnötigen Lärm.`,
        zh: `在 ${childName} 仍处于恢复观察时保持可联系，除非需要支持否则不要增加干扰。`,
        ja: `${childName} の回復見守り中は連絡可能な状態を保ち、必要がなければ余計な動きは避けてください。`,
        pt: `Fique disponível enquanto ${childName} permanece em recuperação e evite ruído extra sem necessidade.`,
        he: `היו זמינים בזמן ש-${childName} במעקב התאוששות, והימנעו מרעש מיותר.`,
        ar: `ابقَ متاحًا بينما ${childName} في مراقبة التعافي وتجنب إضافة ضوضاء دون حاجة.`,
      }),
    },
    reduced_data: {
      headline: pick(lang, {
        en: 'Data confidence is reduced right now.',
        ru: 'Достоверность данных сейчас снижена.',
        uk: 'Достовірність даних зараз знижена.',
        es: 'La confianza en los datos está reducida ahora.',
        fr: 'La confiance dans les données est réduite en ce moment.',
        de: 'Das Vertrauen in die Daten ist gerade reduziert.',
        zh: '当前数据可信度降低。',
        ja: '現在、データの信頼度が下がっています。',
        pt: 'A confiança nos dados está reduzida agora.',
        he: 'רמת הביטחון בנתונים ירדה כרגע.',
        ar: 'ثقة البيانات منخفضة الآن.',
      }),
      detail: pick(lang, {
        en: 'Use the current state as guidance, but slow down decisions and confirm the sensor connection before reacting hard.',
        ru: 'Ориентируйтесь на текущее состояние, но не торопитесь — проверьте связь с сенсором, прежде чем резко реагировать.',
        uk: 'Орієнтуйтесь на поточний стан, але не поспішайте — перевірте зв’язок із сенсором, перш ніж різко реагувати.',
        es: 'Usa el estado actual como guía, pero ve más despacio y confirma la conexión del sensor antes de reaccionar con fuerza.',
        fr: 'Utilisez l’état actuel comme guide, mais ralentissez et confirmez la connexion capteur avant de réagir fort.',
        de: 'Nutzen Sie den aktuellen Zustand als Orientierung, aber entschleunigen Sie und prüfen Sie die Sensorverbindung vor harter Reaktion.',
        zh: '以当前状态为参考，但在强烈反应前先放慢并确认传感器连接。',
        ja: '現在の状態を目安にしつつ、強く反応する前にセンサー接続を確認してください。',
        pt: 'Use o estado atual como guia, mas desacelere e confirme a conexão do sensor antes de reagir com força.',
        he: 'השתמשו במצב הנוכחי כהכוונה, אך האטו ואשרו את חיבור החיישן לפני תגובה חזקה.',
        ar: 'استخدم الحالة الحالية كمرشد، لكن تمهل وأكد اتصال المستشعر قبل التفاعل بقوة.',
      }),
    },
    needs_attention: {
      headline: pick(lang, {
        en: 'The household needs a clear next step right now.',
        ru: 'Семье сейчас нужен понятный следующий шаг.',
        uk: 'Сім’ї зараз потрібен зрозумілий наступний крок.',
        es: 'La familia necesita un siguiente paso claro ahora.',
        fr: 'Le foyer a besoin d’une prochaine étape claire maintenant.',
        de: 'Der Haushalt braucht jetzt einen klaren nächsten Schritt.',
        zh: '家庭现在需要一个明确的下一步。',
        ja: '世帯には今、明確な次の一手が必要です。',
        pt: 'A família precisa de um próximo passo claro agora.',
        he: 'המשפחה זקוקה עכשיו לצעד הבא ברור.',
        ar: 'الأسرة تحتاج الآن إلى خطوة تالية واضحة.',
      }),
      detail: pick(lang, {
        en: 'Keep the responder, the treatment step, and the backup path explicit until the cycle is covered.',
        ru: 'Держите ответственного, шаг лечения и резервный путь явными, пока цикл не будет закрыт.',
        uk: 'Тримайте відповідального, крок лікування та резервний шлях явними, доки цикл не буде закритий.',
        es: 'Mantén claro quién responde, el paso de tratamiento y la ruta de respaldo hasta cubrir el ciclo.',
        fr: 'Gardez le répondant, l’étape de traitement et le relais explicites jusqu’à couvrir le cycle.',
        de: 'Halten Sie Verantwortlichen, Behandlungsschritt und Backup-Pfad klar, bis der Zyklus abgedeckt ist.',
        zh: '在周期覆盖之前，明确响应者、处理步骤和后备路径。',
        ja: 'サイクルがカバーされるまで、対応者、処置、補助の流れを明確に保ってください。',
        pt: 'Mantenha explícitos quem responde, o passo de tratamento e o caminho de reforço até cobrir o ciclo.',
        he: 'השאירו את המגיב, שלב הטיפול ונתיב הגיבוי ברורים עד שהמחזור מכוסה.',
        ar: 'اجعل المستجيب وخطوة العلاج ومسار الاحتياط واضحين حتى تُغطى الدورة.',
      }),
    },
    needs_attention_caregiver: {
      headline: pick(lang, {
        en: 'The household needs a clear next step right now.',
        ru: 'Семье сейчас нужен понятный следующий шаг.',
        uk: 'Сім’ї зараз потрібен зрозумілий наступний крок.',
        es: 'La familia necesita un siguiente paso claro ahora.',
        fr: 'Le foyer a besoin d’une prochaine étape claire maintenant.',
        de: 'Der Haushalt braucht jetzt einen klaren nächsten Schritt.',
        zh: '家庭现在需要一个明确的下一步。',
        ja: '世帯には今、明確な次の一手が必要です。',
        pt: 'A família precisa de um próximo passo claro agora.',
        he: 'המשפחה זקוקה עכשיו לצעד הבא ברור.',
        ar: 'الأسرة تحتاج الآن إلى خطوة تالية واضحة.',
      }),
      detail: pick(lang, {
        en: 'Confirm who is leading the response and be ready to step in without adding confusion.',
        ru: 'Уточните, кто ведёт ответ, и будьте готовы подключиться без лишней путаницы.',
        uk: 'Уточніть, хто веде відповідь, і будьте готові підключитися без зайвої плутанини.',
        es: 'Confirma quién lidera la respuesta y prepárate para entrar sin añadir confusión.',
        fr: 'Confirmez qui mène la réponse et soyez prêt à intervenir sans ajouter de confusion.',
        de: 'Klären Sie, wer die Reaktion führt, und seien Sie bereit einzuspringen, ohne Verwirrung zu stiften.',
        zh: '确认谁在主导响应，并准备好介入且不增加混乱。',
        ja: '誰が対応をリードしているか確認し、混乱を増やさずに入れる準備をしてください。',
        pt: 'Confirme quem lidera a resposta e fique pronto para entrar sem gerar confusão.',
        he: 'אשרו מי מוביל את התגובה והיו מוכנים להיכנס בלי ליצור בלבול.',
        ar: 'أكد من يقود الاستجابة وكن مستعدًا للتدخل دون إضافة ارتباك.',
      }),
    },
    watch_cycle: {
      headline: pick(lang, {
        en: 'The day is stable, but this cycle still needs watching.',
        ru: 'День стабилен, но этот цикл всё ещё требует наблюдения.',
        uk: 'День стабільний, але цей цикл ще потребує спостереження.',
        es: 'El día es estable, pero este ciclo aún necesita vigilancia.',
        fr: 'La journée est stable, mais ce cycle reste à surveiller.',
        de: 'Der Tag ist stabil, aber dieser Zyklus braucht noch Beobachtung.',
        zh: '今天较稳定，但本周期仍需关注。',
        ja: '今日は安定していますが、このサイクルはまだ見守りが必要です。',
        pt: 'O dia está estável, mas este ciclo ainda precisa de atenção.',
        he: 'היום יציב, אך המחזור הזה עדיין דורש מעקב.',
        ar: 'اليوم مستقر، لكن هذه الدورة ما زالت تحتاج متابعة.',
      }),
      detail: pick(lang, {
        en: 'Nothing needs a dramatic response yet. Stay close to the current trend, data quality, and responder status.',
        ru: 'Пока не нужна резкая реакция. Следите за трендом, качеством данных и статусом ответственного.',
        uk: 'Поки не потрібна різка реакція. Слідкуйте за трендом, якістю даних і статусом відповідального.',
        es: 'Todavía no hace falta una respuesta drástica. Mantente cerca de la tendencia, la calidad de datos y quién responde.',
        fr: 'Aucune réponse dramatique n’est nécessaire pour l’instant. Restez proche de la tendance, de la qualité des données et du répondant.',
        de: 'Noch keine dramatische Reaktion nötig. Bleiben Sie nah an Trend, Datenqualität und Verantwortlichem.',
        zh: '暂时不需要激烈反应。继续关注趋势、数据质量和响应者状态。',
        ja: 'まだ大げさな対応は不要です。トレンド、データ品質、対応者の状態に注意を保ってください。',
        pt: 'Ainda não é preciso uma resposta drástica. Fique atento à tendência, qualidade dos dados e quem responde.',
        he: 'עדיין אין צורך בתגובה דרמטית. הישארו קרובים למגמה, לאיכות הנתונים ולמגיב.',
        ar: 'لا حاجة لاستجابة حادة بعد. ابقَ قريبًا من الاتجاه وجودة البيانات وحالة المستجيب.',
      }),
    },
    steady_adult: {
      headline: contextualSummaries.steady.headline,
      detail: pick(lang, {
        en: 'Keep the routine simple, let the system monitor in the background, and only step up if the state changes.',
        ru: 'Держите рутину простой, пусть система мониторит в фоне, и усиливайте внимание только при изменении состояния.',
        uk: 'Тримайте рутину простою, нехай система моніторить у фоні, і посилюйте увагу лише при зміні стану.',
        es: 'Mantén la rutina simple, deja que el sistema monitoree en segundo plano y sube el nivel solo si cambia el estado.',
        fr: 'Gardez la routine simple, laissez le système surveiller en arrière-plan et n’intensifiez que si l’état change.',
        de: 'Halten Sie die Routine einfach, lassen Sie das System im Hintergrund überwachen und reagieren Sie erst bei Zustandsänderung.',
        zh: '保持日常简单，让系统在后台监控，只有状态变化时才加强关注。',
        ja: 'ルーティンをシンプルに保ち、システムにバックグラウンド監視を任せ、状態が変わったときだけ踏み込んでください。',
        pt: 'Mantenha a rotina simples, deixe o sistema monitorar em segundo plano e intensifique só se o estado mudar.',
        he: 'השאירו את השגרה פשוטה, תנו למערכת לנטר ברקע, והגבירו רק אם המצב משתנה.',
        ar: 'اجعل الروتين بسيطًا، ودع النظام يراقب في الخلفية، وزد الانتباه فقط عند تغير الحالة.',
      }),
    },
  };

  if (contextualSummaries[key]) {
    return {
      tone: payload.contextualSummary?.tone || 'calm',
      headline: pick(lang, contextualSummaries[key].headline),
      detail: pick(lang, contextualSummaries[key].detail),
    };
  }

  if (key === 'steady') {
    return {
      tone: payload.contextualSummary?.tone || 'calm',
      headline: pick(lang, contextualSummaries.steady.headline),
      detail: pick(lang, {
        en: `The household is covered right now, and ${childName}'s support loop can stay calm and predictable.`,
        ru: `Семья сейчас под прикрытием, цикл поддержки ${childName} может оставаться спокойным и предсказуемым.`,
        uk: `Сім’я зараз під прикриттям, цикл підтримки ${childName} може залишатися спокійним і передбачуваним.`,
        es: `La familia está cubierta ahora y el ciclo de apoyo de ${childName} puede mantenerse calmado y predecible.`,
        fr: `Le foyer est couvert et la boucle de soutien de ${childName} peut rester calme et prévisible.`,
        de: `Der Haushalt ist abgedeckt, und ${childName}s Unterstützungsschleife kann ruhig und vorhersehbar bleiben.`,
        zh: `家庭目前已有覆盖，${childName} 的支持循环可以保持平静、可预期。`,
        ja: `世帯は今カバーされており、${childName} のサポートループは落ち着いて予測可能なままでいられます。`,
        pt: `A família está coberta agora e o ciclo de apoio de ${childName} pode permanecer calmo e previsível.`,
        he: `המשפחה מכוסה כרגע, ולולאת התמיכה של ${childName} יכולה להישאר רגועה וצפויה.`,
        ar: `الأسرة مغطاة الآن، وحلقة دعم ${childName} يمكن أن تبقى هادئة ومتوقعة.`,
      }),
    };
  }

  const template = templates[key];
  if (!template) return payload.contextualSummary;

  return {
    tone: payload.contextualSummary?.tone || 'calm',
    headline: template.headline,
    detail: template.detail,
  };
};

const localizeDailyGuidance = (lang, payload) => {
  if (!payload.dailyGuidance) return payload.dailyGuidance;
  const role = payload.user?.role === 'caregiver' || payload.user?.role === 'adult' ? payload.user.role : 'parent';
  const childName = payload.household?.childName || pick(lang, childFallback);
  const isType2 = normalizeDiabetesType(payload.household?.diabetesType) === 'type2';
  const nowTable = role === 'adult'
    ? (isType2 ? guidanceNowType2.adult : guidanceNow.adult)
    : isType2 && role === 'parent'
      ? guidanceNowType2.parent(childName)
      : guidanceNow[role](childName);
  const watchTable = isType2 ? (guidanceWatchType2[role] || guidanceWatch[role]) : guidanceWatch[role];
  const dexcomReason = payload.dexcomHealth?.reason || 'ok';
  const fallbackKey =
    dexcomReason === 'broken_auth' ? 'broken_auth' :
    dexcomReason === 'rate_limited' ? 'rate_limited' :
    dexcomReason === 'degraded_data' ? 'degraded_data' :
    dexcomReason === 'repeated_failures' || dexcomReason === 'request_failed' ? 'repeated_failures' :
    'ok';
  const checklist = guidanceChecklists[role] || guidanceChecklists.parent;

  return {
    ...payload.dailyGuidance,
    title: pick(lang, guidanceTitles[role]),
    now: pick(lang, nowTable),
    watch: pick(lang, watchTable),
    fallback: pick(lang, guidanceFallback[fallbackKey]),
    checklist: checklist.map((item) => pick(lang, item)),
  };
};

const localizeTimelineEntry = (lang, entry) => {
  if (!entry || typeof entry !== 'object') return entry;
  const copy = eventLogCopy[entry.kind];
  if (!copy) return entry;
  return {
    ...entry,
    step: pick(lang, copy.step),
    detail: copy.detail ? pick(lang, copy.detail) : entry.detail,
  };
};

const localizeTimeline = (lang, entries) =>
  Array.isArray(entries) ? entries.map((entry) => localizeTimelineEntry(lang, entry)) : entries;

const localizeReviewSummary = (lang, payload, reviewSummary) => {
  if (!reviewSummary) return reviewSummary;
  const deliveryStatus = payload.notificationSummary?.deliveryStatus;
  const escalationCount = payload.morningSummary?.escalationCount ?? 0;
  const alertsCount = payload.morningSummary?.alertsCount ?? 0;
  const headlineKey = inferReviewHeadlineKey(payload);
  const noteKeys = [
    deliveryStatus === 'escalated'
      ? 'delivery_escalated'
      : deliveryStatus === 'retrying'
        ? 'delivery_retrying'
        : 'delivery_clean',
    escalationCount > 0 ? 'backup_used' : 'primary_stable',
  ];
  const nextFocusKey =
    escalationCount > 1
      ? 'review_routing'
      : alertsCount > 2
        ? 'review_sensitivity'
        : 'keep_setup';

  return {
    ...reviewSummary,
    headline: pick(lang, reviewHeadlines[headlineKey]),
    notes: noteKeys.map((key) => pick(lang, reviewNotes[key])),
    nextFocus: pick(lang, reviewNextFocus[nextFocusKey]),
  };
};

const localizeMorningSummary = (lang, payload, morningSummary) => {
  if (!morningSummary) return morningSummary;
  const childName = payload.household?.childName || pick(lang, childFallback);
  return {
    ...morningSummary,
    headline: localizeMorningHeadline(lang, childName, morningSummary.alertsCount || 0, morningSummary.escalationCount || 0),
    outcome: pick(lang, morningOutcome),
  };
};

const localizeDexcomHealth = (lang, payload) => {
  if (!payload.dexcomHealth) return payload.dexcomHealth;
  const reason = payload.dexcomHealth.reason || 'ok';
  const headlineTable = dexcomHealthHeadlines[reason] || dexcomHealthHeadlines.ok;

  return {
    ...payload.dexcomHealth,
    headline: pick(lang, headlineTable),
  };
};

const localizeHouseholdReadiness = (lang, payload) => {
  if (!payload.householdReadiness) return payload.householdReadiness;
  const state = payload.householdReadiness.state || 'watch';
  const headlineTable = readinessHeadlines[state] || readinessHeadlines.watch;
  const caregiverName = payload.household?.caregiverName || pick(lang, { en: 'backup support', ru: 'резервная поддержка' });
  const responder = payload.currentState?.responder || pick(lang, { en: 'Unassigned', ru: 'Не назначен' });

  return {
    ...payload.householdReadiness,
    headline: pick(lang, headlineTable),
    backup: payload.household?.caregiverName
      ? pick(lang, {
          en: `Backup support is available through ${caregiverName}.`,
          ru: `Резервная поддержка доступна через ${caregiverName}.`,
          uk: `Резервна підтримка доступна через ${caregiverName}.`,
          es: `El apoyo de respaldo está disponible a través de ${caregiverName}.`,
          fr: `Le soutien de relais est disponible via ${caregiverName}.`,
          de: `Reserve-Unterstützung ist über ${caregiverName} verfügbar.`,
          zh: `可通过 ${caregiverName} 获得后备支持。`,
          ja: `${caregiverName} 経由で補助サポートが利用できます。`,
          pt: `O apoio reserva está disponível por ${caregiverName}.`,
          he: `תמיכת גיבוי זמינה דרך ${caregiverName}.`,
          ar: `الدعم الاحتياطي متاح عبر ${caregiverName}.`,
        })
      : pick(lang, {
          en: 'No backup caregiver is configured yet.',
          ru: 'Резервный опекун пока не настроен.',
          uk: 'Резервного опікуна поки не налаштовано.',
          es: 'Aún no hay cuidador de respaldo configurado.',
          fr: 'Aucun aidant de relais n’est encore configuré.',
          de: 'Noch kein Reserve-Betreuer konfiguriert.',
          zh: '尚未配置后备照护者。',
          ja: '補助ケアギバーはまだ設定されていません。',
          pt: 'Nenhum cuidador reserva configurado ainda.',
          he: 'מטפל גיבוי עדיין לא הוגדר.',
          ar: 'لم يتم إعداد مقدم رعاية احتياطي بعد.',
        }),
    responder: payload.currentState?.responder && payload.currentState.responder !== 'Unassigned'
      ? pick(lang, {
          en: `${responder} is the current responder.`,
          ru: `${responder} — текущий ответственный.`,
          uk: `${responder} — поточний відповідальний.`,
          es: `${responder} es quien responde ahora.`,
          fr: `${responder} est le répondant actuel.`,
          de: `${responder} ist derzeit verantwortlich.`,
          zh: `${responder} 是当前响应者。`,
          ja: `${responder} が現在の対応者です。`,
          pt: `${responder} é quem responde agora.`,
          he: `${responder} הוא המגיב הנוכחי.`,
          ar: `${responder} هو المستجيب الحالي.`,
        })
      : pick(lang, {
          en: 'No clear responder is set right now.',
          ru: 'Сейчас не назначен явный ответственный.',
          uk: 'Зараз не призначено явного відповідального.',
          es: 'No hay un respondedor claro asignado ahora.',
          fr: 'Aucun répondant clair n’est défini pour l’instant.',
          de: 'Derzeit ist kein klarer Verantwortlicher gesetzt.',
          zh: '当前未设置明确的响应者。',
          ja: '現在、明確な対応者が設定されていません。',
          pt: 'Nenhum respondedor claro definido agora.',
          he: 'לא הוגדר מגיב ברור כרגע.',
          ar: 'لا يوجد مستجيب واضح محدد الآن.',
        }),
  };
};

export const localizeWorkspacePayload = (lang, payload) => {
  if (!payload || payload.needsSetup) return payload;

  const localizedReview = localizeReviewSummary(lang, payload, payload.reviewSummary);
  const localizedMorning = localizeMorningSummary(lang, payload, payload.morningSummary);

  return {
    ...payload,
    dailyGuidance: localizeDailyGuidance(lang, payload),
    dexcomHealth: localizeDexcomHealth(lang, payload),
    householdReadiness: localizeHouseholdReadiness(lang, payload),
    contextualSummary: localizeContextualSummary(lang, payload),
    morningSummary: localizedMorning,
    reviewSummary: localizedReview,
    timeline: localizeTimeline(lang, payload.timeline),
    recentEvents: localizeTimeline(lang, payload.recentEvents),
    dailyHistory: Array.isArray(payload.dailyHistory)
      ? payload.dailyHistory.map((session) => ({
          ...session,
          review: localizeReviewSummary(lang, payload, session.review || localizedReview),
          timeline: localizeTimeline(lang, session.timeline),
        }))
      : payload.dailyHistory,
    selectedSession: payload.selectedSession
      ? {
          ...payload.selectedSession,
          review: localizeReviewSummary(lang, payload, payload.selectedSession.review || localizedReview),
          timeline: localizeTimeline(lang, payload.selectedSession.timeline),
        }
      : payload.selectedSession,
  };
};

export { inferContextualSummaryKey };
