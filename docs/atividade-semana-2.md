# Minha Página Consome uma API: Fetch, JSON e DOM

**DWS — 4º bimestre — Semana 2 — Aula 3**

**Nome completo:** ____________________  **Turma:** __________  **Data:** ___/___/______

**Tema do projeto:** Estante do Bairro — site de livros usados e trocas.

## Funcionalidade implementada

Consulta de endereço por CEP na página Contato, seção **De qual bairro você vem?**.
O visitante informa o CEP, clica em **Buscar endereço** e recebe rua, bairro, cidade e UF sem recarregar a página.
A consulta é independente do formulário de recados e não cadastra dados nem calcula frete.

## Planejamento da minha funcionalidade (página 3)

| O que decidir | Minha escolha | Trecho de código relacionado |
| --- | --- | --- |
| API escolhida | ViaCEP, pública e sem chave | `fetch(\`https://viacep.com.br/ws/${cep}/json/\`, { signal: sinal })` |
| Dado que será buscado | Endereço correspondente ao CEP: rua, bairro, cidade e UF | `const dados = await resposta.json();` |
| Elemento HTML que será atualizado | `#cep-rua`, `#cep-bairro`, `#cep-cidade` e `#cep-uf`, dentro de `#cep-resultado`; avisos em `#cep-status` | `document.getElementById('cep-rua').textContent = dados.logradouro || 'Não informada para este CEP';` |
| Mensagem exibida em caso de erro | “Não foi possível buscar o CEP agora. Verifique sua conexão e tente novamente.” | `catch (erro) { ... mostrarMensagem(..., 'erro'); }` |

## Onde está cada requisito

- **Função assíncrona:** `async function buscarCEP()` em `js/cep.js`.
- **Requisição:** `await fetch(...)`, com limite de 10 segundos por `AbortController`.
- **HTTP:** `if (!resposta.ok) throw new Error(...)` trata respostas HTTP de falha.
- **JSON:** `await resposta.json()` converte o corpo recebido em objeto JavaScript.
- **CEP inexistente:** `dados.erro` é verificado porque o ViaCEP pode responder HTTP 200 com `{ "erro": true }`.
- **DOM:** `textContent` preenche os quatro campos de endereço; `hidden` mostra ou oculta o resultado.
- **Sem recarregar:** `evento.preventDefault()` interrompe o envio normal do formulário.
- **Falhas:** `catch` apresenta orientação amigável; `finally` libera o botão após a consulta.
- **Acessibilidade:** rótulo associado ao CEP, mensagens anunciadas com `role="status"`, `aria-invalid` e `aria-busy`.
- **Resposta antiga:** ao editar o CEP, a consulta anterior é cancelada e o resultado é limpo.

## Testes executados em 18/10/2026

Testes no Chromium com Playwright, servindo os arquivos locais por HTTP.
A primeira consulta usou a API real; respostas controladas no navegador foram usadas nos demais testes para reproduzir falhas de forma confiável.

| Cenário | Entrada / condição | Resultado observado |
| --- | --- | --- |
| Consulta real válida | `01001-000` com ViaCEP real | Endereço encontrado; cidade São Paulo/SP. |
| JSON válido (controlado) | `01001000` com rua Praça da Sé, bairro Sé, cidade São Paulo e UF SP | Os quatro elementos receberam os valores; URL não mudou. |
| Formato inválido | `123` | Mensagem “Digite um CEP com 8 números”; nenhuma requisição enviada; resultado oculto. |
| CEP inexistente (controlado) | `00000000` com JSON `{ "erro": true }` | Mensagem “CEP não encontrado. Confira os números e tente novamente.” |
| Falha de conexão (simulada) | Requisição abortada pelo teste | Mensagem amigável de conexão; botão liberado para tentar novamente. |
| Falha HTTP (simulada) | HTTP 503 | Erro tratado pela verificação de `resposta.ok`. |
| JSON inválido (simulado) | Corpo não JSON | Erro de conversão tratado no `catch`, sem quebrar a página. |
| CEP geral (controlado) | JSON com cidade/UF sem rua/bairro | Cidade e UF exibidas; texto explica os campos não informados. |
| Responsividade | Desktop 1440 px e celular 375 px | Controles legíveis, botão empilhado no celular e sem rolagem horizontal. |

### Como repetir na apresentação

1. Abra a seção de consulta pelo link abaixo.
2. Digite `01001-000` e clique em **Buscar endereço**. Aguarde a API real.
3. Troque por `123`: deve aparecer o aviso de formato inválido.
4. Consulte `00000000`: o ViaCEP deve indicar que o CEP não existe.
5. Para testar a conexão, abra as ferramentas de desenvolvedor, ative **Offline** na aba Network/Rede e consulte um CEP de 8 números. Depois restaure a conexão.

## Links de entrega

- Repositório: https://github.com/miguelfmaggi15-lang/estante-do-bairro
- Funcionalidade: https://miguelfmaggi15-lang.github.io/estante-do-bairro/contato.html#consulta-cep
- Site: https://miguelfmaggi15-lang.github.io/estante-do-bairro/

## Resumo para explicar

“Uso o fetch para consultar o ViaCEP e await para aguardar a resposta e a conversão para JSON. Verifico resposta.ok e dados.erro. Se houver falha de rede, HTTP ou JSON, o catch mostra uma mensagem. Quando dá certo, textContent atualiza os campos na página sem recarregar. Finalmente, o finally restaura o botão.”
