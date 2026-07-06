import '../server/load-env.mjs';
import { googleAuthConfig, googleJavascriptOrigins, isGoogleAuthEnabled } from '../server/google-auth.mjs';

const { clientId, siteUrl } = googleAuthConfig();

console.log(JSON.stringify({
  ok: isGoogleAuthEnabled(),
  flow: 'google-identity-services',
  siteUrl,
  clientId,
  addTheseJavaScriptOriginsInGoogleConsole: googleJavascriptOrigins(),
  googleConsoleSteps: [
    'Open https://console.cloud.google.com/apis/credentials',
    `Open OAuth client: ${clientId}`,
    'Application type must be Web application',
    'Under Authorized JavaScript origins, add EVERY origin in addTheseJavaScriptOriginsInGoogleConsole',
    'Redirect URIs are NOT required for this sign-in flow',
    'OAuth consent screen → Test users → add your Gmail if app is in Testing',
    'Save, wait 1 minute, retry Sign in with Google',
  ],
}, null, 2));

process.exit(isGoogleAuthEnabled() ? 0 : 1);
