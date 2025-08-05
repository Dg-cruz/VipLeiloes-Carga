import {browser} from 'k6/browser';
import {check} from 'k6';
import {Rate} from 'k6/metrics';

const errorRate = new Rate('errors');
const connectionFailures = new Rate('connection_failures');
const timeoutFailures = new Rate('timeout_failures');

export const options = {
  scenarios: {
    ui: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },  // Sobe para 100 VUs em 2 minutos
        { duration: '3m', target: 100 },  // Mantém 100 VUs por 3 minutos
        { duration: '2m', target: 200 },  // Sobe para 200 VUs em 2 minutos
        { duration: '3m', target: 200 },  // Mantém 200 VUs por 3 minutos
        { duration: '2m', target: 500 },  // Sobe para 500 VUs em 2 minutos
        { duration: '3m', target: 500 },  // Mantém 500 VUs por 3 minutos
        { duration: '2m', target: 0 },    // Reduz para 0 VUs em 2 minutos
      ],
      gracefulRampDown: '30s',
      options: {
        browser: {
          type: 'chromium',
        }
      }
    },
  },
  thresholds: {
    'errors': ['rate<0.1'],
    'browser_http_req_duration': ['p(95)<20000'], // 20s máximo
    'browser_web_vital_lcp': ['p(95)<30000'],
  },
};

export default async function(){
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    bypassCSP: true,  
    cache: 'always',
    serviceWorkers: 'block',
    acceptDownloads: false,
    ignoreDefaultArgs: ['--disable-notifications']
  });
  const page = await context.newPage()

  try{
    const startTime = Date.now();
    const response = await page.goto("https://hom-frontend.leilaovip.com.br/", {
      timeout: 60000,
      waitUntil: 'networkidle'
    });
    await page.waitForLoadState('networkidle');

    if (!response) {
      connectionFailures.add(1);
      throw new Error('Falha na conexão - sem resposta');
    }

    if (response.status() >= 500) {
      connectionFailures.add(1);
      throw new Error(`Erro do servidor: ${response.status()}`);
    }

    const loadTime = Date.now() - startTime;

    const checks = check(response, {
      'status is 200': () => response.status() ===200,
      'page loads under 25s': () => loadTime < 25000,
      'title is present': () => page.title() !== '',
    })

    const navigationTimings = await page.evaluate(()=>{
      const [navigationEntry] = performance.getEntriesByType('navigation');
      if (!navigationEntry) return { domContentLoaded: null, load: null};

      return {
        domContentLoaded: navigationEntry.domContentLoadedEventEnd,
        load: navigationEntry.loadEventEnd
      };
    });
    
    errorRate.add(!checks);

  } catch (error) {
      if (error.message.includes('timeout')) {
        timeoutFailures.add(1);
      } else{
        connectionFailures.add(1);
      }
    console.error(`Erro no teste: ${error}`);
    errorRate.add(true);
  } finally {
    await page.close();
    await context.close();
  }
}
