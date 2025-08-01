import http from 'k6/http';
import { config } from '../config/dev.js';

export function createUser(userData) {
  const res = http.post(\`\${config.baseUrl}/users\`, JSON.stringify(userData), { headers: config.headers });
  return res;
}
