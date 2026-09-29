# ADR-006 — Foto de perfil no Storage

Status: Accepted

## Context

Quem está logado escolhe uma foto no Perfil. Ela precisa valer na hora, ficar na conta e aparecer no círculo do Perfil e no chip da navegação, neste aparelho e noutro.

[ADR-005](ADR-005-supabase-account.md) fixou a conta sem foto e sem UPDATE em `public.accounts`. E-mail e origem de aquisição não podem ser alterados pelo cliente. Uma policy de update na linha inteira abriria esses campos.

Guardar os bytes na linha que a sessão carrega inteira aumentaria toda hidratação por causa do chip. A foto também não entra em `preferences`: não é país nem streaming, e **Salvar preferências** precisa seguir independente.

## Decision

O banco guarda o caminho. Os bytes ficam num bucket.

- Tabela `public.avatars`: `user_id` PK com FK `auth.users(id) on delete cascade`, `object_path` e `updated_at`. O caminho permitido é `{user_id}/avatar`.
- RLS: a pessoa autenticada só lê, insere, atualiza e apaga a própria linha.
- Bucket `avatars`, público. Leitura do objeto é pública, para a URL não expirar no meio da sessão. Escrita e exclusão só no objeto `{user_id}/avatar`. Limite de 2 MiB. MIME `image/jpeg`, `image/png` e `image/webp`.
- `public.accounts` continua só com select. Sem `SERVICE_ROLE` no app.
- Sem recorte. A foto preenche o círculo por `object-fit: cover`.

## Consequences

- A hidratação da conta carrega uma URL, não o arquivo.
- Quem tiver a URL abre a foto. A URL não é listada na UI para mais ninguém. Uma URL assinada quebraria o chip sem um ciclo de renovação que o app não tem.
- Trocar a foto sobrescreve o mesmo objeto. Apagar o usuário remove a linha de `avatars`.
- O contrato que grava e publica `avatarUrl` fica no adapter de conta, não nesta decisão.
