/* Semana 2 — consulta real ao ViaCEP: Fetch, JSON e DOM.
   Script separado para manter a integração fácil de estudar. */
(function () {
  'use strict';

  const formulario = document.getElementById('form-cep');
  if (!formulario) return;

  const campo = document.getElementById('cep');
  const botao = document.getElementById('buscar-cep');
  const mensagem = document.getElementById('cep-status');
  const resultado = document.getElementById('cep-resultado');
  let requisicaoAtual = 0;
  let controlador = null;

  function limparEndereco() {
    resultado.hidden = true;
    ['rua', 'bairro', 'cidade', 'uf'].forEach(function (parte) {
      document.getElementById('cep-' + parte).textContent = '';
    });
  }

  function mostrarMensagem(texto, estado) {
    mensagem.textContent = texto;
    mensagem.dataset.estado = estado;
  }

  async function buscarCEP() {
    const cep = campo.value.trim().replace('-', '');
    const numeroRequisicao = ++requisicaoAtual;
    if (controlador) controlador.abort();
    limparEndereco();
    campo.setAttribute('aria-invalid', 'false');

    if (!/^\d{8}$/.test(cep)) {
      campo.setAttribute('aria-invalid', 'true');
      mostrarMensagem('Digite um CEP com 8 números. Exemplo: 01001-000.', 'erro');
      campo.focus();
      return;
    }

    controlador = new AbortController();
    const consulta = controlador;
    const sinal = consulta.signal;
    // O timeout evita deixar o botão carregando se a conexão parar.
    const limite = setTimeout(function () { consulta.abort(); }, 10000);
    botao.disabled = true;
    botao.textContent = 'Buscando…';
    formulario.setAttribute('aria-busy', 'true');
    mostrarMensagem('Consultando o endereço no ViaCEP…', 'carregando');

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: sinal });
      if (!resposta.ok) throw new Error('Falha na consulta ao ViaCEP.');

      const dados = await resposta.json();
      if (numeroRequisicao !== requisicaoAtual) return;
      // ViaCEP retorna HTTP 200 mesmo para um CEP inexistente.
      if (dados.erro) {
        campo.setAttribute('aria-invalid', 'true');
        mostrarMensagem('CEP não encontrado. Confira os números e tente novamente.', 'erro');
        return;
      }
      if (!dados.localidade || !dados.uf) throw new Error('Resposta incompleta.');
      if (numeroRequisicao !== requisicaoAtual) return;

      // textContent exibe os dados como texto, sem interpretar HTML da API.
      document.getElementById('cep-rua').textContent = dados.logradouro || 'Não informada para este CEP';
      document.getElementById('cep-bairro').textContent = dados.bairro || 'Não informado para este CEP';
      document.getElementById('cep-cidade').textContent = dados.localidade;
      document.getElementById('cep-uf').textContent = dados.uf;
      resultado.hidden = false;
      mostrarMensagem('Endereço encontrado. Confira os dados abaixo.', 'sucesso');
    } catch (erro) {
      if (numeroRequisicao !== requisicaoAtual) return;
      limparEndereco();
      mostrarMensagem('Não foi possível buscar o CEP agora. Verifique sua conexão e tente novamente.', 'erro');
    } finally {
      clearTimeout(limite);
      if (numeroRequisicao === requisicaoAtual) {
        botao.disabled = false;
        botao.textContent = 'Buscar endereço';
        formulario.setAttribute('aria-busy', 'false');
      }
    }
  }

  formulario.addEventListener('submit', function (evento) {
    evento.preventDefault(); // Atualiza a página pelo DOM, sem navegação.
    buscarCEP();
  });

  campo.addEventListener('input', function () {
    // Uma resposta antiga não deve aparecer para um CEP recém-digitado.
    requisicaoAtual++;
    if (controlador) controlador.abort();
    botao.disabled = false;
    botao.textContent = 'Buscar endereço';
    formulario.setAttribute('aria-busy', 'false');
    campo.setAttribute('aria-invalid', 'false');
    limparEndereco();
    mostrarMensagem('', 'inicial');
  });
})();
