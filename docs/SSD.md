# SSD — Watchly

Última atualização: 12 de setembro de 2026

Este arquivo é a fonte da verdade técnica do sistema. Comportamento e regras de negócio vivem em `docs/PRD.md`. Decisões arquiteturais relevantes ficam em `docs/decisions/`.

O PRD descreve o comportamento aprovado e desejado. Este SSD separa o que o código faz hoje do que precisa mudar para suportá-lo. Não misturar os dois estados.

## Visão geral da arquitetura

### Current architecture

O Watchly é um app Next.js (App Router). O browser renderiza a UI, guarda a conta em `localStorage` e chama route handlers do próprio Next. Esses handlers consultam a TMDB no servidor. Não há banco, middleware de sessão nem Supabase.

```text
Browser (Client Components)
  ├── AccountProvider → localStorage (watchly-account-v2)
  ├── Rotas públicas: home, busca, detalhe
  ├── AuthGuard: watchlist, onboarding, perfil
  └── fetch → /api/*

Route Handlers (app/api/*)
  └── lib/catalog/* + lib/tmdb/*  (import "server-only")
        └── TMDB API v3 (Bearer TMDB_ACCESS_TOKEN)
```

As telas não importam o cliente TMDB. Conta, preferências e watchlist passam pelo contrato em `lib/account`, nunca pelo storage mock direto.

Home, busca e detalhe são públicos. Visitante usa `region=BR` e lista vazia de provedores.

### Target architecture

O fluxo de produto do PRD já está na UI e no contrato mock. Ainda pendente: persistência em servidor e envio real de e-mail.

Não copiar do protótipo HTML: `localStorage` de API key, chamada direta à TMDB no browser ou mocks de catálogo.

A implementação mock continua atrás do contrato ([ADR-002](decisions/ADR-002-account-abstraction.md)).

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
  layout.tsx                 AccountProvider, ToastProvider, lang=pt-BR
  (auth)/                    login, cadastro, senha (sem nav)
  (browse)/                  home, busca, detalhe (públicos)
  (app)/                     watchlist, perfil
  (setup)/                   onboarding isolado, sem nav, com atribuição
  api/                       catalog, search, title, meta, watch-providers
components/                  UI e guards
hooks/                       leave-then-navigate, cascata de entrada, navegação do shell
lib/
  account/                   contrato público → mock/
  catalog/                   discover, merge, hydrate, detalhe
  tmdb/                      cliente e queries
  api.ts                     fetch helpers do browser
  http.ts                    erros e região obrigatória nas APIs
  media.ts                   filme/serie ↔ movie/tv
  motion.ts                  tokens, identidade de tela e helpers de entrada/saída
```

Grupos de rota: `app/(browse)` público com nav pill flutuante; `app/(app)` autenticado (watchlist, perfil) com o mesmo chrome; `app/(setup)` autenticado sem nav (onboarding), com atribuição; `app/(auth)` para visitante, sem wordmark no header. A home e o detalhe ocupam a largura toda (hero/backdrop edge-to-edge); as demais telas do shell usam padding-top ~110px. A Home busca o Hero à parte da grade (`sort=trending`, página 1, sem filtros da URL); só o país de referência entra. `sort=trending` usa `/trending/all/week`, descarta pessoa e adulto, hidrata ofertas e fica só com título que tem still e oferta no país. O Hero mede o parágrafo da sinopse no client e escolhe um candidato extrativo que caiba em 3 linhas. Sem hero (erro ou lista vazia), a Home aplica o mesmo offset para não ficar sob a pill. Não existe `middleware.ts`. `/verificar-email` redireciona para `/login`. Logout volta para `/`.

Tokens visuais em `app/globals.css`: fundo `#0b0c10`, texto `#f2f3f5`, positivo/alerta em oklch, sem ember como accent. Nav: pill fixa centrada, `rgba(16,17,23,.7)` + blur 20. Auth: card 404px com gradiente `#191c22 → #101216` e atmosphere azul. Toast de watchlist é efêmero no client.

Movimento de tela no shell com nav pill (Home, busca, detalhe, Watchlist, Perfil): classes `.d-back`, `.d-in` e `.d-leaving` em `globals.css` (entrada 400ms / `translateY(14px)`, saída 260ms / `translateY(8px)`). `PageMotionProvider` no `AppShell` expõe `leaveThen`; o frame de saída é chaveado pela identidade da tela (`lib/motion.ts`) para o leave não prender a rota seguinte. A identidade da Home inclui só `media`: `home`, `home:movie`, `home:tv`. Gênero, ano, sort e provedor não mudam a identidade. A origem da comparação usa pathname + search, não só o pathname. `ScreenLink` e `useScreenNavigate` interceptam o clique primário quando origem e destino são telas diferentes do shell; o filtro Tipo da Home também passa por `leaveTo`. Digitação na busca, demais filtros e destino auth/onboarding não passam pelo leave. Durante os 260ms há `prefetch` da rota e, em URL de título, `fetchTitle`; destino Home também aquece catálogo, hero, meta e provedores (cache in-flight + peek em `lib/api.ts`). O guard de reentrada é um ref. Depois de 1100ms o Hero tira `.d-in` dos filhos para a troca de slide não re-animar o texto. Busca, Watchlist e Perfil entram só com cascata de conteúdo (sem `.d-back`). Auth e onboarding mantêm `.fade-up`. `prefers-reduced-motion: reduce` desliga a cascata e o atraso de saída.

## Domínios e módulos principais

### Account

Contrato público atual:

- `lib/account/session.ts` — cadastro, login, logout, confirmar email, reset e atualizar senha
- `lib/account/preferences.ts` — país + `providerIds` (≥1)
- `lib/account/watchlist.ts` — add, remove, list, isSaved, setWatchlistWatched
- `lib/account/types.ts` — `Session`, `Preferences`, `WatchlistItem`, `AcquisitionSource`
- `lib/account/watch-status.ts` — rótulos **Ainda não assistido** / **Já assistido**

Implementação atual: `lib/account/mock/*`. Store `watchly-account-v2` isola dados por e-mail. Ver [ADR-002](decisions/ADR-002-account-abstraction.md).

`AccountProvider` usa `useSyncExternalStore` e reage a mudanças na mesma aba e entre abas (`storage` + evento `watchly-account`).

Cadastro exige origem de aquisição. Sessão só tem status `authenticated`.

### Catalog

- `get-catalog.ts` — Discover Movie/TV, merge, hidratação de ofertas
- `get-search.ts` — Search Movie/TV, merge, hidratação (`onlyOwn=false`)
- `get-title.ts` — detalhe, créditos, ofertas, trailer
- `get-meta.ts` — países, gêneros mesclados por nome, provedores por região
- `discover-query.ts` — query TMDB com região, providers (`|` = OR), monetização, adulto desligado
- `hydrate.ts` — uma chamada de watch/providers por item visível
- `merge.ts` — junta filme e série, deduplica, ordena
- `hero-params.ts` — query do Hero (`page=1`, `sort=trending`), sem filtros da listagem
- `trending.ts` — mapeia `/trending/all/week` e escolhe os itens do Hero (still + oferta)
- `hero-synopsis.ts` — candidatos extrativos da sinopse e escolha do texto que cabe em 3 linhas no Hero

Discover sem `with_watch_providers` quando a lista está vazia; hidratação com `onlyOwn=false`. Visitante: `region=BR`. Filtro de provedor opcional na UI. Faixas de ano via `yearRange`.

O BFF de trailer pode permanecer sem superfície de produto. O PRD não inclui trailer nem link do título na TMDB.

### TMDB

Cliente único em `lib/tmdb/client.ts`. Queries em `lib/tmdb/queries.ts`. URLs de imagem em `lib/tmdb/image.ts` (usável no client; só paths públicos da CDN).

## Modelo de domínio

Entidades de negócio do Watchly, validadas contra o PRD, o código e o store atual. Não há tabela física. **Profile** não é entidade persistida: a tela Perfil é UI sobre User e Preferences.

| Conceito | Responsabilidade | Existe hoje? |
| --- | --- | --- |
| User | Identidade da sessão (e-mail). Hoje: `Session`. | Sim, como `Session` |
| Acquisition source | Origem informada no cadastro. Lista fechada. Não é editável depois. | Sim, no mock |
| Preferences | País de referência + streamings escolhidos (≥1). | Sim |
| Country | Conjunto de produto: `BR`, `US`, `PT`. A TMDB continua sendo a fonte de provedores da região. | Sim, na UI |
| Streaming provider | Serviço de streaming da TMDB numa região. | Sim, como dado de catálogo (`WatchProvider`) |
| Streaming preference | Vínculo entre a conta e um provedor escolhido. | Sim, como `providerIds[]` em Preferences |
| Media | Filme ou série da TMDB. Não é persistido como registro próprio. | Sim, só em runtime |
| Watchlist item | Título guardado pela conta, com status de visualização e snapshot de UI. | Sim |

## Diagrama entidade-relacionamento conceitual

Domínio do produto, independente da estrutura física.

```mermaid
erDiagram
    USER ||--o| PREFERENCES : configura
    USER ||--o{ WATCHLIST_ITEM : adiciona
    USER ||--|| ACQUISITION_SOURCE : informa_no_cadastro
    COUNTRY ||--o| PREFERENCES : referencia
    COUNTRY ||--o{ STREAMING_PROVIDER : disponibiliza
    STREAMING_PROVIDER ||--o{ STREAMING_PREFERENCE : selecionado_em
    PREFERENCES ||--o{ STREAMING_PREFERENCE : inclui
    MEDIA ||--o{ WATCHLIST_ITEM : pertence_a
```

## Diagrama de relacionamento de entidades

Não existem migrations, Postgres nem Supabase. O modelo persistido real é um JSON em `localStorage`. O diagrama abaixo descreve esse store. Campos propostos para o PRD aparecem como **Proposed**.

### Current

Store atual: `watchly-account-v2` em `lib/account/mock/storage.ts`.

```text
Session        { email, status: authenticated }
StoredUser     { password, acquisitionSource, preferences, watchlist[] }
StoredState    { session, accounts: { [email]: StoredUser } }
```

Dados isolados por e-mail. A UI lê a visão `{ session, preferences, watchlist }` da conta corrente.

```mermaid
erDiagram
    stored_account {
        object session
        object preferences
        array watchlist
    }

    session {
        string email PK
        string status
    }

    preferences {
        string country
        number_array providerIds
    }

    watchlist_item {
        number tmdbId
        string mediaType
        string title
        string posterPath
        number year
        timestamp createdAt
        boolean watched
    }

    stored_account ||--o| session : tem
    stored_account ||--o| preferences : tem
    stored_account ||--o{ watchlist_item : contem
```

Identidade de um item: `mediaType + tmdbId` neste navegador. Ver [ADR-003](decisions/ADR-003-watchlist-identity.md).

Catálogo em runtime (`lib/catalog/types.ts`): `CatalogItem`, `TitleDetails`, `Offer` (`providerId`, `providerName`, `logoPath`, `monetization`, `isOwn`). URLs de detalhe usam `filme` | `serie`; o domínio interno usa `movie` | `tv` (`lib/media.ts`).

### Proposed

O contrato mock acima já cobre o PRD. Schema SQL continua **não existente**. Persistência em servidor exigiria ADR.

```mermaid
erDiagram
    account {
        string email PK
        string status
        string acquisitionSource
    }

    preferences {
        string email FK
        string country
        number_array providerIds
        timestamp updatedAt
    }

    watchlist_item {
        string email FK
        number tmdbId
        string mediaType
        string title
        string posterPath
        number year
        timestamp createdAt
        boolean watched
    }

    account ||--o| preferences : configura
    account ||--o{ watchlist_item : adiciona
```

Não existem tabelas `profiles`, `streaming_providers` persistidas nem `user_streaming_preferences`. Inventar schema SQL agora exigiria uma decisão de backend que ainda não foi tomada.

## Persistência

### Current

Só `localStorage`, chave `watchly-account-v2`. Sem Postgres, cookies de sessão ou sync entre dispositivos. Migra `watchly-account-v1` se existir.

Na watchlist, `title`, `posterPath` e `year` são snapshot de UI no momento de guardar. Disponibilidade **não** é gravada. Itens lidos sem `watched` são tratados como `false`.

Não há migração de dados para outro backend. Limpar o storage apaga sessão, preferências e watchlist.

### Target

Persistência em servidor (Supabase ou outro) **não** está definida. Sem ADR e sem schema até essa escolha.

## Autenticação

### Current

Mock em `lib/account/mock/session.ts`. Senha fica no store mock só para conferir login. Validação: email com formato válido; senha com pelo menos 6 caracteres; origem obrigatória no cadastro.

Casos de QA no mock:

- `usado@watchly.app` → email já usado no cadastro
- senha `errada` no login → credencial inválida
- e-mail sem cadastro → conta não encontrada

`requestPasswordReset` e `updatePassword` só validam input; não enviam email.

Proteção de rotas no cliente:

- `AuthGuard` — sem sessão → `/login`; sem preferências → `/onboarding`
- `GuestGuard` — autenticado não permanece nas telas de auth
- Home, busca e detalhe sem sessão
- Logout → `/`

As rotas `/api/*` **não** verificam sessão.

Recuperação: o PRD descreve “enviar um link”. Não há serviço de e-mail no repositório.

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

### Current

Discover da home: `watch_region`, `with_watch_providers` (OR), `with_watch_monetization_types`. A home não filtra título a título antes do Discover. Depois do merge, `hydrateOffers(..., onlyOwn=true)` busca watch/providers só dos itens visíveis.

Busca: Search Movie + Search TV, sem filtro de provedor; hidratação com `onlyOwn=false`.

Detalhe: details + credits + watch/providers da região + videos. Trailers: YouTube, com `include_video_language=pt-BR,en,null`.

Imagens: `image.tmdb.org` (`next.config.ts`).

Países de produto na UI: `BR`, `US`, `PT`. Provedores vêm da TMDB por região. Home pública: `providers` opcional, visitante `BR`, hidratação com ofertas do país. Paginação permanece como limitação da TMDB. Trailer pode continuar no BFF sem superfície de produto.

## Integração com Supabase

Não há. Zero dependência, zero client, zero migration, zero RLS. `.env.example` menciona `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` só como comentário.

Introduzir Supabase exigiria ADR. Não está decidido.

## APIs e contratos

Cinco route handlers GET. Sem `"use server"`.

| Rota | Função | Params relevantes |
| --- | --- | --- |
| `GET /api/catalog` | Página de catálogo | `region` (obrigatório), `providers` (opcional), `page`, `media`, `yearRange`, `sort`, `filterProviders` |
| `GET /api/search` | Busca | `q` (obrigatório), `region`, `providers`, `page` |
| `GET /api/title/[tipo]/[id]` | Detalhe | `tipo` = `filme` \| `serie`, `region`, `providers` |
| `GET /api/meta` | Países e gêneros | — |
| `GET /api/watch-providers` | Provedores da região | `region` |

`requireRegion` exige ISO-2. Query de busca vazia não chama a TMDB.

### Current

`GET /api/catalog`: `providers` é opcional. Visitante consulta com `region=BR`. Conta autenticada envia o país salvo e os provedores só para personalizar ou filtrar.

Identidade da watchlist: `mediaType + tmdbId`, acrescida da identidade da conta quando o store deixar de ser um blob único. Ver [ADR-003](decisions/ADR-003-watchlist-identity.md).

## Segurança

- Token TMDB só no servidor
- Imagens públicas da CDN no client
- Auth mock é bypassável (reescrever `localStorage`)
- `/api/*` é um proxy TMDB sem sessão e sem rate limit próprio (além do 429 da TMDB)
- Senhas do mock ficam no `localStorage` só para conferir login; não há hash nem backend

A home pública torna o proxy de catálogo ainda mais alinhado ao produto. Continua sem autenticação de usuário nas rotas `/api/*`.

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

Uma home sem filtro de provedor aumenta o volume de Discover e de hidratação.

## Tratamento de erros

- TMDB: `TmdbError` para 401, 404, 429 e demais falhas
- Route handlers: `jsonError()` — 401 da TMDB vira 502; `Error` vira 400; resto 500
- Conta: `AccountError` + `ACCOUNT_ERROR_COPY` na UI
- UI: `StatusPanel` para vazio, erro e retry; `role="alert"` nos forms

Mensagens de origem de aquisição e de gate de visitante estão na UI.

## Decisões técnicas atuais

- TMDB só no servidor, via BFF Next, não no browser e não em Edge Function
- Conta atrás de um contrato (`lib/account`) com implementação mock
- Watchlist identificada por `mediaType + tmdbId` neste navegador
- Disponibilidade live na TMDB; watchlist guarda só snapshot de UI
- Guards de rota no cliente, sem middleware
- Grade mista: mesma `page` nos dois Discovers, merge e ordenação no servidor, “Carregar mais” na UI
- Gêneros de filme e série mesclados por nome para a UI
- Conteúdo adulto sempre desligado na query

Essas decisões continuam válidas no que o PRD não contradiz. Um ADR novo só deve nascer quando a implementação escolher backend, envio de e-mail ou a query da home pública.

## Limitações técnicas

- Sem persistência de servidor e sem sync entre dispositivos
- APIs de catálogo públicas (qualquer cliente com `region`; hoje também exige `providers`)
- Páginas majoritariamente Client Components; pouco SSR de dados TMDB
- Emails de auth são simulados
- `applyCountryChange()` existe no contrato de preferências, mas a UI salva só via `savePreferences()` no submit do formulário
- A listagem não carrega o catálogo inteiro de uma vez; a paginação é restrição da TMDB, não requisito de UX

## Dívida técnica conhecida

- Auth e dados de conta ainda são mock; a abstração existe para trocar a implementação sem reescrever as telas
- `hydrateOffers` faz uma chamada TMDB por item visível (N+1), mitigada pelo cache de 6 h
- Sem testes de componente, rota ou E2E; só unitários em `lib/`
- Proteção de rotas só no cliente
- Proxy TMDB sem autenticação de usuário nem cota própria

## Decisões pendentes

1. **Persistência em servidor** — o PRD pede dados por conta; o repo ainda é mock. Sem schema SQL e sem ADR até essa escolha.
2. **Envio real de e-mail** na recuperação de senha — o PRD descreve o comportamento esperado; o sistema atual não envia mensagem.
