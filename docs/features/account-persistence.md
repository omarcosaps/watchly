# Feature Spec — Persistência de conta no Supabase

Status: Done

PRD: ../PRD.md
SSD: ../SSD.md
ADR: ../decisions/ADR-005-supabase-account.md

Última atualização: 12 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro da troca do mock local por persistência em servidor.

## Summary

Cadastro, login, preferências e watchlist passam a viver no Supabase. A exploração pública e o catálogo TMDB não mudam. A recuperação de senha envia um e-mail de verdade.

## Current Behavior

Sessão, origem, país, streamings e watchlist ficam em `watchly-account-v2` neste navegador. Funções de conta são síncronas. Recuperação só valida o e-mail. Limpar o storage apaga a conta neste dispositivo.

## Proposed Behavior

- Visitante continua na Home, busca e detalhe sem conta.
- Cadastro, login, logout, onboarding, perfil e watchlist usam a mesma UI e as mesmas mensagens de erro.
- Depois do cadastro sem preferências, onboarding. Login com preferências vai à Home.
- Watchlist e preferências sincronizam entre dispositivos da mesma conta.
- Recuperação responde de forma neutra e envia o link se a conta existir.
- `/atualizar-senha` aceita o retorno do e-mail mesmo com sessão de recovery.
- Sem migração automática do mock local.

## Technical Approach

Adapter Supabase atrás de `lib/account`. Schema em `supabase/migrations`. Cliente `@supabase/ssr`. `proxy.ts` só de cookie. Guards no cliente.

## Affected Areas

- `lib/account/*`
- `components/account-provider.tsx`, `auth-form.tsx`, guards, preferências, watchlist
- `app/auth/callback/route.ts` e `proxy.ts`
- Documentação viva (PRD, SSD, CHANGELOG)

## Acceptance Criteria

- Cadastro com origem persiste a conta e abre o onboarding.
- Login distingue e-mail inexistente e senha errada.
- Preferências exigem ≥1 streaming e não apagam a watchlist.
- Watchlist: add, remove, status, unicidade `tipo + id TMDB` por conta.
- Reload e outro dispositivo veem os mesmos dados.
- Recuperação é neutra e o link leva a definir senha nova.
- Home, busca e detalhe seguem públicos. Movimento de tela intacto.

## Implementation Tasks

Registro histórico: branch `feat/supabase-account-persistence`, schema via MCP, adapter, UI async, testes com cliente mockado, atualização do PRD/SSD.
