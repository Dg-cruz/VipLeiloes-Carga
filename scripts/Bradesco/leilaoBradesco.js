import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
const errorRate = new Rate('errors');
const updateTrend = new Trend('update_request_duration');
import { ATUALIZACAO_URL } from '../../config/bradesco.js'; // importa as URLs do arquivo de configuração
import { gerarRelatorioGlobalsys } from '../../modules/reporter-globalsys.js'; // importa a função de geração de relatório
import { getThresholds } from '../../modules/thresholds-globalsys.js';

// 👇 escolha o tipo de teste
const tipoTeste = 'spike';  // opções: 'carga', 'stress', 'endurance', 'spike'

// 👇 obtém thresholds e descrição
const { thresholds, descricao } = getThresholds(tipoTeste);

let urlTestada; // variável global

export const options = {
  stages: [
  { duration: '1m', target: 1000 },
  { duration: '2m', target: 1500 },
  { duration: '1m', target: 2000 },
  { duration: '2m', target: 2500 },
  { duration: '1m', target: 0 }
],
  thresholds: thresholds,

  tags: { 
    tipoTeste, 
    sistema: 'VIPLeilões', 
    ambiente: 'homolog' 
  }
};
const params = {
  headers: {
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Accept': 'application/json'
  },
  timeout: '20s'
};
export default function () {
  let updateResponse = http.get(ATUALIZACAO_URL, params);
  urlTestada = ATUALIZACAO_URL; // salva a URL na variável global
  
  if (updateResponse.status === 200 || updateResponse.status === 204) {
    updateTrend.add(updateResponse.timings.duration);
  }
  
  const checks = check(updateResponse, {
    'status ok': (r) => {
      return r.status === 200 || r.status === 204
    },
    'dados válidos': (r) => {
      if (r.status === 204) return true;
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    }
  });
  
  errorRate.add(!checks);
  sleep(4);  
}
// Ao finalizar o teste, o k6 chama automaticamente essa função
export function handleSummary(data) {
  data.config = { url: ATUALIZACAO_URL };
  return gerarRelatorioGlobalsys(data, tipoTeste, descricao, thresholds);
}