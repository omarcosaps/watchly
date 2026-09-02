# PRD — Watchly

Última atualização: 1 de setembro de 2026

Este arquivo é a fonte da verdade de produto. Atualizar aqui quando uma decisão mudar. Plano técnico e implementação não substituem este documento.

## Problema

Escolher o que assistir exige abrir vários apps de streaming, lembrar o que a pessoa assina e conferir se o título está incluso, é extra, aluguel ou compra.

O problema não é falta de catálogo. É fricção na hora de decidir, com base nos serviços que a pessoa já usa.

## Outcome

Em poucos minutos, a pessoa autenticada consegue:

1. ver o que está disponível nos serviços que já usa, no país dela
2. distinguir incluso na assinatura, gratuito, aluguel e compra
3. escolher um filme ou série para assistir agora
4. guardar títulos numa watchlist da conta
5. na Watchlist e no detalhe (se o título estiver guardado), ver e registrar se cada título já foi assistido

## Usuário

Uso pessoal e projeto de portfólio. Não há pesquisa de mercado. O produto precisa ser útil para uma pessoa só.

Uso não comercial. A TMDB em modo developer basta neste recorte.

## Escopo do MVP

- App web
- Conta obrigatória: email e senha (cadastro, login, logout)
- Recuperação de senha por email
- Persistência no Supabase: sessão, preferências (país e provedores) e watchlist
- Onboarding depois do login: país + streamings
- País padrão: Brasil
- Catálogo de filmes e séries
- Grade única misturando filmes e séries, e misturando assinatura, gratuito, aluguel e compra
- Busca por título
- Filtros: tipo, gênero, provedor, forma de assistir, ano
- Ordenação: popularidade (padrão), nota, data
- Página de detalhe com onde e como assistir
- Watchlist por conta (adicionar, remover, listar)
- Status visual na Watchlist e no detalhe (só se o título estiver na lista): “Ainda não assistir” ou “Já assistir”
- Troca de país e de provedores depois do onboarding, sem apagar a watchlist
- Atribuição visível a TMDB e JustWatch

## Fora do escopo

- Login social (Google, GitHub, etc.)
- Magic link
- Acesso sem conta (visitante)
- Sync com a watchlist da TMDB
- Player ou deep link confiável para o app do streaming
- Recomendação por IA
- Monetização, ads ou paywall
- Catálogo mundial sem região
- Histórico de “entrou / saiu do catálogo”
- Conteúdo adulto ligado por padrão
- Compartilhar watchlist com outras pessoas
- Listas personalizadas além da Watchlist da conta
- Histórico separado de títulos assistidos
- Progresso por temporada ou episódio
- Status de assistido na home, na busca ou no atalho da Watchlist
- Filtro, ordenação ou contagem por status de assistido
- Data em que assistiu ou nota depois de assistir

## Fluxos

### Autenticação

Sem sessão válida, o app mostra só login / cadastro. Não há catálogo, busca, detalhe, watchlist nem onboarding.

Sair encerra a sessão neste navegador. Preferências e watchlist permanecem no banco.

Se o projeto Supabase exigir confirmação de email, o app mostra “verifique seu email” e só segue depois de confirmar.

### Onboarding

No primeiro login sem preferências: país (Brasil pré-selecionado) e pelo menos um streaming daquele país. Só então a home abre.

Visitas seguintes, com sessão e preferências salvas, caem direto na home.

### Decidir o que assistir

Home com grade única. Cada card mostra poster, título, tipo (filme/série) e selos de como assistir nos provedores da conta.

A pessoa filtra, ordena ou busca, abre o detalhe, lê a sinopse e vê onde assistir. Pode salvar na watchlist. Se o título estiver na Watchlist, o detalhe também mostra o status “Ainda não assistir” ou “Já assistir”. O play continua no app do streaming.

### Watchlist

Adicionar e remover a partir do card ou do detalhe. Uma lista por conta, filmes e séries juntos, mais recente no topo. Cada item mostra disponibilidade no país atual.

Na página da Watchlist e no detalhe (somente se o título estiver guardado), cada título tem um status visual: “Ainda não assistir” (padrão ao guardar) ou “Já assistir”. O status é só registro visual. Marcar não remove, não arquiva e não muda a ordem. A pessoa pode voltar de um status para o outro.

No detalhe, fora da Watchlist o status não aparece. Tirar da lista esconde o status; guardar de novo volta para “Ainda não assistir”.

O status não aparece na home, na busca nem no atalho da Watchlist.

O título permanece salvo mesmo se sair dos streamings ou se a pessoa trocar provedores. Se for removido e guardado de novo, o status volta para “Ainda não assistir”.

### Troca de contexto

Alterar país ou provedores atualiza as preferências da conta. A watchlist não é apagada. A disponibilidade exibida passa a usar o novo país. Provedores inexistentes no novo país são desmarcados. Se não restar nenhum, o app pede nova escolha antes da home.

## Regras de negócio

1. Região é obrigatória em qualquer consulta de disponibilidade.
2. Na home, “disponível” significa: existe oferta na região atual em pelo menos um provedor da conta, em qualquer forma (`flatrate`, `free`, `ads`, `rent`, `buy`).
3. Na home, todas as formas de oferta entram na mesma grade, com selo visível. Não há prioridade automática para assinatura.
4. A busca não esconde título fora dos streamings da conta. Distingue o que está nos provedores dela do que não está.
5. No detalhe, os provedores da conta aparecem em destaque em relação aos demais do país.
6. Sem disponibilidade no país atual: dizer isso explicitamente.
7. Sem botão “assistir agora” que prometa abrir o app do streaming. Pode haver link para a página do título na TMDB.
8. Watchlist e preferências são por usuário no Supabase. Um email = uma conta. Sem lista anônima.
9. A chave da watchlist é `tipo + id TMDB` por usuário. Filme e série com o mesmo id são itens diferentes. Sem duplicata do mesmo par na mesma conta.
10. Interface em português. Títulos e sinopses em `pt-BR` quando a TMDB tiver tradução; senão, idioma original.
11. Fonte da disponibilidade: TMDB / JustWatch. O app não corrige catálogo na mão.
12. Logos e nomes de streamings só a partir dos assets da TMDB.
13. Conteúdo adulto desligado. Sem controle no MVP para ligar.
14. Listagem é paginada ou contínua. Não existe carregar o catálogo inteiro de uma vez.
15. Cada item da Watchlist tem status “Ainda não assistir” ou “Já assistir”. O padrão ao guardar é “Ainda não assistir”. O status não tira o título da lista. É exibido e alterado na Watchlist e no detalhe, neste último só se o título estiver na lista. Remover e guardar de novo volta o status para “Ainda não assistir”.

## Dependências

- TMDB API v3 (modo developer / não comercial), com **API Read Access Token**
- Disponibilidade por país via parceria TMDB + JustWatch
- Endpoints principais: Configuration, Watch Providers, Discover Movie/TV, Search Movie/TV, Details
- Supabase: Auth (email/senha) + banco + políticas para o usuário só ler/escrever os próprios dados
- Atribuição obrigatória: TMDB e JustWatch
- Imagens via CDN da TMDB, sem hospedar poster por conta própria

## Restrições da TMDB

- Uso comercial exige acordo pago. Este MVP é não comercial.
- Dados de watch providers exigem atribuição a JustWatch.
- A API não devolve deep links completos para Netflix, Prime, etc.
- A disponibilidade é por país. Sem região, o catálogo não faz sentido.
- “Todos os filmes disponíveis agora” é inexato: a API é paginada e depende da região.
- Não usar conteúdo da TMDB para treinar IA.

## Riscos de produto

- Disponibilidade pode estar desatualizada em relação ao app real do streaming.
- Sem deep link, o último clique ainda é abrir o app certo na mão.
- Auth simples ainda depende de email (confirmação e reset). Configuração errada no Supabase bloqueia o onboarding.

## Decisões em aberto (UX, não escopo)

- Visual dos selos de oferta e do destaque “é um dos seus streamings”
- Paginação versus scroll infinito
- Confirmação de email ligada ou desligada no projeto Supabase

## Como atualizar

Mudou uma decisão de produto? Editar este arquivo, ajustar a data no topo e registrar só o estado atual — não o histórico do chat.
