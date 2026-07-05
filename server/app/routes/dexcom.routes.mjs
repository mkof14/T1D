import { applySecurityHeaders } from '../../security-headers.mjs';
import {
  connectDexcom,
  dexcomOAuthCallback,
  dexcomOAuthStart,
  dexcomEnvConfig,
  disconnectDexcom,
  refreshDexcomToken,
} from '../../dexcom-service.mjs';

export const handleDexcomRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    sendJson,
    readBody,
    BODY_TOO_LARGE,
    findSessionUser,
    readHouseholds,
    writeHouseholds,
    consumeOAuthState,
    createOAuthState,
    appendDexcomAudit,
    applyDexcomPollToHousehold,
    buildWorkspacePayloadForRequest,
    safeText,
    SITE_URL,
    isProductionRuntime,
  } = ctx;

  if (req.method === 'GET' && url.pathname === '/api/dexcom/oauth/callback') {
    const code = safeText(url.searchParams.get('code'), 240);
    const state = safeText(url.searchParams.get('state'), 120);
    const oauthState = state ? await consumeOAuthState(state) : null;
    const redirectBase = `${SITE_URL.replace(/\/$/, '')}/workspace`;
    const current = await findSessionUser(req);

    if (!code || !oauthState || !current || current.user.householdId !== oauthState.householdId) {
      applySecurityHeaders(res);
      res.writeHead(302, { Location: `${redirectBase}?dexcom_auth=error` });
      res.end();
      return true;
    }

    if (oauthState.userId && oauthState.userId !== current.user.id) {
      applySecurityHeaders(res);
      res.writeHead(302, { Location: `${redirectBase}?dexcom_auth=error` });
      res.end();
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === oauthState.householdId);
    if (householdIndex === -1) {
      applySecurityHeaders(res);
      res.writeHead(302, { Location: `${redirectBase}?dexcom_auth=error` });
      res.end();
      return true;
    }

    const nextDexcom = await dexcomOAuthCallback(households[householdIndex], code);
    households[householdIndex] = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'oauth_callback',
      status: nextDexcom.status === 'connected' ? 'ok' : 'error',
      headline: 'Dexcom OAuth callback',
      detail: nextDexcom.message,
    });
    await writeHouseholds(households);
    const status = nextDexcom.status === 'connected' ? 'success' : 'error';
    applySecurityHeaders(res);
    res.writeHead(302, { Location: `${redirectBase}?dexcom_auth=${status}` });
    res.end();
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/oauth/start') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const start = dexcomOAuthStart(
      households[householdIndex],
      current.user.fullName || current.user.email,
      await createOAuthState(households[householdIndex].id, current.user.id)
    );
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: start.dexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'oauth_start',
      status: start.dexcom.configStatus === 'ready' ? 'ok' : 'warning',
      headline: 'Dexcom OAuth start',
      detail: start.dexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, { workspace: buildWorkspacePayloadForRequest(req, current.user, nextHousehold), redirectUrl: start.redirectUrl });
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/oauth/callback') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const body = await readBody(req);
    if (body === BODY_TOO_LARGE) {
      sendJson(res, 413, { error: 'Request body too large' });
      return true;
    }
    if (!body || typeof body !== 'object') {
      sendJson(res, 400, { error: 'Invalid JSON body' });
      return true;
    }

    const stateToken = safeText(body.state, 120);
    const oauthState = stateToken ? await consumeOAuthState(stateToken) : null;
    if (!oauthState || oauthState.householdId !== current.user.householdId) {
      sendJson(res, 400, { error: 'Invalid or expired OAuth state' });
      return true;
    }
    if (oauthState.userId && oauthState.userId !== current.user.id) {
      sendJson(res, 403, { error: 'OAuth state does not match the current session' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const nextDexcom = await dexcomOAuthCallback(households[householdIndex], safeText(body?.code, 240));
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'oauth_callback',
      status: nextDexcom.status === 'connected' ? 'ok' : 'error',
      headline: 'Dexcom OAuth callback',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/refresh-token') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const nextDexcom = await refreshDexcomToken(households[householdIndex]);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'token_refresh',
      status: nextDexcom.status === 'connected' ? 'ok' : 'error',
      headline: 'Dexcom token refresh',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/connect') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    if (isProductionRuntime && !dexcomEnvConfig().useLiveMode && process.env.T1D_ALLOW_MOCK_DEXCOM !== 'true') {
      sendJson(res, 403, { error: 'Mock Dexcom connect is disabled in production. Use OAuth live mode.' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const body = await readBody(req);
    const nextDexcom = connectDexcom(households[householdIndex], safeText(body?.accountName, 120) || current.user.fullName || current.user.email);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'connect',
      status: 'ok',
      headline: 'Dexcom connected',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/disconnect') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const nextDexcom = disconnectDexcom(households[householdIndex]);
    const nextHousehold = appendDexcomAudit({
      ...households[householdIndex],
      dexcom: nextDexcom,
      updatedAt: new Date().toISOString(),
    }, {
      kind: 'disconnect',
      status: 'warning',
      headline: 'Dexcom disconnected',
      detail: nextDexcom.message,
    });
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  if (req.method === 'POST' && url.pathname === '/api/dexcom/poll') {
    const current = await findSessionUser(req);
    if (!current) {
      sendJson(res, 401, { error: 'Unauthorized' });
      return true;
    }

    const households = await readHouseholds();
    const householdIndex = households.findIndex((entry) => entry.id === current.user.householdId);
    if (householdIndex === -1) {
      sendJson(res, 400, { error: 'Household setup is required first' });
      return true;
    }

    const nextHousehold = await applyDexcomPollToHousehold(households[householdIndex], 'manual');
    households[householdIndex] = nextHousehold;
    await writeHouseholds(households);
    sendJson(res, 200, buildWorkspacePayloadForRequest(req, current.user, nextHousehold));
    return true;
  }

  return false;
};
