// Aumenta gradualmente o número de usuários para descobrir o ponto de quebra.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseURL } from '../config/staging.js'; // importa a URL base da pasta config

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
  },
  tags: { test_type: 'stress' }
};

export default function () {
  const res = http.get(baseURL);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo de resposta < 4s': (r) => r.timings.duration < 4000,
  });

  sleep(1); // pausa entre requisições
}
