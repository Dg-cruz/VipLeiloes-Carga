import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
 
// URLs alvo
const baseURL = 'https://hom-frontend.vipleiloes.com.br';
const detalhesURL = baseURL + '/evento/detalhes/travasmultiplo2?handler=consultarSituacaoEvento';
 
// Métricas por URL
const mainSuccessCounter = new Counter('main_success_count');
const mainFailCounter = new Counter('main_fail_count');
const detalhesSuccessCounter = new Counter('detalhes_success_count');
const detalhesFailCounter = new Counter('detalhes_fail_count');
 
export const options = {
  vus: 50,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
  tags: { test_type: 'load' }
};
 
export default function () {
  // Requisição principal
  const resMain = http.get(baseURL);
  const mainSuccess = check(resMain, {
    'Main status é 200': function (r) { return r.status === 200; },
    'Main tempo < 4s': function (r) { return r.timings.duration < 4000; },
  });
 
  if (mainSuccess) {
    mainSuccessCounter.add(1);
  } else {
    mainFailCounter.add(1);
  }
 
  sleep(4); // pausa entre chamadas
 
  // Requisição secundária
  const resDetalhes = http.get(detalhesURL);
  const detalhesSuccess = check(resDetalhes, {
    'Detalhes status é 200': function (r) { return r.status === 200; },
    'Detalhes tempo < 4s': function (r) { return r.timings.duration < 4000; },
  });
 
  if (detalhesSuccess) {
    detalhesSuccessCounter.add(1);
  } else {
    detalhesFailCounter.add(1);
  }
 
  sleep(1); // pausa entre ciclos
}
 
export function handleSummary(data) {
  var mainSuccess = 0;
  var mainFail = 0;
  var detalhesSuccess = 0;
  var detalhesFail = 0;
 
  if (data.metrics['main_success_count'] && data.metrics['main_success_count'].values) {
    mainSuccess = data.metrics['main_success_count'].values.count;
  }
  if (data.metrics['main_fail_count'] && data.metrics['main_fail_count'].values) {
    mainFail = data.metrics['main_fail_count'].values.count;
  }
  if (data.metrics['detalhes_success_count'] && data.metrics['detalhes_success_count'].values) {
    detalhesSuccess = data.metrics['detalhes_success_count'].values.count;
  }
  if (data.metrics['detalhes_fail_count'] && data.metrics['detalhes_fail_count'].values) {
    detalhesFail = data.metrics['detalhes_fail_count'].values.count;
  }
 
  // Exibe no terminal
  console.log('\n=== Totais por URL ===');
  console.log('Principal:', mainSuccess + ' sucessos, ' + mainFail + ' falhas');
  console.log('Secundária:', detalhesSuccess + ' sucessos, ' + detalhesFail + ' falhas');
 
  // Gera relatório HTML
  var customSummary = `
<h1>Resumo do Teste de Carga</h1>
<h2>URL Principal</h2>
<p><strong>URL:</strong> ${baseURL}</p>
<p><strong>Sucessos:</strong> ${mainSuccess}</p>
<p><strong>Falhas:</strong> ${mainFail}</p>
 
    <h2>URL Secundária</h2>
<p><strong>URL:</strong> ${detalhesURL}</p>
<p><strong>Sucessos:</strong> ${detalhesSuccess}</p>
<p><strong>Falhas:</strong> ${detalhesFail}</p>
<hr/>
  `;
 
  var originalReport = htmlReport(data);
  var finalReport = customSummary + originalReport;
 
  return {
    'summary.html': finalReport,
  };
}