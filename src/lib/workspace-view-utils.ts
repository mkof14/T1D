import type { CurrentStatePayload, SafetyPreferencesInput } from '../lib/api';

export const STATE_TONE: Record<CurrentStatePayload['level'], string> = {
  ok: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300',
  watch: 'bg-amber-100 text-amber-900 dark:bg-amber-500/12 dark:text-amber-200',
  risk: 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300',
  critical: 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300',
  recovery: 'bg-violet-100 text-violet-800 dark:bg-violet-500/12 dark:text-violet-300',
};

export const statusTone = (status: 'done' | 'active' | 'waiting') =>
  status === 'done'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
    : status === 'active'
      ? 'bg-amber-100 text-amber-900 dark:bg-amber-500/12 dark:text-amber-200'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

export const deviceTone = (status: 'connected' | 'delayed' | 'offline') =>
  status === 'connected'
    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/12 dark:text-emerald-300'
    : status === 'delayed'
      ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/12 dark:text-amber-300'
      : 'bg-rose-100 text-rose-800 dark:bg-rose-500/12 dark:text-rose-300';

export const normalizeContactPhones = (prefs?: SafetyPreferencesInput['contactPhones']) => ({
  parent: prefs?.parent || '',
  adult: prefs?.adult || '',
  caregiver: prefs?.caregiver || '',
});
