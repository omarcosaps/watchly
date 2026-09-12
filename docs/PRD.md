# PRD — Watchly

Última atualização: 12 de setembro de 2026

Este arquivo é a fonte da verdade funcional do produto. Ele representa o **comportamento de produto aprovado e desejado**, ainda não totalmente implementado. Atualizar aqui quando o comportamento, o escopo ou uma regra de negócio mudar. A arquitetura vive em `docs/SSD.md`. Mudanças individuais ficam em `docs/features/`.

## Visão do produto

O Watchly é um app web de portfólio, não comercial. Ele mostra filmes e séries disponíveis no país de referência, destaca os streamings que a pessoa já usa e deixa guardar uma watchlist pessoal.

A pessoa explora o catálogo sem conta. A autenticação entra quando uma ação depende de persistência pessoal.

A atribuição à TMDB e ao JustWatch é visível. O produto não é endossado nem certificado pelo TMDB.

## Problema

Escolher o que assistir exige abrir vários apps de streaming, lembrar o que a pessoa assina e conferir se o título está incluso, é extra, aluguel ou compra.

O problema não é falta de catálogo. É fricção na hora de decidir, com base nos serviços que a pessoa já usa.

## Objetivo / Outcome

Em poucos minutos, a pessoa consegue:

1. explorar o catálogo sem criar conta
2. ver o que está disponível no país de referência, distinguindo incluso na assinatura, gratuito, com anúncios, aluguel e compra
3. depois de autenticada, ver o que está nos streamings que já usa e o que está fora deles
4. escolher um filme ou série para assistir agora
5. guardar títulos numa watchlist
6. na Watchlist e no detalhe (se o título estiver guardado), ver e registrar se cada título já foi assistido

## Público

Uso pessoal e projeto de portfólio. Não há pesquisa de mercado. O produto precisa ser útil para uma pessoa só.

Uso não comercial. A TMDB em modo developer basta neste recorte.

## Princípios

### Descoberta antes da autenticação

Navegar, filtrar, buscar e abrir o detalhe de um título são experiências públicas.

### Autenticação no momento da intenção

Login ou cadastro não bloqueiam a exploração. A conta passa a ser exigida quando a pessoa quer persistir uma ação pessoal, começando por adicionar um título à watchlist ou abrir a Watchlist.

## Escopo desejado

- App web, interface em português
- Home, busca e detalhe acessíveis sem conta
- Cadastro com e-mail, senha e origem de aquisição (“Onde conheceu o Watchly?”)
- Login com e-mail e senha, com opção de voltar a explorar sem conta
- Recuperação de senha: pedir um link, confirmação neutra, definir nova senha e voltar ao login
- Onboarding depois de criar a conta, se ainda não houver preferências: país e pelo menos um streaming
- País de referência restrito a Brasil, Estados Unidos e Portugal
- Troca de país e de streamings depois do onboarding, sem apagar a watchlist
- Catálogo de filmes e séries na mesma grade, com títulos que tenham oferta no país atual
- Home com hero em carrossel, filtros, ordenação e grade
- Busca por título, com distinção entre resultados nos streamings da pessoa e fora deles
- Página de detalhe com sinopse, elenco, onde assistir e ações de watchlist
- Watchlist por conta: adicionar, remover, listar e alternar status **Ainda não assistido** / **Já assistido**
- Perfil com conta atual, país, streamings e logout
- Atribuição visível a TMDB e JustWatch
- Conteúdo adulto desligado, sem controle para ligar

## Fora do escopo

- Persistência em servidor (incluindo Supabase)
- Conta compartilhada entre dispositivos ou navegadores
- Verificação de e-mail
- Envio real de e-mail (a recuperação descreve o comportamento esperado; a implementação atual não envia mensagem)
- Login social (Google, GitHub, etc.)
- Magic link
- Watchlist anônima
- Nome ou confirmação de senha no cadastro
- Trailer
- Link do título na TMDB
- Filtro por forma de assistir
- Painel lateral na home
- Países além de Brasil, Estados Unidos e Portugal
- Sync com a watchlist da TMDB
- Player ou deep link confiável para o app do streaming
- Recomendação por IA
- Monetização, ads ou paywall
- Catálogo mundial sem região
- Histórico de “entrou / saiu do catálogo”
- Conteúdo adulto ligado por padrão
- Compartilhar watchlist com outras pessoas
- Listas personalizadas além da Watchlist
- Histórico separado de títulos assistidos
- Progresso por temporada ou episódio
- Status de assistido na home ou na busca
- Filtro, ordenação, agrupamento ou contagem por status de assistido
- Data em que assistiu, nota ou reflexão depois de assistir

## Visitante e conta

### O que o visitante pode fazer

- Ver a Home no Brasil
- Filtrar por tipo, gênero e ano
- Ordenar a listagem
- Buscar por título
- Abrir o detalhe
- Usar **Explorar sem conta →** nas telas de autenticação

### O que exige autenticação

- Adicionar ou remover um título da watchlist
- Abrir a Watchlist
- Alterar o status entre **Ainda não assistido** e **Já assistido**
- Escolher ou alterar país e streamings
- Ver e alterar o perfil

Não existe watchlist anônima. O item Watchlist permanece visível na navegação. Se o visitante clicar nele, ou tentar guardar um título, o app pede login ou cadastro.

Copy do gate ao tentar salvar:

> Para adicionar filmes e séries à sua watchlist, entre na sua conta ou crie uma gratuitamente.

Depois do login ou cadastro bem-sucedido, se havia um título pendente, o app guarda esse título e abre o detalhe.

## Funcionalidades desejadas

### Cadastro

Título: **Criar sua conta**. Subtítulo: **Seja bem-vindo ao Watchly**. CTA: **Criar conta**.

Campos:

- E-mail
- Senha
- **Onde conheceu o Watchly** (obrigatório)

Opções da origem:

- Indicação de um amigo
- Redes sociais
- Busca no Google
- YouTube ou podcast
- Notícia ou blog
- Loja de aplicativos
- Outro

Erros visíveis:

- E-mail inválido: “Informe um email válido.”
- E-mail já usado: “Já existe uma conta com esse email. Use Entrar.”
- Senha com menos de 6 caracteres: “A senha precisa de pelo menos 6 caracteres.”
- Origem vazia: “Conte onde você conheceu o Watchly.”

Não há nome, confirmação de senha nem verificação de e-mail. Depois do cadastro, quem ainda não tem streamings configurados vai ao onboarding. Quem já tem vai à Home.

A origem é informada só no cadastro. O perfil não oferece edição desse campo.

### Login

Título: **Login**. Subtítulo: **Acesse sua conta para continuar**. CTA: **Entrar**.

Campos: e-mail e senha. Link: **Esqueci minha senha**. Rodapé: **Novo por aqui?** → **Criar conta**. Escape: **Explorar sem conta →**.

Erros visíveis:

- E-mail inválido: “Informe um email válido.”
- Conta inexistente: “Conta não encontrada. Crie uma conta primeiro.”
- Senha incorreta: “Senha incorreta.”

### Recuperação de senha

A pessoa informa o e-mail e pede um link para criar uma senha nova.

O app responde de forma neutra, sem revelar se a conta existe: se existir uma conta para aquele e-mail, um link de redefinição é enviado.

A pessoa define a nova senha a partir do link e volta ao login. Quem já tem o link pode ir direto a `/atualizar-senha`. Quem lembrou a senha pode voltar ao login sem concluir o fluxo.

### Onboarding

Depois de criar a conta, se ainda não houver streamings configurados:

1. selecionar o país (Brasil pré-selecionado; opções: Brasil, Estados Unidos, Portugal)
2. selecionar os streamings principais daquele país (Netflix, Prime Video, Max, Disney+, Globoplay, Apple TV+, Paramount+ e Telecine, quando a região os tiver)
3. exigir pelo menos um streaming
4. continuar para a Home

Título: **Onde você assiste?** Texto: dá para mudar depois, sem perder a watchlist. O botão **Continuar** só funciona com pelo menos um streaming. Não há “pular”.

### Home

A Home é o ponto principal de descoberta e o destino inicial do visitante.

O catálogo mistura filmes e séries. Entram só títulos com pelo menos uma oferta no país atual, em qualquer forma (incluso, grátis, com anúncios, aluguel ou compra). A home **não** se limita aos streamings da conta.

O visitante vê disponibilidade no Brasil. Quem está autenticado vê disponibilidade no país salvo.

Hero: carrossel com as 5 tendências da semana no país de referência, consultadas na TMDB a cada carga. Entra só título com oferta no país e com backdrop ou pôster. A regra não acompanha tipo, gênero, ano, provedor nem a ordenação da grade. Quando a fonte muda o que está em evidência, o Hero muda. Avança a cada 7 segundos. Kicker **Novo filme** / **Filme** / **Nova série** / **Série** (ano ≥ 2024 usa “Novo/Nova”). Texto de apoio: sinopse em até 3 linhas. Se a original não couber, o Hero mostra um resumo que preserva a ideia principal, o contexto e o tom; a sinopse completa fica só no detalhe. Sem corte com reticências e sem reduzir fonte ou largura só para caber. CTAs: **Ver Detalhes** e adicionar/remover da lista (**Adicionar à minha lista** / **Na minha lista**).

A navegação é uma pill flutuante: **Watchly**, **Início**, **Filmes**, **Séries**, **Watchlist**, busca e, se autenticada, o atalho de perfil (avatar + nome) para `/preferencias`. Filmes e Séries aplicam o filtro de tipo na Home. Logout fica só no Perfil.

Filtros:

- Tipo: Filmes e séries, Filmes, Séries
- Gênero: Todos os gêneros + gêneros do catálogo
- Ano: Todos os anos, 2024–2025, 2020–2023, 2010–2019, Antes de 2010
- Provedor: Todos os serviços + streamings da pessoa — **somente** se autenticada e com streamings configurados

Ordenação (padrão: Popularidade): Popularidade, Nota, Data de lançamento.

Cada card mostra pôster, nota, título, ano, tipo e uma linha de provedores. Com streamings configurados, o que não está nos serviços da pessoa aparece como **Fora dos seus serviços**. Sem streamings (visitante), a linha lista provedores do país.

Estado vazio: “Nada por aqui com esses filtros. Tente afrouxar algum deles.”

Não há painel lateral nem filtro por forma de assistir.

### Busca

Campo: “Buscar filmes e séries por título…”. A busca é por título.

Sem query: “Digite um título para buscar no catálogo.”

Com query e sem resultado: “Nenhum título encontrado para essa busca.”

Quando a pessoa tem streamings configurados, os resultados se separam em:

- **Nos seus streamings**
- **Fora dos seus streamings**

A seção de fora vazia diz: “Nada fora dos seus serviços para essa busca.”

Visitante, ou conta sem streamings: uma seção única **Resultados**. A busca não esconde títulos fora dos streamings escolhidos.

### Detalhe do título

Página pública. Mostra:

- backdrop e pôster
- título, tipo, ano, gêneros e nota
- sinopse
- elenco (até 8 pessoas, com foto ou iniciais e personagem)
- **Onde assistir · {País}**
- seção **Nos seus streamings**, quando houver oferta nos serviços da conta
- demais ofertas do país: **Também disponível em {País}** ou **Disponível em {País} (fora dos seus serviços)**
- forma da oferta (Incluso, Grátis, Com anúncios, Aluguel, Compra) e preço de aluguel ou compra quando a fonte informar

Sem disponibilidade: “Este título não está disponível em nenhum serviço em {País} no momento.”

Ações: voltar; adicionar ou remover da lista (**Add a minha lista** / **Na minha lista**). Se o título estiver na lista, a seção **Meu status** permite alternar entre **Ainda não assistido** e **Já assistido**.

Não há trailer, link para a página do título na TMDB nem botão que prometa abrir o app do streaming.

### Watchlist

Título da página: **Minha lista**. Exclusiva de quem está autenticado. Filmes e séries na mesma lista, mais recente no topo.

Subtítulo: quantidade de títulos salvos e disponibilidade no país atual.

Por item: pôster, título, meta, linha de disponibilidade, toggle de status e remover.

Disponibilidade:

- Disponível nos provedores do país
- Fora dos seus serviços, ainda listando onde está
- Sem oferta no país no momento

Estado vazio: “Sua lista está vazia.” CTA: **Explorar o catálogo**.

Não há filtro, ordenação extra nem agrupamento por status. O título permanece salvo se sair dos streamings da pessoa ou se ela trocar preferências.

### Perfil e preferências

Tela **Perfil**. Mostra a conta atual (e-mail) e o mesmo par país + streamings do onboarding.

Texto: trocar país ou streamings não apaga a watchlist.

Ações: **Salvar preferências** e **Sair da conta**.

Salvar sem streaming: “Escolha pelo menos um streaming disponível neste país para continuar.” Provedores inexistentes no novo país são desmarcados no formulário. Se a pessoa muda o país e sai sem salvar, as preferências anteriores permanecem.

Sucesso: “Preferências salvas. Sua watchlist continua intacta.”

Logout encerra a sessão e volta à Home como visitante. Preferências e watchlist permanecem associadas à conta.

## Fluxos principais

### Exploração pública

Sem sessão → Home no Brasil. Dá para filtrar, ordenar, buscar e abrir o detalhe sem cadastro.

### Autenticação

Visitante tenta guardar um título ou abrir a Watchlist → login ou cadastro, com a opção de explorar sem conta.

Cadastro sem streamings → onboarding → Home.

Login com streamings → Home (e retoma o título pendente, se houver).

Login sem streamings → onboarding.

Logout → Home como visitante.

### Decidir o que assistir

Home → filtrar, ordenar ou buscar → abrir o detalhe → ler a sinopse e ver onde assistir → guardar na watchlist, se quiser. O play continua no app do streaming.

### Registrar o que já viu

Na Watchlist, ou no detalhe de um título já guardado, alternar entre **Ainda não assistido** e **Já assistido**.

## Regras de negócio

1. O visitante explora Home, busca e detalhe sem conta.
2. Adicionar ou remover da watchlist, abrir a Watchlist e alterar o status exigem autenticação.
3. Não existe watchlist anônima.
4. O cadastro exige e-mail, senha e origem de aquisição, escolhida na lista fechada do produto.
5. Não há verificação de e-mail.
6. Onboarding e preferências exigem pelo menos um streaming.
7. O país de referência da conta é um entre Brasil (`BR`), Estados Unidos (`US`) e Portugal (`PT`).
8. O visitante usa Brasil e não troca o país.
9. Qualquer consulta de disponibilidade depende do país de referência atual.
10. Na home, entra o título que tem pelo menos uma oferta no país atual, em qualquer forma. A listagem não se restringe aos streamings da conta.
11. Com streamings configurados, a UI distingue o que está nos serviços da pessoa do que está fora. Sem streamings, não há essa distinção.
12. A busca não esconde título fora dos streamings da conta. Quando há preferências, separa **Nos seus streamings** e **Fora dos seus streamings**.
13. No detalhe, os provedores da conta aparecem em destaque em relação aos demais do país.
14. Sem disponibilidade no país atual: dizer isso explicitamente.
15. Sem botão “assistir agora” que prometa abrir o app do streaming.
16. Trocar país ou streamings e salvar não apaga a watchlist. No formulário, provedores inválidos no novo país são desmarcados; salvar exige pelo menos um provedor.
17. A chave da watchlist é `tipo + id TMDB` por conta. Filme e série com o mesmo id são itens diferentes. Sem duplicata do mesmo par na mesma conta.
18. Cada item da Watchlist tem status **Ainda não assistido** ou **Já assistido**. O padrão ao guardar é **Ainda não assistido**. Marcar assistido não remove, não arquiva e não muda a ordem. O status aparece na Watchlist e no detalhe, neste último só se o título estiver na lista. Remover e guardar de novo volta o status para **Ainda não assistido**.
19. Interface em português. Títulos e sinopses em `pt-BR` quando a TMDB tiver tradução; senão, idioma original. Sem sinopse em português, o detalhe diz isso explicitamente.
20. Fonte da disponibilidade: TMDB / JustWatch. O app não corrige catálogo na mão.
21. Logos e nomes de streamings só a partir dos assets da TMDB.
22. Conteúdo adulto desligado. Sem controle para ligar.

## Métricas

Não há instrumentação de produto. O recorte é uso pessoal e portfólio. Não há metas numéricas de aquisição, retenção ou conversão.

## Dependências externas

- TMDB API v3 (modo developer / não comercial), com **API Read Access Token**
- Disponibilidade por país via parceria TMDB + JustWatch
- Imagens via CDN da TMDB, sem hospedar pôster por conta própria
- Atribuição obrigatória: TMDB e JustWatch

## Limitações

- Conta, preferências e watchlist existem só neste navegador até haver persistência em servidor. Limpar o armazenamento local apaga a sessão e os dados.
- A recuperação de senha descreve o comportamento esperado de envio de link. A implementação atual não envia mensagem.
- A disponibilidade é por país e pode estar desatualizada em relação ao app real do streaming.
- A API da TMDB não devolve deep links completos para Netflix, Prime e similares.
- “Tudo o que está disponível agora” é inexato: a listagem depende da região e da fonte externa.
- Uso comercial da TMDB exige acordo pago. Este produto é não comercial.
- Não usar conteúdo da TMDB para treinar IA.

## Riscos

- A pessoa pode decidir com base em disponibilidade desatualizada.
- Sem deep link, o último passo ainda é abrir o app certo na mão.
- O primeiro pedido de autenticação acontece quando a pessoa tenta guardar um título. Perder o contexto entre o gate e o retorno à ação reduz a conversão.
- Perder o armazenamento local equivale a perder a conta neste dispositivo.

## Decisões de produto em aberto

- Se e quando existir conta persistida entre dispositivos (e como isso muda sessão, preferências e watchlist)
- Se a recuperação de senha passará a enviar e-mail de verdade

## Como atualizar

Mudou uma decisão de produto, um fluxo ou uma regra de negócio? Editar este arquivo, ajustar a data no topo e registrar só o estado desejado atual. Histórico detalhado fica no Git. Detalhe de uma evolução específica fica na Feature Spec correspondente.
