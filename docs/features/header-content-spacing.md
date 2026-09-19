# Feature Spec — Espaçamento de 32px em Watchlist e Busca

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 19 de setembro de 2026

Esta spec não redefine regras de catálogo, conta ou navegação. É o registro do vão de 32px entre o header e o conteúdo só em Watchlist e Busca.

## Summary

Em `/watchlist` e `/busca`, o primeiro conteúdo começa 32px abaixo do fundo do header, no compacto e a partir de 640px. O header não muda de altura nem de posição. Home, detalhe e Perfil mantêm o offset atual.

## Current Behavior

O `<main>` do `AppShell` aplica `pt-chrome` (`--chrome-top`) em todas as rotas que não são flush.

- Compacto: `--chrome-top` = safe-area + `--chrome-bar` (49px). O conteúdo começa colado no header (vão 0px).
- A partir de 640px: `--chrome-top` = `--chrome-pill` (110px). A pílula ocupa ~68px a partir do topo; o vão abaixo dela fica ~42px.
- `/preferencias` usa o mesmo `pt-chrome`.

## Proposed Behavior

Nas duas páginas, nos dois breakpoints: início do conteúdo = fundo do header + 32px.

- Compacto: 49px + 32px (+ safe-area).
- A partir de 640px: ocupação da pílula (token `--chrome-header: 68px`) + 32px.
- Home, detalhe e Perfil: inalterados.
- Header: sem mudança de altura, `top` ou estrutura.

A pílula logada é ~4px mais baixa que a de visitante. O token fixo de 68px deixa o vão ~32px deslogado e ~36px logado.

Fora deste recorte: Home, detalhe, Perfil, auth, onboarding, altura do header.

## Technical Approach

Só frontend. `--chrome-top`, `--chrome-pill` e `pt-chrome` não mudam.

Tokens em `app/globals.css`: `--content-gap: 32px`; `--chrome-header` no compacto = safe-area + barra; a partir de 640px = `68px`. Utilitário `pt-content` = `calc(var(--chrome-header) + var(--content-gap))`.

`AppShell` troca `pt-chrome` por `pt-content` só em `/watchlist` e `/busca`. As páginas em si não ganham padding extra.

## Affected Areas

- `app/globals.css`
- `components/app-shell.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: `AppTopbar`, páginas de Watchlist e Busca, Home, detalhe, Perfil, persistência, APIs.

## Acceptance Criteria

1. `/busca` e `/watchlist` no compacto: vão de ~32px entre o fundo do header e o primeiro conteúdo.
2. `/busca` e `/watchlist` no desktop: vão de ~32px entre o fundo da pílula e o primeiro conteúdo.
3. `/`, `/titulo/...` e `/preferencias`: espaçamento igual ao de antes.
4. Header: mesma altura e mesma posição em todas as rotas.

## Implementation Tasks

Concluídas nesta mudança.

### Task 1 — Tokens e offset do shell

Concluída.

### Task 2 — Documentação viva

Concluída.

## Risks / Open Questions

- A ocupação da pílula varia ~4px entre visitante e conta logada. O token de 68px prioriza o estado visitante, medido no app.
