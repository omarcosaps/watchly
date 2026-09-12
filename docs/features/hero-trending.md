# Feature Spec — Hero com Tendências

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 12 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da evolução que trocou o Hero de lançamentos por data pelas tendências da TMDB.

## Summary

O Hero da Home mostra as 5 tendências da semana no país de referência. Entra só título com oferta no país e com backdrop ou pôster. A regra não acompanha tipo, gênero, ano, provedor nem a ordenação da grade.

## Current Behavior

`CatalogHome` busca o Hero com `sort=date`. A primeira página da TMDB por data traz estreias futuras e títulos sem still.

## Proposed Behavior

- O Hero busca `GET /api/catalog?sort=trending`: TMDB `/trending/all/week`.
- Pessoa e conteúdo adulto saem.
- Só entra filme ou série com still e com pelo menos uma oferta no país atual.
- A ordem da TMDB se mantém.
- Trocar filtro ou ordenação não recarrega o Hero.
- Trocar o país atualiza o Hero.
- A grade não ganha opção Tendências.
- Kicker, sinopse de 3 linhas, rotação de 7s e CTAs permanecem iguais.

## Technical Approach

`getTrendingAll` em `lib/tmdb/queries.ts`. Mapper e filtros puros em `lib/catalog/trending.ts`. `getCatalogPage` desvia quando `sort === "trending"`.

O frontend continua com fetch independente (`heroCatalogParams`) e aplica `pickHeroItems`.

## Affected Areas

- `lib/tmdb/queries.ts`, `lib/tmdb/types.ts`
- `lib/catalog/params.ts`, `lib/catalog/get-catalog.ts`, `lib/catalog/trending.ts`
- `lib/catalog/hero-params.ts`
- `components/catalog-home.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: página de detalhe, busca, watchlist, select de ordenação da grade, `HeroCarousel`.

## Acceptance Criteria

1. Na Home, o Hero mostra tendências atuais com imagem, não lançamentos futuros sem arte.
2. Filtrar tipo, gênero, ano, provedor ou mudar a ordenação não troca os slides do Hero.
3. Trocar o país atualiza o Hero para a região nova.
4. A grade continua com Popularidade, Nota e Data de lançamento.
5. Sinopse de 3 linhas, kicker e CTAs continuam iguais.

## Implementation Tasks

### Task 1 — BFF trending

Concluída.

### Task 2 — Frontend

Concluída.

### Task 3 — Documentação

Concluída.
