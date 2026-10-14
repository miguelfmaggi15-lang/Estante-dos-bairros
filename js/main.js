/* Sebo do Bairro — main.js
   Funcionalidades: menu mobile, filtros do catálogo,
   favoritos, modal, FAQ, validação, toast, voltar ao topo.
*/
(function () {
  'use strict';

  // Ano no rodapé
  var ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu mobile
  var btnMenu = document.getElementById('btn-menu');
  var menu = document.getElementById('menu');
  if (btnMenu && menu) {
    btnMenu.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      btnMenu.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') menu.classList.remove('aberto');
    });
  }

  // Toast acessível
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function mostrarToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visivel');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('visivel');
    }, 3200);
  }

  // Voltar ao topo
  var btnTopo = document.getElementById('topo-btn');
  if (btnTopo) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) btnTopo.classList.add('visivel');
      else btnTopo.classList.remove('visivel');
    }, { passive: true });
    btnTopo.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Catálogo: filtro + busca ----
  var campoBusca = document.getElementById('busca');
  var campoGenero = document.getElementById('filtro-genero');
  var campoPreco = document.getElementById('filtro-preco');
  var campoDisp = document.getElementById('filtro-disponivel');
  var conta = document.getElementById('conta-resultados');
  var faixaBusca = document.getElementById('busca-faixa');

  function normaliza(s) {
    return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  function aplicarFiltro() {
    var cards = document.querySelectorAll('[data-livro]');
    if (!cards.length) return;
    var termo = campoBusca ? normaliza(campoBusca.value.trim()) : '';
    var genero = campoGenero ? campoGenero.value : '';
    var precoMax = campoPreco && campoPreco.value ? parseFloat(campoPreco.value) : null;
    var soDisp = campoDisp ? campoDisp.checked : false;
    var visiveis = 0;

    cards.forEach(function (card) {
      var titulo = normaliza(card.getAttribute('data-titulo'));
      var autor = normaliza(card.getAttribute('data-autor'));
      var g = card.getAttribute('data-genero');
      var preco = parseFloat(card.getAttribute('data-preco'));
      var disponivel = card.getAttribute('data-disponivel') === '1';

      var ok = true;
      if (termo && titulo.indexOf(termo) === -1 && autor.indexOf(termo) === -1) ok = false;
      if (genero && g !== genero) ok = false;
      if (precoMax !== null && !isNaN(precoMax) && preco > precoMax) ok = false;
      if (soDisp && !disponivel) ok = false;

      card.style.display = ok ? '' : 'none';
      if (ok) visiveis++;
    });

    if (conta) {
      conta.textContent = visiveis === 1
        ? '1 livro na estante agora'
        : visiveis + ' livros na estante agora';
    }
  }

  ['input', 'change'].forEach(function (evt) {
    if (campoBusca) campoBusca.addEventListener(evt, aplicarFiltro);
    if (campoGenero) campoGenero.addEventListener(evt, aplicarFiltro);
    if (campoPreco) campoPreco.addEventListener(evt, aplicarFiltro);
    if (campoDisp) campoDisp.addEventListener(evt, aplicarFiltro);
  });
  if (faixaBusca) {
    faixaBusca.addEventListener('input', function () {
      if (campoBusca) {
        campoBusca.value = faixaBusca.value;
        aplicarFiltro();
      }
      // se estiver na home, leva para o catálogo mantendo o termo
      if (!document.querySelector('[data-livro]') && faixaBusca.value.length > 1) {
        // não navega sozinho; só sugere
      }
    });
  }
  aplicarFiltro();

  // Botão limpar filtros
  var btnLimpar = document.getElementById('limpar-filtros');
  if (btnLimpar) {
    btnLimpar.addEventListener('click', function () {
      if (campoBusca) campoBusca.value = '';
      if (campoGenero) campoGenero.value = '';
      if (campoPreco) campoPreco.value = '';
      if (campoDisp) campoDisp.checked = false;
      aplicarFiltro();
      mostrarToast('Filtros limpos. Estante completa de novo.');
    });
  }

  // ---- Favoritos (coração) com localStorage ----
  var FAV_KEY = 'sebo_favoritos';
  function lerFavs() {
    try { return JSON.parse(localStorage.getItem(FAV_KEY) || '[]'); }
    catch (e) { return []; }
  }
  function salvarFavs(lista) {
    try { localStorage.setItem(FAV_KEY, JSON.stringify(lista)); } catch (e) {}
  }
  var favs = lerFavs();
  document.querySelectorAll('.fav').forEach(function (btn) {
    var id = btn.getAttribute('data-fav');
    if (favs.indexOf(id) !== -1) btn.setAttribute('aria-pressed', 'true');
    btn.addEventListener('click', function () {
      var i = favs.indexOf(id);
      if (i === -1) {
        favs.push(id);
        btn.setAttribute('aria-pressed', 'true');
        mostrarToast('Guardado nos seus favoritos.');
      } else {
        favs.splice(i, 1);
        btn.setAttribute('aria-pressed', 'false');
        mostrarToast('Tirado dos favoritos.');
      }
      salvarFavs(favs);
    });
  });

  // ---- Modal de detalhes ----
  var modalFundo = document.getElementById('modal-fundo');
  var modalTitulo = document.getElementById('modal-titulo');
  var modalCorpo = document.getElementById('modal-corpo');
  var ultimoFoco = null;

  function abrirModal(titulo, html) {
    if (!modalFundo) return;
    ultimoFoco = document.activeElement;
    modalTitulo.textContent = titulo;
    modalCorpo.innerHTML = html;
    modalFundo.setAttribute('open', '');
    var fechar = modalFundo.querySelector('.modal-fechar');
    if (fechar) fechar.focus();
    document.body.style.overflow = 'hidden';
  }
  function fecharModal() {
    if (!modalFundo) return;
    modalFundo.removeAttribute('open');
    document.body.style.overflow = '';
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  }
  document.querySelectorAll('[data-detalhe]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var card = btn.closest('[data-livro]');
      if (!card) return;
      var titulo = card.getAttribute('data-titulo');
      var autor = card.getAttribute('data-autor');
      var preco = card.getAttribute('data-preco');
      var estado = card.getAttribute('data-estado') || 'Usado em bom estado';
      var obs = card.getAttribute('data-obs') || 'Folheado e conferido no balcão. Sem rasgos, sem grifo.';
      abrirModal(titulo,
        '<p style="margin:0 0 8px"><em>' + autor + '</em></p>' +
        '<p style="margin:0 0 8px"><strong>R$ ' + Number(preco).toFixed(2).replace('.', ',') + '</strong> · ' + estado + '</p>' +
        '<p style="margin:0 0 14px">' + obs + '</p>' +
        '<p style="margin:0"><a class="btn btn-solido btn-pequeno" href="php/reservas.php?titulo=' + encodeURIComponent(titulo) + '">Reservar este livro</a></p>');
    });
  });
  if (modalFundo) {
    modalFundo.addEventListener('click', function (e) {
      if (e.target === modalFundo || e.target.classList.contains('modal-fechar')) fecharModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalFundo.hasAttribute('open')) fecharModal();
    });
  }

  // ---- Validação em tempo real (contato) ----
  function validaCampo(input) {
    var erro = document.getElementById(input.id + '-erro');
    var msg = '';
    var v = input.value.trim();
    if (input.required && !v) msg = 'Preencha este campo.';
    else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Esse e-mail parece incompleto.';
    else if (input.id === 'telefone' && v && v.replace(/\D/g, '').length < 10) msg = 'Telefone com DDD, com 10 ou 11 números.';
    else if (input.id === 'mensagem' && v && v.length < 10) msg = 'Conta um pouquinho mais pra gente te ajudar.';
    if (erro) erro.textContent = msg;
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    return !msg;
  }
  document.querySelectorAll('form[data-validar] input, form[data-validar] textarea').forEach(function (input) {
    input.addEventListener('blur', function () { validaCampo(input); });
    input.addEventListener('input', function () {
      var erro = document.getElementById(input.id + '-erro');
      if (erro && erro.textContent) validaCampo(input);
    });
  });
  document.querySelectorAll('form[data-validar]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var campos = form.querySelectorAll('input, textarea');
      var ok = true;
      campos.forEach(function (c) { if (!validaCampo(c)) ok = false; });
      if (!ok) {
        e.preventDefault();
        var primeiroErro = form.querySelector('[aria-invalid="true"]');
        if (primeiroErro) primeiroErro.focus();
        mostrarToast('Confere os campos marcados.');
      } else {
        var btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Enviando…';
          setTimeout(function () { btn.disabled = false; btn.textContent = btn.getAttribute('data-texto') || 'Enviar'; }, 4000);
        }
      }
    });
    var btn = form.querySelector('[type="submit"]');
    if (btn && !btn.getAttribute('data-texto')) btn.setAttribute('data-texto', btn.textContent);
  });

  // Máscara simples de telefone
  var tel = document.getElementById('telefone') || document.getElementById('contato');
  if (tel) {
    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 6) tel.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6);
      else if (d.length > 2) tel.value = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else if (d.length > 0) tel.value = '(' + d;
    });
  }

  // Revelação única do herói (sem enfeite em cada seção)
  var hero = document.querySelector('.hero-grade');
  if (hero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    hero.style.opacity = '0';
    hero.style.transform = 'translateY(10px)';
    requestAnimationFrame(function () {
      hero.style.transition = 'opacity .5s ease, transform .5s ease';
      hero.style.opacity = '1';
      hero.style.transform = 'none';
    });
  }
})();
