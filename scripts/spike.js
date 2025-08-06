// Simula aumento rápido e inesperado de usuários, ideal para eventos tipo Black Friday.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { baseURL } from '../config/evento_multiplo.js'; // importa a URL base da pasta config

export let options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '10s', target: 100 },
    { duration: '30s', target: 100 },
    { duration: '10s', target: 10 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1200'],
  },
  tags: { test_type: 'spike' }
};

export default function() {
  const url = baseURL + '/path/to/resource';
  const res = http.get(url);

  const resultado = {
    url: url,
    requisicoesFalhas: 0,
    requisicoesSucesso: 0,
  };

  check(res, {
    'status é 200': (r) => r.status === 200,
    'tempo de resposta < 4s': (r) => r.timings.duration < 4000,
  });

  if (res.status === 200) {
    resultado.requisicoesSucesso++;
  } else {
    resultado.requisicoesFalhas++;
  }

  console.log('RESUMO DO TESTE:');
  console.log(`URL testada: ${resultado.url}`);
  console.log(`Requisições falhas: ${resultado.requisicoesFalhas}`);
  console.log(`Requisições com sucesso: ${resultado.requisicoesSucesso}`);

  return resultado;
}
