import { applySecurityHeaders } from '../../security-headers.mjs';
import { ALERT_RULE_VERSION } from '../../domain/alerts/alert-rules.mjs';
import { dexcomEnvConfig } from '../../dexcom-service.mjs';
import { getStorageBackend, probeStorage } from '../../storage.mjs';
import { isUpstashRateLimitEnabled } from '../../rate-limit.mjs';
import { readOpenApiSpec } from '../../services/workspace-payload-service.mjs';
import { getSqlReadMode } from '../../infrastructure/repositories/sql-read-service.mjs';

export const handleSystemRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    sendJson,
    safeEqualString,
    CRON_SECRET,
    runBackgroundDexcomSync,
  } = ctx;

  if (req.method === 'GET' && url.pathname === '/api/health') {
    const storageProbe = await probeStorage();
    const payload = {
      ok: storageProbe.ok !== false,
      service: 't1d-api',
      timestamp: new Date().toISOString(),
      storage: storageProbe.backend || getStorageBackend(),
      rateLimit: isUpstashRateLimitEnabled() ? 'upstash' : 'memory',
      dexcomLive: dexcomEnvConfig().useLiveMode,
      alertRuleVersion: ALERT_RULE_VERSION,
      sqlRead: getSqlReadMode(),
    };
    if (storageProbe.error) payload.storageError = storageProbe.error;
    if (url.searchParams.get('verbose') === '1') {
      payload.version = process.env.npm_package_version || '1.1.0';
      payload.node = process.version;
      payload.requestId = req.requestId;
    }
    sendJson(res, 200, payload);
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/openapi.yaml') {
    try {
      const spec = await readOpenApiSpec();
      applySecurityHeaders(res);
      res.writeHead(200, { 'Content-Type': 'application/yaml; charset=utf-8' });
      res.end(spec);
    } catch {
      sendJson(res, 404, { error: 'OpenAPI spec not found' });
    }
    return true;
  }

  if (req.method === 'GET' && url.pathname === '/api/cron/dexcom-sync') {
    const authHeader = String(req.headers.authorization || '');
    if (!CRON_SECRET) {
      sendJson(res, 503, { error: 'Service unavailable' });
      return true;
    }
    if (!safeEqualString(authHeader, `Bearer ${CRON_SECRET}`)) {
      sendJson(res, 401, { error: 'Unauthorized cron request' });
      return true;
    }
    const result = await runBackgroundDexcomSync();
    sendJson(res, 200, { ok: true, ...result });
    return true;
  }

  return false;
};
