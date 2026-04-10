import { handleRequest } from '../server/index.mjs';

export default async function vercelHandler(req, res) {
  return handleRequest(req, res);
}
