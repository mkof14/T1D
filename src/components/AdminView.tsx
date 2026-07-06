import React, { useCallback, useEffect, useState } from 'react';
import type { AdminHouseholdsPayload, AdminSummaryPayload } from '../lib/api';
import { getAdminHouseholds, getAdminSummary } from '../lib/api';
import { T1DPageBackdrop } from './layout/T1DPageBackdrop';
import {
  t1dBtnPrimary,
  t1dBtnSecondary,
  t1dCardHeading,
  t1dDisplayTitle,
  t1dEyebrow,
  t1dHelpText,
  t1dInput,
  t1dPanelCompactSurface,
  t1dPanelPrimary,
  t1dShell,
  t1dSoftLabel,
  type T1DTheme,
} from '../lib/t1d-ui';

const ADMIN_TOKEN_KEY = 't1d_admin_token';

interface AdminViewProps {
  theme: T1DTheme;
  setTheme: (theme: T1DTheme) => void;
  onBackToPublic: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; theme: T1DTheme }> = ({ label, value, theme }) => (
  <div className={t1dPanelCompactSurface(theme)}>
    <p className={t1dSoftLabel(theme)}>{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
  </div>
);

export const AdminView: React.FC<AdminViewProps> = ({ theme, setTheme, onBackToPublic }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [summary, setSummary] = useState<AdminSummaryPayload | null>(null);
  const [households, setHouseholds] = useState<AdminHouseholdsPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (activeToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const [nextSummary, nextHouseholds] = await Promise.all([
        getAdminSummary(activeToken),
        getAdminHouseholds(activeToken, 30),
      ]);
      setSummary(nextSummary);
      setHouseholds(nextHouseholds);
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      if (status === 401 || status === 403) {
        window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        setSummary(null);
        setHouseholds(null);
        setError('Invalid admin token.');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadDashboard(token);
  }, [token, loadDashboard]);

  const handleUnlock = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) return;
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, trimmed);
    setToken(trimmed);
    setTokenInput('');
  };

  const handleSignOut = () => {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setSummary(null);
    setHouseholds(null);
    setError(null);
  };

  return (
    <div className={`${t1dShell(theme)} relative min-h-screen`}>
      <T1DPageBackdrop theme={theme} />
      <div className="t1d-container relative z-10 py-8 md:py-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={t1dEyebrow(theme)}>Operations</p>
            <h1 className={t1dDisplayTitle()}>T1D Admin</h1>
            <p className={`mt-2 max-w-2xl ${t1dHelpText(theme)}`}>
              Read-only service overview. Uses Bearer token (`T1D_CRON_SECRET` or `T1D_ADMIN_SECRET`).
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={t1dBtnSecondary(theme)} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button type="button" className={t1dBtnSecondary(theme)} onClick={onBackToPublic}>
              Back to site
            </button>
            {token ? (
              <button type="button" className={t1dBtnSecondary(theme)} onClick={handleSignOut}>
                Clear token
              </button>
            ) : null}
          </div>
        </div>

        {!token ? (
          <form className={`${t1dPanelPrimary(theme)} max-w-lg space-y-4`} onSubmit={handleUnlock}>
            <h2 className={t1dCardHeading()}>Admin token</h2>
            <p className={t1dHelpText(theme)}>Stored in session storage for this browser tab only.</p>
            <label className="block space-y-2">
              <span className={t1dSoftLabel(theme)}>Bearer secret</span>
              <input
                type="password"
                autoComplete="off"
                className={`${t1dInput(theme)} w-full`}
                value={tokenInput}
                onChange={(event) => setTokenInput(event.target.value)}
                placeholder="T1D_CRON_SECRET"
              />
            </label>
            {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}
            <button type="submit" className={t1dBtnPrimary(theme)} disabled={!tokenInput.trim()}>
              Unlock dashboard
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" className={t1dBtnPrimary(theme)} disabled={loading} onClick={() => void loadDashboard(token)}>
                {loading ? 'Refreshing…' : 'Refresh'}
              </button>
              {summary?.timestamp ? (
                <p className={t1dHelpText(theme)}>Updated {new Date(summary.timestamp).toLocaleString()}</p>
              ) : null}
            </div>

            {error ? <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p> : null}

            {summary ? (
              <>
                <section className={`${t1dPanelPrimary(theme)} space-y-4`}>
                  <h2 className={t1dCardHeading()}>Runtime</h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard theme={theme} label="Storage" value={summary.storage} />
                    <StatCard theme={theme} label="SQL read mode" value={summary.sqlRead} />
                    <StatCard theme={theme} label="Rate limit" value={summary.rateLimit} />
                    <StatCard theme={theme} label="Dexcom live" value={summary.dexcomLive ? 'yes' : 'no'} />
                  </div>
                  <p className={t1dHelpText(theme)}>Alert rules: {summary.alertRuleVersion}</p>
                  {summary.recommendations.length > 0 ? (
                    <ul className={`list-disc space-y-1 pl-5 ${t1dHelpText(theme)}`}>
                      {summary.recommendations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className={t1dHelpText(theme)}>No recommendations.</p>
                  )}
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                  <div className={`${t1dPanelPrimary(theme)} space-y-3`}>
                    <h2 className={t1dCardHeading()}>KV / file counts</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <StatCard theme={theme} label="Households" value={summary.kv.households} />
                      <StatCard theme={theme} label="Users" value={summary.kv.users} />
                      <StatCard theme={theme} label="Active alerts" value={summary.kv.activeAlerts} />
                      <StatCard theme={theme} label="In-memory notifications" value={summary.kv.inMemoryNotifications} />
                    </div>
                  </div>
                  <div className={`${t1dPanelPrimary(theme)} space-y-3`}>
                    <h2 className={t1dCardHeading()}>SQL counts</h2>
                    {summary.sql ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <StatCard theme={theme} label="Households" value={summary.sql.households} />
                        <StatCard theme={theme} label="Users" value={summary.sql.users} />
                        <StatCard theme={theme} label="Active alerts" value={summary.sql.active_alerts} />
                        <StatCard theme={theme} label="Notifications" value={summary.sql.notification_deliveries} />
                        <StatCard theme={theme} label="Escalations" value={summary.sql.escalations} />
                        <StatCard theme={theme} label="Glucose readings" value={summary.sql.glucose_readings} />
                      </div>
                    ) : (
                      <p className={t1dHelpText(theme)}>DATABASE_URL not configured or SQL unavailable.</p>
                    )}
                  </div>
                </section>
              </>
            ) : null}

            {households ? (
              <section className={`${t1dPanelPrimary(theme)} space-y-4`}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className={t1dCardHeading()}>Households</h2>
                  <p className={t1dHelpText(theme)}>
                    Showing {households.items.length} of {households.total}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className={t1dSoftLabel(theme)}>
                      <tr>
                        <th className="px-3 py-2">Name</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Stage</th>
                        <th className="px-3 py-2">Responder</th>
                        <th className="px-3 py-2">Dexcom</th>
                        <th className="px-3 py-2">Alerts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {households.items.map((item) => (
                        <tr key={item.id} className="border-t border-black/5 dark:border-white/10">
                          <td className="px-3 py-2 font-medium">{item.householdName}</td>
                          <td className="px-3 py-2">{item.diabetesType}</td>
                          <td className="px-3 py-2">{item.stage}</td>
                          <td className="px-3 py-2">{item.responderState}</td>
                          <td className="px-3 py-2">{item.dexcomStatus}</td>
                          <td className="px-3 py-2 tabular-nums">{item.alertsCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {households.items.length === 0 ? <p className={`px-3 py-4 ${t1dHelpText(theme)}`}>No households yet.</p> : null}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
