# Feature Spec — Transições Home e Detalhe

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 12 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da linguagem de movimento aplicada à Home e ao detalhe do título.

## Summary

Uma só linguagem de movimento no eixo Home↔detalhe: o fundo aparece em fade, o conteúdo sobe em cascata, e a saída é o mesmo movimento invertido e mais curto. Trocar de slide no Hero não re-anima o texto.

## Current Behavior

A Home e o detalhe montavam sem cascata de entrada. O clique no card e em **Ver Detalhes** usava `Link` imediato. **Voltar** chamava `router.back()` na hora. O Hero já fazia crossfade de 1s no fundo.

## Proposed Behavior

- Entrada: 400ms, `cubic-bezier(.22, .7, .25, 1)`, conteúdo `translateY(14px)` → 0. Fundo só fade.
- Saída: 260ms, `ease`, `translateY(8px)`, antes de trocar de rota.
- Cascata da Home: hero → kicker → título → sinopse → botões → filtros → indicadores → grade; cards com passo de 35ms até o 12º.
- Cascata do detalhe: backdrop → voltar → pôster → título → ficha → sinopse → status → ações → onde assistir → elenco.
- Troca de slide: só o crossfade de 1s no fundo.
- `prefers-reduced-motion: reduce`: sem animação e sem atraso de navegação.
- Busca e watchlist não entram neste recorte.

## Technical Approach

CSS em `app/globals.css` (`.d-back`, `.d-in`, `.d-leaving`). Helper `useLeaveNavigate` com guard em ref. `TitleCard` aceita `onNavigate` opcional; só a Home passa o callback.

O Hero arma um timer de 1100ms e então remove `.d-in` dos filhos. A grade só faz stagger na primeira pintura da visita.

Sem biblioteca de animação e sem View Transitions API.

## Affected Areas

- `app/globals.css`
- `lib/motion.ts`
- `hooks/use-leave-navigate.ts`
- `components/catalog-home.tsx`
- `components/hero-carousel.tsx`
- `components/catalog-filters.tsx`
- `components/catalog-grid.tsx`
- `components/title-card.tsx`
- `app/(browse)/titulo/[tipo]/[id]/page.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: busca, watchlist, auth, APIs.

## Acceptance Criteria

1. Entrar na Home: fundo do hero em fade, depois kicker → título → sinopse → botões → filtros → indicadores → grade.
2. Trocar de slide: só o fundo em 1s; o texto não sobe de novo.
3. Abrir um título: a Home desce 8px e desvanece em 260ms; o detalhe entra em cascata.
4. Voltar: o detalhe sai; a Home reaparece visível, sem ficar presa em `d-leaving`.
5. Com reduced motion: nenhuma animação e navegação imediata.
6. Cmd/Ctrl+clique no card abre nova aba sem leave.
7. Cards na busca continuam navegando na hora.
