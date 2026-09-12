# SSD — Watchly

Última atualização: 10 de setembro de 2026

Este arquivo é a fonte da verdade técnica do sistema atual. Comportamento e regras de negócio vivem em `docs/PRD.md`. Decisões arquiteturais relevantes ficam em `docs/decisions/`.

## Visão geral da arquitetura

O Watchly é um app Next.js (App Router). O browser renderiza a UI, guarda a conta em `localStorage` e chama route handlers do próprio Next. Esses handlers consultam a TMDB no servidor. Não há banco, middleware de sessão nem Supabase.

```text
Browser (Client Components)
  ├── AccountProvider → localStorage (watchly-account-v1)
  ├── AuthGuard / GuestGuard → redirects no cliente
  └── fetch → /api/*

Route Handlers (app/api/*)
  └── lib/catalog/* + lib/tmdb/*  (import "server-only")
        └── TMDB API v3 (Bearer TMDB_ACCESS_TOKEN)
```

As telas não importam o cliente TMDB. Conta, preferências e watchlist passam pelo contrato em `lib/account`, nunca pelo storage mock direto.

## Stack

| Camada | Escolha |
| --- | --- |
| Framework | Next.js 16.3.2 (App Router) |
| UI | React 19.2.8 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS 4 |
| TMDB no servidor | `server-only` + `fetch` com Bearer |
| Conta | Mock em `localStorage` |
| Testes | Vitest 3.2.4 (unitários em `lib/`) |

Não há `@supabase/*`, ORM, middleware de auth, server actions nem React Query/SWR.

## Estrutura do projeto

```text
app/
  layout.tsx                 AccountProvider, lang=pt-BR
  (auth)/                    login, cadastro, senha, verificar email
  (app)/                     home, onboarding, busca, detalhe, watchlist, preferências
  api/                       catalog, search, title, meta, watch-providers
components/                  UI e guards
lib/
  account/                   contrato público → mock/
  catalog/                   discover, merge, hydrate, detalhe
  tmdb/                      cliente e queries
  api.ts                     fetch helpers do browser
  http.ts                    erros e região obrigatória nas APIs
  media.ts                   filme/serie ↔ movie/tv
```

Grupos de rota: `app/(auth)` para visitante; `app/(app)` para sessão autenticada na UI. Não existe `middleware.ts`.

## Domínios e módulos principais

### Account

Contrato público:

- `lib/account/session.ts` — cadastro, login, logout, confirmar email, reset e atualizar senha
- `lib/account/preferences.ts` — país + `providerIds` (≥1)
- `lib/account/watchlist.ts` — add, remove, list, isSaved, setWatchlistWatched
- `lib/account/types.ts` — `Session`, `Preferences`, `WatchlistItem`
- `lib/account/watch-status.ts` — rótulos “Ainda não assistir” / “Já assistir”

Implementação atual: `lib/account/mock/*`. Ver [ADR-002](decisions/ADR-002-account-abstraction.md).

`AccountProvider` usa `useSyncExternalStore` e reage a mudanças na mesma aba e entre abas (`storage` + evento `watchly-account`).

### Catalog

- `get-catalog.ts` — Discover Movie/TV, merge, hidratação de ofertas
- `get-search.ts` — Search Movie/TV, merge, hidratação (`onlyOwn=false`)
- `get-title.ts` — detalhe, créditos, ofertas, trailer
- `get-meta.ts` — países, gêneros mesclados por nome, provedores por região
- `discover-query.ts` — query TMDB com região, providers (`|` = OR), monetização, adulto desligado
- `hydrate.ts` — uma chamada de watch/providers por item visível
- `merge.ts` — junta filme e série, deduplica, ordena

### TMDB

Cliente único em `lib/tmdb/client.ts`. Queries em `lib/tmdb/queries.ts`. URLs de imagem em `lib/tmdb/image.ts` (usável no client; só paths públicos da CDN).

## Modelo de dados

Conta (`lib/account/types.ts`):

```text
Session        { email, status: authenticated | email_pending }
Preferences    { country: ISO-2, providerIds: number[] }
WatchlistItem  { tmdbId, mediaType: movie | tv, title, posterPath, year, createdAt, watched }
```

Storage (`lib/account/mock/storage.ts`):

```text
StoredAccount { session, preferences, watchlist[] }
```

Catálogo (`lib/catalog/types.ts`): `CatalogItem`, `TitleDetails`, `Offer` (`providerId`, `providerName`, `logoPath`, `monetization`, `isOwn`).

URLs de detalhe usam `filme` | `serie`; o domínio interno usa `movie` | `tv` (`lib/media.ts`).

## Persistência

Só `localStorage`, chave `watchly-account-v1`. Sem Postgres, cookies de sessão ou sync entre dispositivos.

Na watchlist, `title`, `posterPath` e `year` são snapshot de UI no momento de guardar. Disponibilidade **não** é gravada. Itens lidos sem `watched` são tratados como `false`.

Não há migração de dados para outro backend. Limpar o storage apaga sessão, preferências e watchlist.

## Autenticação

Mock em `lib/account/mock/session.ts`. Senha não é persistida. Validação: email com formato válido; senha com pelo menos 6 caracteres.

Casos de QA no mock:

- `usado@watchly.app` → email já usado no cadastro
- `pendente@watchly.app` → `email_pending`
- senha `errada` no login → credencial inválida

Qualquer outra combinação válida entra. `requestPasswordReset` e `updatePassword` só validam input; não enviam email nem gravam senha.

Proteção de rotas no cliente:

- `AuthGuard` — sem sessão → `/login`; email pendente → `/verificar-email`; sem preferências → `/onboarding`
- `GuestGuard` — autenticado não permanece nas telas de auth

As rotas `/api/*` **não** verificam sessão.

## Integração com TMDB

Toda chamada autenticada à TMDB passa por módulos com `import "server-only"`. Token: `TMDB_ACCESS_TOKEN` (sem `NEXT_PUBLIC_`). Header `Authorization: Bearer`. Base `https://api.themoviedb.org/3`. Idioma padrão `pt-BR`. `include_adult=false` em discover e search.

Ver [ADR-001](decisions/ADR-001-tmdb-server-side.md).

Endpoints usados:

| Recurso | Path |
| --- | --- |
| Configuration | `/configuration` |
| Países | `/configuration/countries` |
| Gêneros | `/genre/movie/list`, `/genre/tv/list` |
| Provedores | `/watch/providers/movie`, `/watch/providers/tv` |
| Discover | `/discover/movie`, `/discover/tv` |
| Search | `/search/movie`, `/search/tv` |
| Detalhe | `/movie/{id}`, `/tv/{id}` |
| Créditos | `/movie/{id}/credits`, `/tv/{id}/credits` |
| Ofertas | `/movie/{id}/watch/providers`, `/tv/{id}/watch/providers` |
| Vídeos | `/movie/{id}/videos`, `/tv/{id}/videos` |

Discover da home: `watch_region`, `with_watch_providers` (OR), `with_watch_monetization_types`. A home não filtra título a título antes do Discover. Depois do merge, `hydrateOffers(..., onlyOwn=true)` busca watch/providers só dos itens visíveis.

Busca: Search Movie + Search TV, sem filtro de provedor; hidratação com `onlyOwn=false`.

Detalhe: details + credits + watch/providers da região + videos. Trailers: YouTube, com `include_video_language=pt-BR,en,null`.

Imagens: `image.tmdb.org` (`next.config.ts`).

## Integração com Supabase

Não há. Zero dependência, zero client, zero migration, zero RLS. `.env.example` menciona `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` só como comentário.

## APIs e contratos

Cinco route handlers GET. Sem `"use server"`.

| Rota | Função | Params relevantes |
| --- | --- | --- |
| `GET /api/catalog` | Página de catálogo | `region` (obrigatório), `providers`, `page`, `media`, `monetization`, `genreMovie`, `genreTv`, `year`, `sort`, `filterProviders` |
| `GET /api/search` | Busca | `q` (obrigatório), `region`, `providers`, `page` |
| `GET /api/title/[tipo]/[id]` | Detalhe | `tipo` = `filme` \| `serie`, `region`, `providers` |
| `GET /api/meta` | Países e gêneros | — |
| `GET /api/watch-providers` | Provedores da região | `region` |

`requireRegion` exige ISO-2. Catálogo exige pelo menos um provedor. Query de busca vazia não chama a TMDB.

O browser envia `region` e `providers` a partir das preferências locais (`lib/api.ts`).

Identidade da watchlist: `mediaType + tmdbId`. Ver [ADR-003](decisions/ADR-003-watchlist-identity.md).

## Segurança

- Token TMDB só no servidor
- Imagens públicas da CDN no client
- Auth mock é bypassável (reescrever `localStorage`)
- `/api/*` é um proxy TMDB sem sessão e sem rate limit próprio (além do 429 da TMDB)
- Senhas não são armazenadas nem verificadas contra um registro real

## Cache

`tmdbFetch` usa `fetch(..., { next: { revalidate } })`.

| Dado | TTL |
| --- | --- |
| Configuration, países, gêneros | 24 h |
| Provedores por região | 12 h |
| Discover / search | 15 min |
| Detalhe, créditos, vídeos, watch/providers por título | 6 h |

Não há `unstable_cache` nem `revalidate` de segmento nas rotas. Hidratação de ofertas que falha devolve o item com `offers: []`.

Disponibilidade é sempre consultada na TMDB (com esse cache HTTP), nunca persistida. Ver [ADR-004](decisions/ADR-004-live-availability.md).

## Tratamento de erros

- TMDB: `TmdbError` para 401, 404, 429 e demais falhas
- Route handlers: `jsonError()` — 401 da TMDB vira 502; `Error` vira 400; resto 500
- Conta: `AccountError` + `ACCOUNT_ERROR_COPY` na UI
- UI: `StatusPanel` para vazio, erro e retry; `role="alert"` nos forms

## Decisões técnicas atuais

- TMDB só no servidor, via BFF Next, não no browser e não em Edge Function
- Conta atrás de um contrato (`lib/account`) com implementação mock
- Watchlist identificada por `mediaType + tmdbId` neste navegador
- Disponibilidade live na TMDB; watchlist guarda só snapshot de UI
- Guards de rota no cliente, sem middleware
- Grade mista: mesma `page` nos dois Discovers, merge e ordenação no servidor, “Carregar mais” na UI
- Gêneros de filme e série mesclados por nome para a UI
- Conteúdo adulto sempre desligado na query

## Limitações técnicas

- Sem persistência de servidor e sem sync entre dispositivos
- APIs de catálogo públicas (qualquer cliente com `region` + `providers`)
- Páginas majoritariamente Client Components; pouco SSR de dados TMDB
- Emails de auth são simulados
- `applyCountryChange()` existe no contrato de preferências, mas a UI salva só via `savePreferences()` no submit do formulário

## Dívida técnica conhecida

- Auth e dados de conta ainda são mock; a abstração existe para trocar a implementação sem reescrever as telas
- `hydrateOffers` faz uma chamada TMDB por item visível (N+1), mitigada pelo cache de 6 h
- Sem testes de componente, rota ou E2E; só unitários em `lib/`
- Proteção de rotas só no cliente
- Proxy TMDB sem autenticação de usuário nem cota própria
