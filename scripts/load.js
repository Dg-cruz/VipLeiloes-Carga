import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
const updateTrend_main = new Trend('update_request_duration_main');
const updateTrend_second = new Trend('update_request_duration_second');
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { BASE_URL, ATUALIZACAO_URL } from '../config/evento_multiplo.js'; 

// Métricas por URL
const mainSuccessCounter = new Counter('main_success_count');
const mainFailCounter = new Counter('main_fail_count');
const detalhesSuccessCounter = new Counter('detalhes_success_count');
const detalhesFailCounter = new Counter('detalhes_fail_count');
 
export const options = {
  stages: [
    { duration: '2m', target: 250 },
    { duration: '3m', target: 500 },
    { duration: '2m', target: 750 },
    { duration: '3m', target: 1000 },
    { duration: '2m', target: 0 }   
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    update_request_duration_main: ['p(95)<1000'],
    update_request_duration_second: ['p(95)<1000']
  }
};
 
export default function () {
  // Requisição principal
  const resMain = http.get(ATUALIZACAO_URL);
  const mainSuccess = check(resMain, {
    'Main status é 200': function (r) { return r.status === 200; },
    'Main tempo < 4s': function (r) { return r.timings.duration < 4000; },
  });

  if (resMain.status === 200 || resMain.status === 204) {
    updateTrend_main.add(resMain.timings.duration);
  }
 
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

   if (resDetalhes.status === 200 || resDetalhes.status === 204) {
    updateTrend_second.add(resDetalhes.timings.duration);
  }
 
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