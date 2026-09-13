# ADR-005 — Persistência de conta no Supabase

Status: Accepted

## Context

Conta, preferências e watchlist viviam no mock `localStorage` atrás do contrato `lib/account` ([ADR-002](ADR-002-account-abstraction.md)). O PRD pede dados por conta, inclusive entre dispositivos, e envio real do link de recuperação de senha. O SSD deixava o backend em aberto até esta escolha.

O catálogo e a disponibilidade continuam na TMDB ([ADR-001](ADR-001-tmdb-server-side.md), [ADR-004](ADR-004-live-availability.md)).

## Decision

Usar Supabase Auth + Postgres com RLS.

- Telas e `AccountProvider` continuam falando só com `lib/account`. O SDK fica no adapter e no callback de auth.
- Identidade física: `auth.users.id` (UUID). A watchlist é única por `user_id + media_type + tmdb_id` ([ADR-003](ADR-003-watchlist-identity.md)).
- Tabelas `public.accounts`, `public.preferences` e `public.watchlist_items`. Sem `profiles`, sem catálogo persistido, sem ofertas.
- Origem de aquisição entra na metadata do `signUp` e o trigger grava em `accounts`. Sem UPDATE nessa coluna.
- Sessão em cookie via `@supabase/ssr`. `proxy.ts` só renova o cookie. `AuthGuard` e `GuestGuard` continuam protegendo as rotas no cliente.
- `/auth/callback` troca o código PKCE. Recuperação redireciona para `/atualizar-senha`.
- Sem `SERVICE_ROLE` no app. Login distingue conta inexistente e senha errada com a RPC `email_registered`. Recuperação permanece neutra.
- Confirm email desligado no projeto. Sem verificação de e-mail no produto.
- Dados do mock local não são migrados.

## Consequences

- A mesma conta funciona em outro navegador ou dispositivo.
- O contrato de conta passa a ser assíncrono.
- O app depende do projeto Supabase (URL + publishable/anon key) e das URLs de redirect do Auth.
- Auth mock e senha em `localStorage` deixam de existir.
