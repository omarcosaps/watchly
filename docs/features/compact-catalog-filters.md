# Feature Spec — Filtro do catálogo no compacto

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 17 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da evolução que tirou a faixa de selects do compacto e passou o filtro da Home para um botão no topo e um bottom sheet. Catálogo, conta, watchlist, ofertas e params da URL não mudam.

## Summary

No compacto (`< 640px`), os filtros da Home deixam a faixa abaixo do hero. Entram por um botão circular no topo (depois da conta) que abre um painel com os mesmos controles. A partir de 640px a faixa abaixo do hero permanece.

## Current Behavior

Depois da tab bar da #30, o telefone ainda mostrava a faixa de Tipo / Gênero / Ano / Provedor / Ordenar abaixo do hero.

- A faixa quebrava linha no compacto e empurrava a grade.
- O topo compacto era Watchly + conta, sem botão de filtro.
- Médio e amplo: faixa abaixo do hero, pílula sem botão de sliders.

## Proposed Behavior

As regras de catálogo, conta, watchlist, ofertas e query **não mudam**. Muda só como a pessoa chega aos filtros no compacto.

- Botão circular com ícone de sliders, só na Home (`/` com ou sem `?media=`).
- Visitante: Watchly | Entrar | Criar conta | filtro.
- Logado: Watchly | perfil | filtro.
- Toque abre um bottom sheet com Tipo, Gênero, Ano, Provedor (se a pessoa tem streamings) e Ordenar + contagem.
- A faixa de selects some no compacto; em `sm+` permanece abaixo do hero, sem botão no header.
- Filtros aplicam na hora via URL, como hoje. Tipo continua com `leaveTo`; os outros com `replace`, sem reanimar a página.
- Fechar: overlay, Escape ou botão fechar. Sheet acima da tab bar.
- Indicador discreto no botão quando houver filtro além do tipo (gênero, ano, provedor, ordenação).
- Busca, detalhe, Watchlist e Perfil **sem** botão de filtro.

Fora deste recorte: tab bar, itens da nav, redesenho da pílula no médio/amplo, filtro por forma de assistir, painel lateral, backend.

## Technical Approach

Só frontend. Breakpoint `sm` (640px) inalterado.

`HomeFilterChromeProvider` no `AppShell` guarda `open` e o slot. `CatalogHome` publica gêneros, provedores, `showProviderFilter` e contagem. `CompactFilterButton` no `CompactChrome` só monta quando `pathname === "/"`. `CatalogFilterSheet` (`z-[70]`, `sm:hidden`, `role="dialog"`) fica fora do `PageMotionFrame`; fecha no overlay, Escape, botão fechar, pathname ≠ `/` ou `matchMedia('(min-width: 640px)')`. `CatalogFilters` tem `layout="strip"` (`hidden sm:flex` abaixo do hero) e `layout="stack"` no sheet. Indicador quando `genre`, `yearRange`, `filterProviders` ou `sort` estão na URL.

## Affected Areas

- `components/app-topbar.tsx`
- `components/app-shell.tsx`
- `components/catalog-home.tsx`
- `components/catalog-filters.tsx`
- `components/home-filter-chrome.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: regras de catálogo, contrato de conta, persistência, route handlers, linguagem de movimento (Tipo continua em `leaveTo`; demais filtros em `replace`).

## Acceptance Criteria

1. 390px visitante na Home: filtro depois de Criar conta; sheet abre/fecha; selects **não** aparecem abaixo do hero.
2. 390px logado: filtro depois do perfil.
3. 390px Filmes/Séries: o botão continua; Tipo no sheet ainda troca a identidade da tela.
4. 390px busca, detalhe, Watchlist, Perfil: **sem** botão de filtro.
5. 390px: aplicar gênero/ano não reanima a página; Tipo anima como hoje.
6. 1280px: faixa de selects abaixo do hero, sem botão no header, sem sheet.

## Implementation Tasks

Concluídas na issue #31.

### Task 1 — Botão, sheet e selects só no desktop

Concluída.

### Task 2 — Documentação viva

Concluída.

## Risks / Open Questions

- Nenhuma pergunta de produto bloqueia o recorte.
