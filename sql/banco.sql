-- Sebo do Bairro — banco MySQL
-- Como usar no XAMPP:
-- 1. Ligue Apache + MySQL no painel do XAMPP
-- 2. Abra http://localhost/phpmyadmin
-- 3. Aba "Importar" > escolha este arquivo > Executar
-- 4. Abra http://localhost/sebo-do-bairro/php/reservas.php

CREATE DATABASE IF NOT EXISTS sebo_do_bairro
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sebo_do_bairro;

CREATE TABLE IF NOT EXISTS reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome_cliente VARCHAR(80) NOT NULL,
  contato VARCHAR(100) NOT NULL,
  titulo_livro VARCHAR(150) NOT NULL,
  data_retirada DATE NULL,
  observacoes VARCHAR(500) NULL,
  estado ENUM('aguardando','pronta','retirado') NOT NULL DEFAULT 'aguardando',
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Exemplos para a apresentação (pode apagar à vontade)
INSERT INTO reservas (nome_cliente, contato, titulo_livro, data_retirada, observacoes, estado) VALUES
('Mariana Souza', '(11) 98711-2233', 'A hora da estrela', CURDATE() + INTERVAL 2 DAY, 'Embrulhar pra presente, por favor.', 'aguardando'),
('Paulo Henrique', 'paulo.h@mail.com', 'O hobbit', CURDATE() + INTERVAL 1 DAY, 'Prefere capa dura se aparecer outra.', 'pronta'),
('Dona Lúcia', '(11) 97654-8899', 'O pequeno príncipe', CURDATE() - INTERVAL 5 DAY, '', 'retirado');
