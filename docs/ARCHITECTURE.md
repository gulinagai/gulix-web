# Arquitetura do GuliX Web

Este documento descreve a organização técnica do frontend `gulix-web` e a forma prevista de integração com o backend `projeto-GuliX`. O estado atual e as decisões planejadas estão separados. Nada desta página afirma que uma integração já foi executada no navegador.

## Objetivo e escopo

O GuliX Web é a loja do cliente. A versão presente entrega a página inicial com identidade visual, layout e dados locais. Autenticação, catálogo real, carrinho, conta, endereços, checkout e pedidos estão planejados e ainda não existem no frontend.

O painel administrativo não faz parte deste frontend. O backend expõe operações de gestão, e elas permanecem fora do escopo da loja.

## Tecnologias em uso

| Ferramenta | Situação | Uso atual |
| --- | --- | --- |
| React 19 | Instalada | Interface |
| TypeScript | Instalada | Tipagem do código existente |
| Vite 8 | Instalada | Servidor de desenvolvimento e build |
| Tailwind CSS 4 | Instalada | Estilos, via `@tailwindcss/vite` |
| lucide-react | Instalada | Ícones |
| oxlint | Instalada | `npm run lint` |
| React Router 7 | Instalada | Rotas `/` e `*` |
| Vitest | Instalada | `npm run test` |
| Testing Library | Instalada | Testes de componente com jsdom |
| Node.js 22 ou superior | Exigida pelo `README.md` | Ambiente local |

Não há cliente HTTP de terceiros, biblioteca de estado nem teste de ponta a ponta. O cliente da API usa `fetch`.

Fontes Inter e Newsreader são carregadas no `index.html` a partir do Google Fonts. Os tokens visuais ficam em `src/index.css`, no bloco `@theme`.

## Estrutura atual

```text
gulix-web/
├── index.html
├── package.json
├── vite.config.ts
├── .env.example
├── README.md
├── docs/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── lib/http/
    ├── routes/
    ├── pages/
    │   ├── HomePage.tsx
    │   └── NotFoundPage.tsx
    ├── components/
    │   ├── layout/
    │   └── home/
    ├── data/
    │   ├── catalog.ts
    │   └── home.ts
    └── assets/
```

`main.tsx` monta `App` em modo estrito. `App` entrega o roteador. O layout compartilhado fica em `AppShell`: `AnnouncementBar`, o link de pular para `#conteudo`, `Header`, a rota ativa e `Footer`. A home continua sendo a rota `/`. A rota `*` renderiza `NotFoundPage`.

`vite.config.ts` registra os plugins do React e do Tailwind. Não há proxy para o backend.

## Componentes e páginas

Há uma única página, `HomePage`. Ela compõe sete seções:

| Componente | Responsabilidade atual |
| --- | --- |
| `Hero` | Abertura, atalhos `#produtos` e `#ofertas`, e cartão do `highlightProduct` |
| `CategorySection` | Grade visual de categorias |
| `FeaturedProducts` | Filtro local e grade de todos os produtos de `catalog.ts` |
| `OfferBanner` | Banner estático com atalho `#produtos` |
| `BestSellers` | Grade ordenada por `rankingIds` |
| `Benefits` | Quatro diferenciais com texto fixo |
| `Newsletter` | Formulário que apenas cancela o envio |

O layout compartilhado está em `src/components/layout/`: `AnnouncementBar`, `Header`, `Footer`, `Container` e `Wordmark`.

`ProductCard` está em `src/components/home/` e é usado por `FeaturedProducts` e `BestSellers`. O cartão conhece o tipo `Product` de `catalog.ts`, inclusive preço já formatado, parcela e selo.

`src/data/catalog.ts` é a fonte usada pela interface. `src/data/home.ts` exporta outro `Product`, outras categorias e outros produtos, e nenhum módulo o importa.

## Roteamento

### Estado atual

As rotas ficam em `src/routes/routes.tsx` e o `RouterProvider` em `src/routes/router.tsx`. `/` renderiza a home existente. Qualquer outro caminho renderiza a página 404, com link de volta para `/`.

A navegação interna do cabeçalho e do rodapé continua em âncoras: `#inicio`, `#produtos`, `#categorias` e `#ofertas`. O cabeçalho marca “Início” com `aria-current="page"`. O menu móvel abre, fecha com Escape e devolve o foco operacional ao fechar o painel. Busca, conta e carrinho não navegam e não alteram dados.

### Decisão planejada

As páginas de catálogo, detalhe, autenticação, carrinho, conta, endereços, checkout e pedidos entram nas tarefas das features correspondentes, como novos objetos em `appRoutes`. A refatoração da home não cria essas rotas.

## Comunicação com o backend

### Estado atual

`createApiClient` em `src/lib/http/client.ts` monta as URLs a partir de `VITE_API_BASE_URL`, aceita `GET`, `POST`, `PUT`, `PATCH` e `DELETE`, anexa `Authorization: Bearer` somente quando recebe `token` e lê corpo vazio, inclusive `204`. Nenhuma tela chama esse cliente ainda. A classe `CorsConfig` do backend está vazia, então a comunicação pelo navegador não está habilitada no código do servidor.

O backend usado como contrato é uma API stateless, com prefixo `/api/v1`, JWT no header `Authorization` e sessão sem estado no servidor. A documentação OpenAPI e o Swagger UI são públicos. Isso não substitui a leitura dos controllers e dos DTOs.

### Decisão planejada

O armazenamento da sessão entra na feature `auth`. O cliente já está pronto para receber o token, sem guardá-lo. Ele não será considerado validado no navegador enquanto o CORS não permitir a origem do Vite.

## Contratos relevantes

Os contratos abaixo foram lidos no backend. O frontend ainda não os implementa.

### Consultas públicas

| Operação | Uso previsto na loja |
| --- | --- |
| `GET /api/v1/produtos` | Listagem paginada. Filtros existentes: `nome`, `categoriaId`, `marcaId`, além da paginação do Spring (`page`, `size`, `sort`) |
| `GET /api/v1/produtos/{produtoId}` | Detalhe |
| `GET /api/v1/categorias` e `GET /api/v1/categorias/{categoriaId}` | Nome e id da categoria |
| `GET /api/v1/marcas` e `GET /api/v1/marcas/{marcaId}` | Nome e id da marca |
| `POST /api/v1/auth/register` | Cadastro. Resposta `201` com `UsuarioResponseDTO`, sem tokens |
| `POST /api/v1/auth/login` | Retorna `token`, `refreshToken` e `type` (`Bearer`) |
| `POST /api/v1/auth/refresh` | Gera outro par e revoga o refresh token anterior |
| `POST /api/v1/auth/logout` | Revoga o refresh token informado. Resposta `204` |

`ProdutoResponseDTO` expõe `id`, `nome`, `resumo`, `preco`, `estoque`, `destaque`, `imagemURL`, `desconto`, `categoriaId`, `marcaId`, `criadoEm` e `atualizadoEm`. `EstoqueResponseDTO`, dentro do produto, expõe `estoqueTotal`, `estoqueReservado` e `estoqueDisponivel`. Os endpoints de `/api/v1/estoques` são administrativos.

`CategoriaResponseDTO` e `MarcaResponseDTO` expõem `id` e `nome`. Não há imagem, descrição nem contagem.

Não há parâmetro de consulta para `destaque`. A seleção de destaques da home, quando passar a usar a API, filtra esse campo no cliente. Não há endpoint de mais vendidos nem de busca separado de `nome`.

### Operações do cliente autenticado

Exigem papel `USER`, salvo observação em contrário.

| Operação | Observação confirmada no código |
| --- | --- |
| `GET /api/v1/carrinho` | Cria o carrinho do usuário se ele ainda não existir |
| `POST /api/v1/carrinho/itens` | Soma a quantidade quando o produto já está no carrinho. Resposta `201` sem corpo |
| `PUT /api/v1/carrinho/itens/{itemId}` | Substitui a quantidade. Resposta `200` sem corpo |
| `DELETE /api/v1/carrinho/itens/{itemId}` | Resposta `204` |
| `GET` e `PATCH /api/v1/usuarios/{usuarioId}` | O próprio usuário ou `ADMIN`. `UsuarioUpdateDTO` aceita `nome`, `senha` e `telefone` |
| `GET`, `POST`, `PATCH` e `DELETE /api/v1/enderecos` | Endereços do usuário autenticado |
| `PATCH /api/v1/enderecos/{enderecoId}/principal` | Resposta `204` |
| `GET /api/v1/cidades` e `GET /api/v1/estados` | Exigem autenticação, porque a regra geral do backend protege o que não foi liberado |
| `POST /api/v1/pedidos` | Cria o pedido a partir do carrinho e devolve frete, totais e pagamento |
| `GET /api/v1/pedidos` e `GET /api/v1/pedidos/{pedidoId}` | Pedidos do próprio usuário. `ADMIN` consulta o pedido por id sem ser o dono |
| `PATCH /api/v1/pedidos/{pedidoId}/cancelar` | Somente pedido `PENDENTE` e do próprio usuário |
| `GET /api/v1/pagamentos/{pagamentoId}` | Dono do pedido ou `ADMIN` |

`PedidoCreateDTO` exige `enderecoId`, `metodoPagamento` e, no cartão, `numeroParcelas`. `MetodoPagamento` possui `CARTAO_CREDITO` e `BOLETO`.

`CarrinhoResponseDTO` traz `itens` e `total`. Cada item traz `id`, `produtoId`, `nomeProduto`, `preco` e `quantidade`. Não traz imagem.

### Erros

`ErrorResponseDTO` contém `timestamp`, `status`, `error`, `message` e `path`. `ValidationErrorResponseDTO` acrescenta `fields`, um mapa de campo para mensagem. `ApiError` preserva esses campos quando o JSON corresponde ao contrato. Corpo vazio, JSON inválido, formato inesperado e falha de rede ficam distinguíveis por `kind`, sem substituir `message` quando a API a envia.

## Autenticação e sessão

### Estado atual

Não há login, armazenamento de token nem rota protegida.

### Contrato confirmado

O cadastro grava o usuário com `Role.ROLE_USER` e não autentica. O login compara e-mail e senha e devolve o par de tokens. O JWT leva o e-mail em `sub` e os claims `id` e `role`. Não existe endpoint de perfil do usuário autenticado. A duração do acesso e do refresh token vem de `JWT_EXPIRATION` e `REFRESH_TOKEN_EXPIRATION`; os valores numéricos não estão fixados no código.

A sessão planejada guarda os dois tokens, lê o `id` do claim para chamar `/api/v1/usuarios/{usuarioId}` e renova o acesso com `/refresh`. O logout envia o refresh token. Visitante não possui carrinho: as operações de carrinho respondem `401` ou `403` sem sessão de `USER`.

Senha de cadastro e de atualização: mínimo de 8 caracteres, com maiúscula, minúscula e número. Telefone: 10 ou 11 dígitos. E-mail não faz parte de `UsuarioUpdateDTO`.

## Catálogo, carrinho, endereços, pedidos e pagamentos

### Catálogo

A home exibe oito produtos locais, com preço, comparação, parcela e selo já montados em texto. As categorias locais incluem imagem, descrição e um texto de contagem. Essa contagem não acompanha a lista: Tecnologia informa `4 ITENS` e há dois produtos dessa categoria; Acessórios informa `4 ITENS` e há um produto.

Quando a integração existir, o preço cobrável é `preco`. O carrinho e o item do pedido usam `produto.preco`. O campo `desconto` não entra nesse cálculo. `imagemURL` está documentado no DTO como nome de arquivo ou URL, e não há endpoint de mídia. `destaque` seleciona produtos no cliente. Marcas entram como filtro da listagem. A página de detalhe usa o `id` numérico.

### Carrinho

O carrinho é do servidor e pertence ao usuário. Incluir o mesmo produto soma a quantidade. Estoque disponível é validado na inclusão, na atualização e na criação do pedido. A home não chama essas operações. O botão `+` do hero e o ícone do cabeçalho não têm ação.

### Endereços

O cadastro envia `rua`, `numero`, `cidade`, `estado` e `cep`. O CEP aceita `00000-000` ou `00000000`. O estado tem dois caracteres. A cidade precisa existir em `Cidade` com o mesmo nome; caso contrário, a criação falha com recurso não encontrado. O primeiro endereço do usuário torna-se principal no servidor. A resposta `EnderecoResponseDTO` não possui o campo `principal`.

O frete não é cotado por um endpoint. `CalculoFreteService.calcularFrete` roda dentro da criação do pedido, com a filial persistida, o valor por quilômetro da empresa, a política do estado e a rota do OpenRouteService.

### Pedidos e pagamentos

O pedido nasce `PENDENTE`, copia os itens do carrinho, reserva estoque e esvazia o carrinho. A resposta inclui `valorFrete`, `subtotal`, `total` e `PagamentoResponseDTO`.

Cartão exige parcelas. De 1 a 6 não há juros. De 7 a 48 há 2% sobre a base. Acima de 48 a API recusa. Boleto não tem parcelas e recebe 10% de desconto sobre o total do pedido. O gateway é Stripe. A loja deve redirecionar para `checkoutUrl`.

`StripeGateway` fixa o retorno em `http://localhost:8080/pagamento/sucesso` e `http://localhost:8080/pagamento/cancelado`. Não há controller nem página do frontend nesses caminhos. `application.properties` não define `server.port`.

Status de pedido: `PENDENTE`, `APROVADO`, `CANCELADO`. Status de pagamento: `PENDENTE`, `PROCESSANDO`, `CONFIRMADO`, `RECUSADO`, `CANCELADO`.

## Erros, carregamento e ausência de dados

A interface atual não possui estado de carregamento, erro de API nem lista vazia vinda do servidor. `FeaturedProducts` mostra a quantidade da lista local depois do filtro. Se o filtro não encontrar itens, o texto indica zero produtos; com os dados atuais, todos os filtros locais encontram ao menos um.

Os estados de carregamento, erro e lista vazia da home integrada pertencem a `FE-006`. A refatoração estrutural apenas prepara as seções para receber a lista por propriedades, ainda preenchida por `catalog.ts`.

Formulários futuros devem mostrar `message` e, quando existir, `fields`. Isso vale para autenticação, perfil, endereço, carrinho e checkout.

## Variáveis de ambiente

A URL da API é `VITE_API_BASE_URL`, documentada em `.env.example`. O arquivo `.env` fica fora do Git. Segredos do backend — banco, `JWT_SECRET`, Stripe e OpenRouteService — não entram no frontend.

O `README.md` informa que o Vite sobe em `http://localhost:5173`.

## Decisões já tomadas

- A loja e o backend permanecem em repositórios separados.
- A branch `feat(storefront)` registra a interface inicial e não será renomeada.
- A home continua com dados locais até a tarefa de integração do catálogo.
- O preço exibido como valor a pagar deve seguir `preco` quando a API for ligada. O texto de parcela da vitrine atual não representa a regra de juros do backend.
- Favoritos e newsletter permanecem sem comportamento de negócio. Não há API para eles.
- Pix aparece no rodapé como texto visual. O contrato de pagamento não possui Pix.
- O painel administrativo fica fora deste roadmap.
- A ordem de implementação e os identificadores das tarefas estão em `IMPLEMENTATION_ROADMAP.md`.
- O modo de conduzir branches, commits e validação está em `DEVELOPMENT_STANDARDS.md`.

## Limitações técnicas

| Limitação | Onde foi confirmada | Efeito na loja |
| --- | --- | --- |
| CORS sem configuração | `CorsConfig` vazio | Impede considerar a integração validada no navegador |
| Sem cotação de frete | Frete calculado só em `PedidoServiceImpl.createNewPedido` | O valor aparece na resposta do pedido |
| Retorno da Stripe fora do frontend | URLs fixas em `StripeGateway` | A loja abre o checkout e não recebe a volta |
| Sem endpoint do usuário autenticado | Consulta por `/api/v1/usuarios/{usuarioId}` | O `id` precisa ser lido do claim do JWT |
| Cidades e estados autenticados | `SecurityConfig` protege o restante das rotas | O formulário de endereço só lista opções com sessão |
| Cidade precisa existir pelo nome | `EnderecoServiceImpl.buscaCoordenada` | Texto livre que não coincida com o cadastro falha |
| Resposta de endereço sem `principal` | `EnderecoResponseDTO` | A loja pode definir o principal e não consegue lê-lo de volta |
| `imagemURL` sem servidor de mídia | Campo do `ProdutoResponseDTO`; nenhum controller de arquivo | A imagem depende de o valor ser uma URL utilizável |
| `desconto` fora do total do carrinho e do pedido | `CarrinhoServiceImpl.calcularTotal` e preço do item em `PedidoServiceImpl` | A vitrine não deve transformar `desconto` no preço cobrado |
| Sem ranking de vendas | Nenhum endpoint ou campo correspondente | “Mais vendidos” continua uma seleção local |
| Sem favoritos e sem newsletter | Nenhum controller correspondente | Os controles atuais não devem ganhar persistência |
| Pagamento limitado a cartão e boleto | `MetodoPagamento` | O checkout não oferece Pix |
| Carrinho sem imagem | `ItemCarrinhoResponseDTO` | A página do carrinho mostra nome, preço e quantidade, salvo consulta adicional ao produto |
| Cópia de “até 12x sem juros” | `AnnouncementBar`, `Hero` e `Benefits` | Texto de vitrine. A regra confirmada isenta juros só até 6 parcelas |

## Dependências externas

O funcionamento integrado depende de serviços que o frontend não controla:

- API Spring Boot em execução, com banco acessível pelas variáveis já usadas pelo backend.
- CORS permitindo a origem do Vite, ainda ausente.
- Dados de categoria, marca, produto, estoque, cidade, estado, filial, empresa e política de frete já persistidos. A criação de endereço e de pedido falha se cidade, filial ou empresa não existirem.
- OpenRouteService na geração de coordenadas do endereço e no cálculo da rota do frete.
- Stripe na abertura de `checkoutUrl` e no webhook `/webhooks/stripe`, que é do backend.

Enquanto essas dependências não estiverem disponíveis, as telas podem ser construídas e testadas com respostas simuladas. Isso não equivale a uma integração validada no navegador.
