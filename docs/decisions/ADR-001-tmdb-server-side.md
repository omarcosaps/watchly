# ADR-001 — TMDB acessada somente no servidor

Status: Accepted

## Context

O catálogo, a busca, o detalhe e a disponibilidade de streaming vêm da TMDB API v3, autenticada com API Read Access Token (Bearer). Expor esse token no browser permitiria uso indevido da cota e violaria o recorte não comercial do produto.

Havia duas alternativas descartadas:

- SPA (por exemplo Vite) chamando a TMDB no cliente — o token iria no bundle.
- Edge Function no Supabase só para a TMDB — o Next.js já cobre o BFF, e não havia backend Supabase.

## Decision

Todas as chamadas autenticadas à TMDB passam pelo servidor Next.js.

- Módulos `lib/tmdb` e `lib/catalog` usam `import "server-only"`.
- O browser fala só com `GET /api/catalog`, `/api/search`, `/api/title/[tipo]/[id]`, `/api/meta` e `/api/watch-providers`.
- O token vive em `TMDB_ACCESS_TOKEN`, sem prefixo `NEXT_PUBLIC_`.
- O client pode usar URLs públicas de imagem (`image.tmdb.org`) e o embed do YouTube. Não chama `api.themoviedb.org`.

## Consequences

- O token não entra no bundle do client.
- O app depende dos route handlers como proxy. Essas rotas hoje não exigem sessão de usuário.
- Cache HTTP do Next (`revalidate`) fica no servidor, junto com as queries.
- Trocar o BFF (por exemplo para outro runtime) exigiria manter o mesmo isolamento do token.
