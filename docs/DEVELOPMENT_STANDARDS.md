# Padrões de desenvolvimento do GuliX Web

Este documento define como o trabalho no `gulix-web` é conduzido. O que o sistema é está em `ARCHITECTURE.md`. A ordem das tarefas está em `IMPLEMENTATION_ROADMAP.md`.

## Branches

O desenvolvimento é organizado por feature. Cada branch sai da branch padrão atualizada e volta por pull request depois que lint, build e os testes da tarefa passam.

| Situação | Padrão | Exemplo |
| --- | --- | --- |
| Funcionalidade nova | `feat/<escopo>` | `feat/product-catalog` |
| Correção | `fix/<escopo>` | `fix/auth` |
| Refatoração | `refactor/<escopo>` | `refactor/home` |
| Testes como trabalho principal | `test/<escopo>` | `test/checkout` |

A branch `feat(storefront)` já existe, com parênteses, e fica preservada. Ela não é renomeada e não recebe as tarefas novas. O trabalho seguinte da vitrine que for só estrutural usa `refactor/home`. A integração dos produtos reais continua em `feat/product-catalog`.

Regras:

- Confirmar o nome da branch padrão antes de criar a primeira branch. Esse nome ainda não foi verificado na documentação.
- Não abrir branch para ajuste trivial isolado.
- Não juntar features independentes na mesma branch.
- Uma feature pode ter vários commits e mais de um push.
- Não iniciar a tarefa dependente antes de a anterior estar integrada na branch padrão. Exceções exigem justificativa registrada no pull request. As únicas paralelizações previstas estão no roadmap: `FE-007` com `FE-008` depois de `FE-005`, e `FE-014` com `FE-015` depois de `FE-011`.
- Não usar branch intermediária de desenvolvimento. O frontend é um único fluxo de loja, com dependências lineares.

## Conventional Commits

Formato:

```text
<tipo>(<escopo>): <descrição em português>
```

A descrição diz o efeito da mudança, em português, com letra minúscula depois dos dois pontos. Tipos e escopos permanecem como estão abaixo.

### Tipos

| Tipo | Uso |
| --- | --- |
| `feat` | Funcionalidade nova |
| `fix` | Correção |
| `refactor` | Reorganização sem mudança de comportamento esperado |
| `test` | Teste |
| `docs` | Documentação |
| `build` | Build e dependências |
| `ci` | Integração contínua ou fluxo de validação |
| `perf` | Desempenho |
| `chore` | Manutenção que não altera a aplicação nem a documentação de produto |

### Escopos oficiais

`storefront`, `app-foundation`, `product-catalog`, `product-details`, `search`, `auth`, `shopping-cart`, `customer-account`, `addresses`, `checkout`, `orders` e `home`.

O escopo genérico `frontend` não é usado quando um escopo desta lista descreve a mudança. Commits já existentes não são reescritos para se adequar a esta lista.

### Exemplos

```text
refactor(home): reorganizar a estrutura da página inicial
feat(app-foundation): adicionar roteamento da aplicação
feat(app-foundation): implementar cliente HTTP
ci(app-foundation): executar lint, testes e build
feat(product-catalog): consultar listagem paginada de produtos
feat(product-catalog): implementar página de listagem
feat(product-catalog): exibir produtos da API na home
feat(product-details): implementar página de detalhe do produto
feat(search): buscar produtos pelo nome
feat(auth): persistir sessão e renovar acesso
feat(auth): implementar cadastro e login
fix(auth): corrigir validação do formulário de login
feat(shopping-cart): implementar página do carrinho
feat(customer-account): implementar edição de perfil
feat(addresses): cadastrar endereço de entrega
feat(checkout): criar pedido e redirecionar ao pagamento
feat(orders): implementar listagem e detalhe de pedidos
test(product-catalog): adicionar testes para listagem de produtos
docs(home): documentar a refatoração da página inicial
```

## Testes e validação

### Já instalado

O `package.json` expõe:

```bash
npm run lint
npm run test
npm run build
npm run dev
npm run preview
```

`lint` executa o oxlint. `test` executa o Vitest uma vez, com jsdom e Testing Library. `build` executa `tsc -b` e o build do Vite. Não há Playwright nem workflow de CI no repositório.

### Planejado

Código novo de cliente, formulário e estado de tela leva teste automatizado. Os testes do cliente HTTP e do roteamento inicial usam respostas simuladas e não dependem do backend em execução.

| Alvo | Forma prevista | A partir de |
| --- | --- | --- |
| Cliente HTTP e mapeamento de erro | Teste unitário com resposta simulada | Implementado em `src/lib/http/client.test.ts` |
| Listagem, filtros e paginação | Teste do módulo de consulta e da página | FE-004 e FE-005 |
| Formulários de login, cadastro, perfil, endereço e checkout | Teste de componente com campos inválidos e mensagem da API | FE-010 em diante |
| Sessão e rota protegida | Teste de armazenamento, renovação, logout e redirecionamento | FE-009 e FE-011 |
| Carregamento, sucesso, vazio e erro | Teste de componente com as quatro situações quando a tela buscar dados | FE-005, FE-006, FE-007, FE-012 e FE-019 |
| Integração real com a API | Chamada ao backend em execução, depois de o CORS permitir a origem do Vite | Não bloqueia o aceite com resposta simulada; não substitui esse aceite |

Teste de ponta a ponta com navegador e backend reais fica para depois de `FE-018`. Ele depende de API, cidade cadastrada, filial, empresa, política de frete e Stripe. Enquanto `CorsConfig` estiver vazio, essa camada não é critério de conclusão.

Formulários devem exercer as regras já expressas nos DTOs: e-mail, senha, telefone, CEP, parcelas e quantidade positiva. A mensagem exibida no erro de validação vem de `fields`. A mensagem dos demais erros vem de `message`.

Autorização no frontend significa o seguinte: visitante não acessa rota privada; o token é enviado apenas quando existe; o cliente trata `401` e `403`. A decisão final de acesso continua no backend.

### Conclusão de uma tarefa

Uma tarefa está concluída quando:

1. O escopo implementado é o do roadmap, sem a tarefa vizinha.
2. Os critérios de aceite da tarefa foram verificados.
3. `npm run lint` e `npm run build` passam.
4. `npm run test` passa.
5. A revisão confere que segredos não foram adicionados.
6. A branch foi integrada na branch padrão por pull request.

`FE-021` também exige a conferência visual da home em viewport estreita e larga. `FE-001` e o cliente HTTP passam por `npm run test`, além de lint e build.

Chamar a API no navegador e observar a resposta não é obrigatório para concluir a tarefa enquanto o CORS não estiver resolvido. Quando essa chamada for feita, o resultado deve ser descrito como integração verificada. Até lá, o resultado dos testes simulados deve ser descrito como validação local.

## Fluxo de cada tarefa

1. Consultar `ARCHITECTURE.md` para o contrato e a limitação envolvidos, e `IMPLEMENTATION_ROADMAP.md` para o escopo da tarefa.
2. Confirmar a branch padrão, criar a branch da tarefa e verificar se a dependência já foi integrada.
3. Implementar somente o escopo descrito. Em particular, `refactor/home` não consome a API, e `FE-006` não reorganiza a estrutura deixada por `FE-021`.
4. Executar lint, build e os testes pertinentes. Para mudança visual da home, percorrer a página em viewport estreita e larga.
5. Revisar o diff: arquivos fora do escopo, dados estáticos removidos cedo demais e mensagens de erro inventadas.
6. Criar commits no formato deste documento. Uma tarefa pode ter mais de um commit quando houver uma etapa verificável, como teste separado da implementação.
7. Enviar a branch ao repositório remoto somente quando isso for autorizado.
8. Abrir pull request para a branch padrão. O texto do pull request indica a tarefa, o que foi verificado e o que ficou bloqueado por CORS ou por outra limitação.
9. Se o escopo, a ordem ou uma limitação mudar, atualizar `IMPLEMENTATION_ROADMAP.md` no mesmo trabalho, com commit `docs(<escopo>)`. Não reescrever o histórico de commits antigos.

Não alterar o backend a partir das tarefas deste frontend. Uma limitação de API permanece documentada até que o código do backend mostre o contrário.
