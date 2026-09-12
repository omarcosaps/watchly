# ADR-002 — Abstração de Account

Status: Accepted

## Context

A UI precisa de sessão, preferências (país e provedores) e watchlist desde as primeiras telas. A persistência real em servidor ainda não existe. Se as páginas falassem direto com `localStorage` ou com um SDK de backend, trocar a implementação reescreveria o app.

## Decision

As telas e o `AccountProvider` dependem só do contrato em `lib/account`:

- `session.ts` — logado, deslogado, email pendente
- `preferences.ts` — país + `providerIds` (≥1)
- `watchlist.ts` — add, remove, list, isSaved, setWatchlistWatched

A implementação atual está em `lib/account/mock/*` e persiste um único `StoredAccount` em `localStorage` (`watchly-account-v1`). Os módulos públicos apenas reexportam o mock.

## Consequences

- As páginas não importam Supabase nem o storage direto.
- Dá para trocar o mock por outra implementação sem mudar os contratos das telas.
- Hoje a conta é por navegador: não há `user_id`, cookies nem RLS.
- A abstração não substitui autenticação de verdade; os guards continuam só no cliente.
