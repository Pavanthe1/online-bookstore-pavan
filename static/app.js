
"use strict";

const API = "/api";
let allBooks = [];
let cart = {};
let selectedCategory = "all";

const $ = id => document.getElementById(id);

async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

async function loadBooks() {
    const grid = $("bookGrid");
    grid.textContent = "Loading books...";

    try {
        allBooks = await apiRequest(`${API}/books`);
        renderBooks();
    } catch (error) {
        console.error("Loading books failed:", error);
        grid.textContent = "Unable to load books: " + error.message;
    }
}

function renderBooks() {
    const search = $("searchInput").value.trim().toLowerCase();

    const filtered = allBooks.filter(book => {
        const matchesSearch =
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search);

        const matchesCategory =
            selectedCategory === "all" ||
            book.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    $("bookCount").textContent = allBooks.length;

    if (filtered.length === 0) {
        $("bookGrid").textContent = "No books found.";
        return;
    }

    $("bookGrid").innerHTML = filtered.map(book => `
        <article>
            <h3>${escapeHTML(book.title)}</h3>
            <p>Author: ${escapeHTML(book.author)}</p>
            <p>Category: ${escapeHTML(book.category)}</p>
            <p>Price: ₹${Number(book.price).toFixed(2)}</p>
            <p>${book.available ? "Available" : "Out of stock"}</p>
            <button type="button"
                data-add="${Number(book.id)}"
                ${book.available ? "" : "disabled"}>
                Add to cart
            </button>
        </article>
        <hr>
    `).join("");
}

function renderCart() {
    let total = 0;
    let count = 0;
    const items = [];

    for (const [id, quantity] of Object.entries(cart)) {
        const book = allBooks.find(
            item => Number(item.id) === Number(id)
        );

        if (!book) continue;

        const subtotal = Number(book.price) * quantity;
        total += subtotal;
        count += quantity;

        items.push(`
            <div>
                <strong>${escapeHTML(book.title)}</strong>
                <p>Price: ₹${Number(book.price).toFixed(2)}</p>
                <p>Quantity: ${quantity}</p>
                <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
                <button type="button"
                    data-change="${id}" data-amount="-1">−</button>
                <button type="button"
                    data-change="${id}" data-amount="1">+</button>
                <button type="button" data-remove="${id}">Remove</button>
            </div>
            <hr>
        `);
    }

    $("cartItems").innerHTML = items.length
        ? items.join("")
        : "Your cart is empty.";

    $("cartCount").textContent = count;
    $("cartTotal").textContent = "Total: ₹" + total.toFixed(2);
}

document.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add]");

    if (addButton) {
        const id = Number(addButton.dataset.add);
        const book = allBooks.find(item => Number(item.id) === id);

        if (!book || !book.available) {
            $("checkoutMessage").textContent = "This book is unavailable.";
            return;
        }

        if ((cart[id] || 0) >= 10) {
            $("checkoutMessage").textContent =
                "Maximum quantity is 10 per book.";
            return;
        }

        cart[id] = (cart[id] || 0) + 1;
        renderCart();
        $("checkoutMessage").textContent = "Book added to cart.";
        return;
    }

    const categoryButton = event.target.closest("[data-category]");

    if (categoryButton) {
        selectedCategory = categoryButton.dataset.category || "all";

        document.querySelectorAll("[data-category]").forEach(button => {
            button.classList.toggle("active", button === categoryButton);
        });

        renderBooks();
        return;
    }

    const changeButton = event.target.closest("[data-change]");

    if (changeButton) {
        const id = changeButton.dataset.change;

        cart[id] = (cart[id] || 0) +
            Number(changeButton.dataset.amount);

        if (cart[id] <= 0) {
            delete cart[id];
        }

        renderCart();
        return;
    }

    const removeButton = event.target.closest("[data-remove]");

    if (removeButton) {
        delete cart[removeButton.dataset.remove];
        renderCart();
    }
});

$("searchInput").addEventListener("input", renderBooks);

$("cartButton").addEventListener("click", () => {
    $("cartSection").scrollIntoView({ behavior: "smooth" });
});

$("checkoutForm").addEventListener("submit", async event => {
    event.preventDefault();

    const customer = $("customerName").value.trim();

    const items = Object.entries(cart).map(([id, quantity]) => ({
        book_id: Number(id),
        quantity: quantity
    }));

    if (!customer) {
        $("checkoutMessage").textContent = "Enter your name.";
        return;
    }

    if (items.length === 0) {
        $("checkoutMessage").textContent = "Your cart is empty.";
        return;
    }

    const button = $("placeOrderButton");
    button.disabled = true;

    try {
        const order = await apiRequest(`${API}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customer, items })
        });

        $("checkoutMessage").textContent =
            `Thank you, ${customer}! Order ID: ${order.order_id}. ` +
            `Status: ${order.status}. Total: ₹${order.total}.`;

        cart = {};
        renderCart();
        $("customerName").value = "";
    } catch (error) {
        $("checkoutMessage").textContent =
            "Order failed: " + error.message;
    } finally {
        button.disabled = false;
    }
});

$("trackingForm").addEventListener("submit", async event => {
    event.preventDefault();

    const id = $("orderIdInput").value.trim();

    try {
        const order = await apiRequest(
            `${API}/orders/${encodeURIComponent(id)}`
        );

        $("trackingResult").textContent =
            `Order ID: ${order.order_id} | ` +
            `Customer: ${order.customer} | ` +
            `Status: ${order.status} | Total: ₹${order.total}`;
    } catch (error) {
        $("trackingResult").textContent =
            "Tracking failed: " + error.message;
    }
});

renderCart();
loadBooks();
