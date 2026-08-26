# Plano técnico — Watchly

Última atualização: 24 de agosto de 2026

Fonte de produto: [`docs/prd.md`](prd.md). Este arquivo define como implementar o MVP. Não altera regras de produto.

## Summary

O repositório hoje não tem app — só PRD, skills e credencial TMDB local. O MVP continua o mesmo: **Next.js (App Router) + TypeScript + Tailwind**, **TMDB só no servidor**, **Supabase** para conta, preferências e watchlist.

A **ordem de construção** é em duas fases:

1. **Fase A — interface + catálogo.** Telas, fluxos e TMDB real. Sessão, preferências e watchlist atrás de um contrato com implementação mock.
2. **Fase B — banco.** Trocar o mock por Supabase Auth + Postgres + RLS, sem reescrever as telas.

O produto não muda: o MVP só está completo depois da Fase B. Mock não é persistência de produto. `localStorage` (ou memória) na Fase A é andaime, não a watchlist final.

## Current Architecture

Não existe aplicação implementada.

O que já está no repo:

- `docs/prd.md` — decisões de produto
- `.env` — `TMDB_ACCESS_TOKEN` (local, gitignored); token já validado contra configuration e provedores BR
- `.env.example` — nomes das variáveis, **sem** secrets
- `.gitignore` — ignora `.env`, `node_modules`, `.next`

Não há padrão de pastas, testes nem clientes de API para reutilizar.

## Proposed Approach

### Estratégia em duas fases

| | Fase A | Fase B |
| --- | --- | --- |
| UI e rotas | Sim | Reuso |
| TMDB no servidor | Sim | Reuso |
| Sessão / preferências / watchlist | Mock atrás de contratos | Supabase |
| Token TMDB no browser | Não | Não |
| Pronto para uso pessoal real | Não | Sim |

A Fase A precisa obedecer as regras do PRD (conta obrigatória na UI, ≥1 provedor, chave `tipo + id`, troca de país não apaga watchlist). Senão a Fase B vira retrabalho.

### Stack

| Camada | Escolha | Quando |
| --- | --- | --- |
| UI | Next.js App Router + React + TypeScript + Tailwind | Fase A |
| Catálogo | TMDB v3 no servidor (`Authorization: Bearer`) | Fase A |
| Componentes | Tailwind; shadcn/ui só para primitivos | Fase A |
| Auth + dados do usuário | Supabase (`@supabase/ssr` + Postgres + RLS) | Fase B |

**Alternativa descartada:** SPA Vite + TMDB no cliente. Exporia o token.

**Alternativa descartada:** Edge Function no Supabase para a TMDB. O Next já cobre o BFF.

**Alternativa descartada:** adiar a TMDB junto com o banco. Sem catálogo real, selos, filtros e detalhe ficam fictícios e se reescrevem na integração.

### Contratos da conta (Fase A e B)

Três módulos. As telas dependem só da interface, nunca do Supabase direto.

```text
lib/account/session.ts       logado | deslogado | email pendente
lib/account/preferences.ts   país + provider_ids (≥1)
lib/account/watchlist.ts     add | remove | list | isSaved (chave tipo + tmdb_id)
```

- **Fase A:** `lib/account/mock/*` — um usuário de desenvolvimento; persistência local só para sobreviver a reload enquanto se constrói a UI. Login de mock aceita qualquer email/senha com validação de formato, para montar as mensagens de erro.
- **Fase B:** as mesmas funções passam a usar Auth + `profiles` + `watchlist_items`. O mock é removido ou fica atrás de flag de dev, sem caminho de produção.

Regras que o mock **já** deve cumprir:

- Sem sessão → só rotas `(auth)`
- Sessão sem preferências → `/onboarding`
- Preferências exigem ≥1 provedor
- Watchlist não duplica `media_type + tmdb_id`
- Trocar país desmarca provedores inválidos; se zerar, volta ao onboarding; watchlist permanece
- Falha ao salvar watchlist não deixa o toggle como salvo (na Fase A, falha só se a persistência local quebrar)

### Separação de responsabilidades

- **Fase A, browser:** UI + mock da conta
- **Fase A e B, servidor Next:** todas as chamadas TMDB
- **Fase B, browser + RLS:** login real, perfil, watchlist
- **Nunca** persistir catálogo TMDB no Postgres. Disponibilidade continua da TMDB, com cache HTTP no Next

### Rotas

```text
/login
/cadastro
/recuperar-senha
/atualizar-senha
/verificar-email

/                    home (catálogo) — exige sessão + preferências
/onboarding          país + provedores — exige sessão, sem preferências ainda
/busca
/titulo/[tipo]/[id]  tipo = filme | serie
/watchlist
/preferencias        trocar país e streamings
```

Grupos Next: `app/(auth)` público; `app/(app)` protegido.

Fase A: proteção via o contrato de sessão (layout ou middleware simples).  
Fase B: `@supabase/ssr` no `middleware.ts` (refresh de cookie + os mesmos redirects).

### Auth (produto — Fase B no fio, UI na Fase A)

A Fase A constrói todas as telas: cadastro, login, logout, recuperar senha, atualizar senha, verificar email, mensagens de erro.

Na Fase A, recuperar/atualizar senha e verificar email são **UI completa com fluxo mock** (ex.: “email enviado”). O envio real de email só existe na Fase B.

Recomendação de setup na Fase B (não é regra de produto): para uso pessoal, desligar confirmação de email no painel do Supabase reduz atrito. A UI cobre o estado pendente nos dois casos.

### Schema Supabase (somente Fase B)

Duas tabelas. Sem row de perfil = onboarding pendente.

```sql
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  country text not null default 'BR',
  provider_ids integer[] not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint country_iso check (country ~ '^[A-Z]{2}$'),
  constraint providers_not_empty check (cardinality(provider_ids) >= 1)
);

create table public.watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  year integer,
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);
```

`title` / `poster_path` / `year` na watchlist são cache de UI. Disponibilidade **não** é gravada: sempre buscada na hora, no país atual do perfil.

RLS: `select` / `insert` / `update` / `delete` só com `auth.uid() = user_id`.

Na Fase B, dados do mock local **não** são migrados. Greenfield: a pessoa cadastra de novo.

### TMDB no servidor (Fase A)

Módulo `lib/tmdb` com `import "server-only"`. Token só em `TMDB_ACCESS_TOKEN` (sem `NEXT_PUBLIC_`).

Cliente HTTP único: `fetch` para `https://api.themoviedb.org/3/...` com Bearer, `language=pt-BR`, `include_adult=false`.

Cache Next (`revalidate`):

| Dado | TTL sugerido |
| --- | --- |
| Configuration (base de imagem) | 24 h |
| Lista de provedores por região | 12 h |
| Gêneros e países | 24 h |
| Discover / search | 10–15 min |
| Detalhe + watch/providers por título | 6 h |

### Grade mista (filme + série)

Discover Movie e Discover TV são endpoints separados. A home **não** chama watch/providers título a título para filtrar — o filtro entra no Discover:

- `watch_region` = país das preferências (mock ou `profiles`)
- `with_watch_providers` = ids da conta (pipe `\|` = OR)
- `with_watch_monetization_types` = `flatrate\|free\|ads\|rent\|buy` no padrão; o filtro da UI restringe esse conjunto
- `with_watch_providers` ainda mais estreito se a pessoa filtrar um subconjunto dos provedores dela

**Merge:** cada “página” da UI busca a mesma `page` nos dois Discovers, junta os resultados, marca `media_type` e ordena no servidor pela chave pedida (popularidade, nota ou data). A UI usa **carregar mais**.

Filtro “só filmes” ou “só séries”: um único Discover.

### Selos nos cards

O Discover **não** devolve a forma da oferta. Depois da página mergeada o servidor busca `/{movie\|tv}/{id}/watch/providers` **só dos itens visíveis**, em paralelo, e recorta para a região + provedores da conta.

Busca: Search Movie + Search TV (sem filtro de provedor). Depois, a mesma hidratação para distinguir “está nos seus streamings” vs “não está”.

Detalhe: Details + credits + watch/providers do país; provedores da conta em destaque; link TMDB, sem deep link de streaming.

### Variáveis de ambiente

Fase A:

```bash
TMDB_ACCESS_TOKEN=          # servidor
```

Fase B, além da TMDB:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Nunca commitar `.env`. Nunca prefixar o token TMDB com `NEXT_PUBLIC_`.

### Convenções de código

Alinhar às regras de frontend do workspace: TypeScript, Tailwind, early returns, `const` para handlers (`handleClick`), acessibilidade nos controles, sem ponto e vírgula.

## Affected Components

| Área | Papel | Fase |
| --- | --- | --- |
| `app/(auth)/*` | Login, cadastro, senha, verificar email | A |
| `app/(app)/page.tsx` | Home / catálogo | A |
| `app/(app)/onboarding` | País + provedores | A |
| `app/(app)/busca` | Busca | A |
| `app/(app)/titulo/[tipo]/[id]` | Detalhe | A |
| `app/(app)/watchlist` | Lista | A |
| `app/(app)/preferencias` | Troca de país/provedores | A |
| `lib/account/` | Contratos de sessão, preferências, watchlist | A, swap em B |
| `lib/tmdb/` | Cliente e queries TMDB | A |
| `lib/catalog/` | Merge, filtros, query Discover | A |
| `components/` | Card, selos, grade, header, atribuição | A |
| `lib/supabase/` | Browser, server, middleware | B |
| `supabase/migrations/` | Schema + RLS | B |
| `middleware.ts` | Sessão real e redirects | B |

## Data / API Changes

**Fase A — TMDB (somente leitura):** Configuration, Watch Providers, Discover Movie/TV, Search Movie/TV, Genre lists, Configuration countries, Movie/TV details, credits.

**Fase A — BFF Next (usa preferências do contrato de conta):**

- `GET /api/catalog`
- `GET /api/search?q=`
- `GET /api/title/[tipo]/[id]`
- `GET /api/watch-providers?region=`
- `GET /api/meta`

**Fase B — Postgres:** `profiles`, `watchlist_items` + RLS. Watchlist e profiles passam do mock para o cliente Supabase no browser.

## Implementation Tasks

### Fase A — interface e catálogo

### Task 1 — Scaffold do app e ambiente

**Objective**
Criar o app Next.js com TypeScript e Tailwind, layout base e variável TMDB só no servidor.

**Changes**
- `create-next-app` no repositório (App Router)
- Tailwind; pastas `app`, `lib`, `components`
- `.env.example` com `TMDB_ACCESS_TOKEN` vazio (Supabase só como comentário ou linhas vazias, preenchidas na Fase B)
- `.gitignore` para `.env`, `.env.local`, `.next`, `node_modules`

**Affected Areas**
- Raiz do repo, `app/layout.tsx`, `app/globals.css`, `.gitignore`, `.env.example`

**Dependencies**
- None

**Validation**
- `npm run dev` sobe
- Token TMDB não aparece em bundle cliente

### Task 2 — Cliente TMDB no servidor

**Objective**
Isolar a TMDB no servidor, com tipos, cache e erros previsíveis.

**Changes**
- `lib/tmdb/client.ts` (`server-only`)
- Funções: configuration, countries, providers por região, genres, discover movie/tv, search movie/tv, details, credits, watch providers por título
- Helper de URL de poster
- Tratamento de 401/404/429

**Affected Areas**
- `lib/tmdb/`
- Route Handlers ou server functions

**Dependencies**
- Task 1

**Validation**
- Configuration e providers BR retornam 200 pelo BFF
- Network do browser: **não** há request para `api.themoviedb.org` nem Bearer da TMDB
- Teste unitário do builder de query Discover (região obrigatória, `include_adult=false`, pipe de providers)

### Task 3 — Contratos de conta mock e telas de auth

**Objective**
Deixar o app navegável com as regras de sessão do PRD, sem Supabase.

**Changes**
- Interfaces e mock de sessão, preferências e watchlist
- Telas: cadastro, login, logout, recuperar senha, atualizar senha, verificar email
- Mensagens para email inválido, senha curta, email já usado, credencial errada (o mock pode simular esses casos)
- Redirects: deslogado → auth; logado sem preferências → onboarding; com preferências → home

**Affected Areas**
- `lib/account/`, `app/(auth)/`, layout `(app)`

**Dependencies**
- Task 1

**Validation**
- Visitante não acessa `/`
- Login mock + reload mantém o estado de sessão da Fase A
- Logout volta ao login e esconde o catálogo
- Telas de reset e verificar email existem e são usáveis (fluxo fake)

### Task 4 — Onboarding e preferências (mock)

**Objective**
Informar país (padrão BR) e pelo menos um provedor antes do catálogo.

**Changes**
- Tela de onboarding: país (lista TMDB) + provedores da região
- Trocar país recarrega provedores; ids inválidos desmarcados
- `/preferencias` reutiliza o formulário
- Persistência via contrato de preferências (mock)

**Affected Areas**
- `app/(app)/onboarding`, `app/(app)/preferencias`

**Dependencies**
- Task 2, Task 3

**Validation**
- Primeiro “login” cai no onboarding com BR
- Continuar sem provedor é bloqueado
- Reload após concluir cai na home
- Trocar para um país sem os provedores atuais exige nova seleção
- Watchlist mock não é apagada nessa troca

### Task 5 — Home: catálogo misto, filtros e selos

**Objective**
Listar filmes e séries disponíveis nos provedores das preferências, na mesma grade, com todas as formas de oferta.

**Changes**
- `GET /api/catalog` lê preferências do contrato + filtros
- Merge das duas páginas Discover + hidratação de watch/providers da página
- Card: poster, título, tipo, selos, estado da watchlist
- Filtros e sort do PRD; carregar mais; loading / vazio / erro com retry
- Header: busca, watchlist, preferências, sair

**Affected Areas**
- `app/(app)/page.tsx`, `lib/catalog/`, `components/title-card`, `GET /api/catalog`

**Dependencies**
- Task 4

**Validation**
- Grade mistura filme e série e mistura formas de oferta
- Filtro “só séries” + “só aluguel” restringe o conjunto
- Sem resultados: mensagem + limpar filtros
- Falha TMDB: retry, preferências intactas
- Cards não disparam requests TMDB no browser

### Task 6 — Detalhe do título

**Objective**
Mostrar sinopse e onde assistir no país atual, com os streamings da conta em destaque.

**Changes**
- `/titulo/[tipo]/[id]`
- Poster, título, ano, sinopse, gêneros, nota, tipo, elenco
- Ofertas da região; destaque se o provider está nas preferências
- Sem disponibilidade: texto explícito
- Link TMDB; watchlist no detalhe
- Sem CTA que prometa abrir o app do streaming

**Affected Areas**
- `app/(app)/titulo/[tipo]/[id]`, `GET /api/title/...`

**Dependencies**
- Task 4, Task 2

**Validation**
- Filme e série abrem
- Provedores da conta distintos dos demais
- Sem oferta no país: texto explícito

### Task 7 — Watchlist (mock)

**Objective**
Salvar e remover títulos pela UI, com as regras de produto, ainda sem banco.

**Changes**
- Add/remove no card e no detalhe; unique `tipo + id`
- `/watchlist`: mais recente no topo, filme e série juntos
- Disponibilidade live via TMDB no país das preferências
- Toggle visível quando já está salvo
- Estado vazio com orientação

**Affected Areas**
- `lib/account/watchlist`, `app/(app)/watchlist`, toggle no card

**Dependencies**
- Task 3; pode avançar em paralelo com Tasks 5–6

**Validation**
- Salvar → aparece na lista → reload da Fase A mantém (mock)
- Mesmo `tmdb_id` filme vs série são itens distintos
- Troca de país: itens permanecem; ofertas mudam com a região
- **Não** exigir “outro browser / outro usuário” — isso só é aceite na Fase B

### Task 8 — Busca

**Objective**
Buscar por nome sem esconder títulos fora dos streamings da conta, distinguindo os que estão nela.

**Changes**
- `/busca` e `GET /api/search`
- Query vazia ou só espaços não chama TMDB
- Merge movie + TV; hidratar providers da região
- Ênfase “nos seus streamings” vs demais

**Affected Areas**
- `app/(app)/busca`

**Dependencies**
- Task 4, Task 2

**Validation**
- Termo conhecido retorna resultados com disponibilidade no país
- Título fora dos provedores continua visível e distinguível

### Task 9 — Atribuição e fechamento da Fase A

**Objective**
UI completa, termos TMDB/JustWatch visíveis, pronta para trocar o mock.

**Changes**
- Rodapé: logo TMDB + texto de não-endosso; JustWatch onde houver disponibilidade
- Revisar empty/error/loading
- Conferir que as telas só falam com `lib/account` e `lib/tmdb`, não com Supabase

**Affected Areas**
- `components/attribution`, layouts `(app)`

**Dependencies**
- Tasks 5–8

**Validation**
- Fluxo no browser: login mock → onboarding BR → grade mista → filtro → busca → detalhe → watchlist → logout
- Atribuição visível
- Nenhuma chave TMDB no cliente
- Nenhum import de Supabase nas telas

### Fase B — banco

### Task 10 — Projeto Supabase, schema e RLS

**Objective**
Criar o banco e as policies antes de ligar a UI.

**Changes**
- Projeto no dashboard; credenciais só em `.env`
- Migration das duas tabelas, índices, unique, RLS
- Auth: email/senha ligado; social desligado; URLs de redirect

**Affected Areas**
- `supabase/migrations/`, painel Auth, `.env` / `.env.example`

**Dependencies**
- Task 9 (UI estável). Pode preparar o projeto em paralelo, mas o merge no código espera a Fase A fechada

**Validation**
- SQL: usuário autenticado lê/grava só as próprias rows
- Unique impede duplicata `movie`+id; permite `movie` e `tv` com o mesmo id

### Task 11 — Trocar mock por Auth, profiles e watchlist reais

**Objective**
O app passar a cumprir o PRD com conta e persistência no Supabase.

**Changes**
- `@supabase/ssr`: browser, server, `middleware.ts`
- Implementações reais dos três contratos; remover mock do caminho de uso
- Cadastro, login, logout, reset de senha e verificar email reais
- Sem migração dos dados mock

**Affected Areas**
- `lib/account/`, `lib/supabase/`, `middleware.ts`, telas de auth já existentes

**Dependencies**
- Task 10

**Validation**
- Visitante não acessa `/`
- Cadastro + login + reload mantém sessão
- Logout esconde o catálogo
- Reset de senha funciona com email do Supabase
- Preferências e watchlist sobrevivem a outro browser após login
- Usuário B não vê watchlist de A
- Falha ao gravar watchlist não deixa o toggle como salvo
- Critérios de aceite do PRD no browser, agora com conta real

## Dependencies

- Conta TMDB e token no `.env` (já validado) — **Fase A**
- Node/npm — **Fase A**
- Projeto Supabase — **Fase B**
- Email de reset do Supabase — **Fase B**

Ordem: 1 → 2 e 3 em paralelo após 1 → 4 depende de 2–3 → 5–8 em cima de 4 → 9 fecha a Fase A → 10 → 11.

## Risks

| Risco | Mitigação |
| --- | --- |
| Telas acopladas ao mock | Contratos em `lib/account`; Task 9 recusa import de Supabase nas páginas |
| Mock frouxo (visitante vê catálogo, duplicata, país apaga lista) | Regras do PRD já na Task 3–7 |
| Tratar `localStorage` como produto | Documentado: andaime da Fase A; some na B sem migração |
| Token TMDB no cliente | `server-only` + BFF; validar no network panel na Task 2 |
| Rate limit nos providers da página | Cache 6 h; só itens visíveis; Discover já filtra a home |
| RLS ausente | Policies na mesma migration (Task 10) |
| Confirmação de email bloqueia | UI na Fase A; config no painel na Fase B |

## Migration / Compatibility

Greenfield. Sem migração mock → Supabase. Sem watchlist anônima de produto.

## Open Technical Questions

Nenhum bloqueio para a Task 1.

Já resolvidos neste plano:

- Duas fases: UI + TMDB primeiro; Supabase depois
- **Carregar mais** em vez de infinite scroll
- TMDB no Next, não em Edge Function
- Cache de título/poster na watchlist; disponibilidade sempre live
- Mock local não migra para o banco

Ainda de setup, só na Fase B:

- Confirmação de email ligada ou não no projeto Supabase
- Criar o projeto e preencher `NEXT_PUBLIC_SUPABASE_*`

## Mapeamento PRD → tasks

| PRD | Fase A (UI) | Fase B (real) |
| --- | --- | --- |
| Conta email/senha, reset, sessão | 3 | 11 |
| Preferências, BR, ≥1 provedor | 4 | 11 |
| Grade mista e todas as ofertas | 5 | — |
| Filtros e ordenação | 5 | — |
| Busca sem esconder fora dos streamings | 8 | — |
| Detalhe + destaque dos provedores | 6 | — |
| Watchlist, chave tipo+id | 7 | 11 |
| Troca de país sem apagar watchlist | 4, 7 | 11 |
| Atribuição TMDB/JustWatch | 9 | — |
| Adulto desligado, sem deep link, sem visitante | 2, 3, 6 | 11 |
| Persistência no Supabase | — | 10, 11 |
