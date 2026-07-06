export const BODY_TOO_LARGE = Symbol('BODY_TOO_LARGE');

export const createHttpResponse = ({
  applySecurityHeaders,
  maxBodyBytes,
  allowedOrigins,
  isProductionRuntime,
}) => {
  const sendJson = (res, status, payload, headers = {}) => {
    applySecurityHeaders(res);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      ...headers,
    });
    res.end(JSON.stringify(payload));
  };

  const sendEmpty = (res, status, headers = {}) => {
    applySecurityHeaders(res);
    res.writeHead(status, headers);
    res.end();
  };

  const readBody = async (req) => {
    const declaredLength = Number(req.headers['content-length'] || 0);
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
      return BODY_TOO_LARGE;
    }

    const chunks = [];
    let totalBytes = 0;
    for await (const chunk of req) {
      totalBytes += chunk.length;
      if (totalBytes > maxBodyBytes) return BODY_TOO_LARGE;
      chunks.push(chunk);
    }
    if (chunks.length === 0) return {};
    try {
      return JSON.parse(Buffer.concat(chunks).toString('utf8'));
    } catch {
      return null;
    }
  };

  const withCors = (req, res) => {
    const origin = req.headers.origin;
    const allowedOrigin = origin && allowedOrigins.has(origin) ? origin : null;
    if (allowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  };

  const assertMutationOrigin = (req, res) => {
    if (!isProductionRuntime) return true;
    const origin = String(req.headers.origin || '');
    if (origin && allowedOrigins.has(origin)) return true;
    const referer = String(req.headers.referer || '');
    if (referer) {
      try {
        if (allowedOrigins.has(new URL(referer).origin)) return true;
      } catch {
        // ignore malformed referer
      }
    }
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim();
    if (host) {
      const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0].trim() || 'https';
      const hostOrigin = `${proto}://${host}`;
      if (allowedOrigins.has(hostOrigin)) return true;
    }
    sendJson(res, 403, { error: 'Origin not allowed' });
    return false;
  };

  return {
    BODY_TOO_LARGE,
    sendJson,
    sendEmpty,
    readBody,
    withCors,
    assertMutationOrigin,
  };
};
