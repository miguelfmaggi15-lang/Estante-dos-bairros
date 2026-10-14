<?php
require __DIR__ . '/conexao.php';

function limpar($v) { return trim((string)($v ?? '')); }

$mensagem_ok = '';
$mensagem_erro = '';
$editando = null;

// ---- EXCLUIR ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['excluir_id'])) {
    $id = (int)$_POST['excluir_id'];
    $stmt = $pdo->prepare("DELETE FROM reservas WHERE id = ?");
    $stmt->execute([$id]);
    header("Location: reservas.php?ok=excluido");
    exit;
}

// ---- CRIAR ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'criar') {
    $nome = limpar($_POST['nome'] ?? '');
    $contato = limpar($_POST['contato'] ?? '');
    $titulo = limpar($_POST['titulo_livro'] ?? '');
    $retirada = limpar($_POST['data_retirada'] ?? '');
    $obs = limpar($_POST['observacoes'] ?? '');

    if ($nome === '' || $contato === '' || $titulo === '') {
        $mensagem_erro = 'Preencha nome, contato e título do livro. O resto a gente combina no balcão.';
    } elseif ($retirada !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $retirada)) {
        $mensagem_erro = 'Data de retirada inválida.';
    } else {
        $stmt = $pdo->prepare("INSERT INTO reservas (nome_cliente, contato, titulo_livro, data_retirada, observacoes, estado) VALUES (?, ?, ?, NULLIF(?, ''), ?, 'aguardando')");
        // data_retirada pode ser vazia
        $stmt->execute([$nome, $contato, $titulo, $retirada === '' ? null : $retirada, $obs]);
        header("Location: reservas.php?ok=cadastrado");
        exit;
    }
}

// ---- ATUALIZAR ----
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'atualizar') {
    $id = (int)($_POST['id'] ?? 0);
    $nome = limpar($_POST['nome'] ?? '');
    $contato = limpar($_POST['contato'] ?? '');
    $titulo = limpar($_POST['titulo_livro'] ?? '');
    $retirada = limpar($_POST['data_retirada'] ?? '');
    $obs = limpar($_POST['observacoes'] ?? '');
    $estado = in_array($_POST['estado'] ?? '', ['aguardando','pronta','retirado'], true) ? $_POST['estado'] : 'aguardando';

    if ($id <= 0 || $nome === '' || $contato === '' || $titulo === '') {
        $mensagem_erro = 'Confere os campos: nome, contato e título são obrigatórios.';
    } else {
        $stmt = $pdo->prepare("UPDATE reservas SET nome_cliente=?, contato=?, titulo_livro=?, data_retirada=NULLIF(?, ''), observacoes=?, estado=? WHERE id=?");
        $stmt->execute([$nome, $contato, $titulo, $retirada === '' ? null : $retirada, $obs, $estado, $id]);
        header("Location: reservas.php?ok=atualizado");
        exit;
    }
}

// ---- MODO EDIÇÃO ----
if (isset($_GET['editar'])) {
    $stmt = $pdo->prepare("SELECT * FROM reservas WHERE id = ?");
    $stmt->execute([(int)$_GET['editar']]);
    $editando = $stmt->fetch();
    if (!$editando) {
        $mensagem_erro = 'Reserva não encontrada. Ela pode ter sido retirada da lista.';
    }
}

// ---- MENSAGENS VIA GET ----
if (isset($_GET['ok'])) {
    if ($_GET['ok'] === 'cadastrado') $mensagem_ok = 'Anotado no caderno! Guardamos o livro com seu nome por 3 dias.';
    if ($_GET['ok'] === 'atualizado') $mensagem_ok = 'Ficha atualizada. O balcão já está sabendo.';
    if ($_GET['ok'] === 'excluido') $mensagem_ok = 'Reserva retirada do caderno. O livro voltou pra estante.';
}

// ---- LISTAGEM COM BUSCA ----
$q = limpar($_GET['q'] ?? '');
$filtro_estado = limpar($_GET['estado'] ?? '');
$sql = "SELECT * FROM reservas WHERE 1=1";
$params = [];
if ($q !== '') { $sql .= " AND (nome_cliente LIKE ? OR titulo_livro LIKE ?)"; $params[] = "%$q%"; $params[] = "%$q%"; }
if (in_array($filtro_estado, ['aguardando','pronta','retirado'], true)) { $sql .= " AND estado = ?"; $params[] = $filtro_estado; }
$sql .= " ORDER BY id DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$reservas = $stmt->fetchAll();

$titulo_prefill = limpar($_GET['titulo'] ?? '');
if ($editando) $titulo_prefill = '';

function estado_legivel($e) {
    return $e === 'pronta' ? 'Pronta p/ retirada' : ($e === 'retirado' ? 'Retirado' : 'Aguardando');
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Livro de reservas — Sebo do Bairro</title>
  <link rel="stylesheet" href="../css/estilo.css">
  <link rel="icon" href="../img/logo.svg" type="image/svg+xml">
</head>
<body>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <div class="topo-faixa"><div class="envelope"><span>O caderno oficial do balcão — dados no MySQL</span><span><a href="../index.html" style="color:#e9dfc8">Voltar à loja</a></span></div></div>
  <header class="topo">
    <div class="barra-topo">
      <a class="marca" href="../index.html"><img src="../img/logo.svg" alt="" aria-hidden="true"><span class="marca-nome">Sebo do Bairro<small>livro de reservas</small></span></a>
      <button class="botao-menu" id="btn-menu" aria-expanded="false" aria-controls="menu">Menu</button>
      <nav class="menu" id="menu" aria-label="Navegação principal">
        <a href="../index.html">Início</a>
        <a href="../catalogo.html">Catálogo</a>
        <a href="../sobre.html">Nossa história</a>
        <a href="../contato.html">Contato</a>
        <a href="reservas.php" aria-current="page" class="btn btn-solido btn-pequeno">Reservas</a>
      </nav>
    </div>
  </header>

  <main id="conteudo">
    <section class="bloco">
      <div class="envelope">
        <span class="ficha">CRUD completo · PHP + PDO + MySQL</span>
        <h1 style="font-family:var(--fonte-titulo);font-size:clamp(30px,5vw,46px);margin:10px 0 6px">Caderno de reservas do balcão</h1>
        <p style="margin:0 0 16px;color:var(--tinta-suave);max-width:42em">Anota aqui que a gente tira da estante e etiqueta com seu nome. Dá pra cadastrar, procurar, corrigir e tirar da lista — tudo gravado no banco <code>sebo_do_bairro</code>.</p>

        <?php if ($mensagem_ok): ?>
          <p class="alerta alerta-ok" role="status"><?= htmlspecialchars($mensagem_ok) ?></p>
        <?php endif; ?>
        <?php if ($mensagem_erro): ?>
          <p class="alerta alerta-erro" role="alert"><?= htmlspecialchars($mensagem_erro) ?></p>
        <?php endif; ?>

        <div class="painel" style="margin-bottom:20px">
          <div class="painel-cab">
            <h2><?= $editando ? 'Corrigir ficha nº ' . (int)$editando['id'] : 'Anotar nova reserva' ?></h2>
            <?php if ($editando): ?><a href="reservas.php" class="btn btn-mostarda btn-pequeno">Cancelar edição</a><?php endif; ?>
          </div>
          <form class="form-grade" method="post" action="reservas.php<?= $editando ? '?editar='.(int)$editando['id'] : '' ?>">
            <input type="hidden" name="acao" value="<?= $editando ? 'atualizar' : 'criar' ?>">
            <?php if ($editando): ?><input type="hidden" name="id" value="<?= (int)$editando['id'] ?>"><?php endif; ?>
            <div class="campo">
              <label for="nome">Seu nome</label>
              <input type="text" id="nome" name="nome" required maxlength="80" value="<?= htmlspecialchars($editando['nome_cliente'] ?? '') ?>" placeholder="Ex.: Mariana Souza">
            </div>
            <div class="campo">
              <label for="contato">Contato (tel. ou e-mail)</label>
              <input type="text" id="contato" name="contato" required maxlength="100" value="<?= htmlspecialchars($editando['contato'] ?? '') ?>" placeholder="(11) 98765-4321">
            </div>
            <div class="campo">
              <label for="titulo_livro">Título do livro</label>
              <input type="text" id="titulo_livro" name="titulo_livro" required maxlength="150" value="<?= htmlspecialchars($editando['titulo_livro'] ?? $titulo_prefill) ?>" placeholder="Ex.: A hora da estrela">
            </div>
            <div class="campo">
              <label for="data_retirada">Quando pretende retirar?</label>
              <input type="date" id="data_retirada" name="data_retirada" value="<?= htmlspecialchars($editando['data_retirada'] ?? '') ?>">
              <p class="dica">Seguramos por 3 dias a partir de hoje.</p>
            </div>
            <?php if ($editando): ?>
            <div class="campo">
              <label for="estado">Situação</label>
              <select id="estado" name="estado">
                <?php foreach (['aguardando'=>'Aguardando','pronta'=>'Pronta p/ retirada','retirado'=>'Retirado'] as $v=>$l): ?>
                  <option value="<?= $v ?>" <?= ($editando['estado']===$v)?'selected':'' ?>><?= $l ?></option>
                <?php endforeach; ?>
              </select>
            </div>
            <?php endif; ?>
            <div class="campo inteira">
              <label for="observacoes">Recado pro balcão (opcional)</label>
              <textarea id="observacoes" name="observacoes" maxlength="500" placeholder="Ex.: prefiro capa dura; embrulhar pra presente…"><?= htmlspecialchars($editando['observacoes'] ?? '') ?></textarea>
            </div>
            <div class="inteira">
              <button class="btn btn-solido" type="submit"><?= $editando ? 'Salvar correção' : 'Anotar no caderno' ?></button>
            </div>
          </form>
        </div>

        <div class="painel">
          <div class="painel-cab">
            <h2>Fichas anotadas (<?= count($reservas) ?>)</h2>
            <form method="get" action="reservas.php" style="display:flex;gap:8px;flex-wrap:wrap" role="search" aria-label="Buscar reservas">
              <input type="search" name="q" value="<?= htmlspecialchars($q) ?>" placeholder="Buscar nome ou livro…" aria-label="Buscar por nome ou livro" style="font-family:var(--fonte-ui);padding:8px 10px;border-radius:6px;border:2px solid #0f1a15">
              <select name="estado" aria-label="Filtrar por situação" style="font-family:var(--fonte-ui);padding:8px;border-radius:6px">
                <option value="">Todas</option>
                <option value="aguardando" <?= $filtro_estado==='aguardando'?'selected':'' ?>>Aguardando</option>
                <option value="pronta" <?= $filtro_estado==='pronta'?'selected':'' ?>>Prontas</option>
                <option value="retirado" <?= $filtro_estado==='retirado'?'selected':'' ?>>Retirados</option>
              </select>
              <button class="btn btn-mostarda btn-pequeno" type="submit">Filtrar</button>
            </form>
          </div>
          <div class="tabela-envolve">
            <table class="lista">
              <thead><tr><th>Nº</th><th>Quem</th><th>Livro</th><th>Retirada</th><th>Situação</th><th>Ações</th></tr></thead>
              <tbody>
              <?php if (!$reservas): ?>
                <tr><td colspan="6">Nenhuma ficha por aqui. Anota a primeira ali em cima — o café já está no fogo.</td></tr>
              <?php else: foreach ($reservas as $r): ?>
                <tr>
                  <td><?= (int)$r['id'] ?></td>
                  <td><strong><?= htmlspecialchars($r['nome_cliente']) ?></strong><br><span style="color:#666"><?= htmlspecialchars($r['contato']) ?></span><?php if ($r['observacoes']): ?><br><span style="font-style:italic">“<?= htmlspecialchars($r['observacoes']) ?>”</span><?php endif; ?></td>
                  <td><?= htmlspecialchars($r['titulo_livro']) ?></td>
                  <td><?= $r['data_retirada'] ? date('d/m/Y', strtotime($r['data_retirada'])) : '—' ?></td>
                  <td><span class="badge badge-<?= htmlspecialchars($r['estado']) ?>"><?= estado_legivel($r['estado']) ?></span></td>
                  <td style="white-space:nowrap">
                    <a class="btn btn-pequeno" href="reservas.php?editar=<?= (int)$r['id'] ?>">Corrigir</a>
                    <form method="post" action="reservas.php" style="display:inline" onsubmit="return confirm('Tirar a reserva nº <?= (int)$r['id'] ?> do caderno? O livro volta pra estante.')">
                      <input type="hidden" name="excluir_id" value="<?= (int)$r['id'] ?>">
                      <button class="btn btn-perigo btn-pequeno" type="submit">Retirar</button>
                    </form>
                  </td>
                </tr>
              <?php endforeach; endif; ?>
              </tbody>
            </table>
          </div>
        </div>
        <p style="font-family:var(--fonte-ui);font-size:14px;color:var(--tinta-suave)">Para o professor: banco <code>sebo_do_bairro</code>, tabela <code>reservas</code>, conexão em <code>php/conexao.php</code> via PDO com prepared statements. Importe <code>sql/banco.sql</code> no phpMyAdmin.</p>
      </div>
    </section>
  </main>

  <footer class="rodape">
    <div class="envelope rodape-grade">
      <div><h3>Sebo do Bairro</h3><p style="margin:0">Livros usados, troca justa e conversa boa desde 2009.</p></div>
      <div><h3>Fuça</h3><ul><li><a href="../index.html">Início</a></li><li><a href="../catalogo.html">Catálogo</a></li><li><a href="../sobre.html">Nossa história</a></li><li><a href="../contato.html">Contato</a></li></ul></div>
      <div><h3>Balcão</h3><ul><li>Rua das Palmeiras, 214</li><li>Ter a sáb · 9h às 19h</li></ul></div>
    </div>
    <div class="envelope rodape-base"><span>© <span id="ano">2026</span> Sebo do Bairro</span><span>Projeto escolar AV2 · DWS</span></div>
  </footer>
  <div id="toast" role="status" aria-live="polite"></div>
  <button id="topo-btn" aria-label="Voltar ao topo">↑</button>
  <script src="../js/main.js" defer></script>
</body>
</html>
