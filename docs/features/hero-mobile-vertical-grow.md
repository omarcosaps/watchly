# Feature Spec — Crescimento vertical do Hero no compacto

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 19 de setembro de 2026

Esta spec não redefine regras de catálogo, sinopse, CTAs ou o Hero cinema no desktop. É o registro da âncora do copy no compacto.

## Summary

Na Home (`/`), no compacto, o início do copy do Hero (kicker/badge) fica na mesma posição em relação ao header, mesmo quando o título ou a sinopse ocupam mais de uma linha. O extra cresce para baixo e a altura do Hero pode passar de 50dvh.

## Current Behavior

`hero-frame` usa `height: 50dvh` no compacto. O copy do `HeroCarousel` está `absolute bottom-0`. Título ou sinopse extras empurram o bloco para cima, o vão header → kicker encolhe e o kicker pode sobrepor o header. O frame não cresce; `overflow-hidden` recorta o que passa de 50dvh.

## Proposed Behavior

- Com título de 1 linha a 390px, o layout permanece o de hoje.
- Com título ou sinopse em 2+ linhas, o kicker não sobe; o conteúdo e a base do Hero descem.
- O vão entre o header e o kicker não depende da altura do texto.
- Título e sinopse não são truncados nem limitados para resolver o layout.
- Fundo, CTAs, indicadores e o Hero cinema a partir de 640px permanecem.

Fora deste recorte: detalhe, Watchlist, Busca, `AppShell`, truncamento da sinopse, APIs.

## Technical Approach

Só frontend.

`--hero-copy-anchor: 315px` é a altura do stack compacto de 1 linha (kicker + título de 1 linha + sinopse até 2 linhas + CTAs empilhados + dots + `pb-6`).

`hero-frame` no compacto: `min-height: var(--hero-height)` e `height: auto`. A partir de 640px: `height` `64vh` e `min-height` `520px`.

`hero-copy` no compacto: `padding-top: max(0px, calc(var(--hero-height) - var(--hero-copy-anchor)))`. A partir de 640px: `padding-top: 0` e o wrapper volta a `absolute bottom-0`.

O wrapper do copy fica `relative` no compacto para o parágrafo de medição da sinopse continuar usando a mesma largura.

## Affected Areas

- `app/globals.css`
- `components/hero-carousel.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: `AppShell`, detalhe, Watchlist, Busca, persistência, APIs.

## Acceptance Criteria

1. 390px, título de 1 linha: layout igual ao de antes.
2. 390px, título de 2+ linhas: conteúdo cresce para baixo; kicker na mesma distância do header.
3. 390px, sinopse de 2+ linhas: conteúdo cresce para baixo; kicker na mesma distância do header.
4. CTAs e indicadores permanecem dentro do Hero, sem sobreposição com o header.
5. Desktop: Hero cinema sem regressão visual.

## Implementation Tasks

Concluídas nesta mudança.

### Task 1 — Corrigir crescimento vertical do Hero no mobile

Concluída.

## Risks / Open Questions

- `--hero-copy-anchor` é um valor medido no stack compacto típico. Mudança de tipografia, CTA ou `pb` do copy pede novo ajuste do token.
