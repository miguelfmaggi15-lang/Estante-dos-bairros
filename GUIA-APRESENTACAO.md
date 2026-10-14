# Guia de apresentação — estude aqui antes de mostrar ao professor

Você escolheu o Sebo do Bairro. O professor pode perguntar qualquer parte do código. Leia os arquivos de verdade e entenda estes 10 pontos:

## 1. O que o projeto faz (30 segundos)
"Site de um sebo fictício com 4 páginas HTML e um caderno de reservas em PHP+MySQL. O visitante garimpa o catálogo com filtro em JavaScript, favorita, abre a ficha e reserva. A reserva grava no banco e aparece na tabela, onde dá pra editar e excluir."

## 2. Estrutura de pastas
`css/` tem um único `estilo.css` externo. `js/` tem um único `main.js` externo. `img/` tem dois SVGs feitos à mão. `php/` tem `conexao.php` (só conecta) e `reservas.php` (todo o CRUD). `sql/banco.sql` cria banco e tabela.

## 3. HTML multi-páginas
Abra `index.html`, `catalogo.html`, `sobre.html`, `contato.html` e mostre que o `<nav>` se repete igual e que `aria-current="page"` marca onde você está. Mostre o skip-link, o `lang="pt-BR"` e os `label for=` ligados nos inputs.

## 4. CSS responsivo (sem framework)
Tudo em `css/estilo.css`, mobile-first. `.vitrine` tem 1 coluna no celular, 2 em 640px e 3 em 1000px. O menu vira botão "Menu" abaixo de 860px. Cores em `:root` com nomes de papel e tinta. Se perguntarem "por que sem Bootstrap?", diga que o edital pede CSS externo autoral e responsivo, e que uma folha própria é mais fácil de explicar.

## 5. JavaScript (o que cada função faz)
Abra `js/main.js`: `aplicarFiltro()` lê `data-titulo/data-autor/data-genero/data-preco` dos cards e esconde os que não batem. Favoritos salvam o `data-fav` no localStorage. O modal copia os `data-*` do card pra ficha. A validação usa `blur` e escreve no `<p id="...-erro">`. A máscara de telefone formata `(11) 98765-4321` no `input`.

## 6. PHP + MySQL (o coração da nota)
`php/conexao.php` cria `$pdo = new PDO("mysql:host=...;dbname=sebo_do_bairro...")` com erro em exceção. `php/reservas.php` faz: INSERT no bloco CRIAR, SELECT com LIKE no bloco LISTAGEM, UPDATE no bloco ATUALIZAR, DELETE no bloco EXCLUIR. Tudo com `prepare` + `execute` (pergunte e responda: "evita SQL injection porque o dado nunca vira código SQL").

## 7. Como demonstrar o CRUD na hora
1. Mostre a tabela com os 3 exemplos do `banco.sql`.
2. Cadastre seu nome + um livro do catálogo, mostre o alerta "Anotado no caderno" e a linha nova.
3. Clique Corrigir, mude a situação pra "Pronta", salve.
4. Filtre por "Prontas" e busque seu nome.
5. Exclua e confirme que voltou pra estante. Fale cada SQL em voz alta.

## 8. Se der erro na hora
Sem banco: as 4 páginas HTML abrem, só reservas mostra o aviso "fora do balcão". Diga: "o HTML/CSS/JS é estático, o PHP precisa do MySQL ligado e do banco importado". Saiba importar: phpMyAdmin > Importar > `sql/banco.sql`.

## 9. Decisões de design (mostra autoria)
"Quis cara de papel e balcão, não de template: fundo papel texturizado, etiquetas rotas tortas, fita no bilhete, carimbo em Special Elite, uma animação só no herói, e nada de cartão igual ou palavra colorida no título. Tipografia de livro: EB Garamond + Crimson Text."

## 10. Frases pra não cair em "foi IA?"
- "Fiz com 12 livros fixos no HTML porque o CRUD é das reservas, não do acervo — o edital pede uma tabela."
- "O `?titulo=` na URL só preenche o campo, quem grava é o POST do formulário."
- "O delete pede `confirm()` e usa POST com `excluir_id`, não link GET, pra não apagar sem querer."
Passe o olho no código antes de apresentar. Se não souber algo, diga como fez e onde está o trecho.
