export const BASE_URL = 'https://hom-backoffice.vipleiloes.com.br';
export const LOGIN_URL = `${BASE_URL}/conta/entrar`;
export const OPERADOR_URL = `${BASE_URL}/leiloeiro`;
export const OBTER_DADOS_URL = `${BASE_URL}/operador?handler=ObterDadosTela`;
// Headers compartilhados para todas as requisições
export const baseHeaders = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:138.0) Gecko/20100101 Firefox/138.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'pt-BR,en-US;q=0.7,en;q=0.3',
  'Accept-Encoding': 'gzip, deflate, br, zstd',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1'
};
// IDs para teste (extraídos do curl)
export const EVENTO_ID = 'acb60754-8558-46f5-b05b-b331012b673b';
export const ANUNCIO_ID = '00000000-0000-0000-0000-000000000000';
