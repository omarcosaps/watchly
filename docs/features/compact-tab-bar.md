# Feature Spec — Tab bar inferior no compacto

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 17 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da evolução que trocou o chrome compacto de duas faixas no topo por uma tab bar no rodapé. Catálogo, conta, watchlist e ofertas não mudam.

## Summary

No compacto (`< 640px`), a navegação principal deixa o topo e passa a ser uma tab bar fixa no rodapé. O topo fica em uma linha: Watchly e conta. A busca vira item da tab bar. A partir de 640px a pílula flutuante permanece.

## Current Behavior

Depois do layout compacto do #23, o telefone usava duas faixas no topo.

- Faixa 1: Watchly, ícone de busca e conta (avatar, sem nome).
- Faixa 2: Início, Filmes, Séries e Watchlist em quatro colunas iguais.
- Tokens: `--chrome-bar: 93px`; `--chrome-bottom` só para folga genérica (`70px` + safe-area).
- `AppShell` nas rotas flush (`/` e `/titulo/*`) usava `pt-chrome sm:pt-0`, sem `pb-chrome` no compacto.
- Médio e amplo: pílula flutuante, busca por ícone, item **Watchlist**.

## Proposed Behavior

As regras de catálogo, conta, watchlist e ofertas **não mudam**. Muda só a casca no compacto.

- Compacto, topo: uma linha — Watchly à esquerda; à direita, Entrar + Criar conta (visitante) ou chip de perfil (iniciais e nome truncado).
- Compacto, rodapé: tab bar fixa com **Início**, **Filmes**, **Séries**, **Busca** e **Lista** (ícone + rótulo). Item ativo em branco; demais em `white/60`. Vidro atual, cantos superiores arredondados, safe-area inferior.
- Busca sai do topo e vira item da tab bar.
- Filmes / Séries continuam `/?media=movie` e `/?media=tv`.
- **Lista** no compacto; **Watchlist** na pílula. O clique segue o gate atual (login ou onboarding se faltar).
- `--chrome-bar` / `--chrome-bottom` e o padding do shell acompanham a barra mais baixa no topo e a tab bar na base.
- Transições (`leaveTo` / `ScreenLink`) e reduced motion não mudam.
- Auth e onboarding continuam sem o shell e sem tab bar.
- `≥ 640px`: pílula, busca e Watchlist iguais aos de hoje.

Fora deste recorte: botão/sheet de filtro, redesenho da pílula no médio/amplo, menu hamburger, backend.

## Technical Approach

Só frontend. Breakpoint `sm` (640px) inalterado.

Tokens em `app/globals.css`: `--chrome-bar: 49px` (linha do topo); `--chrome-tab: 57px` (linha da tab bar); `--chrome-bottom: calc(var(--chrome-tab) + var(--safe-bottom))` no compacto; a partir de 640px `--chrome-bottom` continua `70px` + safe-area.

`AppTopbar` renderiza `CompactChrome` + `CompactTabBar` (`sm:hidden`) e `PillChrome` (`hidden sm:block`). `FilmIcon` e `TvIcon` em `components/icons.tsx`. `AppShell` aplica `pt-chrome pb-chrome`; flush usa `sm:pt-0 sm:pb-0`. `Attribution` no compacto soma `--chrome-bottom` no padding inferior.

## Affected Areas

- `components/app-topbar.tsx`
- `components/app-shell.tsx`
- `components/icons.tsx`
- `components/attribution.tsx`
- `app/globals.css`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: regras de catálogo, contrato de conta, persistência, route handlers, linguagem de movimento (além de o chrome continuar fora de `.d-leaving`).

## Acceptance Criteria

1. 390px visitante: topo = Watchly + Entrar + Criar conta; rodapé = cinco itens; busca **não** está no topo.
2. 390px logado: chip de perfil (iniciais + nome) no topo; Lista na tab bar.
3. 390px: Filmes / Séries aplicam `media`; Lista pede login se visitante.
4. 390px: conteúdo e atribuição não ficam sob a tab bar; hero não fica sob o topo.
5. Auth/onboarding **sem** tab bar.
6. 1280px: pílula flutuante, busca e Watchlist iguais aos de hoje.
7. Filtros da Home continuam a faixa de selects.

## Implementation Tasks

Concluídas na issue #30.

### Task 1 — Tab bar e topo compacto

Concluída.

### Task 2 — Documentação viva

Concluída.

## Risks / Open Questions

- O recorte de filtro em sheet permanece no issue #31.
- Nenhuma pergunta de produto bloqueia o recorte.
