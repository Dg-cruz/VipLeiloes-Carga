// Verifica se o sistema básico está funcionando — execução curta, com poucos usuários.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseURL } from '../../config/staging.js'; // importa a URL base da pasta config

export let options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'], // Falha < 1%
    http_req_duration: ['p(95)<500'], // 95% abaixo de 500ms
  },
  tags: { test_type: 'smoke' }
};

export default function () {
  const res = http.get(baseURL);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo de resposta < 4s': (r) => r.timings.duration < 4000,
  });

  sleep(1); // pausa entre requisições
}