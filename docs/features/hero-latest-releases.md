# Feature Spec — Hero com lançamentos mais recentes

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 12 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da evolução que separou o Hero da listagem filtrada.

## Summary

O Hero da Home mostra sempre os 5 títulos de lançamento ou estreia mais recentes no país de referência. A regra não acompanha tipo, gênero, ano, provedor nem a ordenação da grade. A lista é dinâmica: quando a TMDB passa a listar um título mais novo com oferta no país, ele entra e o mais antigo dos 5 sai.

## Current Behavior

`CatalogHome` deriva o Hero com `items.slice(0, 5)` da listagem já filtrada e ordenada. Com o padrão Popularidade, o destaque é o que está em alta, não o que saiu agora.

## Proposed Behavior

- O Hero busca um recorte próprio: página 1, `sort=date`, sem `media`, gênero, `yearRange` nem `filterProviders`.
- Continua misturando filmes e séries com oferta no país atual.
- Estreia futura entra.
- Trocar filtro ou ordenação não recarrega o Hero.
- Trocar o país atualiza o Hero.
- Kicker, sinopse de 3 linhas, rotação de 7s e CTAs permanecem iguais.
- A grade continua com os filtros e a ordenação da URL.

## Technical Approach

Helper puro em `lib/catalog/hero-params.ts`: `heroCatalogParams`.

`CatalogHome` guarda `featured` e `heroLoading` à parte da grade e chama `fetchCatalog` só com o país. Sem API nova.

## Affected Areas

- `lib/catalog/hero-params.ts`
- `components/catalog-home.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: página de detalhe, busca, watchlist, APIs, `HeroCarousel`.

## Acceptance Criteria

1. Na Home padrão, o Hero mostra os 5 títulos mais recentes do país, não o topo da grade por popularidade.
2. Filtrar tipo, gênero, ano, provedor ou mudar a ordenação não troca os slides do Hero.
3. Trocar o país atualiza o Hero para a região nova.
4. Grade vazia não esconde o Hero.
5. Falha da grade não derruba o Hero; falha do Hero não esconde a grade.
6. Sinopse de 3 linhas, kicker e CTAs continuam iguais.

## Implementation Tasks

### Task 1 — Query e fetch independentes

Concluída.

### Task 2 — Documentação

Concluída.
