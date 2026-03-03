# Guia de Deploy — RPA Simplificado

**Domínio:** rpasimplificado.com.br
**Frontend:** Vercel
**Backend:** Railway
**Banco de dados:** Supabase
**Pagamentos:** Stripe

---

## Visão Geral da Arquitetura

```
rpasimplificado.com.br        →  Vercel  (Quasar SPA)
api.rpasimplificado.com.br    →  Railway (Fastify API)
                              →  Supabase (banco + storage + auth)
```

---

## Pré-requisitos

- [ ] Conta no [Vercel](https://vercel.com)
- [ ] Conta no [Railway](https://railway.app)
- [ ] Projeto no Supabase com as tabelas criadas (`supabase/courses-schema.sql`)
- [ ] Conta no Stripe (modo produção ativado)
- [ ] Repositório no GitHub com o código
- [ ] Acesso ao painel DNS do domínio (Registro.br ou onde foi comprado)

---

## PASSO 1 — Backend no Railway

### 1.1 Criar o serviço

1. Acesse [railway.app](https://railway.app) → **New Project**
2. Escolha **Deploy from GitHub repo**
3. Selecione o repositório do projeto

### 1.2 Configurar o Root Directory

O backend fica numa subpasta, então é necessário apontar para ela:

```
Settings → Source → Root Directory → backend
```

Railway vai detectar o `package.json` automaticamente e usar `npm start` como comando de inicialização.

### 1.3 Adicionar variáveis de ambiente

```
Settings → Variables → Add Variable
```

| Variável | Valor |
|---|---|
| `PORT` | `3001` |
| `SUPABASE_URL` | `https://muiyuomjafjjgfmyodfx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | chave service_role do Supabase (Settings → API) |
| `STRIPE_SECRET_KEY` | chave secreta do Stripe (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | preencher depois do passo 4 |
| `FRONTEND_URL` | `https://rpasimplificado.com.br` |

### 1.4 Adicionar domínio customizado

```
Settings → Networking → Custom Domain → api.rpasimplificado.com.br
```

O Railway vai exibir um valor CNAME — **anote esse valor** para usar no DNS.

### 1.5 Verificar o deploy

Após o deploy, acesse:

```
https://api.rpasimplificado.com.br/health
```

Resposta esperada:
```json
{ "status": "ok", "timestamp": "..." }
```

---

## PASSO 2 — Frontend no Vercel

### 2.1 Criar o projeto

1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Importe o repositório do GitHub
3. O Vercel detecta automaticamente as configurações do `vercel.json`:
   - **Build Command:** `quasar build`
   - **Output Directory:** `dist/spa`
   - **Install Command:** `npm install`

### 2.2 Adicionar variável de ambiente

```
Settings → Environment Variables
```

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://api.rpasimplificado.com.br` |

> **Importante:** essa variável precisa estar no painel do Vercel, não apenas no `.env` local. O Quasar injeta ela em build time.

### 2.3 Adicionar domínio customizado

```
Settings → Domains
```

Adicione os dois:
```
rpasimplificado.com.br
www.rpasimplificado.com.br
```

O Vercel vai exibir os registros DNS necessários — **anote esses valores**.

---

## PASSO 3 — Configurar DNS

Acesse o painel DNS do seu domínio (Registro.br ou onde foi comprado) e adicione os seguintes registros:

### Frontend (Vercel)

| Tipo | Nome | Valor |
|---|---|---|
| `A` | `@` | `76.76.21.21` |
| `CNAME` | `www` | `cname.vercel-dns.com` |

### Backend (Railway)

| Tipo | Nome | Valor |
|---|---|---|
| `CNAME` | `api` | _(valor exibido pelo Railway no passo 1.4)_ |

> **Propagação DNS:** pode levar de alguns minutos até 24h. Normalmente resolve em menos de 1h.

### SSL/HTTPS

Tanto o Vercel quanto o Railway provisionam certificado SSL automaticamente — não é necessária nenhuma configuração manual.

---

## PASSO 4 — Stripe Webhook

### 4.1 Criar o endpoint

No [dashboard do Stripe](https://dashboard.stripe.com) → **Developers → Webhooks → Add endpoint**:

```
URL: https://api.rpasimplificado.com.br/api/webhooks/stripe
Evento: checkout.session.completed
```

### 4.2 Copiar o Webhook Secret

Após criar, clique no endpoint → **Signing secret → Reveal**

Copie o valor `whsec_...` e adicione no Railway:

```
STRIPE_WEBHOOK_SECRET = whsec_...
```

---

## PASSO 5 — Supabase (configurações de produção)

### 5.1 URL do site (auth redirects)

No Supabase → **Authentication → URL Configuration**:

```
Site URL: https://rpasimplificado.com.br
```

```
Redirect URLs:
https://rpasimplificado.com.br/**
https://www.rpasimplificado.com.br/**
```

### 5.2 Storage buckets

Confirme que os buckets existem e com as permissões corretas:

| Bucket | Visibilidade |
|---|---|
| `videos` | Privado |
| `thumbnails` | Público |
| `covers` | Público |

### 5.3 Usuário admin

1. Crie o usuário admin em **Authentication → Users → Invite user**
2. No **SQL Editor**, defina o role:

```sql
UPDATE profiles SET role = 'admin' WHERE id = 'uuid-do-usuario';
```

---

## PASSO 6 — Variáveis de ambiente (resumo)

### Backend (Railway)

```env
PORT=3001
SUPABASE_URL=https://muiyuomjafjjgfmyodfx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://rpasimplificado.com.br
```

### Frontend (Vercel)

```env
VITE_API_URL=https://api.rpasimplificado.com.br
```

---

## Ordem recomendada de deploy

```
1. Criar serviço no Railway (backend)
2. Configurar variáveis no Railway (sem STRIPE_WEBHOOK_SECRET por enquanto)
3. Adicionar domínio api.rpasimplificado.com.br no Railway → anotar CNAME
4. Criar projeto no Vercel (frontend)
5. Adicionar VITE_API_URL no Vercel
6. Adicionar domínios no Vercel → anotar registros DNS
7. Configurar DNS no Registro.br (todos os registros de uma vez)
8. Aguardar propagação DNS
9. Verificar https://api.rpasimplificado.com.br/health
10. Configurar webhook no Stripe com a URL da API
11. Copiar STRIPE_WEBHOOK_SECRET e adicionar no Railway
12. Fazer redeploy do Railway (para carregar a nova variável)
13. Configurar Site URL no Supabase
14. Testar fluxo completo: cadastro → matrícula → área do aluno
```

---

## Verificação pós-deploy

- [ ] `https://rpasimplificado.com.br` carrega o site
- [ ] `https://www.rpasimplificado.com.br` redireciona para o site
- [ ] `https://api.rpasimplificado.com.br/health` retorna `{ status: "ok" }`
- [ ] Login admin funciona em `/admin`
- [ ] Dashboard admin carrega os dados
- [ ] Blog público carrega posts
- [ ] Cursos públicos listam corretamente
- [ ] Checkout Stripe processa e cria matrícula
- [ ] Área do aluno abre após login
- [ ] Upload de vídeo funciona no admin

---

## Redeploy

### Frontend
Qualquer push para a branch main do GitHub aciona rebuild automático no Vercel.

### Backend
Qualquer push para a branch main aciona redeploy automático no Railway.

Para forçar redeploy manual: Railway → serviço → **Deploy → Redeploy**.
