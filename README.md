# VipLeiloesQA

Projeto para automação de testes de carga, desempenho e estabilidade na plataforma VipLeilões, utilizando o framework [k6](https://k6.io/).

## Objetivo

O objetivo deste projeto é garantir que a plataforma VipLeilões suporte diferentes níveis de uso, identificando gargalos, falhas e oportunidades de melhoria antes que impactem os usuários finais. Os testes são organizados para simular cenários reais e extremos de acesso, proporcionando uma visão abrangente da performance do sistema.

## Estrutura do Projeto

- **config/**: Arquivos de configuração para diferentes ambientes (desenvolvimento, staging, produção).
- **scripts/**: Scripts de teste automatizados, cada um focado em um tipo de teste de carga.
- **package.json**: Comandos npm para facilitar a execução dos testes.

## Tipos de Teste

O projeto contempla os principais tipos de teste de carga:

- **Smoke Test**  
  Executa um número reduzido de requisições para validar se o sistema está respondendo corretamente e se os principais fluxos estão funcionando. É utilizado como uma verificação rápida antes de testes mais intensos.

- **Load Test**  
  Simula o acesso de múltiplos usuários simultâneos durante um período determinado, avaliando como o sistema se comporta sob a carga nominal esperada. Mede tempos de resposta, taxa de erros e estabilidade sob uso normal.

- **Stress Test**  
  Eleva gradualmente o número de usuários e requisições até ultrapassar a capacidade esperada do sistema, com o objetivo de identificar o ponto de falha, gargalos e como o sistema se recupera após sobrecarga.

- **Soak Test**  
  Mantém o sistema sob carga por um longo período para identificar problemas de estabilidade, vazamento de memória ou degradação de performance ao longo do tempo.

- **Spike Test**  
  Aplica aumentos repentinos e curtos de carga para avaliar como o sistema lida com picos inesperados de acesso e se consegue retornar ao estado normal rapidamente.

Cada script em `scripts/` implementa um desses cenários, podendo ser customizado conforme a necessidade do ambiente ou do teste.

## Como Executar

1. Clone este repositório.
2. (Opcional) Instale as dependências:  
   `npm install`
3. Execute os testes desejados:
   - Smoke: `k6 run scripts/smoke.js`
   - Load: `k6 run scripts/load.js`
   - Stress: `k6 run scripts/stress.js`
   - Soak: `k6 run scripts/soak.js`
   - Spike: `k6 run scripts/spike.js`
   - Backoffice: `k6 run scripts/backoffice-test.js`

Os resultados dos testes são exibidos no terminal e podem ser integrados a relatórios para acompanhamento contínuo da qualidade da plataforma.

## Métricas de Teste de Carga

Durante a execução dos testes de carga, diversas métricas são coletadas para avaliar o desempenho e a estabilidade do sistema. Abaixo estão as principais métricas e o significado de cada valor apresentado nos resultados:

- **http_req_duration**  
  Mede o tempo total (em milissegundos) que cada requisição HTTP leva para ser concluída, incluindo DNS, conexão, espera e download da resposta.  
  - **avg**: tempo médio das requisições.
  - **min**: menor tempo registrado.
  - **med**: valor mediano (50% das requisições foram mais rápidas, 50% mais lentas).
  - **max**: maior tempo registrado.
  - **p(95)**: 95% das requisições foram concluídas em menos que esse valor.

- **http_req_failed**  
  Taxa de requisições HTTP que falharam (por erro de rede, status HTTP >= 400, etc).  
  - **rate**: percentual de falhas em relação ao total de requisições.

- **iteration_duration**  
  Mede o tempo total de execução de cada iteração do teste (do início ao fim de uma execução do script para um usuário virtual).  
  - **avg**: tempo médio de cada iteração.
  - **min**: menor tempo de iteração.
  - **med**: tempo mediano de iteração.
  - **max**: maior tempo de iteração.

- **errors**  
  Métrica personalizada para contabilizar erros específicos do fluxo de teste, definidos manualmente no script.  
  - **rate**: percentual de execuções com erro.

- **operador_update_duration**  
  Métrica personalizada para medir o tempo de atualização de uma operação específica (exemplo: atualização de tela do operador).  
  - **avg**: tempo médio das atualizações.
  - **min**: menor tempo registrado.
  - **med**: tempo mediano.
  - **max**: maior tempo registrado.
  - **p(95)**: 95% das atualizações foram concluídas em menos que esse valor.

### Significado das Siglas

- **avg**: valor médio (average)
- **min**: valor mínimo (minimum)
- **med**: valor mediano (median)
- **max**: valor máximo (maximum)
- **p(95)**: percentil 95 (95% dos valores estão abaixo deste valor)
- **rate**: taxa ou percentual

Essas métricas permitem identificar gargalos, lentidão, instabilidades e pontos de melhoria no sistema testado, garantindo que ele atenda aos requisitos de desempenho e confiabilidade
