// Aumenta gradualmente o número de usuários para descobrir o ponto de quebra.
import http from 'k6/http';
import { check, sleep } from 'k6';
import { pesquisaBradescoURL } from '../../config/bradesco.js';
import { gerarRelatorioGlobalsys } from '../../modules/reporter-globalsys.js';
import { getThresholds } from '../../modules/thresholds-globalsys.js';
import { getStages } from '../../config/stages-globalsys.js';

// 👇 escolha o tipo de teste
const tipoTeste = 'carga';  // opções: 'carga', 'stress', 'endurance', 'spike'

// 👇 obtém thresholds e descrição
const { thresholds, descricao } = getThresholds(tipoTeste);

export let options = {
  stages: getStages('carga', 10000),
};

// Função auxiliar para transformar objeto em form-urlencoded
function toFormUrlEncoded(obj) {
    return Object.keys(obj)
        .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
        .join('&');
}

export default function () {
    const url = pesquisaBradescoURL;

    // 🔒 Cookie da sua sessão
    const cookie = `ai_user=wKv0Qzm/BAvxRd2z/...`; // <-- coloque seu cookie completo aqui

    // 🔧 Cabeçalhos
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
    };

    // 🧾 Corpo da requisição (form data)
    const payload = {
        "Filtro.Texto": "",
        "Filtro.SubCategoriaId": "E4ECBFA9-993C-41A7-B0CE-B37800DBB7D7",
        "Filtro.Marca": "",
        "Filtro.Modelo": "",
        "Filtro.Ano": "",
        "Filtro.ValorDe": "",
        "Filtro.ValorAte": "",
        "Filtro.QuilometragemDe": "1",
        "Filtro.QuilometragemAte": "200000",
        "Filtro.LocalEstadoId": "",
        "Filtro.Caracteristicas[0].CaracteristicaId": "db6bb8fc-d1e9-4da2-9f18-b37800dc2afa",
        "Filtro.Caracteristicas[0].Tipo": "Lista",
        "Filtro.Caracteristicas[0].Valor": "SIM",
        "Filtro.Caracteristicas[1].CaracteristicaId": "cb64991b-6ce1-425d-bde5-b37800dd7e9a",
        "Filtro.Caracteristicas[1].Tipo": "Lista",
        "Filtro.Caracteristicas[1].Valor": "Tem",
        "Filtro.Caracteristicas[2].CaracteristicaId": "dbd2b436-c7d9-4aa8-bbf1-b37800dc4f3c",
        "Filtro.Caracteristicas[2].Tipo": "Lista",
        "Filtro.Caracteristicas[2].Valor": "",
        "Filtro.Caracteristicas[3].CaracteristicaId": "a92cd56a-a7ae-4923-b85b-b37800dc08cd",
        "Filtro.Caracteristicas[3].Tipo": "Lista",
        "Filtro.Caracteristicas[3].Valor": "Tem",
        "Filtro.Caracteristicas[4].CaracteristicaId": "92b8a8d7-1e15-418f-9570-b37800dca8fe",
        "Filtro.Caracteristicas[4].Tipo": "Lista",
        "Filtro.Caracteristicas[4].Valor": "",
        "Filtro.Caracteristicas[5].CaracteristicaId": "6151e477-9bbf-44a3-88d4-b37800dc8b72",
        "Filtro.Caracteristicas[5].Tipo": "Lista",
        "Filtro.Caracteristicas[5].Valor": "Tem",
        "Filtro.Caracteristicas[6].CaracteristicaId": "4ee313b4-c574-4bd0-889e-b37800dcefb5",
        "Filtro.Caracteristicas[6].Tipo": "Lista",
        "Filtro.Caracteristicas[6].Valor": "Tem",
        "Filtro.Caracteristicas[7].CaracteristicaId": "e0eacf81-b271-4ae2-bb6e-b37800dc6de5",
        "Filtro.Caracteristicas[7].Tipo": "Lista",
        "Filtro.Caracteristicas[7].Valor": "",
        "Filtro.Caracteristicas[8].CaracteristicaId": "31f2279d-bb7a-4579-8b39-b37800dcd957",
        "Filtro.Caracteristicas[8].Tipo": "Lista",
        "Filtro.Caracteristicas[8].Valor": "Sim",
        "CurrentPage": "1",
        "__RequestVerificationToken": "CfDJ8BrcO22AZEhHhTuaVniiz8ywJd-WtIvyRiwA_EmmOVJckk6dXtxhUrDrtzWLpMTKnfz-MC5Ue45XlOrylaufWHWaR2VCfNC1Gv4p3TDpBku05_aTZivBvnQ_M0WWpNO7akJrpFxhAaidYsurQxTPBaOSbVaOOJhLEHtixLCebwxO48mwo39ESc-7F3wMMP09EA",
        "Filtro.ApenasFavoritos": "false",
    };

    const res = http.post(url, toFormUrlEncoded(payload), { headers });

    check(res, {
        'status é 200': (r) => r.status === 200,
    });

    sleep(1); // pausa entre requisições
}

// Ao finalizar o teste, o k6 chama automaticamente essa função
export function handleSummary(data) {
    data.config = { url: pesquisaBradescoURL };
    return gerarRelatorioGlobalsys(data, tipoTeste, descricao, thresholds);
}