import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
const errorRate = new Rate('errors');
const updateTrend = new Trend('update_request_duration');
import { ATUALIZACAO_URL } from '../config/evento_multiplo.js'; // importa as URLs do arquivo de configuração 
export const options = {
  stages: [
  { duration: '2m', target: 1000 },
  { duration: '3m', target: 1500 },
  { duration: '2m', target: 2000 },
  { duration: '3m', target: 2500 },
  { duration: '2m', target: 0 }
],
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
    errors: ['rate<0.1'],
    'update_request_duration': ['p(95)<1000']
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