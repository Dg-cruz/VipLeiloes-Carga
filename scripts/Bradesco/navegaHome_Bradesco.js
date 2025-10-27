// Aumenta gradualmente o número de usuários para descobrir o ponto de quebra.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { bradescobaseURL } from '../../config/bradesco.js'; // importa a URL base da pasta config
import { gerarRelatorioGlobalsys } from '../../modules/reporter-globalsys.js'; // importa a função de geração de relatório
import { getThresholds } from '../../modules/thresholds-globalsys.js';

// 👇 escolha o tipo de teste
const tipoTeste = 'stress';  // opções: 'carga', 'stress', 'endurance', 'spike'

// 👇 obtém thresholds e descrição
const { thresholds, descricao } = getThresholds(tipoTeste);

let urlTestada; // variável global


export let options = {
  stages: [
  { duration: '1m', target: 100 },
  { duration: '2m', target: 500 },
  { duration: '2m', target: 1000 },
  { duration: '2m', target: 1500 },
  { duration: '1m', target: 0 }
],
  thresholds: thresholds,

  tags: { 
    tipoTeste, 
    sistema: 'VIPLeilões', 
    ambiente: 'homolog' 
  }
};

export default function () {
  const res = http.get(bradescobaseURL);
  urlTestada = bradescobaseURL; // salva a URL na variável global

  check(res, {
    'status é 200': (r) => r.status === 200,
  });

  sleep(1); // pausa entre requisições
}

// Ao finalizar o teste, o k6 chama automaticamente essa função
export function handleSummary(data) {
  data.config = { url: bradescobaseURL };
  return gerarRelatorioGlobalsys(data, tipoTeste, descricao, thresholds);
}