# Feature Spec — Layout responsivo compacto, médio e amplo

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 15 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da evolução que tornou o app usável no telefone, sem mudar catálogo, conta, watchlist nem ofertas.

## Summary

O app web cabe no iPhone Safari: navegação, título, CTA e submit não cortam. A linguagem cinema permanece no desktop. No telefone, chrome estável e conteúdo em coluna.

Há três larguras: compacto (`< 640px`), médio (`640–1023px`) e amplo (`≥ 1024px`). Compacto usa chrome em duas faixas e conteúdo empilhado. Médio e amplo mantêm a pílula flutuante; no médio o e-mail some e fica o avatar.

## Current Behavior

O layout era desktop numa faixa só.

- Topbar-pílula (`w-max` + `overflow-x-auto`), fixa e centrada em qualquer largura.
- `AppShell` com padding-top ~110px e padding-bottom ~70px fixos. Home e detalhe flush usavam o mesmo offset da pílula.
- Hero: `64vh` + `min-h-[520px]`. Copy e CTAs em linha; dots sobrepostos à direita.
- Grade: `minmax(176px, 1fr)` — no telefone, um card de largura cheia.
- Detalhe: pôster e texto lado a lado (`flex-1 min-w-0`); overlap `mt-[-170px]`.
- Watchlist: linha horizontal; serviços empurravam status e remover para fora.
- Auth, onboarding e Perfil: card centrado na vertical, sem safe-area nem compensação do teclado do iOS.

## Proposed Behavior

As regras de catálogo, conta, watchlist e ofertas **não mudam**. Muda só como a casca se comporta em cada largura.

| Nome | Largura | Comportamento |
| --- | --- | --- |
| Compacto | `< 640px` | Chrome em duas faixas; conteúdo em coluna |
| Médio | `640–1023px` | Pílula atual; e-mail some se apertar |
| Amplo | `≥ 1024px` | Pílula flutuante; avatar + nome curto |

### Chrome

- Compacto, faixa 1: Watchly + busca + conta (avatar sem e-mail).
- Compacto, faixa 2: Início, Filmes, Séries, Watchlist em quatro itens iguais, sempre visíveis.
- Médio/amplo: pílula atual. No médio o e-mail some e fica só o avatar.
- Viewport: `viewport-fit=cover` e `interactive-widget=resizes-content`.
- Offset do conteúdo usa a altura real da chrome + safe-area. Home e detalhe flush respeitam o offset no topo.
- A topbar **não** leva `.d-leaving`. Reduced motion e transições da nav (leave/cascata) continuam.

### Home e Hero

- Hero em `dvh` no telefone (~50dvh), sem o mínimo de 520px.
- Padding-top da chrome; copy e CTAs empilhados; dots abaixo dos botões.
- Filtros: wrap; “Ordenar por” não some nem cola no canto.
- Troca de slide e reduced motion iguais aos atuais. A partir de 640px o hero cinema permanece.

### Grade

- Compacto: dois pôsteres por linha. Médio: três. Amplo: auto-fill.
- Vale para skeleton e para a busca (mesmo `CatalogGrid`).
- Título do card continua `truncate`; rating stamp legível.

### Detalhe

- Compacto: coluna (`Voltar` → pôster ~160–180px → título → meta → sinopse → status/watchlist → ofertas → elenco).
- O bloco de texto não usa `flex-1 min-w-0` no compacto.
- Oferta: nome em uma linha (`truncate`); badge não encolhe.
- Overlap menor no compacto para o Voltar não cair no meio do still.

### Watchlist

- Compacto: card em coluna (pôster + texto; status em largura cheia; remover no canto).
- Ofertas: no máximo duas linhas, depois truncate / “e mais”.
- Add/remove/status e a hidratação da API não mudam.
- Lista vazia: CTA **Explorar o catálogo** inteiro abaixo da nav.

### Auth, onboarding e Perfil

- Login, cadastro, recuperar/atualizar senha: no compacto o card não fica preso no centro quando o teclado abre; **Entrar** (e equivalentes) rolável até ficar visível.
- Onboarding: **Continuar** não fica sob o Safari.
- Perfil: **Salvar preferências** e **Sair da conta** acima da barra do Safari. Logout e save iguais aos de hoje.

Fora deste recorte: menu hamburger, app nativo, backend, redesenho da pílula no desktop.

## Technical Approach

Só frontend. Breakpoints do Tailwind: compacto abaixo de `sm` (640px); médio a partir de `sm`; amplo a partir de `lg` (1024px).

Tokens em `app/globals.css`: `--safe-top` / `--safe-bottom`, `--chrome-bar` (93px), `--chrome-pill` (110px), `--chrome-top`, `--chrome-bottom`, `--hero-height` (`50dvh` no compacto; `64vh` + min `520px` a partir de 640px). Utilitários `pt-chrome`, `pb-chrome`, `pt-safe`, `pb-safe`, `scroll-mb-safe`, `hero-frame`.

`AppTopbar` renderiza `CompactChrome` (`sm:hidden`) e `PillChrome` (`hidden sm:block`). `AppShell` aplica `pt-chrome`; rotas flush (`/` e `/titulo/*`) usam `pt-chrome sm:pt-0`. Sem hero, a Home aplica `sm:pt-chrome`.

Grade: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(176px,1fr))]`. `TitleCard` `sizes`: `50vw` / `33vw` / `176px`.

Detalhe: `flex-col` no compacto, `sm:flex-row`; overlap `-56px` / `sm:-170px`; pôster `168px` / `sm:230px`.

Watchlist: `flex-col` no compacto, `sm:flex-row`; `WatchStatusToggle` compacto em largura cheia; `formatOfferNames` limita a dois nomes + “e mais”.

Auth e setup: `min-h-dvh`, `pt-safe`, `justify-center-safe`; onboarding e ações do Perfil também `pb-safe`. Viewport `interactiveWidget: "resizes-content"` para o teclado redimensionar o conteúdo.

## Affected Areas

- `app/layout.tsx`
- `app/globals.css`
- `components/app-topbar.tsx`
- `components/app-shell.tsx`
- `components/catalog-home.tsx`
- `components/hero-carousel.tsx`
- `components/catalog-filters.tsx`
- `components/catalog-grid.tsx`
- `components/title-card.tsx`
- `app/(browse)/titulo/[tipo]/[id]/page.tsx`
- `app/(app)/watchlist/page.tsx`
- `components/watch-status-toggle.tsx`
- `app/(auth)/layout.tsx`
- `components/auth-form.tsx`
- `app/(setup)/layout.tsx`
- `app/(setup)/onboarding/page.tsx`
- `app/(app)/preferencias/page.tsx`
- `components/preferences-form.tsx`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: regras de catálogo, contrato de conta, persistência, route handlers, linguagem de movimento (além de não aplicar `.d-leaving` na topbar).

## Acceptance Criteria

1. 390px visitante: Watchly, Início, Filmes, Séries, Watchlist, busca, Entrar e Criar conta visíveis, sem `mes` / `lista` cortados.
2. 390px logado: avatar visível; e-mail não empurra a nav para fora.
3. 1280px: pílula flutuante igual à de antes desta mudança.
4. 390px Home: kicker + título + **Ver Detalhes** + **Adicionar à minha lista** inteiros, abaixo da nav.
5. 390px Home e `/busca`: dois cards por linha. 768px: pelo menos três.
6. 390px detalhe: título completo; pôster não divide a linha com o H1; nome do canal + badge na mesma linha.
7. 390px Watchlist: **Ainda não assistido** / **Já assistido** / remover cabem e são clicáveis; lista vazia com **Explorar o catálogo** abaixo da nav.
8. 390px login: com teclado de e-mail, **Entrar** acessível. Cadastro e recuperar senha no mesmo padrão.
9. Perfil: salvar/sair acima da barra do Safari; logout e save iguais aos de hoje.
10. Reduced motion e transições da nav continuam; a topbar não leva `.d-leaving`.
11. Desktop amplo não regride.

## Implementation Tasks

Concluídas na issue #23 (PRs #24–#29) e nesta documentação (Task 7).

### Task 1 — Casca compacta (viewport, safe-area e topbar)

Concluída.

### Task 2 — Home e Hero no compacto

Concluída.

### Task 3 — Grade da Home e da busca em duas colunas

Concluída.

### Task 4 — Detalhe em coluna

Concluída.

### Task 5 — Watchlist empilhada

Concluída.

### Task 6 — Auth, onboarding e Perfil com teclado e barra do Safari

Concluída.

### Task 7 — Documentação viva

Concluída.

## Risks / Open Questions

- O chrome compacto desta spec (duas faixas no topo) foi o estado do #23. A tab bar inferior está em [compact-tab-bar.md](compact-tab-bar.md). O recorte de filtro em sheet permanece no issue #31; os filtros em wrap continuam.
- Nenhuma pergunta de produto bloqueia o recorte.
