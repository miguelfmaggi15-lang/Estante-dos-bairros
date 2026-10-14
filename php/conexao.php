<?php
// Sebo do Bairro — conexão PDO MySQL (XAMPP)
// Ajuste usuário/senha se o seu MySQL for diferente.
$HOST = 'localhost';
$BASE = 'sebo_do_bairro';
$USER = 'root';
$PASS = '';

try {
    $pdo = new PDO(
        "mysql:host=$HOST;dbname=$BASE;charset=utf8mb4",
        $USER,
        $PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    // Em sala, mostra mensagem legível em vez de tela branca.
    // Em produção, registrar em log em vez de exibir.
    http_response_code(500);
    echo "<h1>O caderno de reservas está fora do balcão por um instante</h1>";
    echo "<p>Não foi possível conectar ao MySQL. Confira se o Apache e o MySQL estão ligados no XAMPP e se você importou o arquivo <code>sql/banco.sql</code>.</p>";
    echo "<p><a href='../index.html'>Voltar ao início</a></p>";
    // Descomente para depurar em aula:
    // echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
    exit;
}
