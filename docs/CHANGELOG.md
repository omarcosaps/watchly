# Changelog

## 2026-09-12

### Added

- Persistência de conta, preferências e watchlist no Supabase, com sync entre dispositivos.
- Recuperação de senha com e-mail real do Supabase Auth.
- Exploração pública da Home, busca e detalhe, com autenticação só na watchlist e no perfil.
- Cadastro com origem de aquisição e persistência mock isolada por e-mail.

### Changed

- A linguagem de movimento vale em toda troca entre Home, busca, detalhe, Watchlist e Perfil, inclusive pela nav pill; Início, Filmes e Séries também saem e entram com o mesmo gesto.
- Home e detalhe entram em cascata e saem com fade + descida de 260ms; o carrossel do Hero não re-anima o texto.
- O Hero da Home mostra as 5 tendências da semana no país, com oferta e still; independente da listagem.
- O Hero da Home resume a sinopse para no máximo 3 linhas; o detalhe mantém o texto completo.
- Onboarding e Perfil usam os mesmos streamings principais e o mesmo formato de pills em grade 2×4.
- Onboarding alinhado à referência: bloco de 720px, país em outline, oito streamings principais em grade 2×4 e Continuar ao lado do hint.
- UI alinhada ao HTML de referência e ao Style Guide: tokens `#0b0c10` / `#f2f3f5`, nav pill flutuante, hero full-bleed, filtros abaixo do hero, cards sem stamps, watchlist em lista, detalhe com overlap, auth com card de 404px e onboarding sem chrome.
- UI alinhada ao protótipo: nav, hero, filtros, detalhe, Minha lista, Perfil e rótulos **Ainda não assistido** / **Já assistido**.
- `GET /api/catalog` deixa de exigir provedores; a Home lista o que tem oferta no país.

### Fixed

- Home não recarrega o hero ao alterar a watchlist; sem hero, o conteúdo fica abaixo da nav; recuperação de senha volta a apontar para `/atualizar-senha`; onboarding mostra a atribuição.

### Removed

- Fluxo de verificação de e-mail, trailer e link do título na TMDB da superfície de produto.

## 2026-09-11

### Added

- Modelo de domínio e diagramas ER conceitual e persistido em `docs/SSD.md`.

### Changed

- O PRD passa a descrever o comportamento de produto aprovado e desejado no protótipo: exploração como visitante, cadastro com origem de aquisição, onboarding de país e streamings, e os fluxos de home, busca, detalhe, watchlist e perfil.
- O SSD diferencia arquitetura atual e arquitetura alvo para suportar esse comportamento, sem inventar schema de banco.

### Fixed

### Removed

## 2026-09-10

### Added

- Modelo de documentação viva: `docs/PRD.md`, `docs/SSD.md`, `docs/features/`, `docs/decisions/` e este changelog.

### Changed

- O PRD passa a descrever o estado funcional atual (conta, preferências e watchlist locais; emails de auth simulados; sem persistência em servidor).
- A arquitetura vigente foi consolidada em `docs/SSD.md`.

### Fixed

### Removed

- `docs/tech-plan.md` — planejamento histórico. O que ainda vale está no SSD e nos ADRs; o restante permanece no Git.
