
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

BOOKS = [
    {
        "id": 1,
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "category": "Programming",
        "price": 499,
        "available": True
    },
    {
        "id": 2,
        "title": "The Pragmatic Programmer",
        "author": "David Thomas",
        "category": "Programming",
        "price": 599,
        "available": True
    },
    {
        "id": 3,
        "title": "Atomic Habits",
        "author": "James Clear",
        "category": "Self-Help",
        "price": 399,
        "available": True
    },
    {
        "id": 4,
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "category": "Fiction",
        "price": 299,
        "available": True
    },
    {
        "id": 5,
        "title": "Wings of Fire",
        "author": "A. P. J. Abdul Kalam",
        "category": "Biography",
        "price": 350,
        "available": False
    },
    {
        "id": 6,
        "title": "Deep Work",
        "author": "Cal Newport",
        "category": "Productivity",
        "price": 449,
        "available": True
    },
    {
        "id": 7,
        "title": "Python Crash Course",
        "author": "Eric Matthes",
        "category": "Programming",
        "price": 550,
        "available": True
    },
    {
        "id": 8,
        "title": "Ikigai",
        "author": "Hector Garcia",
        "category": "Self-Help",
        "price": 325,
        "available": True
    }
]

ORDERS = {}
NEXT_ORDER_ID = 1001


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/books", methods=["GET"])
def get_books():
    query = request.args.get("q", "").strip().lower()
    category = request.args.get("category", "").strip()

    results = [
        book for book in BOOKS
        if (
            not query
            or query in book["title"].lower()
            or query in book["author"].lower()
        )
        and (
            not category
            or category.lower() == "all"
            or category == book["category"]
        )
    ]

    return jsonify(results)


@app.route("/api/orders", methods=["POST"])
def place_order():
    global NEXT_ORDER_ID

    data = request.get_json(silent=True) or {}
    customer = str(data.get("customer", "")).strip()
    items = data.get("items", [])

    if not customer:
        return jsonify({
            "error": "Customer name is required."
        }), 400

    if len(customer) > 100:
        return jsonify({
            "error": "Customer name must be at most 100 characters."
        }), 400

    if not isinstance(items, list) or not items:
        return jsonify({
            "error": "Your cart is empty."
        }), 400

    order_items = []
    total = 0

    for item in items:
        if not isinstance(item, dict):
            return jsonify({
                "error": "Invalid order item."
            }), 400

        try:
            book_id = int(item["book_id"])
            quantity = int(item["quantity"])
        except (KeyError, TypeError, ValueError):
            return jsonify({
                "error": "Invalid book ID or quantity."
            }), 400

        book = next(
            (book for book in BOOKS if book["id"] == book_id),
            None
        )

        if book is None:
            return jsonify({
                "error": "Book not found."
            }), 400

        if not book["available"]:
            return jsonify({
                "error": f'{book["title"]} is out of stock.'
            }), 400

        if quantity < 1 or quantity > 10:
            return jsonify({
                "error": "Quantity must be between 1 and 10."
            }), 400

        order_items.append({
            "book_id": book["id"],
            "title": book["title"],
            "quantity": quantity,
            "price": book["price"]
        })

        total += book["price"] * quantity

    order_id = NEXT_ORDER_ID
    NEXT_ORDER_ID += 1

    order = {
        "order_id": order_id,
        "customer": customer,
        "items": order_items,
        "total": total,
        "status": "Order placed"
    }

    ORDERS[order_id] = order

    return jsonify(order), 201


@app.route("/api/orders/<int:order_id>", methods=["GET"])
def track_order(order_id):
    order = ORDERS.get(order_id)

    if order is None:
        return jsonify({
            "error": "Order not found."
        }), 404

    return jsonify(order)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy"
    }), 200


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
