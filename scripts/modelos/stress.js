// Aumenta gradualmente o número de usuários para descobrir o ponto de quebra.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseURL } from '../../config/staging.js'; // importa a URL base da pasta config

export let options = {
  stages: [
  { duration: '2m', target: 100 },
  { duration: '3m', target: 500 },
  { duration: '2m', target: 1000 },
  { duration: '3m', target: 1500 },
  { duration: '2m', target: 0 }
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
  });

  sleep(1); // pausa entre requisições
}
