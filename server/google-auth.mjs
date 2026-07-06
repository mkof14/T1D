import { OAuth2Client } from 'google-auth-library';

export const googleAuthConfig = () => {
  const clientId = String(process.env.T1D_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = String(process.env.T1D_GOOGLE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const siteUrl = String(
    process.env.T1D_SITE_URL || process.env.VITE_SITE_URL || 'http://localhost:3002',
  ).trim().replace(/\/$/, '');

  return { clientId, clientSecret, siteUrl };
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
