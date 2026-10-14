# Sebo do Bairro — livros usados & achados

Projeto AV2 · DWS – Desenvolvimento de Websites · 3º bimestre 2026

## O que é
Site de um sebo de bairro fictício na Rua das Palmeiras, 214. O problema que resolve: livros parados na estante de casa e gente que quer ler barato. O público: vizinhos, estudantes e colecionadores que garimpam usados.

O site apresenta a loja (home), a estante com filtros (catálogo), a história e as regras de troca (sobre), o contato e o endereço (contato) e o caderno de reservas com banco de dados (PHP + MySQL).

## Páginas
- `index.html` — home: herói, busca, destaques, como funciona, bilhetes, visita
- `catalogo.html` — 12 livros com busca, filtro por prateleira/preço, favoritos e modal de ficha
- `sobre.html` — história, linha do tempo, equipe, perguntas do balcão
- `contato.html` — formulário com validação, endereço e croqui
- `php/reservas.php` — CRUD completo: cadastrar, listar, buscar, editar e excluir reservas

## Pastas
```
sebo-do-bairro/
  index.html  catalogo.html  sobre.html  contato.html
  css/estilo.css
  js/main.js
  img/logo.svg  img/balcao.svg
  php/conexao.php  php/reservas.php
  sql/banco.sql
  docs/sitemap.md  docs/wireframe.txt
```

## Como rodar (XAMPP)
1. Instale e abra o XAMPP, ligue **Apache** e **MySQL**.
2. Copie a pasta `sebo-do-bairro` para `C:\xampp\htdocs\`.
3. No navegador, abra `http://localhost/phpmyadmin`, aba **Importar**, escolha `sql/banco.sql` e execute. Isso cria o banco `sebo_do_bairro` e a tabela `reservas` com 3 exemplos.
4. Abra `http://localhost/sebo-do-bairro/` para o site e `http://localhost/sebo-do-bairro/php/reservas.php` para o caderno de reservas.
5. Sem banco, as 4 páginas HTML abrem normalmente; só a página de reservas mostra o aviso de conexão.

## Banco de dados
- Banco: `sebo_do_bairro`, tabela `reservas(id, nome_cliente, contato, titulo_livro, data_retirada, observacoes, estado, criado_em)`.
- Conexão via PDO em `php/conexao.php` com prepared statements (protege de SQL injection).
- Operações em `php/reservas.php`: INSERT (cadastrar), SELECT com busca (listar), UPDATE (editar), DELETE (excluir).

## JavaScript (js/main.js, externo)
Menu mobile, filtro do catálogo em tempo real, favoritos em localStorage, modal de ficha, validação com erro junto do campo, máscara de telefone, toast e voltar ao topo. Sem biblioteca, sem framework.

## Decisões de design (pra contar na apresentação)
Papel de fundo escuro-quente (#e7dcc3) com tinta verde-preta, mostarda e carimbo vermelho — cores de etiqueta, fita e capa velha. Títulos em EB Garamond, texto em Crimson Text (cara de livro), bilhetes à mão em Caveat e carimbos em Special Elite. Nada de cartãozinho igual nem título com palavra colorida: cada livro tem capa de cor diferente, etiqueta torta e selo só quando merece. Uma animação só no herói, e respeita quem prefere menos movimento.
