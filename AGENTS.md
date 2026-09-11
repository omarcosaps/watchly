<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Product documentation

- `docs/PRD.md` — source of truth para comportamento, requisitos e regras de negócio.
- `docs/SSD.md` — source of truth para arquitetura e implementação técnica atual.
- `docs/features/` — especificações de mudanças individuais.
- `docs/decisions/` — ADRs de decisões arquiteturais relevantes.
- `docs/CHANGELOG.md` — registro das principais mudanças do produto.

PRD e SSD são documentos vivos: descrevem o sistema como ele é agora. Feature Specs e ADRs são registros históricos. O Git é o histórico detalhado.

Não duplicar informação. Regras de negócio ficam no PRD. Como o código implementa isso fica no SSD. O “por quê” de uma escolha arquitetural fica no ADR. Não atualizar documentos sem necessidade.

### Antes de implementar uma feature

1. Ler as partes relevantes do PRD.
2. Ler as partes relevantes do SSD.
3. Ler a Feature Spec, quando existir.
4. Verificar impactos no comportamento e arquitetura existentes.

### Definition of Done

Antes de considerar qualquer feature concluída:

- verificar se o PRD precisa ser atualizado (mudou comportamento, escopo ou regra de negócio);
- verificar se o SSD precisa ser atualizado (mudou arquitetura, contrato, persistência, integração ou limitação técnica);
- verificar se uma nova decisão arquitetural exige ADR (só se a decisão for relevante e existir no código);
- atualizar CHANGELOG se houver mudança relevante no produto;
- garantir que código e documentação descrevam o mesmo sistema.

Feature Specs em `docs/features/` documentam uma mudança específica. Depois de Done, permanecem como histórico e não precisam continuar sendo atualizadas, salvo correção factual.

Não inventar requisitos, arquitetura ou decisões. Se o código e o documento divergirem, corrigir o documento ou o código — não deixar os dois descreverem sistemas diferentes.
