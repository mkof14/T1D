import React, { useEffect, useState } from 'react';
import { getGoogleAuthStatus, signIn, signInWithGoogle, signUp, type GoogleAuthStatus } from '../lib/api';
import { AUTH_SOCIAL_COPY, COPY, type AccessCopy } from '../content/access-copy';
import { readSignupDiabetesType } from '../lib/signup-diabetes-type';
import { Language, RTL_LANGUAGES, type DiabetesType, type UserRole } from '../types';
import { AuthScreenShell } from './auth/AuthScreenShell';
import { GoogleSignInPanel } from './auth/GoogleSignInPanel';
import { PasswordField } from './auth/PasswordField';
import { t1dBtnPrimary, t1dInput, t1dSoftLabel } from '../lib/t1d-ui';

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
  onSuccess: (user: AccessUser) => void | Promise<void>;
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
  if (message === 'Origin not allowed') return copy.errors.requestFailed;
  return message || copy.errors.requestFailed;
};

const defaultSignupRole = (presetType: DiabetesType | null): UserRole =>
  presetType === 'type2' ? 'adult' : 'parent';

export const AccessView: React.FC<AccessViewProps> = ({
  mode,
  lang,
  setLang,
  theme,
  setTheme,
  diabetesType = null,
  onBack,
  onSuccess,
  onModeChange,
}) => {
  const presetType = diabetesType ?? readSignupDiabetesType();
  const copy = COPY[lang][mode];
  const socialCopy = AUTH_SOCIAL_COPY[lang];
  const isRTL = RTL_LANGUAGES.includes(lang);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [googleClientId, setGoogleClientId] = useState('');
  const labelClass = t1dSoftLabel(theme);
  const cardClass = theme === 'dark' ? 't1d-auth-card t1d-auth-card--dark' : 't1d-auth-card';
  const diabetesTypeForApi = presetType ?? 'type1';

  useEffect(() => {
    getGoogleAuthStatus()
      .then((response: GoogleAuthStatus) => {
        setGoogleEnabled(response.enabled);
        setGoogleClientId(response.clientId || import.meta.env.VITE_GOOGLE_CLIENT_ID || '');
      })
      .catch(() => setGoogleEnabled(false));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const googleAuth = params.get('google_auth');
    if (googleAuth === 'error') setError(socialCopy.googleFailed);
    if (googleAuth === 'no_account') setError(socialCopy.googleNoAccount);
    if (googleAuth) {
      params.delete('google_auth');
      const nextSearch = params.toString();
      window.history.replaceState({}, '', `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}`);
    }
  }, [socialCopy.googleFailed, socialCopy.googleNoAccount]);

  const completeAuth = async (user: AccessUser) => {
    await onSuccess(user);
  };

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
        role: mode === 'signup' ? defaultSignupRole(presetType) : undefined,
        diabetesType: diabetesTypeForApi,
      });
      await completeAuth({ ...response.user, password: '' });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '';
      setError(message === 'no_account' ? socialCopy.googleNoAccount : socialCopy.googleFailed);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'signin') {
        const response = await signIn({ email, password, diabetesType: diabetesTypeForApi });
        await completeAuth({ ...response.user, password });
        return;
      }

      const role = defaultSignupRole(presetType);
      const fullName = email.split('@')[0]?.trim() || 'Member';
      const response = await signUp({
        email,
        password,
        fullName,
        role,
        organization: '',
        diabetesType: diabetesTypeForApi,
      });
      await completeAuth({ ...response.user, password });
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : '';
      setError(normalizeError(message, copy));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreenShell
      lang={lang}
      setLang={setLang}
      theme={theme}
      setTheme={setTheme}
      diabetesType={presetType}
      isRTL={isRTL}
      onBack={onBack}
      backLabel={copy.back}
    >
      <section className={`${cardClass} p-7 md:p-8`}>
        <h1 className="text-center text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {copy.title}
        </h1>

        <div className="mt-6 space-y-5">
          {googleEnabled && googleClientId ? (
            <GoogleSignInPanel
              clientId={googleClientId}
              disabled={busy}
              onCredential={handleGoogleCredential}
              onError={() => setError(socialCopy.googleFailed)}
            />
          ) : null}

          <div className="t1d-auth-divider">{socialCopy.orEmail}</div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="access-email" className={labelClass}>{copy.fields.email}</label>
              <input
                id="access-email"
                className={`${t1dInput(theme)} ${isRTL ? 'text-right' : 'text-left'}`}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={copy.placeholders.email}
                autoComplete="email"
                required
              />
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

            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/40 dark:text-rose-300">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className={`${t1dBtnPrimary(theme)} w-full disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {busy ? copy.working : copy.primary}
            </button>
          </form>

          <div className="border-t border-slate-200 pt-5 text-center dark:border-slate-800">
            <button
              type="button"
              onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="text-sm font-semibold text-orange-800 transition hover:text-orange-700 dark:text-amber-200 dark:hover:text-amber-100"
            >
              {copy.switchAction}
            </button>
          </div>
        </div>
      </section>
    </AuthScreenShell>
  );
};

export default AccessView;
