# Feature Spec — Transições do app com nav pill

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md

Última atualização: 12 de setembro de 2026

Esta spec não redefine a decisão de produto. Estende a linguagem já aprovada em [screen-transitions.md](screen-transitions.md) às telas do shell com nav pill. O recorte anterior (“busca e watchlist fora”) deixa de valer.

## Summary

Toda troca de tela entre Home, busca, detalhe, Watchlist e Perfil usa o mesmo gesto: a tela atual desce e some; a seguinte entra com fundo em fade e conteúdo em cascata. Início, Filmes e Séries são identidades distintas (`home`, `home:movie`, `home:tv`). Auth e onboarding mantêm a entrada que já têm. Reduced motion continua sem animação e com navegação imediata.

## Current Behavior

A linguagem de movimento existe só no eixo Home ↔ detalhe.

- Entrada: `.d-back` (só fade) e `.d-in` (sobe 14px, 400ms) em `app/globals.css`.
- Saída: `.d-leaving` (8px, 260ms) via `useLeaveNavigate`, só no clique do card, em **Ver Detalhes** e em **Voltar**.
- A nav pill (`AppTopbar`, `Wordmark`) usa `Link` ou `router.push` imediato.
- Busca, Watchlist e Perfil montam sem cascata. Cards da busca e itens da Watchlist navegam na hora.
- Filmes e Séries já são query da Home (`/?media=movie|tv`), não rotas novas.
- Login, cadastro e recuperação entram com `.fade-up` no card. Onboarding entra com `.fade-up` no bloco de 720px.
- `prefers-reduced-motion: reduce` já desliga a cascata e o atraso de saída no CSS e no hook.

## Proposed Behavior

Reutilizar os tokens já aprovados. Sem curva, duração ou deslocamento novos.

- Entrada: 400ms, `cubic-bezier(.22, .7, .25, 1)`. Fundo só fade. Conteúdo `translateY(14px)` → 0.
- Saída: 260ms, `ease`, `translateY(8px)`, **antes** de trocar de rota. A classe de saída permanece até o unmount da tela que está saindo, para não inverter o fade.
- Reduced motion: sem animação e sem atraso. Cmd/Ctrl/clique do meio abre nova aba sem leave.

### O que conta como troca de tela

Identidade da tela (query string não conta, exceto `media` na Home e o id do título):

| Rota | Identidade |
| --- | --- |
| `/` | Início (`home`) |
| `/?media=movie` | Filmes (`home:movie`) |
| `/?media=tv` | Séries (`home:tv`) |
| `/busca` | Busca |
| `/titulo/{tipo}/{id}` | Detalhe daquele título |
| `/watchlist` | Watchlist |
| `/preferencias` | Perfil |

Anima a página inteira só quando origem e destino estão nessa tabela **e** as identidades são diferentes.

Não anima a página inteira:

- Início, Filmes ou Séries quando o destino é o mesmo item já ativo.
- Gênero, ano, provedor, ordenação e **Carregar mais** na Home.
- Digitação e submit da busca enquanto a pessoa já está em `/busca`.
- Troca de slide do Hero (continua só o crossfade do fundo).
- Destino auth ou onboarding: **Entrar**, **Criar conta**, Watchlist sem sessão, Watchlist sem preferências. Navegação imediata. Login, cadastro, senha e onboarding mantêm `.fade-up`.
- Ações dentro da tela: remover item, toggle de status, salvar preferências (Perfil permanece na rota), erro/sucesso de formulário.

Vale para os links da nav, o wordmark, o ícone de busca, o chip de perfil, o card, **Ver Detalhes**, **Voltar**, itens da Watchlist e **Explorar o catálogo**. Detalhe de um título → detalhe de outro também é troca de tela.

Logout no Perfil vai para a Home: origem e destino estão na tabela, então usa o mesmo leave + entrada.

Voltar do browser (gesto nativo / botão do Chrome) não atrasa o histórico. A tela de destino ainda entra em cascata ao montar. O **Voltar** do detalhe continua interceptado.

### Cascata de entrada

Home e detalhe: manter a ordem já especificada em [screen-transitions.md](screen-transitions.md). A Home continua sem re-animar texto na troca de slide e sem re-stagger ao filtrar.

Telas sem still próprio (busca, Watchlist, Perfil) não inventam `.d-back`. O void do shell já está visível e não se move. Só o conteúdo sobe em cascata.

**Busca** — no mount da rota: campo → estado inicial (hint, vazio, erro ou heading) → grade. Cards com o mesmo passo da Home (`cardEnterDelay`, até o 12º). Nova query, **Carregar mais** e troca de resultados não re-animam a página.

**Watchlist** — título → subtítulo (ou bloco vazio) → CTA **Explorar o catálogo** ou itens. Itens com passo de 35ms até o 12º. Hidratar disponibilidade, remover item ou alternar status não re-anima a página.

**Perfil** — título → conta → país → streamings → ações. Trocar país no formulário, recarregar provedores ou mostrar sucesso/erro não re-anima. Onboarding **não** recebe essas classes: `PreferencesForm` só anima entrada quando a tela Perfil pedir.

Primeira chegada inclui URL direta e retorno a uma rota de onde a pessoa saiu (Busca → Watchlist → Busca entra de novo).

## Technical Approach

Sem biblioteca de animação e sem View Transitions API. Reusar `.d-back`, `.d-in`, `.d-leaving`, `MOTION_OUT`, `prefersReducedMotion`, `isModifiedClick` e `cardEnterDelay`.

O clique da nav vive no layout (`AppShell` / `AppTopbar`), não na página. O leave local de Home e detalhe não alcança esses cliques. Subir o gesto para o shell, sem aplicar `.d-leaving` num wrapper persistente que sobreviva à troca de rota — isso prenderia a próxima tela invisível ou inverteria o fade.

Abordagem recomendada:

1. Helper puro em `lib/motion.ts` que, dados pathname+query atuais e o href de destino, decide se a navegação é troca de tela do shell, filtro da Home, ou destino fora (auth/onboarding).
2. Contexto no `AppShell` expondo `leaveThen` / `leaving`, baseado no hook atual.
3. Frame de saída **com `key` da identidade da tela** (não um `div` persistente). A condição de `.d-leaving` vale só enquanto a identidade atual é a que pediu a saída. Destino auth não passa por `leaveThen`.
4. Nav, wordmark, busca e perfil deixam de ser `Link` cego: clique primário sem modificador chama o helper; se for troca de tela, `preventDefault` + `leaveThen` + `router.push`. Mesmo destino ou filtro da Home: comportamento atual, sem leave.
5. Home e detalhe deixam o hook local e passam a usar o contexto. Prefetch nos 260ms permanece: rota de destino e, em URL de título, `fetchTitle` (cache já existente em `lib/api.ts`).
6. Busca, Watchlist e Perfil ganham `.d-in` na cascata acima. `CatalogGrid` / `TitleCard` na busca passam a receber `onNavigate`. Links da Watchlist idem.

`AuthGuard` e `GuestGuard` não mudam: redirect para login/onboarding continua imediato.

`(browse)` e `(app)` já montam o mesmo `AppShell`. Home → Watchlist troca o grupo de rota e remonta o shell **depois** dos 260ms; a saída termina antes. Home → busca permanece no mesmo layout; o `key` da identidade evita o leave preso.

## Affected Areas

- `lib/motion.ts` e `lib/motion.test.ts`
- `hooks/use-leave-navigate.ts`
- `components/app-shell.tsx`
- `components/app-topbar.tsx`
- `components/wordmark.tsx`
- `components/catalog-home.tsx`
- `app/(browse)/titulo/[tipo]/[id]/page.tsx`
- `app/(browse)/busca/page.tsx`
- `app/(app)/watchlist/page.tsx`
- `app/(app)/preferencias/page.tsx`
- `components/preferences-form.tsx` (entrada opcional, só Perfil)
- `components/catalog-grid.tsx` / `components/title-card.tsx` (já têm `onNavigate`)
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

Não afetar: `app/(auth)/*`, `app/(setup)/*`, route handlers, contrato de conta, Hero (além do leave já existente em **Ver Detalhes**), filtros e **Carregar mais**.

## Acceptance Criteria

1. Home → busca (ícone da nav): a Home desce e desvanece em 260ms; a busca entra campo → estado → grade.
2. Busca → detalhe (card): a busca sai; o detalhe entra backdrop → cascata já existente.
3. Detalhe → Watchlist (nav, com sessão): o detalhe sai; **Minha lista** entra em cascata.
4. Watchlist → item → detalhe: a lista sai; o detalhe entra em cascata.
5. Watchlist vazia → **Explorar o catálogo**: a lista sai; a Home entra em cascata.
6. Perfil → Início (nav): o Perfil sai; a Home entra em cascata.
7. Na Home, Início ↔ Filmes ↔ Séries (nav ou filtro Tipo) saem e entram com o mesmo gesto. Clicar o item já ativo não anima.
8. Gênero, ano, provedor e ordenação na Home não disparam leave nem cascata nova.
9. Visitante clica Watchlist: vai ao login na hora; a Home não faz leave; o login entra com `.fade-up`.
10. **Entrar** / **Criar conta** na nav: imediatos; auth não usa `.d-in` / `.d-leaving`.
11. Digitar ou resubmeter a busca, filtrar a Home e **Carregar mais** não re-animam a página.
12. Troca de slide do Hero: só crossfade do fundo.
13. Com `prefers-reduced-motion: reduce`: nenhuma cascata e navegação imediata em todos os eixos acima.
14. Cmd/Ctrl+clique (card, item da lista, link da nav) abre nova aba sem leave.
15. Voltar do detalhe continua saindo antes de retornar; a Home não fica presa em `.d-leaving`.
16. Onboarding continua com `.fade-up` no bloco; não herda a cascata do Perfil.

## Implementation Tasks

### Task 1 — Identidade de tela e regra de transição

**Objective**
Decidir, sem UI, quando uma navegação é troca de tela do shell, filtro da Home ou destino fora do recorte.

**Changes**
- Extrair helper puro em `lib/motion.ts` a partir da tabela de identidades.
- Destinos `/login`, `/cadastro`, `/recuperar-senha`, `/atualizar-senha`, `/onboarding` (e equivalentes com query) ficam fora.
- Home distingue `media` (`home`, `home:movie`, `home:tv`); gênero, ano, sort e provedor não mudam a identidade.

**Affected Areas**
- `lib/motion.ts`
- `lib/motion.test.ts`

**Validation**
- Testes unitários: `/` → `/?media=movie`; `/?media=movie` → `/`; `/?media=movie` ↛ `/?media=movie&genre=`; `/busca` → `/`; `/titulo/filme/1` → `/titulo/filme/2`; `/` → `/login`; mesmo pathname da busca com `q` diferente.

### Task 2 — Leave compartilhado no shell

**Objective**
Um só gesto de saída para qualquer troca de tela do recorte, inclusive quando o clique não nasce na página.

**Changes**
- Subir `useLeaveNavigate` para um contexto no `AppShell`.
- Aplicar `.d-leaving` num frame chaveado pela identidade da tela, só enquanto essa identidade for a origem da saída.
- Home e detalhe deixam o hook local e o `className` próprio de leaving; passam a usar o contexto.
- Reset implícito: ao montar o destino, o frame novo não nasce com `.d-leaving`.

**Affected Areas**
- `hooks/use-leave-navigate.ts`
- `components/app-shell.tsx`
- `components/catalog-home.tsx`
- `app/(browse)/titulo/[tipo]/[id]/page.tsx`

**Validation**
- Home → detalhe (card / **Ver Detalhes**) e **Voltar** continuam iguais aos critérios de [screen-transitions.md](screen-transitions.md).
- Reduced motion continua imediato.
- A Home não reaparece no meio da saída (fade não inverte).

### Task 3 — Interceptar nav e links internos do recorte

**Objective**
A nav pill e os atalhos de conteúdo usam o mesmo leave das telas, sem atrasar filtro, auth ou clique modificado.

**Changes**
- `AppTopbar` e `Wordmark`: clique primário consulta o helper; troca de tela → `leaveThen`; filtro Home / mesmo destino / auth → navegação atual.
- Watchlist na nav: sem sessão ou sem preferências → `router.push` imediato para login/onboarding; com conta → leave para `/watchlist` se ainda não estiver lá.
- Busca: `CatalogGrid` recebe `onNavigate` do contexto.
- Watchlist: pôster, título e **Explorar o catálogo** passam pelo leave.
- Perfil: logout usa `leaveThen` antes de `router.replace("/")`.
- Prefetch da rota (e `fetchTitle` quando o href for detalhe) durante os 260ms.

**Affected Areas**
- `components/app-topbar.tsx`
- `components/wordmark.tsx`
- `app/(browse)/busca/page.tsx`
- `app/(app)/watchlist/page.tsx`
- `components/preferences-form.tsx`
- `components/catalog-grid.tsx` / `components/title-card.tsx` (só ligar o callback)

**Validation**
- Critérios 1–10 e 14.
- Filmes/Séries na Home não atrasam a troca de query.
- Clique com metaKey não chama `leaveThen`.

### Task 4 — Cascata de entrada em busca, Watchlist e Perfil

**Objective**
A primeira chegada a essas rotas usa a mesma entrada das outras telas do shell.

**Changes**
- Busca: `.d-in` no campo, no estado e na grade (stagger só no primeiro paint do mount).
- Watchlist: `.d-in` no título, no subtítulo/vazio e nos itens (stagger até o 12º).
- Perfil: `.d-in` no título e, via prop explícita, nas seções de `PreferencesForm`. Onboarding não passa a prop.
- Sem `.d-back` nessas três telas.

**Affected Areas**
- `app/(browse)/busca/page.tsx`
- `app/(app)/watchlist/page.tsx`
- `app/(app)/preferencias/page.tsx`
- `components/preferences-form.tsx`

**Validation**
- Critérios 1, 3, 5, 6, 11, 13, 16.
- Mudar a query da busca ou o país no Perfil não dispara a cascata de novo.
- Onboarding visualmente igual ao atual.

### Task 5 — Documentação viva

**Objective**
PRD, SSD e changelog descreverem o mesmo sistema depois da mudança.

**Changes**
- PRD: a linguagem de movimento vale no shell com nav pill, não só Home ↔ detalhe; Filmes/Séries e reduced motion explícitos.
- SSD: leave no `AppShell`, helper de identidade, busca/Watchlist/Perfil com cascata; auth/onboarding fora.
- CHANGELOG: registrar a extensão da linguagem de movimento.

**Affected Areas**
- `docs/PRD.md`
- `docs/SSD.md`
- `docs/CHANGELOG.md`

**Validation**
- PRD e SSD não contradizem esta spec nem o recorte de [screen-transitions.md](screen-transitions.md) que permanece (Hero, reduced motion, tokens).

## Risks / Open Questions

- **Layout persistente vs. leaving.** Se `.d-leaving` ficar num wrapper que sobrevive à troca Home ↔ busca, a próxima tela nasce invisível ou o fade inverte. O `key` pela identidade da tela é a mitigação; não aplicar leaving em `AppTopbar` nem em `Attribution`.
- **Remount `(browse)` → `(app)`.** A saída precisa terminar antes do `router.push`. Não começar a navegação no primeiro frame do leave.
- **`PreferencesForm` compartilhado.** Sem prop explícita, o onboarding herdaria a cascata do Perfil e perderia o `.fade-up` atual.
- **Voltar nativo do browser.** Não há interceptação de `popstate`. É limitação aceita, não decisão de produto nova.
- Nenhuma pergunta de produto bloqueia a implementação.
