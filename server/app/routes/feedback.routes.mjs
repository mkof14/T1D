import { randomBytes } from 'node:crypto';

export const handleFeedbackRoutes = async (ctx) => {
  const {
    req,
    res,
    url,
    lang,
    sendJson,
    readBody,
    BODY_TOO_LARGE,
    findSessionUser,
    feedbackRateLimit,
    clientIp,
    t,
    safeText,
    readJson,
    writeJson,
    FEEDBACK_FILE,
  } = ctx;

  if (req.method !== 'POST' || url.pathname !== '/api/feedback') {
    return false;
  }

  const limit = await feedbackRateLimit(clientIp(req));
  if (!limit.allowed) {
    sendJson(res, 429, { error: t(lang, 'rateLimited') });
    return true;
  }

  const body = await readBody(req);
  if (body === BODY_TOO_LARGE) {
    sendJson(res, 413, { error: 'Request body too large' });
    return true;
  }
  const message = safeText(body?.message, 2000);
  const rating = Math.max(1, Math.min(5, Number(body?.rating || 0) || 0));
  if (!message) {
    sendJson(res, 400, { error: 'Message is required' });
    return true;
  }

  const current = await findSessionUser(req);
  const data = await readJson(FEEDBACK_FILE, { entries: [] });
  const entries = Array.isArray(data.entries) ? data.entries : [];
  entries.unshift({
    id: randomBytes(8).toString('hex'),
    time: new Date().toISOString(),
    message,
    rating: rating || null,
    userId: current?.user?.id || '',
    email: current?.user?.email || safeText(body?.email, 160),
  });
  await writeJson(FEEDBACK_FILE, { entries: entries.slice(0, 200) });
  sendJson(res, 201, { ok: true });
  return true;
};
