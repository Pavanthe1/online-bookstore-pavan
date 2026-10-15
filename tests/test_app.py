
import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as test_client:
        yield test_client


def test_homepage_loads(client):
    response = client.get("/")

    assert response.status_code == 200
    assert b"PageTurner" in response.data


def test_books_api_returns_eight_books(client):
    response = client.get("/api/books")

    assert response.status_code == 200

    books = response.get_json()

    assert len(books) == 8
    assert all("title" in book for book in books)


def test_search_books_by_title(client):
    response = client.get("/api/books?q=clean")

    assert response.status_code == 200

    books = response.get_json()

    assert any(book["title"] == "Clean Code" for book in books)


def test_search_books_by_author(client):
    response = client.get("/api/books?q=james clear")

    assert response.status_code == 200

    books = response.get_json()

    assert any(book["author"] == "James Clear" for book in books)


def test_filter_books_by_category(client):
    response = client.get("/api/books?category=Programming")

    assert response.status_code == 200

    books = response.get_json()

    assert len(books) >= 1
    assert all(
        book["category"] == "Programming"
        for book in books
    )


def test_all_category_returns_all_books(client):
    response = client.get("/api/books?category=all")

    assert response.status_code == 200
    assert len(response.get_json()) == 8


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.get_json()["status"] == "healthy"


def test_order_requires_customer_name(client):
    response = client.post(
        "/api/orders",
        json={
            "customer": "",
            "items": [{"book_id": 1, "quantity": 1}]
        }
    )

    assert response.status_code == 400


def test_order_rejects_empty_cart(client):
    response = client.post(
        "/api/orders",
        json={
            "customer": "Test Customer",
            "items": []
        }
    )

    assert response.status_code == 400


def test_order_rejects_unavailable_book(client):
    response = client.post(
        "/api/orders",
        json={
            "customer": "Test Customer",
            "items": [{"book_id": 5, "quantity": 1}]
        }
    )

    assert response.status_code == 400


def test_order_rejects_invalid_quantity(client):
    response = client.post(
        "/api/orders",
        json={
            "customer": "Test Customer",
            "items": [{"book_id": 1, "quantity": 0}]
        }
    )

    assert response.status_code == 400


def test_valid_order_and_tracking(client):
    response = client.post(
        "/api/orders",
        json={
            "customer": "Test Customer",
            "items": [{"book_id": 1, "quantity": 2}]
        }
    )

    assert response.status_code == 201

    order = response.get_json()

    assert order["total"] == 998
    assert order["status"] == "Order placed"

    tracking_response = client.get(
        f"/api/orders/{order['order_id']}"
    )

    assert tracking_response.status_code == 200

    tracked_order = tracking_response.get_json()

    assert tracked_order["customer"] == "Test Customer"
    assert tracked_order["total"] == 998


def test_tracking_unknown_order_returns_404(client):
    response = client.get("/api/orders/999999")

    assert response.status_code == 404


def test_order_rejects_unknown_book(client):
    response = client.post(
        "/api/orders",
        json={
            "customer": "Test Customer",
            "items": [{"book_id": 999, "quantity": 1}]
        }
    )

    assert response.status_code == 400
