CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    horario TIME NOT NULL,
    local VARCHAR(100) NOT NULL
);

CREATE TABLE ingressos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    evento_id INTEGER NOT NULL,
    data_compra TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

-- Exemplo de inserção de dados
INSERT INTO usuarios (nome_completo, email, senha) VALUES
('João Silva', 'joao@email.com', 'senha123');

INSERT INTO eventos (nome, data, horario, local) VALUES
('Filme X', '2025-09-15', '20:00', 'Cine Center');

INSERT INTO ingressos (usuario_id, evento_id) VALUES
(1, 1);