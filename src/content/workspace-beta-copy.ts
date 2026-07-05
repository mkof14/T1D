import type { Language } from '../types';

export type WorkspaceBetaCopy = {
  badge: string;
  title: string;
  body: string;
  dismiss: string;
};

export const WORKSPACE_BETA_COPY: Record<Language, WorkspaceBetaCopy> = {
  en: {
    badge: 'Beta',
    title: 'Support software — not a medical device',
    body: 'Steady helps families notice change and coordinate next steps. It does not diagnose, treat, or replace emergency care or your clinician.',
    dismiss: 'Dismiss',
  },
  ru: {
    badge: 'Бета',
    title: 'Программа поддержки — не медицинское изделие',
    body: 'Steady помогает семье замечать изменения и согласовывать следующий шаг. Это не диагностика, не лечение и не замена скорой помощи или врача.',
    dismiss: 'Скрыть',
  },
  uk: {
    badge: 'Бета',
    title: 'Програмне забезпечення підтримки — не медичний виріб',
    body: 'Steady допомагає сім’ї помічати зміни та узгоджувати наступний крок. Це не діагностика, не лікування і не заміна невідкладної допомоги чи лікаря.',
    dismiss: 'Приховати',
  },
  es: {
    badge: 'Beta',
    title: 'Software de apoyo — no es un dispositivo médico',
    body: 'Steady ayuda a las familias a notar cambios y coordinar el siguiente paso. No diagnostica, no trata y no reemplaza la atención de emergencia ni a su médico.',
    dismiss: 'Ocultar',
  },
  fr: {
    badge: 'Bêta',
    title: 'Logiciel d’accompagnement — pas un dispositif médical',
    body: 'Steady aide les familles à repérer les changements et coordonner la prochaine étape. Il ne diagnostique pas, ne traite pas et ne remplace pas les urgences ni le médecin.',
    dismiss: 'Masquer',
  },
  de: {
    badge: 'Beta',
    title: 'Unterstützungssoftware — kein Medizinprodukt',
    body: 'Steady hilft Familien, Veränderungen zu bemerken und den nächsten Schritt abzustimmen. Es diagnostiziert nicht, behandelt nicht und ersetzt weder Notfallversorgung noch Ärztinnen.',
    dismiss: 'Ausblenden',
  },
  zh: {
    badge: '测试版',
    title: '支持软件 — 非医疗器械',
    body: 'Steady 帮助家庭察觉变化并协调下一步。它不能诊断、治疗，也不能替代急救或医生。',
    dismiss: '关闭',
  },
  ja: {
    badge: 'ベータ',
    title: '支援ソフト — 医療機器ではありません',
    body: 'Steady は変化に気づき、次の一歩を家族で調整するためのツールです。診断・治療・救急や医師の代替にはなりません。',
    dismiss: '閉じる',
  },
  pt: {
    badge: 'Beta',
    title: 'Software de apoio — não é dispositivo médico',
    body: 'Steady ajuda famílias a notar mudanças e coordenar o próximo passo. Não diagnostica, não trata e não substitui emergência nem o médico.',
    dismiss: 'Ocultar',
  },
  he: {
    badge: 'בטא',
    title: 'תוכנת תמיכה — לא מכשיר רפואי',
    body: 'Steady עוזרת למשפחות לשים לב לשינוי ולתאם את הצעד הבא. היא לא מאבחנת, לא מטפלת ולא מחליפה חירום או רופא.',
    dismiss: 'הסתר',
  },
  ar: {
    badge: 'تجريبي',
    title: 'برنامج دعم — ليس جهازًا طبيًا',
    body: 'Steady يساعد العائلات على ملاحظة التغيّر وتنسيق الخطوة التالية. لا يشخّص ولا يعالج ولا يحل محل الطوارئ أو الطبيب.',
    dismiss: 'إخفاء',
  },
};

export const ERROR_BOUNDARY_COPY: Record<Language, { title: string; body: string; action: string }> = {
  en: { title: 'Something went wrong', body: 'Refresh the page. If the problem continues, sign out and sign in again.', action: 'Refresh' },
  ru: { title: 'Что-то пошло не так', body: 'Обновите страницу. Если проблема останется, выйдите и войдите снова.', action: 'Обновить' },
  uk: { title: 'Щось пішло не так', body: 'Оновіть сторінку. Якщо проблема залишиться, вийдіть і увійдіть знову.', action: 'Оновити' },
  es: { title: 'Algo salió mal', body: 'Actualiza la página. Si continúa, cierra sesión y vuelve a entrar.', action: 'Actualizar' },
  fr: { title: 'Une erreur est survenue', body: 'Actualisez la page. Si le problème continue, déconnectez-vous puis reconnectez-vous.', action: 'Actualiser' },
  de: { title: 'Etwas ist schiefgelaufen', body: 'Seite neu laden. Wenn es weiter passiert, abmelden und erneut anmelden.', action: 'Neu laden' },
  zh: { title: '出现问题', body: '请刷新页面。若仍有问题，请退出并重新登录。', action: '刷新' },
  ja: { title: '問題が発生しました', body: 'ページを更新してください。続く場合は一度サインアウトして再ログインしてください。', action: '更新' },
  pt: { title: 'Algo deu errado', body: 'Atualize a página. Se continuar, saia e entre novamente.', action: 'Atualizar' },
  he: { title: 'משהו השתבש', body: 'רעננו את הדף. אם הבעיה נמשכת, התנתקו והתחברו שוב.', action: 'רענון' },
  ar: { title: 'حدث خطأ', body: 'حدّث الصفحة. إذا استمرت المشكلة، سجّل الخروج ثم الدخول مجددًا.', action: 'تحديث' },
};
