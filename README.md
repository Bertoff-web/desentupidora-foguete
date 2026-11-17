# Desentupidora Foguete — MVP de controle financeiro

Protótipo acadêmico de um sistema simples para registrar entradas, despesas e acompanhar o saldo financeiro de uma microempresa.

## Funcionalidades

- Visão geral com total de entradas, despesas e saldo.
- Cadastro de recebimentos e despesas.
- Listagem, filtro e busca de lançamentos.
- Exclusão de registros com confirmação.
- Resumo financeiro calculado automaticamente.
- Recurso de acessibilidade: aumento do texto e alto contraste.
- Layout adaptável para computador e celular.
- Armazenamento local no navegador (`localStorage`).

## Como executar

1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` em um navegador atualizado.
3. Cadastre entradas e despesas para testar o resumo.

Não é necessário instalar dependências ou configurar servidor.

## Publicar com GitHub Pages

1. Envie os arquivos `index.html`, `style.css` e `script.js` para a raiz do repositório.
2. No GitHub, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main` e a pasta `/ (root)`.
5. Clique em **Save** e aguarde a publicação.

## Dados e limitações

Este é um MVP demonstrativo. Os dados ficam armazenados somente no navegador e dispositivo utilizados. Limpar os dados do navegador pode apagá-los; eles não são sincronizados entre dispositivos nem enviados para um banco de dados. Não utilize informações financeiras reais ou dados pessoais neste protótipo.

## Cenário fictício para validação

- Entrada: Desentupimento de pia — R$ 250,00 — Pix.
- Despesa: Combustível — R$ 50,00 — Transporte.
- Saldo esperado: R$ 200,00.

## Tecnologias

HTML5, CSS3 e JavaScript puro.
