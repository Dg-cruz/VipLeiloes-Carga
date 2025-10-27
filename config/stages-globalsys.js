// config/stages-globalsys.js
export function getStages(tipoTeste) {
  switch (tipoTeste) {
    case 'carga':
      return [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '30s', target: 0 },
      ];

    case 'stress':
      return [
        { duration: '30s', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '1m', target: 2000 },
        { duration: '1m', target: 3000 },
        { duration: '30s', target: 0 },
      ];

    case 'endurance':
      return [
        { duration: '1m', target: 500 },
        { duration: '2m', target: 1000 },
        { duration: '3m', target: 2000 },
        { duration: '2m', target: 3000 },
        { duration: '1m', target: 0 },
      ];

    case 'spike':
      return [
        { duration: '10s', target: 100 },
        { duration: '10s', target: 2000 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 0 },
      ];

    default:
      console.warn(`⚠️ Tipo de teste desconhecido: ${tipoTeste}. Usando 'carga' como padrão.`);
      return [
        { duration: '30s', target: 200 },
        { duration: '1m', target: 500 },
        { duration: '30s', target: 0 },
      ];
  }
}
