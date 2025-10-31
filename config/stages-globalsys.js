// config/stages-globalsys.js

/**
 * Gera stages para testes k6 de forma dinâmica.
 * @param {string} tipoTeste - 'carga' | 'stress' | 'endurance' | 'spike'
 * @param {number} maxVUs - pico máximo de VUs que deseja atingir
 * @returns {Array} stages configuradas para o teste
 */
export function getStages(tipoTeste, maxVUs = 10000) {
  const rampUpRatio = 0.3;   // proporção de ramp-up do pico
  const sustainRatio = 0.3;  // proporção de tempo no pico
  const rampDownRatio = 0.4; // proporção de ramp-down

  const stages = [];

  switch (tipoTeste) {
    case 'carga':
    case 'stress':
    case 'endurance': {
      const step1 = Math.floor(maxVUs * 0.2);
      const step2 = Math.floor(maxVUs * 0.5);
      const step3 = Math.floor(maxVUs * 0.8);

      stages.push({ duration: '1m', target: step1 });
      stages.push({ duration: '2m', target: step2 });
      stages.push({ duration: '3m', target: step3 });
      stages.push({ duration: '3m', target: maxVUs });
      stages.push({ duration: '5m', target: maxVUs * sustainRatio }); // manter no pico proporcional
      stages.push({ duration: '3m', target: step2 });
      stages.push({ duration: '2m', target: step1 });
      stages.push({ duration: '1m', target: 0 });
      break;
    }

    case 'spike': {
      stages.push({ duration: '10s', target: Math.floor(maxVUs * 0.1) });
      stages.push({ duration: '20s', target: Math.floor(maxVUs * 0.5) });
      stages.push({ duration: '30s', target: maxVUs }); // pico rápido
      stages.push({ duration: '30s', target: Math.floor(maxVUs * 0.2) });
      stages.push({ duration: '10s', target: 0 });
      break;
    }

    default:
      console.warn(`⚠️ Tipo de teste desconhecido: ${tipoTeste}. Usando 'carga' como padrão.`);
      stages.push({ duration: '30s', target: Math.floor(maxVUs * 0.2) });
      stages.push({ duration: '1m', target: Math.floor(maxVUs * 0.5) });
      stages.push({ duration: '30s', target: 0 });
      break;
  }

  return stages;
}
