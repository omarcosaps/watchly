# ADR-003 — Identidade da watchlist por media_type e tmdb_id

Status: Accepted

## Context

A TMDB usa namespaces separados para filme e série. O mesmo número de id pode existir nos dois. Tratar só `tmdb_id` misturaria um filme e uma série, ou impediria guardar os dois.

A conta atual é um único store local neste navegador. Não há `user_id` persistido.

## Decision

Cada item da watchlist é identificado pelo par `mediaType + tmdbId` (`movie` | `tv`).

A chave interna é `` `${mediaType}:${tmdbId}` ``. Não há duplicata do mesmo par no store. Filme e série com o mesmo id TMDB são itens distintos, com status `watched` independente.

Campos `title`, `posterPath` e `year` são snapshot de UI, não fazem parte da identidade.

## Consequences

- A regra de produto “tipo + id TMDB” vale no código e nos testes.
- Sem backend, a unicidade é por navegador, não por usuário autenticado em servidor.
- Uma futura persistência multi-usuário precisaria acrescentar identidade de conta (por exemplo `user_id`) a esse par, sem colapsar filme e série no mesmo id.
