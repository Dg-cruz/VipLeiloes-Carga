import http from 'k6/http';
import { check } from 'k6';

// Configuração de carga/stress
export let options = {
  stages: [
    { duration: '1m', target: 500 },   // Rampa para 10 VUs em 1 min
    { duration: '3m', target: 1000 },   // Mantém 10 VUs por 3 min
    { duration: '1m', target: 1500 },   // Aumenta para 30 VUs em 1 min
    { duration: '3m', target: 2000 },   // Mantém 30 VUs por 3 min
    { duration: '1m', target: 0 },    // Finaliza
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% das requisições em < 1000ms
    http_req_failed: ['rate<0.05'],    // menos de 5% de falhas
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
  const res = http.post(url, payload, params);

  // Checagens
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
    // Se o retorno trouxer token em campo 'token' (ajuste conforme o formato real)
    'resposta contém token': (r) => {
      try {
        const obj = JSON.parse(r.body);
        return obj && (obj.token || obj.access_token || obj.data && obj.data.token);
      } catch (e) {
        return false;
      }
    },
  });

  // NÃO usar sleep aqui — cada iteração representa UMA requisição que o executor
  // tentará disparar na taxa configurada (1000 RPS).
}
