import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import exec from 'k6/execution';

// Métricas personalizadas
const errorRate = new Rate('errors');
const updateTrend = new Trend('operador_update_duration');

// URLs base
const BASE_URL = 'https://hom-backoffice.vipleiloes.com.br';
const LOGIN_URL = `${BASE_URL}/conta/entrar`;
const OPERADOR_URL = `${BASE_URL}/operador`;
const OBTER_DADOS_URL = `${BASE_URL}/operador?handler=ObterDadosTela`;

// IDs para teste (extraídos do curl)
const EVENTO_ID = '6d58c82d-f049-4574-ae7a-b29501784967';
const ANUNCIO_ID = 'd6f27f95-58be-478e-abc4-b2950178493d';

// Credenciais
const USERNAME = 'up-admin@vipleiloes.com.br';
const PASSWORD = 'Vip123456';

// Configuração do teste
export const options = {
  stages: [
    { duration: '1m', target: 80 },   
    { duration: '2m', target: 160 },  
    { duration: '2m', target: 240 }, 
    { duration: '2m', target: 400 },
    { duration: '1m', target: 0 }  
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],        // 95% das requisições abaixo de 5s
    http_req_failed: ['rate<0.1'],            // Taxa de falha menor que 10%
    errors: ['rate<0.1'],                     // Taxa de erros menor que 10%
    'operador_update_duration': ['p(95)<1000'] // 95% das atualizações abaixo de 1s
  },
  setupTimeout: '60s'
};

// Headers compartilhados para todas as requisições
const baseHeaders = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,en-US;q=0.7,en;q=0.3',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};

// Login inicial e obtenção dos cookies
export function setup() {
  console.log('Iniciando processo de login...');
  
  // Inicializar cookies da sessão com o Cloudflare protection
  let sessionCookies = {
    'cf_clearance': 'bFYo9EE0T5G5u64Pesbk8I.ubahIJLxAM2CkraREwKo-1741782740-1.2.1.1-jSTFP1YkPq9K9Da9nmp2WHe268iPocIXMr6IuawhZLU2A_CxPUvQ94FVL8AXuANSw6uDfOR1vpizPz4TeskXKcys3PPVMhS2IHw12F2Bv2ouJ6oNzv5BIli1bWmPYz8tr1_mekheJpo1K8G8zXDvDck38O7caYVgIasFSABwNHYoiPWPLM5Qp6.5mgdkT8mjYwVxQzKvC6we_dChuqoUk9EXxjHazVXmJCPbjLfCTIFaMc_wDRR4KxnZAm9CBKb9gTP.yMinS1RjxPQcqwGIkVvJlyqYvOcFa3Kpp.CKrrb8tei_BWscBEPmm0FASNShO5xMlhRswLSdG732M0TFOcvGisb8vSfFsLZX_kZH31U',
    'ai_user': 'Oq0rLmBd6VMNYFVj+wCl2Z|2025-03-10T14:31:24.948Z'
  };
  
  // Construir string de cookies
  let cookieString = Object.entries(sessionCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  // Passo 1: Acessar a página de login para obter o token CSRF
  console.log('Passo 1: Acessando página de login...');
  let loginPageResponse = http.get(`${LOGIN_URL}?ReturnUrl=%2F`, {
    headers: {
      ...baseHeaders,
      'Cookie': cookieString
    }
  });
  
  // Verificar resposta
  if (loginPageResponse.status !== 200) {
    console.error(`Erro ao acessar página de login: ${loginPageResponse.status}`);
    return null;
  }
  
  // Extrair token CSRF
  let csrfMatch = loginPageResponse.body.match(/"__RequestVerificationToken" type="hidden" value="([^"]+)"/);
  if (!csrfMatch) {
    console.error('Não foi possível encontrar o token CSRF na página de login');
    return null;
  }
  let csrfToken = csrfMatch[1];
  
  // Pegar cookies da resposta
  for (let name in loginPageResponse.cookies) {
    let cookie = loginPageResponse.cookies[name][0];
    sessionCookies[name] = cookie.value;
  }
  
  // Atualizar string de cookies
  cookieString = Object.entries(sessionCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  // Passo 2: Realizar o login
  console.log('Passo 2: Enviando credenciais...');
  const loginPayload = {
    'Login.Login': USERNAME,
    'Login.Senha': PASSWORD,
    '__RequestVerificationToken': csrfToken
  };
  
  let loginResponse = http.post(`${LOGIN_URL}?returnUrl=%2F`, loginPayload, {
    headers: {
      ...baseHeaders,
      'Cookie': cookieString,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': BASE_URL,
      'Referer': `${LOGIN_URL}?ReturnUrl=%2F`
    },
    redirects: 0 // Não seguir redirecionamentos automaticamente
  });
  
  // Verificar redirecionamento de sucesso (302)
  if (loginResponse.status !== 302) {
    console.error(`Login falhou: status ${loginResponse.status}`);
    console.error(`Resposta: ${loginResponse.body.substring(0, 500)}...`);
    return null;
  }
  
  // Obter cookies da resposta de login
  for (let name in loginResponse.cookies) {
    let cookie = loginResponse.cookies[name][0];
    sessionCookies[name] = cookie.value;
  }
  
  // Passo 3: Seguir o redirecionamento para completar o login
  console.log('Passo 3: Seguindo redirecionamento...');
  let redirectUrl = loginResponse.headers.Location || '/';
  if (!redirectUrl.startsWith('http')) {
    redirectUrl = BASE_URL + redirectUrl;
  }
  
  cookieString = Object.entries(sessionCookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');
  
  let homePageResponse = http.get(redirectUrl, {
    headers: {
      ...baseHeaders,
      'Cookie': cookieString,
      'Referer': `${LOGIN_URL}?ReturnUrl=%2F`
    }
  });
  
  // Obter cookies adicionais, se houver
  for (let name in homePageResponse.cookies) {
    let cookie = homePageResponse.cookies[name][0];
    sessionCookies[name] = cookie.value;
  }
  
  // Verificar se o login foi completado corretamente
  if (homePageResponse.status !== 200) {
    console.error(`Falha ao acessar página após login: ${homePageResponse.status}`);
    return null;
  }
  
  if (homePageResponse.body.includes('Login.Login')) {
    console.error('Página ainda contém formulário de login. Autenticação falhou.');
    return null;
  }
  
  // Sucesso! Agora vamos acessar a página do operador para garantir que temos acesso
  console.log('Verificando acesso à página do operador...');
  let operadorResponse = http.get(`${OPERADOR_URL}/${EVENTO_ID}`, {
    headers: {
      ...baseHeaders,
      'Cookie': cookieString,
      'Referer': BASE_URL
    }
  });
  
  let authSuccess = operadorResponse.status === 200 && !operadorResponse.body.includes('Login.Login');
  
  if (authSuccess) {
    console.log('Sessão autenticada confirmada!');
  } else {
    console.error('ERRO: Não foi possível acessar a página do operador.');
    return null;
  }
  
  // Retornar a string de cookies completa e outros dados necessários
  return {
    cookieString,
    sessionCookies
  };
}

// Função principal executada para cada VU
export default function(data) {
  // Verificar se temos cookies válidos
  if (!data || !data.cookieString) {
    console.error('Cookies de sessão inválidos. Abortando teste.');
    errorRate.add(1);
    return;
  }
  
  const cookieString = data.cookieString;
  
  // Grupo: Fazer requisições periódicas para obter dados da tela do operador
  group('Atualizações da Tela do Operador', function() {
    // Parâmetros da requisição
    const params = {
      eventoId: EVENTO_ID,
      anuncioId: ANUNCIO_ID,
      origemRequisicao: 'BotaoAnterior',
      pesquisaPorAnuncioNumero: '',
      somenteEmRepasse: false,
      carregamentoCompleto: false
    };
    
    // Headers específicos para a requisição AJAX
    const ajaxHeaders = {
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0',
      'Accept': '*/*',
      'Accept-Language': 'pt-BR,en-US;q=0.7,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Referer': `${OPERADOR_URL}/${EVENTO_ID}`,
      'content-type': 'application/json',
      'DNT': '1',
      'Alt-Used': BASE_URL.replace(/^https?:\/\//, '').split('/')[0],
      'Connection': 'keep-alive',
      'Cookie': cookieString,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
      'Priority': 'u=4',
      'TE': 'trailers'
    };
    
    // Fazer requisição para obter dados da tela do operador
    let startTime = new Date();
    let updateUrl = `${OBTER_DADOS_URL}&eventoId=${params.eventoId}&anuncioId=${params.anuncioId}&origemRequisicao=${params.origemRequisicao}&pesquisaPorAnuncioNumero=${params.pesquisaPorAnuncioNumero}&somenteEmRepasse=${params.somenteEmRepasse}&carregamentoCompleto=${params.carregamentoCompleto}`;
    
    let response = http.get(updateUrl, {
      headers: ajaxHeaders,
      timeout: '5s'
    });
    
    // Calcular tempo de resposta
    let updateTime = new Date() - startTime;
    updateTrend.add(updateTime);
    
    // Verificar resposta
    let success = check(response, {
      'status é 200': r => r.status === 200,
      'resposta contém dados JSON válidos': r => {
        try {
          let jsonData = JSON.parse(r.body);
          return jsonData.success === true && jsonData.data !== undefined;
        } catch (e) {
          console.error(`Erro ao fazer parse do JSON: ${e.message}`);
          return false;
        }
      },
      'dados do anúncio presentes': r => {
        try {
          let jsonData = JSON.parse(r.body);
          return jsonData.data.anuncio && jsonData.data.anuncio.anuncioId;
        } catch (e) {
          return false;
        }
      }
    });
    
    if (!success) {
      console.error(`Falha na atualização: ${response.status} (VU ID: ${exec.vu.idInTest})`);
      errorRate.add(1);
    }
    
    // Pausa de 1 segundo entre requisições para simular o comportamento real
    sleep(1);
    
    // Realizar uma segunda requisição para simular o comportamento periódico
    startTime = new Date();
    response = http.get(updateUrl, {
      headers: ajaxHeaders,
      timeout: '5s'
    });
    
    updateTime = new Date() - startTime;
    updateTrend.add(updateTime);
    
    success = check(response, {
      'segunda atualização: status é 200': r => r.status === 200,
      'segunda atualização: JSON válido': r => {
        try {
          let jsonData = JSON.parse(r.body);
          return jsonData.success === true;
        } catch (e) {
          return false;
        }
      }
    });
    
    if (!success) {
      console.error(`Falha na segunda atualização: ${response.status}`);
      errorRate.add(1);
    }
    
    // Simulamos o comportamento de polling com uma pausa entre requisições
    sleep(1);
  });
}
