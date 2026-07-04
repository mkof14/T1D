const SUPPORTED = new Set(['en', 'ru', 'uk', 'es', 'fr', 'de', 'zh', 'ja', 'pt', 'he', 'ar']);

export const normalizeLang = (value) => {
  const lang = String(value || 'en').trim().toLowerCase();
  return SUPPORTED.has(lang) ? lang : 'en';
};

export const backendCopy = {
  dexcomPollFailed: {
    en: (source) => `Dexcom ${source} poll failed`,
    ru: (source) => `Ошибка опроса Dexcom (${source})`,
    uk: (source) => `Помилка опитування Dexcom (${source})`,
    es: (source) => `Falló la consulta Dexcom (${source})`,
    fr: (source) => `Échec du sondage Dexcom (${source})`,
    de: (source) => `Dexcom-Abfrage fehlgeschlagen (${source})`,
    zh: (source) => `Dexcom 轮询失败（${source}）`,
    ja: (source) => `Dexcom ポーリング失敗（${source}）`,
    pt: (source) => `Falha na consulta Dexcom (${source})`,
    he: (source) => `שגיאה בסקר Dexcom (${source})`,
    ar: (source) => `فشل استطلاع Dexcom (${source})`,
  },
  dexcomPollCompleted: {
    en: (source) => `Dexcom ${source} poll completed`,
    ru: (source) => `Опрос Dexcom завершён (${source})`,
    uk: (source) => `Опитування Dexcom завершено (${source})`,
    es: (source) => `Consulta Dexcom completada (${source})`,
    fr: (source) => `Sondage Dexcom terminé (${source})`,
    de: (source) => `Dexcom-Abfrage abgeschlossen (${source})`,
    zh: (source) => `Dexcom 轮询完成（${source}）`,
    ja: (source) => `Dexcom ポーリング完了（${source}）`,
    pt: (source) => `Consulta Dexcom concluída (${source})`,
    he: (source) => `סקר Dexcom הושלם (${source})`,
    ar: (source) => `اكتمل استطلاع Dexcom (${source})`,
  },
  rateLimited: {
    en: 'Too many attempts. Please wait and try again.',
    ru: 'Слишком много попыток. Подождите и попробуйте снова.',
    uk: 'Забагато спроб. Зачекайте і спробуйте знову.',
    es: 'Demasiados intentos. Espera e inténtalo de nuevo.',
    fr: 'Trop de tentatives. Attendez puis réessayez.',
    de: 'Zu viele Versuche. Bitte warten und erneut versuchen.',
    zh: '尝试次数过多，请稍后再试。',
    ja: '試行回数が多すぎます。しばらく待ってから再試行してください。',
    pt: 'Muitas tentativas. Aguarde e tente novamente.',
    he: 'יותר מדי ניסיונות. המתינו ונסו שוב.',
    ar: 'محاولات كثيرة جداً. انتظر ثم حاول مرة أخرى.',
  },
  passwordResetSent: {
    en: 'If that email exists, a reset link has been prepared.',
    ru: 'Если такой email существует, ссылка для сброса подготовлена.',
    uk: 'Якщо такий email існує, посилання для скидання підготовлено.',
    es: 'Si ese correo existe, se preparó un enlace de restablecimiento.',
    fr: 'Si cet e-mail existe, un lien de réinitialisation a été préparé.',
    de: 'Falls diese E-Mail existiert, wurde ein Reset-Link vorbereitet.',
    zh: '如果该邮箱存在，已准备重置链接。',
    ja: 'そのメールが存在する場合、リセットリンクを用意しました。',
    pt: 'Se esse e-mail existir, um link de redefinição foi preparado.',
    he: 'אם האימייל קיים, נוצר קישור לאיפוס.',
    ar: 'إذا كان البريد موجوداً، تم تجهيز رابط إعادة التعيين.',
  },
  invalidResetToken: {
    en: 'Reset link is invalid or expired.',
    ru: 'Ссылка для сброса недействительна или истекла.',
    uk: 'Посилання для скидання недійсне або прострочене.',
    es: 'El enlace de restablecimiento no es válido o expiró.',
    fr: 'Le lien de réinitialisation est invalide ou expiré.',
    de: 'Reset-Link ist ungültig oder abgelaufen.',
    zh: '重置链接无效或已过期。',
    ja: 'リセットリンクが無効または期限切れです。',
    pt: 'O link de redefinição é inválido ou expirou.',
    he: 'קישור האיפוס לא תקף או שפג תוקפו.',
    ar: 'رابط إعادة التعيين غير صالح أو منتهٍ.',
  },
};

export const t = (lang, key, ...args) => {
  const entry = backendCopy[key];
  if (!entry) return key;
  const normalized = normalizeLang(lang);
  const localized =
    typeof entry === 'object' && entry.en !== undefined
      ? entry[normalized] || entry.en
      : entry;
  return typeof localized === 'function' ? localized(...args) : localized;
};

export const requestLang = (req) => normalizeLang(req.headers['x-t1d-lang'] || req.headers['accept-language']?.split(',')[0]?.slice(0, 2));
