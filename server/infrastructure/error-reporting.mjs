let sentryClient = null;

export const initErrorReporting = async () => {
  const dsn = String(process.env.SENTRY_DSN || process.env.T1D_SENTRY_DSN || process.env.VITE_SENTRY_DSN || '').trim();
  if (!dsn) return;

  try {
    const Sentry = await import('@sentry/node');
    Sentry.init({
      dsn,
      environment: process.env.VERCEL ? 'production' : 'development',
      release: `steady@${process.env.npm_package_version || '1.1.0'}`,
      tracesSampleRate: 0,
    });
    sentryClient = Sentry;
  } catch (error) {
    console.warn('[t1d-api] sentry init skipped', error instanceof Error ? error.message : error);
  }
};

export const captureServerException = (error, context = {}) => {
  if (sentryClient) {
    sentryClient.captureException(error, { extra: context });
    return;
  }
  console.error('[t1d-api] unhandled error', error, context);
};
