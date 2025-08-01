import http from 'k6/http';
import { config } from '../config/dev.js';

export function login() {
  const payload = JSON.stringify({ username: 'admin', password: '123456' });
  const res = http.post(\`\${config.baseUrl}/auth/login\`, payload, { headers: config.headers });
  return res.json('token');
}
