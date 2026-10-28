# GuliX

Front-end do GuliX, um e-commerce de hardware.

Esta primeira versão entrega a página inicial com identidade visual em preto e azul e dados estáticos. Autenticação, carrinho, pagamentos e a integração com o backend ficam para etapas seguintes.

## Requisitos

- Node.js 22 ou superior

## Executar localmente

```bash
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173`.

## Validação

```bash
npm run lint
npm run test
npm run build
```

Copie `.env.example` para `.env` quando for chamar a API. A variável é `VITE_API_BASE_URL`. O CORS do backend ainda não libera o navegador.
