const bookGrid = document.getElementById("bookGrid");
const bookCount = document.getElementById("bookCount");
const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");

const cartButton = document.getElementById("cartButton");
const cartCount = document.getElementById("cartCount");
const cartSection = document.getElementById("cartSection");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const checkoutForm = document.getElementById("checkoutForm");
const customerName = document.getElementById("customerName");
const placeOrderButton = document.getElementById("placeOrderButton");
const checkoutMessage = document.getElementById("checkoutMessage");

const trackingForm = document.getElementById("trackingForm");
const orderIdInput = document.getElementById("orderIdInput");
const trackingResult = document.getElementById("trackingResult");

let books = [];
let cart = [];
let selectedCategory = "all";

function formatPrice(price) {
    return `₹${Number(price).toFixed(2)}`;
}

async function loadBooks() {
    bookGrid.textContent = "Loading books...";

    try {
        const params = new URLSearchParams();

        if (searchInput.value.trim()) {
            params.set("q", searchInput.value.trim());
        }

        params.set("category", selectedCategory);

        const response = await fetch(`/api/books?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Unable to load books.");
        }

        books = await response.json();
        renderBooks();
    } catch (error) {
        bookGrid.textContent = "Unable to load books. Please refresh the page.";
        bookCount.textContent = "0";
    }
}

function renderBooks() {
    bookCount.textContent = String(books.length);
    bookGrid.replaceChildren();

    if (books.length === 0) {
        bookGrid.textContent = "No books match your search.";
        return;
    }

    books.forEach((book) => {
        const article = document.createElement("article");
        const title = document.createElement("h3");
        const author = document.createElement("p");
        const category = document.createElement("p");
        const price = document.createElement("p");
        const availability = document.createElement("p");
        const button = document.createElement("button");

        title.textContent = book.title;
        author.textContent = `Author: ${book.author}`;
        category.textContent = `Category: ${book.category}`;
        price.textContent = `Price: ${formatPrice(book.price)}`;
        availability.textContent = book.available ? "Available" : "Out of stock";
        button.textContent = "Add to cart";
        button.type = "button";
        button.disabled = !book.available;
        button.addEventListener("click", () => addToCart(book.id));

        article.append(title, author, category, price, availability, button);
        bookGrid.appendChild(article);
    });
}

function addToCart(bookId) {
    const book = books.find((item) => item.id === bookId);

    if (!book || !book.available) {
        return;
    }

    const existingItem = cart.find((item) => item.book_id === bookId);

    if (existingItem) {
        if (existingItem.quantity >= 10) {
            alert("Maximum quantity per book is 10.");
            return;
        }

        existingItem.quantity += 1;
    } else {
        cart.push({
            book_id: bookId,
            title: book.title,
            price: book.price,
            quantity: 1
        });
    }

    renderCart();
}

function renderCart() {
    cartCount.textContent = String(
        cart.reduce((sum, item) => sum + item.quantity, 0)
    );

    cartItems.replaceChildren();

    let total = 0;

    cart.forEach((item) => {
        total += item.price * item.quantity;

        const row = document.createElement("div");
        const description = document.createElement("span");
        const removeButton = document.createElement("button");

        description.textContent =
            `${item.title} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`;

        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
            cart = cart.filter((cartItem) => cartItem.book_id !== item.book_id);
            renderCart();
        });

        row.append(description, removeButton);
        cartItems.appendChild(row);
    });

    cartTotal.textContent = total.toFixed(2);
}

cartButton.addEventListener("click", () => {
    cartSection.hidden = !cartSection.hidden;
});

searchInput.addEventListener("input", loadBooks);

categoryFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");

    if (!button) {
        return;
    }

    selectedCategory = button.dataset.category;
    loadBooks();
});

checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (cart.length === 0) {
        checkoutMessage.textContent = "Please add a book before placing an order.";
        return;
    }

    placeOrderButton.disabled = true;
    checkoutMessage.textContent = "Placing your order...";

    try {
        const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                customer: customerName.value.trim(),
                items: cart.map((item) => ({
                    book_id: item.book_id,
                    quantity: item.quantity
                }))
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to place order.");
        }

        cart = [];
        renderCart();
        checkoutForm.reset();

        checkoutMessage.textContent =
            `Thank you, ${result.customer}! Your order #${result.order_id} has been placed successfully. Total: ${formatPrice(result.total)}. Save your order ID to track your order.`;

        orderIdInput.value = String(result.order_id);
        trackingResult.replaceChildren();

        const trackingMessage = document.createElement("p");
        trackingMessage.textContent =
            `Order #${result.order_id} — Status: ${result.status}`;
        trackingResult.appendChild(trackingMessage);
    } catch (error) {
        checkoutMessage.textContent = error.message;
    } finally {
        placeOrderButton.disabled = false;
    }
});

trackingForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const orderId = orderIdInput.value.trim();

    if (!orderId) {
        trackingResult.textContent = "Please enter an order ID.";
        return;
    }

    trackingResult.textContent = "Looking up your order...";

    try {
        const response = await fetch(
            `/api/orders/${encodeURIComponent(orderId)}`
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to find this order.");
        }

        trackingResult.replaceChildren();

        const heading = document.createElement("h3");
        const customer = document.createElement("p");
        const status = document.createElement("p");
        const total = document.createElement("p");

        heading.textContent = `Order #${result.order_id}`;
        customer.textContent = `Customer: ${result.customer}`;
        status.textContent = `Status: ${result.status}`;
        total.textContent = `Total: ${formatPrice(result.total)}`;

        trackingResult.append(heading, customer, status, total);
    } catch (error) {
        trackingResult.textContent = error.message;
    }
});

loadBooks();
renderCart();
