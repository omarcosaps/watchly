# PRD — Watchly

Última atualização: 10 de setembro de 2026

Este arquivo é a fonte da verdade funcional do produto. Atualizar aqui quando o comportamento, o escopo ou uma regra de negócio mudar. A arquitetura vive em `docs/SSD.md`. Mudanças individuais ficam em `docs/features/`.

## Visão do produto

O Watchly é um app web de portfólio, não comercial. Ele mostra filmes e séries disponíveis nos streamings que a pessoa já usa, no país escolhido, e deixa guardar uma watchlist.

A atribuição à TMDB e ao JustWatch é visível. O produto não é endossado nem certificado pelo TMDB.

## Problema

Escolher o que assistir exige abrir vários apps de streaming, lembrar o que a pessoa assina e conferir se o título está incluso, é extra, aluguel ou compra.

O problema não é falta de catálogo. É fricção na hora de decidir, com base nos serviços que a pessoa já usa.

## Objetivo / Outcome

Em poucos minutos, a pessoa com sessão no app consegue:

1. ver o que está disponível nos serviços que já usa, no país dela
2. distinguir incluso na assinatura, gratuito, com anúncios, aluguel e compra
3. escolher um filme ou série para assistir agora
4. guardar títulos numa watchlist
5. na Watchlist e no detalhe (se o título estiver guardado), ver e registrar se cada título já foi assistido

## Público

Uso pessoal e projeto de portfólio. Não há pesquisa de mercado. O produto precisa ser útil para uma pessoa só.

Uso não comercial. A TMDB em modo developer basta neste recorte.

## Escopo atual

- App web, interface em português
- Conta obrigatória na UI: cadastro, login e logout com email e senha
- Telas de recuperação de senha, atualização de senha e verificação de email (fluxo de interface; não há envio real de email)
- Persistência local no navegador: sessão, preferências (país e provedores) e watchlist
- Onboarding depois do login: país (Brasil pré-selecionado) e pelo menos um streaming
- Catálogo de filmes e séries na mesma grade, misturando assinatura, gratuito, anúncios, aluguel e compra
- Home com destaques em carrossel, grade de cards e painel lateral (preview da Watchlist, melhor nota, atalhos de gênero)
- Busca por título
- Filtros: tipo, gênero, provedor, forma de assistir, ano
- Ordenação: popularidade (padrão), nota, data
- Paginação por “Carregar mais”
- Página de detalhe com sinopse, onde assistir, elenco, trailer quando existir, e link para a TMDB
- Watchlist: adicionar, remover e listar; status visual “Ainda não assistir” ou “Já assistir” na Watchlist e no detalhe (só se o título estiver guardado)
- Troca de país e de provedores depois do onboarding, sem apagar a watchlist
- Atribuição visível a TMDB e JustWatch
- Conteúdo adulto desligado, sem controle para ligar

## Fora do escopo

- Persistência em servidor (incluindo Supabase)
- Conta real compartilhada entre dispositivos ou navegadores
- Envio real de email (confirmação ou recuperação de senha)
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
- Listas personalizadas além da Watchlist
- Histórico separado de títulos assistidos
- Progresso por temporada ou episódio
- Status de assistido na home, na busca ou no atalho da Watchlist
- Filtro, ordenação ou contagem por status de assistido
- Data em que assistiu ou nota depois de assistir

## Funcionalidades atuais

### Conta e sessão

A UI exige email e senha para entrar. Sem sessão, o app mostra só as telas de autenticação.

Sair encerra a sessão neste navegador. Preferências e watchlist permanecem no armazenamento local.

Há telas de cadastro, login, recuperar senha, atualizar senha e verificar email. Recuperar senha e verificar email não enviam mensagem real: a interface simula o fluxo.

### Preferências

Depois do login, quem ainda não escolheu país e streamings passa pelo onboarding. É obrigatório pelo menos um provedor. O país padrão é Brasil.

Em Preferências, a pessoa troca país e streamings. A watchlist não é apagada. A disponibilidade passa a usar o país salvo. No formulário, provedores inexistentes no novo país são desmarcados; salvar sem nenhum provedor é bloqueado. Se a pessoa muda o país e sai sem salvar, as preferências anteriores permanecem.

### Catálogo

A home lista filmes e séries disponíveis nos provedores da conta, na região atual. Cada card mostra pôster, título, tipo e selos de como assistir.

Os cinco primeiros itens da página atual aparecem em carrossel. A grade mostra o restante. O painel lateral traz um preview da Watchlist, títulos com melhor nota e atalhos de gênero.

Filtros e ordenação valem para a grade. “Carregar mais” busca a próxima página. O catálogo inteiro nunca é carregado de uma vez.

### Busca

Busca por nome, sem esconder títulos fora dos streamings da conta. O que não está nos provedores dela aparece distinguível (“Fora dos seus serviços”).

### Detalhe

Mostra título, ano, sinopse, gêneros, nota, tipo, elenco, onde assistir no país atual e, quando houver, um trailer no YouTube. Os streamings da conta aparecem em destaque em relação aos demais do país. Sem disponibilidade, o texto diz isso explicitamente.

Não há botão que prometa abrir o app do streaming. Há link para a página do título na TMDB. Dá para guardar ou tirar da Watchlist. Se o título estiver na lista, o detalhe também mostra o status de assistido.

### Watchlist

Uma lista neste navegador, filmes e séries juntos, mais recente no topo. Adicionar e remover a partir do card ou do detalhe. Cada item mostra disponibilidade no país atual.

Status visual: “Ainda não assistir” (padrão ao guardar) ou “Já assistir”. O status é só registro visual. Marcar não remove, não arquiva e não muda a ordem. A pessoa pode voltar de um status para o outro.

No detalhe, fora da Watchlist o status não aparece. Tirar da lista esconde o status; guardar de novo volta para “Ainda não assistir”.

O status não aparece na home, na busca nem no atalho da Watchlist.

O título permanece salvo mesmo se sair dos streamings ou se a pessoa trocar provedores.

## Fluxos principais

### Autenticação

Sem sessão válida → login / cadastro / recuperar senha / atualizar senha.

Sessão com email pendente → verificar email. Só segue depois de confirmar na própria tela.

Sessão sem preferências → onboarding.

Sessão com preferências → home.

Logout → login. Preferências e watchlist continuam no navegador.

### Decidir o que assistir

Home → filtrar, ordenar ou buscar → abrir o detalhe → ler a sinopse e ver onde assistir → guardar na watchlist, se quiser. O play continua no app do streaming.

### Registrar o que já viu

Na Watchlist, ou no detalhe de um título já guardado, alternar entre “Ainda não assistir” e “Já assistir”.

## Regras de negócio

1. Região é obrigatória em qualquer consulta de disponibilidade.
2. Na home, “disponível” significa: existe oferta na região atual em pelo menos um provedor da conta, em qualquer forma (`flatrate`, `free`, `ads`, `rent`, `buy`).
3. Na home, todas as formas de oferta entram na mesma grade, com selo visível. Não há prioridade automática para assinatura.
4. A busca não esconde título fora dos streamings da conta. Distingue o que está nos provedores dela do que não está.
5. No detalhe, os provedores da conta aparecem em destaque em relação aos demais do país.
6. Sem disponibilidade no país atual: dizer isso explicitamente.
7. Sem botão “assistir agora” que prometa abrir o app do streaming. Pode haver link para a página do título na TMDB e trailer no YouTube.
8. Watchlist e preferências são desta conta neste navegador. Sem lista anônima na UI; sem sync entre dispositivos.
9. A chave da watchlist é `tipo + id TMDB`. Filme e série com o mesmo id são itens diferentes. Sem duplicata do mesmo par neste navegador.
10. Interface em português. Títulos e sinopses em `pt-BR` quando a TMDB tiver tradução; senão, idioma original. Sem sinopse em português, o detalhe diz isso explicitamente.
11. Fonte da disponibilidade: TMDB / JustWatch. O app não corrige catálogo na mão.
12. Logos e nomes de streamings só a partir dos assets da TMDB.
13. Conteúdo adulto desligado. Sem controle para ligar.
14. Listagem usa “Carregar mais”. Não existe carregar o catálogo inteiro de uma vez.
15. Cada item da Watchlist tem status “Ainda não assistir” ou “Já assistir”. O padrão ao guardar é “Ainda não assistir”. O status não tira o título da lista. É exibido e alterado na Watchlist e no detalhe, neste último só se o título estiver na lista. Remover e guardar de novo volta o status para “Ainda não assistir”.
16. Trocar país ou provedores e salvar não apaga a watchlist. No formulário, provedores inválidos no novo país são desmarcados; salvar exige pelo menos um provedor.

## Métricas

Não há instrumentação de produto. O recorte é uso pessoal e portfólio. Não há metas numéricas de aquisição, retenção ou conversão.

## Dependências externas

- TMDB API v3 (modo developer / não comercial), com **API Read Access Token**
- Disponibilidade por país via parceria TMDB + JustWatch
- Imagens via CDN da TMDB, sem hospedar pôster por conta própria
- Atribuição obrigatória: TMDB e JustWatch
- Trailers via YouTube, quando a TMDB devolver um vídeo utilizável

## Limitações

- Conta, preferências e watchlist existem só neste navegador. Limpar o armazenamento local apaga a sessão e os dados.
- Recuperação de senha e verificação de email não enviam mensagem.
- A disponibilidade é por país e pode estar desatualizada em relação ao app real do streaming.
- A API da TMDB não devolve deep links completos para Netflix, Prime e similares.
- “Tudo o que está disponível agora” é inexato: a listagem é paginada e depende da região.
- Uso comercial da TMDB exige acordo pago. Este produto é não comercial.
- Não usar conteúdo da TMDB para treinar IA.

## Riscos

- A pessoa pode decidir com base em disponibilidade desatualizada.
- Sem deep link, o último passo ainda é abrir o app certo na mão.
- Perder o armazenamento local equivale a perder a conta neste dispositivo.
- O catálogo da TMDB continua acessível pelas rotas de API do app, mesmo sem passar pela UI de login.

## Decisões de produto em aberto

- Refino visual dos selos de oferta e do destaque “é um dos seus streamings”
- Se e quando existir conta persistida entre dispositivos (e como isso muda sessão, preferências e watchlist)

## Como atualizar

Mudou uma decisão de produto, um fluxo ou uma regra de negócio? Editar este arquivo, ajustar a data no topo e registrar só o estado atual. Histórico detalhado fica no Git. Detalhe de uma evolução específica fica na Feature Spec correspondente.
