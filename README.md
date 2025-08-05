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
  Mantém uma carga constante por um longo período para verificar a estabilidade do sistema ao longo do tempo, identificando possíveis vazamentos de memória, degradação de performance ou falhas intermitentes.

- **Spike Test**  
  Aplica aumentos repentinos e curtos de carga para avaliar como o sistema lida com picos inesperados de acesso e se consegue retornar ao estado normal rapidamente.

Cada script em `scripts/` implementa um desses cenários, podendo ser customizado conforme a necessidade do ambiente ou do teste.

## Como Executar

1. Clone este repositório.
2. (Opcional) Instale as dependências:  
   `npm install`
3. Execute os testes desejados:
   - Smoke: `npm run smoke`
   - Load: `npm run load`
   - Stress: `npm run stress`
   - Soak: `npm run soak`
   - Spike: `npm run spike`

Os resultados dos testes são exibidos no terminal e podem ser integrados a relatórios para acompanhamento contínuo da qualidade da plataforma.
