# Bolão Copa do Mundo 2026 — Guia de Setup

## Pré-requisitos
- Node.js 20+ instalado (nodejs.org)
- Conta Google (para login dos participantes)
- Conta Supabase (supabase.com) — gratuita
- Conta Vercel (vercel.com) — gratuita

---

## PASSO 1 — Instalar dependências

```bash
cd bolao-copa-2026
npm install
```

---

## PASSO 2 — Criar projeto no Supabase

1. Acesse https://supabase.com → New Project
2. Dê um nome (ex: `bolao-2026`) e guarde a senha do banco
3. Após criar, vá em **SQL Editor** e execute em ordem:
   - `supabase/schema.sql`  ← estrutura do banco
   - `supabase/jogos_copa_2026.sql`  ← jogos da fase de grupos

4. Vá em **Project Settings → API** e copie:
   - `Project URL`
   - `anon public key`
   - `service_role key`

---

## PASSO 3 — Configurar autenticação Google no Supabase

1. No Supabase: **Authentication → Providers → Google** → habilitar
2. Acesse https://console.cloud.google.com
3. Crie um projeto → **APIs & Services → Credentials → OAuth 2.0 Client ID**
   - Tipo: Web application
   - Authorized redirect URIs: `https://SEU_PROJETO.supabase.co/auth/v1/callback`
4. Copie **Client ID** e **Client Secret** e cole no Supabase
5. No Supabase: **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (dev) ou `https://seu-app.vercel.app` (prod)
   - Redirect URLs: adicione ambas

---

## PASSO 4 — Configurar variáveis de ambiente

```bash
# Copie o arquivo de exemplo
copy .env.local.example .env.local
```

Edite `.env.local` com os valores do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
NEXT_PUBLIC_ADMIN_EMAILS=seuemail@gmail.com
```

---

## PASSO 5 — Rodar localmente

```bash
npm run dev
```

Acesse: http://localhost:3000

---

## PASSO 6 — Tornar-se admin

1. Faça login com seu Google no app
2. No Supabase → **Table Editor → perfis**
3. Encontre sua linha e mude `is_admin` para `true`

A partir daí você pode usar o painel Admin para inserir resultados.

---

## PASSO 7 — Deploy no Vercel (para compartilhar pelo WhatsApp)

1. Acesse https://vercel.com → New Project → Import from GitHub
   (ou use: `npx vercel` no terminal)
2. Em **Environment Variables**, adicione as mesmas do `.env.local`
3. Após deploy, copie a URL (ex: `bolao-2026.vercel.app`)
4. Atualize no Supabase: **Authentication → URL Configuration → Site URL**

---

## PONTUAÇÃO

| Resultado | Pontos |
|---|---|
| Placar exato (ex: 2×1 = 2×1) | **3 pontos** |
| Acertou o vencedor ou empate | **1 ponto** |
| Errou tudo | **0 pontos** |

---

## Como funciona no dia a dia

1. Você compartilha o link do Vercel no WhatsApp
2. Participantes entram com Google e fazem seus palpites **antes de cada jogo**
3. Durante/após o jogo, você entra no **Painel Admin** e insere o placar final
4. O sistema recalcula automaticamente os pontos de todos
5. O ranking atualiza em tempo real para todos os participantes

---

## Estrutura de arquivos

```
bolao-copa-2026/
├── src/
│   ├── app/
│   │   ├── (auth)/login/     ← Tela de login
│   │   ├── (app)/jogos/      ← Lista de jogos + palpites
│   │   ├── (app)/ranking/    ← Ranking em tempo real
│   │   └── admin/            ← Painel admin (só admins)
│   ├── components/
│   │   └── NavBar.tsx        ← Barra de navegação inferior
│   ├── lib/supabase/         ← Clientes Supabase (browser/server)
│   └── types/                ← Types TypeScript
├── supabase/
│   ├── schema.sql            ← Estrutura do banco
│   └── jogos_copa_2026.sql   ← Jogos pré-cadastrados
└── .env.local.example        ← Template das variáveis
```
