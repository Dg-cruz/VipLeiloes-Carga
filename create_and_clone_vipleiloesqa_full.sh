#!/usr/bin/env bash
# Script para criar um Gist com estrutura completa VipLeiloesQA e clonar localmente

TOKEN="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"
GIST_DESCRIPTION="VipLeiloesQA k6 project template – estrutura completa"
GIST_PUBLIC=true

# Cria os arquivos com conteúdo inicial
mkdir -p scripts modules config data output results dashboards

cat << 'EOF' > README.md
# VipLeiloesQA

Estrutura de projeto para testes de carga com k6.

## Instruções

1. Clone este repositório.
2. (Opcional) `npm install`
3. Executar testes:
   - `npm run smoke`
   - `npm run load`
   - `npm run stress`
EOF

cat << 'EOF' > .gitignore
node_modules/
output/
results/
dashboards/
EOF

cat << 'EOF' > package.json
{
  "name": "vipleiloesqa",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "smoke": "k6 run scripts/smoke.js",
    "load": "k6 run scripts/load.js",
    "stress": "k6 run scripts/stress.js"
  },
  "dependencies": {}
}
EOF

cat << 'EOF' > scripts/smoke.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/dev.js';
import { login } from '../modules/auth.js';

export let options = {
  vus: 1,
  duration: '30s',
  thresholds: { http_req_duration: ['p(95)<500'] },
  tags: { test_type: 'smoke' }
};

export default function () {
  const token = login();
  const res = http.get(\`\${config.baseUrl}/users\`, { headers: { Authorization: \`Bearer \${token}\` } });
  check(res, { 'status é 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

cat << 'EOF' > scripts/load.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/staging.js';
import { login } from '../modules/auth.js';

export let options = {
  vus: 50,
  duration: '1m',
  thresholds: { http_req_duration: ['p(95)<700'] },
  tags: { test_type: 'load' }
};

export default function () {
  const token = login();
  const res = http.get(\`\${config.baseUrl}/users\`, { headers: { Authorization: \`Bearer \${token}\` } });
  check(res, { 'status é 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

cat << 'EOF' > scripts/stress.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { config } from '../config/prod.js';
import { login } from '../modules/auth.js';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 }
  ],
  thresholds: { http_req_duration: ['p(95)<1000'] },
  tags: { test_type: 'stress' }
};

export default function () {
  const token = login();
  const res = http.get(\`\${config.baseUrl}/users\`, { headers: { Authorization: \`Bearer \${token}\` } });
  check(res, { 'status é 200': (r) => r.status === 200 });
  sleep(1);
}
EOF

cat << 'EOF' > modules/auth.js
import http from 'k6/http';
import { config } from '../config/dev.js';

export function login() {
  const payload = JSON.stringify({ username: 'admin', password: '123456' });
  const res = http.post(\`\${config.baseUrl}/auth/login\`, payload, { headers: config.headers });
  return res.json('token');
}
EOF

cat << 'EOF' > modules/user.js
import http from 'k6/http';
import { config } from '../config/dev.js';

export function createUser(userData) {
  const res = http.post(\`\${config.baseUrl}/users\`, JSON.stringify(userData), { headers: config.headers });
  return res;
}
EOF

cat << 'EOF' > config/dev.js
export const config = {
  baseUrl: 'https://api.dev.vipleiloes.com',
  headers: { 'Content-Type': 'application/json' }
};
EOF

cat << 'EOF' > config/staging.js
export const config = {
  baseUrl: 'https://api.staging.vipleiloes.com',
  headers: { 'Content-Type': 'application/json' }
};
EOF

cat << 'EOF' > config/prod.js
export const config = {
  baseUrl: 'https://api.vipleiloes.com',
  headers: { 'Content-Type': 'application/json' }
};
EOF

cat << 'EOF' > data/users.csv
username,password
user1,senha1
user2,senha2
user3,senha3
EOF

# Constrói payload JSON para a API do Gist
PAYLOAD=$(jq -n \
  --arg desc "$GIST_DESCRIPTION" \
  --argjson pub $GIST_PUBLIC \
  '{description: $desc, public: $pub, files: {
    "README.md": { content: "'$(sed 's/"/\\"/g' README.md)'" },
    ".gitignore": { content: "'$(sed 's/"/\\"/g' .gitignore)'" },
    "package.json": { content: "'$(sed 's/"/\\"/g' package.json)'" },
    "scripts/smoke.js": { content: "'$(sed 's/"/\\"/g' scripts/smoke.js)'" },
    "scripts/load.js": { content: "'$(sed 's/"/\\"/g' scripts/load.js)'" },
    "scripts/stress.js": { content: "'$(sed 's/"/\\"/g' scripts/stress.js)'" },
    "modules/auth.js": { content: "'$(sed 's/"/\\"/g' modules/auth.js)'" },
    "modules/user.js": { content: "'$(sed 's/"/\\"/g' modules/user.js)'" },
    "config/dev.js": { content: "'$(sed 's/"/\\"/g' config/dev.js)'" },
    "config/staging.js": { content: "'$(sed 's/"/\\"/g' config/staging.js)'" },
    "config/prod.js": { content: "'$(sed 's/"/\\"/g' config/prod.js)'" },
    "data/users.csv": { content: "'$(sed 's/"/\\"/g' data/users.csv)'" }
  }}')

response=$(curl -s -H "Accept: application/vnd.github+json" \
  -H "Authorization: token $TOKEN" \
  https://api.github.com/gists \
  -d "$PAYLOAD")

clone_url=$(echo "$response" | jq -r '.git_pull_url')

echo "Clonando de $clone_url..."
git clone "$clone_url" VipLeiloesQA
