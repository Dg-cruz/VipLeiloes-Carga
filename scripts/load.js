// Avalia como o sistema se comporta sob carga nominal esperada.
import http from 'k6/http';
import { group } from 'k6';
import { check, sleep } from 'k6';
import { baseURL } from '../config/staging.js'; // importa a URL base da pasta config
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function handleSummary(data) {
     return {
       "summary.html": htmlReport(data),
    };
   }

  let requisicoesFalhas = 0;
  let requisicoesSucesso = 0;

export const options = {
  vus: 50,           // 50 usuários virtuais simultâneos
  duration: '1m',    // duração total do teste
  thresholds: {
    http_req_duration: ['p(95)<800'],         // 95% das respostas abaixo de 800ms
    http_reqs: ['rate>40'],                   // pelo menos 40 requisições por segundo
    http_req_failed: ['rate<0.01'],           // menos de 1% de falhas
  },
  tags: { test_type: 'load' }
};


export default function() {
  const url = baseURL + '/path/to/resource';


  group('Requisições', function() {
    // Seu código de requisição aqui
    const res = http.get(baseURL)

    check(res, {
      'status é 200': (r) => r.status === 200,
      'tempo de resposta < 4s': (r) => r.timings.duration < 4000,
    });

    if (res.status === 200) {
      requisicoesSucesso++;
    } else {
      requisicoesFalhas++;
    }
  });

  console.log('RESUMO DO TESTE:');
  console.log(`URL testada: ${url}`);
  console.log(`Requisições falhas: ${requisicoesFalhas}`);
  console.log(`Requisições com sucesso: ${requisicoesSucesso}`);
}
