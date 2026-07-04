import { randomBytes } from 'node:crypto';

export const attachRequestContext = (req, res) => {
  const incoming = String(req.headers['x-request-id'] || '').trim();
  const requestId = incoming && incoming.length <= 64 ? incoming : randomBytes(8).toString('hex');
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  return requestId;
};
