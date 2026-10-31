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

A URL da API fica em `.env.local`, na variável `VITE_API_BASE_URL`, sem o prefixo `/api/v1`. O backend libera o navegador em `http://localhost:5173`. Reinicie o Vite depois de criar ou alterar esse arquivo.
