# Watchly

Veja o que dá para assistir nos streamings que você já usa.

O Watchly é um app web de portfólio, **não comercial**. Ele mostra filmes e séries disponíveis nos serviços da conta, no país escolhido, e deixa guardar uma watchlist.

Este produto usa a API do [TMDB](https://www.themoviedb.org/), mas não é endossado ou certificado pelo TMDB. A disponibilidade de streaming vem da parceria TMDB + [JustWatch](https://www.justwatch.com/).

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4

A conta, as preferências e a watchlist ficam no Supabase. O catálogo e a disponibilidade vêm da TMDB.

## Como rodar

1. Clone o repositório e instale as dependências:

```bash
npm install
```

2. Copie o exemplo de ambiente e preencha as chaves:

```bash
cp .env.example .env
```

O token da TMDB é o **API Read Access Token** (Bearer), não a API Key antiga. Crie em [TMDB API settings](https://www.themoviedb.org/settings/api). Não use o prefixo `NEXT_PUBLIC_` — o token fica só no servidor.

No Supabase: URL do projeto e publishable/anon key. No dashboard, deixe **Confirm email** desligado e autorize `http://localhost:3000/auth/callback` nos redirects.

O schema está em `supabase/migrations/20260912120000_account_persistence.sql`. Se o projeto estiver pausado, restaure no dashboard e cole esse SQL no SQL Editor.

3. Suba o app:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando        | O que faz              |
| -------------- | ---------------------- |
| `npm run dev`  | Servidor de desenvolvimento |
| `npm run build`| Build de produção      |
| `npm test`     | Testes (Vitest)        |
| `npm run lint` | ESLint                 |

## Documentation

- Product requirements: `docs/PRD.md`
- System design: `docs/SSD.md`
- Feature specs: `docs/features/`
- Architecture decisions: `docs/decisions/`
- Changelog: `docs/CHANGELOG.md`
