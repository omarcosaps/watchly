# ADR-004 — Disponibilidade de streaming consultada na TMDB

Status: Accepted

## Context

A disponibilidade muda com país, provedor e tempo. Gravar ofertas na watchlist ou num banco local deixaria selos velhos depois de trocar o país ou quando o catálogo da TMDB/JustWatch atualizasse.

O produto precisa mostrar “onde assistir agora” na região das preferências, inclusive para títulos já guardados.

## Decision

Ofertas de streaming não são persistidas.

- Home e busca hidratam watch/providers dos itens visíveis depois do Discover/Search.
- O detalhe busca watch/providers do título na região atual.
- A página da Watchlist reconsulta `/api/title/...` para cada item salvo.
- A watchlist guarda só identidade e snapshot de UI (`title`, `posterPath`, `year`).

O único cache é o HTTP do Next nas queries TMDB (6 h para watch/providers por título).

## Consequences

- Trocar o país atualiza a disponibilidade sem migrar dados da lista.
- Títulos fora do ar no novo país continuam na watchlist; a UI mostra a oferta atual ou a ausência dela.
- Cada página visível dispara N chamadas de watch/providers (mitigadas pelo cache).
- Sem rede ou com falha na hidratação, o item pode aparecer sem selos (`offers: []`) em vez de um snapshot antigo.
