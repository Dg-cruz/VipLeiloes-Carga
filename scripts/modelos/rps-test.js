import http from 'k6/http';
import { check } from 'k6';

// Use apenas um dos scenarios abaixo por vez!
// Comente/descomente conforme o tipo de teste que deseja executar:

export let options = {
  // ✅ Cenário 1: 1 VU disparando 1000 requisições em 1 segundo
  
  vus: 1,
  duration: '1s',
  

  // ✅ Cenário 2: 1000 RPS durante 3 minutos (k6 distribui a carga entre VUs)
  /*scenarios: {
    gerar_1000_rps: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '3m',
      preAllocatedVUs: 100,
      maxVUs: 1000,
    },
  },*/

  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

const url = 'https://lecard-prod-api-identity.sistemas.lecard.com.br/api/login';

const payload = JSON.stringify({
  login: "08794271755",
  password: "P68uj98Lqa1I/dn542ryO6DBhnEoJLe0G6Wxx4j89lPz0ez2eKM60ORd+5wpW8DFrBcErve+b+yi47YKrwnucVkZBK6V5B5Tuv97sHluHttfb3qR/iIJozCbwK1Ah4FcvxPnJlUoXnTk3xIR1cxStSbEqADBAOcWBsVtjhi4stEcu0vdtnlwDwALkq5aUkUcrdMXYttGN8MTf9UXJuNFmTlj/R/o7oM5hSb/ZDLVQw1+Vsk9q54o2us0T5mH0vKW0IHiqw9WTpgGcmRhbohYn/EgsVUc0o1q3OKZ/ibzeqMIVGKg/KKXY47M5kOtNZ5JH67kHcM2trmnJdfysrBMIQ==",
  app: "Estudante",
  device: {
    deviceToken: "60e5c186-664d-4b58-8390-e8b199c34c3b",
    deviceId: "9fb2955f5f8340bd",
    deviceType: "Android",
    deviceModel: "sdk_gphone64_arm64",
    oSVersion: "Android 15",
    appVersion: "1.0.16"
  },
  network: {
    userAgent: "LecardApp/1.0.16 (Android 15)",
    location: "São Paulo, SP"
  }
});

const params = {
  headers: {
    'Content-Type': 'application/json',
  },
};

export default function () {
  // Versão 1: 1 VU disparando 1000 requisições rapidamente
  // OBS: Só use se estiver rodando com `vus: 1` e `duration: '1s'`
  
  for (let i = 0; i < 1000; i++) {
    const res = http.post(url, payload, params);
    validarResposta(res);
  }
  

  // Versão 2: usado pelo scenario 'gerar_1000_rps'
  /*const res = http.post(url, payload, params);
  validarResposta(res);*/
}

// Função de validação extraída para evitar repetição
function validarResposta(res) {
  check(res, {
    'status é 200': (r) => r.status === 200,
    'retorno é JSON válido': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    'resposta contém token': (r) => {
      try {
        const obj = JSON.parse(r.body);
        return obj && (obj.token || obj.access_token || obj.data?.token);
      } catch (e) {
        return false;
      }
    },
  });
}
