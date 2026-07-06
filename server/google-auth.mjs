import { OAuth2Client } from 'google-auth-library';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export const googleAuthConfig = () => {
  const clientId = String(process.env.T1D_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.T1D_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const siteUrl = String(
    process.env.T1D_SITE_URL || process.env.VITE_SITE_URL || 'http://localhost:3002',
  ).trim().replace(/\/$/, '');
  const redirectUri = String(
    process.env.T1D_GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI || `${siteUrl}/api/access/google/callback`,
  ).trim();

  return { clientId, clientSecret, siteUrl, redirectUri };
};

/** GIS Sign-In uses JavaScript origins — not redirect URIs. */
export const googleJavascriptOrigins = () => [
  'http://localhost:3002',
  'http://127.0.0.1:3002',
  'https://t1-d.vercel.app',
];

export const isGoogleAuthEnabled = () => {
  const { clientId } = googleAuthConfig();
  return Boolean(clientId);
};

export const isGoogleRedirectFlowEnabled = () => {
  const { clientId, clientSecret } = googleAuthConfig();
  return Boolean(clientId && clientSecret);
};

export const verifyGoogleIdToken = async (credential) => {
  const { clientId } = googleAuthConfig();
  if (!clientId) {
    throw new Error('Google sign-in is not configured');
  }

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google credential');
  }
  return payload;
};

export const buildGoogleAuthUrl = (state, redirectUri) => {
  const { clientId } = googleAuthConfig();
  const resolvedRedirect = redirectUri || googleAuthConfig().redirectUri;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: resolvedRedirect,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'online',
    prompt: 'select_account',
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
};

export const exchangeGoogleCode = async (code, redirectUri) => {
  const { clientId, clientSecret } = googleAuthConfig();
  const resolvedRedirect = redirectUri || googleAuthConfig().redirectUri;
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: resolvedRedirect,
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

export const resolveGoogleRedirectUri = (req, explicitOrigin = '') => {
  const { redirectUri, siteUrl } = googleAuthConfig();
  const origin = String(explicitOrigin || '').trim().replace(/\/$/, '');
  if (origin) {
    try {
      const url = new URL(origin);
      if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
        return `${url.origin}/api/access/google/callback`;
      }
      if (url.hostname === 't1-d.vercel.app') {
        return `${url.origin}/api/access/google/callback`;
      }
    } catch {
      // fall through
    }
  }
  return redirectUri || `${siteUrl}/api/access/google/callback`;
};
