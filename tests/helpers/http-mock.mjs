import { Readable } from 'node:stream';

export const createMockRequest = ({ method = 'GET', url = '/', headers = {}, body = null } = {}) => {
  let bodyText = null;
  if (body != null) {
    bodyText = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const req = new Readable({
    read() {
      if (bodyText !== null) {
        this.push(bodyText);
        bodyText = null;
        return;
      }
      this.push(null);
    },
  });

  req.method = method;
  req.url = url;
  req.headers = {
    host: 'localhost:8790',
    'content-type': 'application/json',
    ...headers,
  };
  return req;
};

export const createMockResponse = () => {
  const state = {
    statusCode: 0,
    headers: {},
    body: '',
  };

  const res = {
    setHeader(name, value) {
      state.headers[String(name).toLowerCase()] = value;
    },
    writeHead(status, headers = {}) {
      state.statusCode = status;
      if (typeof headers === 'string') {
        state.headers['content-type'] = headers;
        return;
      }
      for (const [key, value] of Object.entries(headers)) {
        state.headers[key.toLowerCase()] = value;
      }
    },
    end(chunk) {
      if (chunk) state.body += chunk;
    },
  };

  return {
    res,
    get status() {
      return state.statusCode;
    },
    get headers() {
      return state.headers;
    },
    json() {
      return state.body ? JSON.parse(state.body) : null;
    },
    text() {
      return state.body;
    },
  };
};

export const invoke = async (handleRequest, options = {}) => {
  const req = createMockRequest(options);
  const mock = createMockResponse();
  await handleRequest(req, mock.res);
  return mock;
};

export const cookieFromResponse = (mock, cookieName) => {
  const setCookie = mock.headers['set-cookie'];
  if (!setCookie) return '';
  const raw = Array.isArray(setCookie) ? setCookie.join('; ') : setCookie;
  const match = raw.match(new RegExp(`${cookieName}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : '';
};
