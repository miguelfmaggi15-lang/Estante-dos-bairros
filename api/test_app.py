import pytest

from app import create_app


@pytest.fixture
def client(tmp_path):
    app = create_app(str(tmp_path / "teste.db"), seed=False)
    app.config.update(TESTING=True)
    return app.test_client()


def test_get_livros_retorna_lista_vazia(client):
    resposta = client.get("/livros")

    assert resposta.status_code == 200
    assert resposta.get_json() == []


def test_post_livro_grava_e_devolve_registro(client):
    resposta = client.post("/livros", json={
        "titulo": "O pequeno príncipe",
        "autor": "Antoine de Saint-Exupéry",
        "ano_publicacao": 1943,
        "disponivel": True,
    })

    assert resposta.status_code == 201
    criado = resposta.get_json()
    assert criado["id"] == 1
    assert criado["titulo"] == "O pequeno príncipe"
    assert criado["autor"] == "Antoine de Saint-Exupéry"
    assert criado["ano_publicacao"] == 1943
    assert criado["disponivel"] is True

    lista = client.get("/livros").get_json()
    assert len(lista) == 1
    assert lista[0] == criado


def test_post_livro_sem_titulo_retorna_400(client):
    resposta = client.post("/livros", json={
        "autor": "Machado de Assis",
        "ano_publicacao": 1899,
    })

    assert resposta.status_code == 400
    assert "titulo" in resposta.get_json()["erro"]


def test_post_livro_com_ano_invalido_retorna_400(client):
    resposta = client.post("/livros", json={
        "titulo": "Dom Casmurro",
        "autor": "Machado de Assis",
        "ano_publicacao": "mil oitocentos",
    })

    assert resposta.status_code == 400
    assert "ano_publicacao" in resposta.get_json()["erro"]


def test_resposta_tem_cors_habilitado(client):
    resposta = client.get("/livros")

    assert resposta.headers.get("Access-Control-Allow-Origin") == "*"
