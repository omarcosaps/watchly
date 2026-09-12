# Feature Spec — Hero com sinopse curta

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 12 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da evolução que limitou o texto de apoio do Hero a 3 linhas.

## Summary

O Hero da Home mostra a sinopse do título em destaque em no máximo 3 linhas. Se a original não couber, o Hero usa um resumo extrativo. A página de detalhe continua com a sinopse completa.

## Current Behavior

`HeroCarousel` busca o detalhe de cada slide e renderiza `overview` inteiro, com `max-w-[640px]`, `text-base` e `leading-[1.55]`. Sinopses longas passam de 3 linhas. O detalhe já mostra `overview` completo.

## Proposed Behavior

- Se a sinopse original couber em 3 linhas no parágrafo do Hero, o Hero usa a original.
- Se não couber, o Hero escolhe o candidato extrativo mais longo que caiba: frases completas e, se preciso, a oração inicial completa.
- O resumo preserva a ideia principal, o contexto e o tom da TMDB. Não inventa copy.
- Sem `line-clamp`, reticências, redução de fonte ou de largura só para caber.
- O resumo vale só no Hero. O detalhe mantém a sinopse original.

## Technical Approach

Utilitário puro em `lib/catalog/hero-synopsis.ts`: `buildHeroSynopsisCandidates` e `pickHeroSynopsis`.

`HeroCarousel` mede um parágrafo invisível com as mesmas classes tipográficas e escolhe o primeiro candidato em que `scrollHeight <= lineHeight * 3 + 1`. Remede no resize e na troca de slide, via `useLayoutEffect`, para não pintar a sinopse longa.

Sem API nova e sem mudança no detalhe.

## Affected Areas

- `lib/catalog/hero-synopsis.ts`
- `components/hero-carousel.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: página de detalhe, busca, watchlist, APIs.

## Acceptance Criteria

1. Todo texto de apoio do Hero cabe em até 3 linhas, sem corte visual.
2. O texto continua fazendo sentido como sinopse curta.
3. Não há reticências nem `line-clamp`.
4. Fonte e `max-w-[640px]` do Hero não mudam para forçar o encaixe.
5. A página de detalhe do mesmo título mostra a sinopse completa.

## Implementation Tasks

### Task 1 — Candidatos extrativos

Concluída.

### Task 2 — Medição no Hero

Concluída.

### Task 3 — Documentação

Concluída.
