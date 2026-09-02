# Spec — Status visual na Watchlist e no detalhe

Última atualização: 1 de setembro de 2026

Fonte de produto: `docs/prd.md`. Esta spec não redefine a decisão de produto.

## Summary

Cada título guardado tem um status visual binário — **Ainda não assistir** ou **Já assistir** — para a pessoa identificar o que já viu. O status aparece na Watchlist e no detalhe do título, neste último **somente se o item estiver na Watchlist**. O título permanece na mesma lista.

## Current Behavior

A Watchlist da conta guarda `tipo + id TMDB`, título, pôster, ano, `createdAt` e `watched`. Dá para adicionar, remover, listar e alterar o status.

A página `/watchlist` mostra o status em selo no pôster. O detalhe já tem `WatchlistToggle`, mas ainda não mostra o status de assistido.

Home, busca e o atalho da Watchlist na home não têm registro de assistido.

## Proposed Behavior

- Ao guardar um filme ou série, o item nasce com status **Ainda não assistir**.
- Na página `/watchlist`, cada item exibe o status e permite alternar entre **Já assistir** e **Ainda não assistir**.
- Na página de detalhe, o status só aparece se o título estiver na Watchlist. Fora da lista, não renderiza.
- Guardar no detalhe faz o status aparecer como **Ainda não assistir**. Tirar da lista esconde o status.
- Alternar o status não remove, não arquiva e não reordena. A ordem na Watchlist continua: mais recente guardado no topo.
- Filme e série com o mesmo id TMDB são itens distintos e têm status independentes.
- Remover o título e guardar de novo volta o status para **Ainda não assistir**.
- Itens já persistidos sem o campo de status são tratados como **Ainda não assistir**.
- Home, busca e o atalho da Watchlist na home não exibem nem alteram esse status.
- Sem filtro, ordenação, contagem, data em que assistiu, nota ou progresso por temporada/episódio.

## Technical Approach

Contrato de conta já existente (Fase A / mock). Sem API nova e sem schema Supabase nesta entrega.

**Dados / escrita / leitura.** Mantidos: `watched` em `WatchlistItem`, `setWatchlistWatched`, normalização na leitura, default `false` no add.

**UI — Watchlist.** `WatchStatusToggle` variant `stamp` (default) via `posterStamp` em `CatalogGrid` / `TitleCard`, só na rota `/watchlist`.

**UI — Detalhe.** No grupo de CTAs do hero em `app/(app)/titulo/[tipo]/[id]/page.tsx`, renderizar `WatchStatusToggle` com `variant="pill"` (altura alinhada aos CTAs). O componente retorna `null` se o título não estiver na lista — a dependência fica no próprio toggle.

**Rótulos.** Visíveis e `aria-label` usam exatamente **Ainda não assistir** e **Já assistir**.

**Fora desta implementação.** Coluna no `watchlist_items` da Fase B.

## Affected Areas

- `components/watch-status-toggle.tsx` — variants `stamp` | `pill`
- `app/(app)/titulo/[tipo]/[id]/page.tsx` — status no grupo de CTAs
- `docs/prd.md` / `docs/spec-watchlist-status.md` — regra atualizada

Já existentes e reutilizados: contrato `watched`, `AccountProvider`, selo na Watchlist.

Não afetar: home, busca, `home-aside`, rotas TMDB.

## Acceptance Criteria

1. Guardar um filme ou série coloca o item na Watchlist com o rótulo **Ainda não assistir**.
2. Na página `/watchlist`, a pessoa vê o status de cada item e consegue alternar entre **Ainda não assistir** e **Já assistir**.
3. No detalhe, sem o título na lista: só “Adicionar à minha lista”; sem controle de status.
4. No detalhe, ao guardar: aparece **Ainda não assistir**; dá para alternar para **Já assistir** e voltar.
5. No detalhe, ao remover da lista: o status some na hora.
6. Depois de marcar **Já assistir**, o título continua na lista, na mesma posição relativa (ordem por `createdAt`).
7. Filme e série com o mesmo `tmdbId` têm status independentes.
8. Remover e guardar de novo mostra **Ainda não assistir**.
9. Reload da Fase A (mock) mantém o status escolhido.
10. Home, busca e o atalho da Watchlist na home não mostram esse status.
11. Não existe filtro, ordenação ou contagem por status.

## Implementation Tasks

### Task 1 — Contrato e persistência do status

Concluída.

### Task 2 — Status visual na Watchlist

Concluída (selo no pôster).

### Task 3 — Status no detalhe (condicionado à Watchlist)

**Objective**
Exibir e alterar o status no detalhe somente quando o título estiver na Watchlist.

**Changes**
- `WatchStatusToggle` com `variant="pill"` alinhado aos CTAs
- Render no grupo trailer + watchlist do detalhe
- Atualizar PRD e esta spec

**Affected Areas**
- `components/watch-status-toggle.tsx`
- `app/(app)/titulo/[tipo]/[id]/page.tsx`
- `docs/prd.md`, `docs/spec-watchlist-status.md`

**Validation**
- Detalhe fora da lista: sem status
- Guardar → status aparece; remover → some
- Watchlist mantém o selo; home/busca sem status

## Risks / Open Questions

- O schema da Fase B em `docs/tech-plan.md` ainda não tem campo de status. Fora desta entrega.
- Os rótulos **Já assistir** e **Ainda não assistir** são decisão de produto.
- Não há pergunta de produto ou de arquitetura da Fase A em aberto.
