# Feature Spec — Foto de perfil

Status: Ready

PRD: ../PRD.md
SSD: ../SSD.md
ADR: ../decisions/ADR-005-supabase-account.md

Última atualização: 28 de setembro de 2026

Esta spec não redefine a decisão de produto. É o registro de como a foto de quem está logado é gravada, mostrada no Perfil e refletida no chip da navegação.

## Summary

A pessoa autenticada escolhe uma foto no Perfil. A foto passa a valer na hora, fica na conta e aparece no círculo do Perfil e no chip do topo, no telefone e no desktop. Sem foto, a inicial de hoje permanece. Onboarding, cadastro e visitante ficam de fora.

## Current Behavior

O Perfil (`/preferencias`) mostra o título, o e-mail e o par país + streamings. Não há círculo de foto nem ações de enviar, trocar ou remover.

O chip da navegação, no compacto e na pílula, monta duas letras a partir do e-mail (`heymark` → `HE`) em `AccountControls`. A sessão carregada é só `{ email, status }`. O snapshot da conta não tem foto.

`public.accounts` guarda e-mail e origem e só permite leitura da própria linha. Não há coluna, tabela nem bucket de foto. A tela Perfil continua sendo UI sobre User e Preferences.

## Proposed Behavior

- Só no Perfil, para quem já tem sessão e preferências. O onboarding não mostra o bloco.
- Sem foto: círculo com a inicial de hoje (duas letras do e-mail) e a ação **Enviar foto**.
- Escolher um arquivo válido mostra a foto na hora no círculo e no chip, e grava na conta. Não há **Salvar** nem **Cancelar**.
- Com foto: **Trocar foto** substitui do mesmo jeito. **Remover** volta à inicial no círculo e no chip e apaga a foto da conta.
- Sucesso depois de enviar ou trocar: “Foto do perfil atualizada.” A frase fica no bloco da conta até a próxima ação de foto ou até sair da página. Remover não mostra essa frase. Recarregar não a traz de volta.
- Arquivo que não é JPG, PNG ou WebP: “Escolha uma foto em JPG, PNG ou WebP.” Arquivo acima de 2 MB: “A foto precisa ter no máximo 2 MB.” Falha ao gravar: “Não deu para salvar a foto.” Falha ao remover: “Não deu para remover a foto.”
- Em qualquer falha, a foto anterior permanece no círculo e no chip. A gravação que não concluiu não substitui a conta.
- A mensagem da foto não substitui a de preferências, nem o contrário. **Salvar preferências** e **Sair da conta** continuam iguais.
- Sair da conta tira a foto do chip. Entrar de novo, neste ou noutro aparelho, mostra a mesma foto.
- Visitante não vê círculo de foto. A inicial não muda de regra.

## Technical Approach

O arquivo não entra na linha que a sessão carrega inteira. O banco guarda o caminho. Os bytes ficam num bucket.

`public.accounts` continua sem UPDATE: e-mail e origem não podem ser alterados pelo cliente. Uma policy de update na linha inteira abriria esses campos. A foto também não entra em `preferences`: não é país nem streaming, e **Salvar preferências** precisa seguir independente.

Tabela nova `public.avatars`:

- `user_id uuid` PK, FK `auth.users(id)` on delete cascade
- `object_path text` not null
- `updated_at timestamptz` not null default `now()`

RLS: a pessoa autenticada só lê, insere, atualiza e apaga a própria linha.

Bucket `avatars`, no Storage do mesmo projeto. Escrita e exclusão só na pasta do próprio `user_id`. Leitura pública do objeto. A URL pública não expira no meio da sessão; uma URL assinada quebraria o chip sem um ciclo de renovação que o app não tem. O caminho é `{user_id}/avatar`, sobrescrito na troca. Remover apaga o objeto e a linha.

O snapshot da conta passa a ter `avatarUrl: string | null`, ao lado de sessão, preferências e watchlist. `hydrateAccount` lê `avatars` e monta a URL. `signOut` limpa o snapshot, então o chip perde a foto sem apagar a conta.

Contrato em `lib/account`, no mesmo adapter do resto da conta. Sem `SERVICE_ROLE`.

- `saveAvatar(file)` valida tipo e tamanho no cliente antes de enviar. Se a validação falha, não chama o Storage e não mexe na URL.
- Se a validação passa, círculo e chip usam a prévia local. No sucesso, a prévia é trocada pela URL gravada. Na falha, os dois voltam à URL anterior.
- `removeAvatar()` só conclui a volta à inicial quando Storage e linha foram apagados. Se um dos dois falha, a foto anterior fica.

A UI da foto usa `<img>`. O host do Storage não entra em `images.remotePatterns`.

No Perfil, o bloco fica no lugar do parágrafo “Conectado como…”, só quando `showAccount` é verdadeiro. Círculo com botão de lápis, título **Perfil** ao lado, e-mail e a ação (**Enviar foto**, ou **Trocar foto** e **Remover**) na linha de baixo. O `<h1>` da página sai do container e passa para esse bloco, para não haver dois títulos. O lápis e o texto da ação abrem o mesmo seletor de arquivo. O chip permanece com 26px; com foto, a imagem cobre o círculo, inclusive quando o chip está ativo em `/preferencias`.

## Affected Areas

- `supabase/migrations` — tabela `avatars`, RLS, bucket e policies de Storage
- `lib/account/types.ts`, `store.ts`, `supabase/load.ts`, adapter novo de avatar, `test-double.ts`
- `components/account-provider.tsx` — `saveAvatar` e `removeAvatar`
- `components/preferences-form.tsx` — bloco só com `showAccount`
- `app/(app)/preferencias/page.tsx` — título sai daqui
- `components/app-topbar.tsx` — chip lê `avatarUrl`
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`
- ADR novo para a tabela e o bucket, porque o ADR-005 fixou conta sem foto e sem update em `accounts`

Não afetar: onboarding, cadastro, login, watchlist, catálogo, `Salvar preferências`, logout além de limpar o snapshot, regra das duas letras.

## Acceptance Criteria

1. Sem foto, Perfil e chip mostram a mesma inicial de duas letras de hoje, e o Perfil oferece **Enviar foto**.
2. Escolher JPG, PNG ou WebP de até 2 MB troca círculo e chip na hora, sem **Salvar** nem **Cancelar**, e grava na conta.
3. Recarregar, sair e entrar, ou abrir noutro aparelho, mostra a mesma foto no Perfil e no chip.
4. **Trocar foto** substitui a anterior nos dois lugares e na conta.
5. **Remover** volta à inicial nos dois lugares e a foto deixa de existir na conta.
6. Arquivo de outro tipo, arquivo acima de 2 MB, falha ao gravar ou falha ao remover mostra o aviso correspondente e mantém a foto anterior.
7. “Foto do perfil atualizada.” aparece só depois de enviar ou trocar com sucesso, e some na próxima ação de foto ou ao sair da página.
8. **Salvar preferências** e **Sair da conta** seguem com o comportamento e as mensagens atuais. A mensagem da foto não apaga a de preferências.
9. Onboarding não mostra enviar, trocar ou remover. Visitante não vê foto no chip.
10. Trocar país ou streamings no formulário não re-anima a página e não dispara de novo a entrada do Perfil.

## Implementation Tasks

### Task 1 — Registro da foto na conta

**Objective**
Persistir o caminho da foto na conta e o arquivo no bucket, com acesso só do dono na escrita.

**Changes**
- Migration com `public.avatars`, RLS e bucket `avatars` (leitura pública, escrita e exclusão só na pasta do `user_id`).
- ADR da escolha: caminho na tabela, bytes no bucket, `accounts` sem update.

**Affected Areas**
- `supabase/migrations`
- `docs/decisions/`

**Validation**
- A pessoa só lê e escreve a própria linha e a própria pasta.
- Apagar o usuário remove a linha. `accounts` continua só com select.

### Task 2 — Contrato de conta

**Objective**
Carregar, gravar e remover a foto pelo mesmo contrato das outras ações da conta, e refletir a URL no snapshot.

**Changes**
- `avatarUrl` no snapshot.
- `saveAvatar` e `removeAvatar`, com validação de tipo e tamanho antes do envio.
- Leitura no `hydrateAccount`. Limpar a URL no `signOut` junto com o resto do snapshot.
- Test double e testes de conta.

**Affected Areas**
- `lib/account/*`
- `components/account-provider.tsx`

**Validation**
- Tipo inválido ou arquivo acima de 2 MB não chama o Storage e não muda `avatarUrl`.
- Sucesso grava o caminho e publica a URL no snapshot.
- Falha de gravação ou de remoção mantém a URL anterior.
- Remoção bem-sucedida deixa `avatarUrl` nulo.
- Hidratar de novo devolve a mesma URL.

### Task 3 — Bloco de foto no Perfil

**Objective**
Mostrar o círculo, as ações e as mensagens só no Perfil, com gravação imediata.

**Changes**
- Bloco com círculo, lápis, e-mail e **Enviar foto** / **Trocar foto** / **Remover**.
- O título **Perfil** mora nesse bloco. A página deixa de renderizar o `<h1>` solto.
- Prévia local no círculo assim que o arquivo passa na validação; reversão se a gravação falha.
- Mensagens de sucesso e de erro no bloco, separadas das de preferências.
- `showAccount` falso: bloco ausente.

**Affected Areas**
- `components/preferences-form.tsx`
- `app/(app)/preferencias/page.tsx`

**Validation**
- Perfil: estados sem foto, com foto, sucesso e erro.
- Onboarding: sem o bloco.
- Salvar preferências e sair da conta inalterados.
- Trocar país ou streaming não re-anima a entrada.

### Task 4 — Chip da navegação

**Objective**
O chip mostra a mesma foto da conta em todas as larguras, e a inicial quando não há foto.

**Changes**
- `AccountControls` usa `avatarUrl` quando existe.
- Sem URL, as duas letras de hoje.
- Chip ativo em `/preferencias` continua mostrando a foto.

**Affected Areas**
- `components/app-topbar.tsx`

**Validation**
- Compacto, médio e amplo: foto no chip depois de gravar; inicial depois de remover.
- Visitante: sem foto.
- Sair da conta: o chip volta a **Entrar** / **Criar conta**.

### Task 5 — Documentação viva

**Objective**
PRD, SSD e CHANGELOG passam a descrever a foto como dado da conta.

**Changes**
- PRD: bloco do Perfil, chip e a regra de que a foto sobrevive ao logout.
- SSD: `avatars`, bucket, `avatarUrl` no snapshot, e a tela Perfil deixa de ser “sem entidade”.
- CHANGELOG: entrada da foto no Perfil e no chip.

**Affected Areas**
- `docs/PRD.md`, `docs/SSD.md`, `docs/CHANGELOG.md`

**Validation**
- Os três docs descrevem o mesmo comportamento desta spec.
- Onboarding e a inicial de duas letras continuam como estão.

## Risks / Open Questions

- A decisão de produto pedia a foto no banco. O arquivo em si fica no Storage; a tabela guarda o caminho. Bytes na linha de sessão aumentariam toda hidratação por causa do chip. Update em `accounts` abriria e-mail e origem.
- Leitura pública do objeto: quem tiver a URL abre a foto. A URL não é listada na UI para mais ninguém. URL assinada expiraria com a aba aberta.
- Não há recorte. A foto preenche o círculo por `object-fit: cover`.
- O texto dos avisos e o momento em que a frase verde some ficaram em aberto na descoberta. Esta spec fecha os dois: cópias acima, e a frase some na próxima ação de foto ou ao sair da página.
