import React, { useEffect, useState } from 'react';
import { confirmPasswordReset, getGoogleAuthStatus, joinHousehold, requestPasswordReset, saveHousehold, signIn, signInWithGoogle, signUp, type GoogleAuthStatus } from '../lib/api';
import { AUTH_SOCIAL_COPY, COPY, RESET_COPY, type AccessCopy } from '../content/access-copy';
import { MEMBER_PATH_COPY, TYPE2_ACCESS_LABELS } from '../content/member-path-copy';
import { BRAND_TAGLINE } from '../content/landing-copy';
import { readSignupDiabetesType } from '../lib/signup-diabetes-type';
import { memberLayoutTypeClass } from '../lib/hero-path';
import { MEMBER_CHROME_COPY } from '../content/member-chrome-copy';
import { buildPublicSiteChrome } from '../lib/public-site-chrome';
import { Language, ROLE_LABELS, RTL_LANGUAGES, type DiabetesType, type UserRole } from '../types';
import { MemberZoneShell } from './layout/MemberZoneShell';
import { GoogleSignInPanel } from './auth/GoogleSignInPanel';
import { GoogleOriginSetupCallout } from './auth/GoogleOriginSetupCallout';
import { PasswordField } from './auth/PasswordField';
import { getRoleLabels } from '../lib/role-labels';
import { createInitialHouseholdForm, getHouseholdSetupSectionCopy, HouseholdSetupFields, type HouseholdFormState } from './HouseholdSetupFields';
import { t1dBtnGhost, t1dBtnPrimary, t1dInput, t1dMemberLayout, t1dSoftLabel } from '../lib/t1d-ui';
import { MemberPageHero } from './layout/MemberPageHero';
import { MEMBER_ACCESS_HERO } from '../lib/member-theme-visuals';

type Mode = 'signin' | 'signup';

export interface AccessUser {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organization?: string;
}

interface AccessViewProps {
  mode: Mode;
  lang: Language;
  setLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  diabetesType?: DiabetesType | null;
  onBack: () => void;
  onSignUp: (type: DiabetesType) => void;
  onSuccess: (user: AccessUser, options?: { householdReady?: boolean }) => void;
  onModeChange: (mode: Mode) => void;
}


const normalizeError = (message: string, copy: AccessCopy) => {
  if (message === 'Email or password is incorrect') return copy.errors.incorrectCredentials;
  if (
    message === 'This email already has a T1D account'
    || message === 'Unable to create account with these details'
  ) return copy.errors.duplicateEmail;
  if (message === 'Email and password are required') return copy.errors.missingCredentials;
  if (message === 'Request failed') return copy.errors.requestFailed;
  return message || copy.errors.requestFailed;
};

export const AccessView: React.FC<AccessViewProps> = ({
  mode,
  lang,
  setLang,
  theme,
  setTheme,
  diabetesType = null,
  onBack,
  onSignUp,
  onSuccess,
  onModeChange,
}) => {
  const presetType = diabetesType ?? readSignupDiabetesType();
  const copy = COPY[lang][mode];
  const pathCopy = presetType ? MEMBER_PATH_COPY[lang] : null;
  const pathHero = presetType && pathCopy ? pathCopy.access[mode][presetType] : null;
  const heroTitle = pathHero?.title ?? copy.title;
  const heroSubtitle = pathHero?.subtitle ?? copy.subtitle;
  const resetCopy = RESET_COPY[lang];
  const socialCopy = AUTH_SOCIAL_COPY[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const roleLabels = presetType === 'type2'
    ? getRoleLabels(lang, 'type2')
    : { ...ROLE_LABELS[lang], ...copy.roles };
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>(presetType === 'type2' ? 'adult' : 'parent');
  const [householdDiabetesType, setHouseholdDiabetesType] = useState<DiabetesType>(presetType ?? 'type1');
  const [householdForm, setHouseholdForm] = useState<HouseholdFormState>(() => createInitialHouseholdForm(lang, presetType === 'type2' ? 'adult' : 'parent', '', presetType));
  const [joinOpen, setJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleStatus, setGoogleStatus] = useState<GoogleAuthStatus | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [resetNotice, setResetNotice] = useState('');
  const memberCopy = MEMBER_CHROME_COPY[lang];
  const publicCopy = buildPublicSiteChrome(lang).copy;
  const householdSectionCopy = getHouseholdSetupSectionCopy(lang, presetType);
  const t2AccessLabels = presetType === 'type2' ? TYPE2_ACCESS_LABELS[lang] : null;
  const signupPrimaryLabel = t2AccessLabels?.signupPrimary
    ?? (lang === 'ru' ? 'Создать аккаунт и семью' : lang === 'uk' ? 'Створити акаунт і сімʼю' : 'Create account & family');

  useEffect(() => {
    setHouseholdForm(createInitialHouseholdForm(lang, role, fullName, presetType));
  }, [lang, role, fullName, presetType]);

  const setHouseholdField = (key: keyof HouseholdFormState, value: string) =>
    setHouseholdForm((current) => ({ ...current, [key]: value }));
  const labelClass = t1dSoftLabel(theme);

  useEffect(() => {
    getGoogleAuthStatus()
      .then((response) => {
        setGoogleStatus(response);
        setGoogleEnabled(response.enabled);
        setGoogleClientId(response.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
      })
      .catch(() => setGoogleEnabled(false));
  }, []);

  const handleGoogleCredential = async (credential: string) => {
    if (!googleEnabled) {
      setError(socialCopy.googleUnavailable);
      return;
    }

    setError('');
    setBusy(true);
    try {
      const response = await signInWithGoogle({
        credential,
        mode,
        role: mode === 'signup' ? role : undefined,
      });
      onSuccess({ ...response.user, password: '' }, { householdReady: response.householdReady });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '';
      if (message === 'no_account') {
        setError(socialCopy.googleNoAccount);
      } else {
        setError(socialCopy.googleFailed);
      }
    } finally {
      setBusy(false);
    }
  };

  const cardClass = theme === 'dark' ? 't1d-auth-card t1d-auth-card--dark' : 't1d-auth-card';

  const handleGoogleError = () => {
    setError(socialCopy.googleFailed);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'signin') {
        const response = await signIn({ email, password });
        onSuccess({ ...response.user, password });
        return;
      }

      if (!fullName.trim()) {
        setError(copy.errors.missingName);
        return;
      }

      if (joinOpen && inviteCode.trim()) {
        const response = await signUp({ email, password, fullName, role, organization });
        await joinHousehold({ inviteCode: inviteCode.trim().toUpperCase() });
        onSuccess({ ...response.user, password }, { householdReady: true });
        return;
      }

      const response = await signUp({ email, password, fullName, role, organization });
      await saveHousehold({ ...householdForm, diabetesType: presetType ?? householdDiabetesType });
      onSuccess({ ...response.user, password }, { householdReady: true });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '';
      setError(normalizeError(message, copy));
    } finally {
      setBusy(false);
    }
  };

  return (
    <MemberZoneShell
      lang={lang}
      setLang={setLang}
      theme={theme}
      setTheme={setTheme}
      isRTL={isRTL}
      diabetesType={presetType}
      activePageLabel={mode === 'signin' ? memberCopy.activeAccessSignin : memberCopy.activeAccessSignup}
      accountLabel={publicCopy.signIn}
      onAccountAction={() => onModeChange('signin')}
      onBackToPublic={onBack}
      onSignUp={onSignUp}
      hero={(
        <MemberPageHero
          variant={MEMBER_ACCESS_HERO[mode]}
          theme={theme}
          isRTL={isRTL}
          diabetesType={presetType}
          eyebrow={presetType && pathCopy ? pathCopy.badge[presetType] : BRAND_TAGLINE[lang]}
          title={heroTitle}
          subtitle={heroSubtitle}
        />
      )}
    >
      <div className={`${t1dMemberLayout()} ${memberLayoutTypeClass(presetType)} relative`}>
        <div className={`t1d-auth-layout relative max-w-xl mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="t1d-auth-layout__panel w-full">
        <div className="t1d-auth-panel">
          <button type="button" onClick={onBack} className={`${t1dBtnGhost(theme)} mb-4`}>
            {copy.back}
          </button>

          <section className={`${cardClass} p-7 md:p-8`}>
            <h1 className="sr-only">{copy.title}</h1>

            <div className="space-y-5">
              {googleEnabled ? (
                <GoogleOriginSetupCallout
                  lang={lang === 'ru' || lang === 'uk' ? 'ru' : 'en'}
                  theme={theme}
                  info={googleStatus}
                />
              ) : null}
              {googleEnabled && googleClientId ? (
                <GoogleSignInPanel
                  clientId={googleClientId}
                  disabled={busy}
                  onCredential={handleGoogleCredential}
                  onError={handleGoogleError}
                />
              ) : null}
              <div className="t1d-auth-divider">{socialCopy.orEmail}</div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {mode === 'signup' ? (
                  <div className="grid gap-5">
                    <div className="space-y-2">
                      <label className={labelClass}>{copy.fields.fullName}</label>
                      <input className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder={copy.placeholders.fullName} />
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className={labelClass}>{copy.fields.role}</label>
                        <select className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`} value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                          {presetType === 'type2' ? (
                            <>
                              <option value="adult">{roleLabels.adult}</option>
                              <option value="parent">{roleLabels.parent}</option>
                              <option value="caregiver">{roleLabels.caregiver}</option>
                            </>
                          ) : (
                            <>
                              <option value="parent">{roleLabels.parent}</option>
                              <option value="adult">{roleLabels.adult}</option>
                              <option value="caregiver">{roleLabels.caregiver}</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className={labelClass}>{copy.fields.organization}</label>
                        <input className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`} value={organization} onChange={(event) => setOrganization(event.target.value)} placeholder={copy.placeholders.organization} />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label htmlFor="access-email" className={labelClass}>{copy.fields.email}</label>
                  <input id="access-email" className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={copy.placeholders.email} autoComplete="email" />
                </div>

                <PasswordField
                  theme={theme}
                  id={mode === 'signup' ? 'access-password-signup' : 'access-password-signin'}
                  label={copy.fields.password}
                  value={password}
                  onChange={setPassword}
                  placeholder={copy.placeholders.password}
                  showLabel={socialCopy.showPassword}
                  hideLabel={socialCopy.hidePassword}
                  rtl={isRTL}
                />

                {mode === 'signup' && !joinOpen ? (
                  <div className="space-y-4 rounded-[1.35rem] border border-orange-100/80 p-5 dark:border-slate-800">
                    <div>
                      <p className={labelClass}>{householdSectionCopy.title}</p>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{householdSectionCopy.subtitle}</p>
                    </div>
                    <HouseholdSetupFields
                      lang={lang}
                      theme={theme}
                      role={role}
                      form={householdForm}
                      onChange={setHouseholdField}
                      diabetesType={householdDiabetesType}
                      onDiabetesTypeChange={setHouseholdDiabetesType}
                      presetType={presetType}
                      compact
                    />
                  </div>
                ) : null}

                {mode === 'signup' ? (
                  <div className={`rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-slate-800 bg-slate-900/70' : 'border-orange-100 bg-orange-50/70'}`}>
                    <button type="button" onClick={() => setJoinOpen((value) => !value)} className="text-sm font-semibold text-orange-800 dark:text-amber-200">
                      {joinOpen
                        ? (t2AccessLabels?.joinCreate ?? (lang === 'ru' ? 'Создать новую семью' : 'Create new family'))
                        : (lang === 'ru' ? 'У меня есть код приглашения' : 'I have an invite code')}
                    </button>
                    {joinOpen ? (
                      <div className="mt-3 space-y-2">
                        <label className={labelClass}>{lang === 'ru' ? 'Код приглашения' : 'Invite code'}</label>
                        <input
                          className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`}
                          value={inviteCode}
                          onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                          placeholder="AB12CD"
                        />
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {mode === 'signin' ? (
                  <div className={`space-y-3 rounded-2xl border px-4 py-3 ${theme === 'dark' ? 'border-stone-800 bg-stone-900/70' : 'border-orange-100 bg-orange-50/70'}`}>
                    <button type="button" onClick={() => setResetOpen((value) => !value)} className="text-sm font-semibold text-orange-800 dark:text-amber-200">
                      {resetCopy.forgot}
                    </button>
                    {resetOpen ? (
                      <div className="space-y-3">
                        <button
                          type="button"
                          disabled={busy || !email}
                          onClick={async () => {
                            setBusy(true);
                            setError('');
                            try {
                              const response = await requestPasswordReset(email);
                              setResetNotice(response.message);
                              if (response.resetToken) setResetToken(response.resetToken);
                            } catch (nextError) {
                              setError(nextError instanceof Error ? nextError.message : copy.errors.requestFailed);
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className={t1dBtnGhost(theme)}
                        >
                          {resetCopy.sendLink}
                        </button>
                        {resetNotice ? <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">{resetNotice}</p> : null}
                        <input className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`} value={resetToken} onChange={(event) => setResetToken(event.target.value)} placeholder={resetCopy.tokenPlaceholder} />
                        <button
                          type="button"
                          disabled={busy || !resetToken || !password}
                          onClick={async () => {
                            setBusy(true);
                            setError('');
                            try {
                              await confirmPasswordReset(resetToken, password);
                              setResetNotice(resetCopy.passwordUpdated);
                            } catch (nextError) {
                              setError(nextError instanceof Error ? nextError.message : copy.errors.requestFailed);
                            } finally {
                              setBusy(false);
                            }
                          }}
                          className={t1dBtnPrimary(theme)}
                        >
                          {resetCopy.updatePassword}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">{error}</p> : null}

                <button type="submit" disabled={busy} className={`${t1dBtnPrimary(theme)} w-full disabled:cursor-not-allowed disabled:opacity-60`}>
                  {busy ? copy.working : mode === 'signup' ? signupPrimaryLabel : copy.primary}
                </button>
              </form>

              <div className={`border-t border-slate-200 pt-5 text-center dark:border-slate-800`}>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{copy.switchLabel}</p>
                <button
                  type="button"
                  onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                  className="mt-3 text-sm font-semibold text-orange-800 transition hover:text-orange-700 dark:text-amber-200 dark:hover:text-amber-100"
                >
                  {copy.switchAction}
                </button>
              </div>
            </div>
          </section>
        </div>
        </div>
        </div>
      </div>
    </MemberZoneShell>
  );
};

export default AccessView;
