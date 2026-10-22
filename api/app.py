import os
import sqlite3

from flask import Flask, g, jsonify, request
from flask_cors import CORS

CAMINHO_BANCO = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sebo.db")

LIVROS_INICIAIS = [
    ("O pequeno príncipe", "Antoine de Saint-Exupéry", 1943, 1),
    ("Dom Casmurro", "Machado de Assis", 1899, 1),
    ("Vidas secas", "Graciliano Ramos", 1938, 0),
]


def conectar_banco(caminho):
    conexao = sqlite3.connect(caminho)
    conexao.row_factory = sqlite3.Row
    return conexao


def criar_tabela(caminho):
    with conectar_banco(caminho) as conexao:
        conexao.execute(
            """
            CREATE TABLE IF NOT EXISTS livros (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                autor TEXT NOT NULL,
                ano_publicacao INTEGER NOT NULL,
                disponivel INTEGER NOT NULL DEFAULT 1
            )
            """
        )


def semear_banco(caminho):
    with conectar_banco(caminho) as conexao:
        total = conexao.execute("SELECT COUNT(*) FROM livros").fetchone()[0]
        if total == 0:
            conexao.executemany(
                "INSERT INTO livros (titulo, autor, ano_publicacao, disponivel)"
                " VALUES (?, ?, ?, ?)",
                LIVROS_INICIAIS,
            )


def livro_para_json(linha):
    return {
        "id": linha["id"],
        "titulo": linha["titulo"],
        "autor": linha["autor"],
        "ano_publicacao": linha["ano_publicacao"],
        "disponivel": bool(linha["disponivel"]),
    }


def create_app(caminho_banco=None, seed=True):
    app = Flask(__name__)
    CORS(app)
    app.config["DATABASE"] = caminho_banco or CAMINHO_BANCO

    criar_tabela(app.config["DATABASE"])
    if seed:
        semear_banco(app.config["DATABASE"])

    def obter_conexao():
        if "conexao" not in g:
            g.conexao = conectar_banco(app.config["DATABASE"])
        return g.conexao

    @app.teardown_appcontext
    def fechar_conexao(exception=None):
        conexao = g.pop("conexao", None)
        if conexao is not None:
            conexao.close()

    @app.get("/livros")
    def listar_livros():
        linhas = obter_conexao().execute(
            "SELECT id, titulo, autor, ano_publicacao, disponivel"
            " FROM livros ORDER BY id"
        ).fetchall()
        return jsonify([livro_para_json(linha) for linha in linhas])

    @app.post("/livros")
    def cadastrar_livro():
        dados = request.get_json(silent=True) or {}
        titulo = str(dados.get("titulo", "")).strip()
        autor = str(dados.get("autor", "")).strip()
        ano = dados.get("ano_publicacao")
        disponivel = dados.get("disponivel", True)

        if not titulo:
            return jsonify({"erro": "informe o campo titulo"}), 400
        if not autor:
            return jsonify({"erro": "informe o campo autor"}), 400
        if isinstance(ano, bool) or not isinstance(ano, int) or ano <= 0:
            return jsonify(
                {"erro": "o campo ano_publicacao deve ser um numero inteiro positivo"}
            ), 400
        if not isinstance(disponivel, bool):
            return jsonify({"erro": "o campo disponivel deve ser true ou false"}), 400

        conexao = obter_conexao()
        cursor = conexao.execute(
            "INSERT INTO livros (titulo, autor, ano_publicacao, disponivel)"
            " VALUES (?, ?, ?, ?)",
            (titulo, autor, ano, int(disponivel)),
        )
        conexao.commit()
        criado = conexao.execute(
            "SELECT id, titulo, autor, ano_publicacao, disponivel"
            " FROM livros WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return jsonify(livro_para_json(criado)), 201

    return app


if __name__ == "__main__":
    create_app().run(debug=True)
