const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export const googleAuthConfig = () => {
  const clientId = String(process.env.T1D_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.T1D_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const apiPort = Number(process.env.T1D_API_PORT || 8790);
  const defaultRedirect = `http://127.0.0.1:${apiPort}/api/access/google/callback`;
  const redirectUri = String(process.env.T1D_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || defaultRedirect).trim();

  return { clientId, clientSecret, redirectUri };
};

export const isGoogleAuthEnabled = () => {
  const { clientId, clientSecret } = googleAuthConfig();
  return Boolean(clientId && clientSecret);
};

export const buildGoogleAuthUrl = (state) => {
  const { clientId, redirectUri } = googleAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const exchangeGoogleCode = async (code) => {
  const { clientId, clientSecret, redirectUri } = googleAuthConfig();
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'Google token exchange failed');
  }

  return payload;
};

export const fetchGoogleProfile = async (accessToken) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error_description || payload.error || 'Google profile request failed');
  }
  return payload;
};
