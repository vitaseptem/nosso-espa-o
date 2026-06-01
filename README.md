# 🌌 Nosso Universo ❤️

Plataforma privada e exclusiva para um casal e sua filha Valentina.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript 5 + Vite 5 |
| Estilos | TailwindCSS 3 + Framer Motion |
| Roteamento | React Router v6 |
| Estado | Zustand |
| Backend | Supabase (Auth, PostgreSQL, Realtime, Storage) |
| PWA | vite-plugin-pwa + Workbox |
| Deploy | GitHub Pages (GitHub Actions) |

## Módulos

| # | Módulo | Descrição |
|---|--------|-----------|
| — | Dashboard | Contador de dias juntos, próximas datas, memórias recentes |
| 1 | Linha do Tempo | Memórias com fotos/vídeos, filtros por ano |
| 2 | Álbum | Galeria de mídia com lightbox |
| 3 | Calendário | Datas especiais com suporte a recorrência anual |
| 4 | Adivinhe meu Pensamento | Jogo de adivinhação entre o casal |
| 5 | Humor do Dia | Registro emocional diário com gráfico |
| 6 | Chat Privado | Mensagens em tempo real (Supabase Realtime) |
| 7 | Chamada de Áudio | WebRTC — somente áudio, baixa latência |
| 8 | Cartas para o Futuro | Mensagens com data de abertura bloqueada |
| 9 | Nosso Universo | Canvas interativo — memórias = estrelas, datas = planetas |
| 10 | Cantinho da Valentina | Linha do tempo e álbum exclusivos da filha |

## Instalação e Deploy

### 1. Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **SQL Editor** → **New query**
3. Cole o conteúdo de `supabase/nosso_universo.sql` e clique **RUN**
4. Vá em **Authentication → Providers → Email** e **desative** "Allow new users to sign up"
5. Edite os e-mails na tabela `app_allowed_users` (via SQL ou Table Editor)
6. **Authentication → Users → Add user**: crie os 2 usuários com exatamente esses e-mails

### 2. Ícones PWA

Abra `public/icons/generate-icons.html` no navegador, baixe os dois PNGs e salve como:
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`

### 3. Desenvolvimento local

```bash
npm install
cp .env.example .env
# Preencha VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_HUSBAND_EMAIL, VITE_WIFE_EMAIL
npm run dev
```

### 4. Deploy no GitHub Pages

1. **Settings → Pages → Source**: "GitHub Actions"
2. **Settings → Secrets → Actions** — crie 4 secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_HUSBAND_EMAIL`
   - `VITE_WIFE_EMAIL`
3. Push para `main` → deploy automático

### 5. Instalar como PWA no Android

Chrome → Menu (⋮) → **Adicionar à tela inicial**

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_SUPABASE_URL` | URL do projeto (ex: `https://xxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Chave anon pública |
| `VITE_HUSBAND_EMAIL` | E-mail do marido |
| `VITE_WIFE_EMAIL` | E-mail da esposa |

## Segurança

- **2 usuários fixos** — sem cadastro, sem 3º acesso
- **RLS em todas as tabelas** — nenhum dado sem autenticação
- **Storage privado** — todos os buckets exigem autenticação
- **Cartas bloqueadas no servidor** — RLS impede leitura antes da `open_date`
- **Triggers** — bloqueiam criação de 3º usuário e alteração de e-mail
