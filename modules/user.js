import http from 'k6/http';
import { baseURL, headers } from '../config/dev.js';

export function createUser(userData) {
  const url = \`\${baseURL}/users\`;
  const payload = JSON.stringify(userData);
  const params = { headers };
  const res = http.post(url, payload, params);
  return res;
}
