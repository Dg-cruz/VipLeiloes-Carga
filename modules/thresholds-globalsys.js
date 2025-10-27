// modules/thresholds-globalsys.js
//
// Define thresholds prontos para diferentes tipos de testes de carga
// Uso: importar no seu script e chamar getThresholds('stress') ou outro tipo

export function getThresholds(tipo = 'carga') {
  const tipos = {
    // 🧪 Teste de CARGA (Load Test)
    // Mede performance sob uso normal previsto
    carga: {
      descricao: 'Valida a performance sob carga esperada (uso típico).',
      thresholds: {
        http_req_duration: [
          'p(90)<800',   // 90% das requisições abaixo de 800 ms
          'p(95)<1000',  // 95% abaixo de 1 segundo
          'p(99)<1500',  // 99% abaixo de 1.5 segundos
        ],
        http_req_failed: ['rate<0.01'], // <1% de erros
        checks: ['rate>0.99'],          // >99% de sucesso nas validações
      },
    },

    // 💥 Teste de STRESS
    // Aumenta a carga até o sistema começar a degradar
    stress: {
      descricao: 'Avalia o ponto de saturação do sistema sob aumento contínuo de carga.',
      thresholds: {
        http_req_duration: [
          'p(90)<1500',  // 90% das requisições abaixo de 1.5s
          'p(95)<2500',  // 95% abaixo de 2.5s
        ],
        http_req_failed: ['rate<0.05'], // até 5% de falhas toleráveis
        checks: ['rate>0.95'],          // 95% das verificações devem passar
      },
    },

    // 🕒 Teste de ENDURANCE (Soak Test)
    // Valida estabilidade e vazamento de memória sob uso prolongado
    endurance: {
      descricao: 'Valida estabilidade e consumo de recursos em longas execuções.',
      thresholds: {
        http_req_duration: [
          'p(90)<1200',  // desempenho consistente ao longo do tempo
          'p(95)<1800',
        ],
        http_req_failed: ['rate<0.01'], // falhas mínimas
        checks: ['rate>0.98'],          // estabilidade operacional
      },
    },

    // ⚡ Teste de SPIKE
    // Mede comportamento sob aumento súbito de usuários
    spike: {
      descricao: 'Verifica como o sistema reage a picos instantâneos de tráfego.',
      thresholds: {
        http_req_duration: [
          'p(95)<2500',
          'p(99)<4000',
        ],
        http_req_failed: ['rate<0.02'], // até 2% de falhas aceitáveis
        checks: ['rate>0.97'],
      },
    },
  };

  // Se o tipo for desconhecido, usa “carga” como padrão
  return tipos[tipo] || tipos.carga;
}
