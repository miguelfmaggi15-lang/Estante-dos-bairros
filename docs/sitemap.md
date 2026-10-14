# Sitemap — Sebo do Bairro

```
              ┌─────────────┐
              │  index.html │  home
              └──────┬──────┘
        ┌────────────┼────────────┬──────────────┐
        ▼            ▼            ▼              ▼
 catalogo.html  sobre.html  contato.html  php/reservas.php
  estante +      história +   endereço +    CRUD MySQL
  filtros JS     FAQ JS       form JS       (criar, listar,
                                            editar, excluir)
        │            │            │              │
        └────────────┴────────────┴──────────────┘
                     ▼
              mesmo topo + rodapé
         css/estilo.css · js/main.js
```

Navegação: o menu do topo aparece igual nas 5 páginas. Todo livro tem botão Reservar que leva a `php/reservas.php?titulo=...` com o título já preenchido. Contato e catálogo também apontam para as reservas.

Wireframe resumido (detalhe em docs/wireframe.txt):

- Home: faixa horário > topo logo+menu > herói texto+estante > busca > 3 destaques > 3 passos > 3 bilhetes > visita+mapa > rodapé
- Catálogo: título > filtros (busca, prateleira, preço, disponíveis) > grade de 12 > modal ficha
- Sobre: texto+foto > linha do tempo 2009–2024 > perguntas dobráveis
- Contato: formulário + painel endereço/mapa
- Reservas: formulário anotar/corrigir + tabela com busca, filtro, corrigir e retirar
