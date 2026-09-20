# Feature Spec — Espaçamento de 32px no Perfil (compacto)

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 19 de setembro de 2026

Esta spec não redefine regras de catálogo, conta ou navegação. É o registro do vão de 32px entre o header e o conteúdo do Perfil só no compacto.

## Summary

Em `/preferencias`, no compacto, o primeiro conteúdo começa 32px abaixo do fundo do header. A partir de 640px o offset permanece o de `pt-chrome`. O header não muda de altura nem de posição. Watchlist, Busca, Home e detalhe não entram neste recorte.

## Current Behavior

O `<main>` do `AppShell` aplica `pt-chrome` em `/preferencias`.

- Compacto: `--chrome-top` = safe-area + `--chrome-bar` (49px). O título “Perfil” começa colado no header (vão 0px).
- A partir de 640px: `--chrome-top` = `--chrome-pill` (110px). A pílula ocupa ~68px; o vão abaixo dela fica ~42px.
- Watchlist e Busca já usam `pt-content` nos dois breakpoints.

## Proposed Behavior

No compacto: início do conteúdo = fundo do header + 32px.

- Compacto: 49px + 32px (+ safe-area), aplicados no container da página.
- A partir de 640px: inalterado (`pt-chrome` no shell, sem padding extra no container).
- Header: sem mudança de altura, `top` ou estrutura.
- Espaçamentos internos entre título, descrição e demais elementos: inalterados.

Fora deste recorte: Home, detalhe, Watchlist, Busca, auth, onboarding, altura do header, desktop do Perfil.

## Technical Approach

Só frontend. `--chrome-top`, `--chrome-pill`, `pt-chrome` e `hasContentGap` do `AppShell` não mudam — incluir `/preferencias` em `pt-content` alteraria o desktop.

O container de `app/(app)/preferencias/page.tsx` recebe `pt-[var(--content-gap)] sm:pt-0`. O token `--content-gap` (32px) já existe.

## Affected Areas

- `app/(app)/preferencias/page.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: `AppTopbar`, `AppShell`, Watchlist, Busca, Home, detalhe, persistência, APIs.

## Acceptance Criteria

1. `/preferencias` a 390px: vão de 32px entre o fundo do header e o título “Perfil”.
2. Título “Perfil” mantém o alinhamento horizontal atual.
3. Header: mesma altura e mesma posição.
4. Conteúdo abaixo do título mantém os espaçamentos atuais.
5. `/preferencias` a partir de 640px: espaçamento visual igual ao de antes.

## Implementation Tasks

### Task 1 — Padding no container do Perfil

**Objective**
Abrir 32px entre o header e o título no compacto, sem mexer no desktop.

**Changes**
- Aplicar `--content-gap` no container de `/preferencias`, com reset a partir de 640px.

**Affected Areas**
- `app/(app)/preferencias/page.tsx`

**Validation**
- 390px: 32px entre header e título.
- Desktop: sem regressão visual.

### Task 2 — Documentação viva

**Objective**
Deixar PRD, SSD e CHANGELOG alinhados ao comportamento.

**Changes**
- Atualizar a regra de espaçamento do Perfil nos docs vivos.

**Affected Areas**
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

**Validation**
- Docs descrevem 32px só no compacto do Perfil.

## Risks / Open Questions

- Decisão de produto: o vão de 32px vale só no telefone. Incluir a rota em `pt-content` no shell mudaria o desktop (~42px → 32px).
