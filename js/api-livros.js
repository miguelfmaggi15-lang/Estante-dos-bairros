/* Sebo do Bairro — integração com a API Flask (GET e POST em /livros). */
(function () {
  'use strict';

  var API_URL = 'http://localhost:5000/livros';
  var form = document.getElementById('form-livro');

  if (!form) {
    return;
  }

  var vitrine = document.getElementById('acervo-vitrine');
  var status = document.getElementById('api-status');
  var conta = document.getElementById('api-conta');
  var botao = document.getElementById('api-enviar');

  function mostrarStatus(mensagem, estado) {
    if (!status) {
      return;
    }
    status.textContent = mensagem;
    if (estado) {
      status.setAttribute('data-estado', estado);
    } else {
      status.removeAttribute('data-estado');
    }
  }

  function criarCard(livro) {
    var artigo = document.createElement('article');
    artigo.className = 'livro';

    var topo = document.createElement('div');
    topo.className = 'livro-topo';

    var capa = document.createElement('div');
    capa.className = 'capa';
    capa.style.background = '#2f4b3e';
    capa.setAttribute('aria-hidden', 'true');
    capa.textContent = (livro.titulo || '?').charAt(0).toUpperCase();

    var info = document.createElement('div');
    var titulo = document.createElement('h3');
    titulo.textContent = livro.titulo;
    var autor = document.createElement('p');
    autor.className = 'autor';
    autor.textContent = livro.autor;
    var ano = document.createElement('span');
    ano.className = 'etiqueta-genero';
    ano.textContent = 'Publicado em ' + livro.ano_publicacao;
    var situacao = document.createElement('span');
    situacao.className = 'badge ' + (livro.disponivel ? 'badge-pronta' : 'badge-aguardando');
    situacao.textContent = livro.disponivel ? 'disponível' : 'emprestado';

    info.appendChild(titulo);
    info.appendChild(autor);
    info.appendChild(ano);
    info.appendChild(situacao);
    topo.appendChild(capa);
    topo.appendChild(info);
    artigo.appendChild(topo);
    return artigo;
  }

  function renderizar(livros) {
    vitrine.textContent = '';
    if (livros.length === 0) {
      var vazio = document.createElement('p');
      vazio.className = 'api-vazio';
      vazio.textContent = 'Nenhum livro no acervo da API ainda. Cadastre o primeiro no formulário acima.';
      vitrine.appendChild(vazio);
    } else {
      livros.forEach(function (livro) {
        vitrine.appendChild(criarCard(livro));
      });
    }
    conta.textContent = livros.length === 1
      ? '1 livro no acervo da API'
      : livros.length + ' livros no acervo da API';
  }

  async function listarLivros() {
    try {
      var resposta = await fetch(API_URL);
      if (!resposta.ok) {
        throw new Error('A API respondeu ' + resposta.status);
      }
      var livros = await resposta.json();
      renderizar(livros);
    } catch (erro) {
      vitrine.textContent = '';
      conta.textContent = '';
      mostrarStatus(
        'Não foi possível carregar o acervo. Confira se a API Flask está rodando em ' + API_URL + '.',
        'erro'
      );
    }
  }

  async function cadastrarLivro(dados) {
    var resposta = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    });
    var corpo = await resposta.json().catch(function () {
      return {};
    });
    if (!resposta.ok) {
      throw new Error(corpo.erro || 'A API respondeu ' + resposta.status);
    }
    return corpo;
  }

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    var campoAno = document.getElementById('api-ano');
    var dados = {
      titulo: document.getElementById('api-titulo').value.trim(),
      autor: document.getElementById('api-autor').value.trim(),
      ano_publicacao: Number(campoAno.value),
      disponivel: document.getElementById('api-disponivel').value === 'true'
    };

    var anoValido = Number.isInteger(dados.ano_publicacao) &&
      dados.ano_publicacao > 0 &&
      dados.ano_publicacao <= 2100;

    if (!dados.titulo || !dados.autor || !anoValido) {
      mostrarStatus('Preencha título, autor e um ano válido antes de cadastrar.', 'erro');
      return;
    }

    botao.disabled = true;
    botao.textContent = 'Cadastrando…';

    try {
      var criado = await cadastrarLivro(dados);
      form.reset();
      await listarLivros();
      mostrarStatus('“' + criado.titulo + '” entrou no acervo.', 'ok');
    } catch (erro) {
      mostrarStatus('Não foi possível cadastrar: ' + erro.message, 'erro');
    } finally {
      botao.disabled = false;
      botao.textContent = 'Cadastrar no acervo';
    }
  });

  listarLivros();
})();
