import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/staging.js';
import { login } from '../modules/auth.js';

export let options = {
  vus: 50,
  duration: '1m',
  thresholds: { http_req_duration: ['p(95)<700'] },
  tags: { test_type: 'load' }
};

export default function () {
  const token = login();
  const res = http.get(\`\${config.baseUrl}/users\`, { headers: { Authorization: \`Bearer \${token}\` } });
  check(res, { 'status é 200': (r) => r.status === 200 });
  sleep(1);
}
