// Testa performance estável ao longo do tempo (detecta vazamentos de memória, por exemplo).
import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseURL } from '../config/staging.js'; // importa a URL base da pasta config

export let options = {
  vus: 20,
  duration: '30m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
  },
  tags: { test_type: 'soak' }
};

export default function () {
  const res = http.get(baseURL);

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo de resposta < 4s': (r) => r.timings.duration < 4000,
  });

  sleep(1); // pausa entre requisições
}