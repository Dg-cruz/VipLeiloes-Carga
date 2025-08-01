import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/prod.js';
import { login } from '../modules/auth.js';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: { http_req_duration: ['p(95)<1000'] },
  tags: { test_type: 'stress' }
};

export default function () {
  const token = login();
  const res = http.get(\`\${config.baseUrl}/users\`, { headers: { Authorization: \`Bearer \${token}\` } });
  check(res, { 'status é 200': (r) => r.status === 200 });
  sleep(1);
}
