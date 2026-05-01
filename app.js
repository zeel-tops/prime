(function () {
  "use strict";

  const API_BASE = "https://dummyjson.com/products";
  const PAGE_SIZE = 12;

  const statusEl = document.getElementById("status");
  const productsEl = document.getElementById("products");
  const paginationEl = document.getElementById("pagination");
  const prevButton = document.getElementById("prev-page");
  const nextButton = document.getElementById("next-page");
  const pageIndicator = document.getElementById("page-indicator");

  let currentPage = 1;
  let totalPages = 1;
  let inFlightController = null;

  function setStatus(state, message) {
    if (!state) {
      statusEl.removeAttribute("data-state");
      statusEl.textContent = "";
      return;
    }
    statusEl.dataset.state = state;
    statusEl.textContent = message;
  }

  function setErrorStatus(message) {
    statusEl.dataset.state = "error";
    statusEl.textContent = "";

    const messageNode = document.createElement("span");
    messageNode.textContent = message;
    statusEl.appendChild(messageNode);

    const retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.className = "retry-button";
    retryButton.textContent = "Retry";
    retryButton.addEventListener("click", () => loadPage(currentPage));
    statusEl.appendChild(retryButton);
  }

  function formatPrice(value) {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "";
    }
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  function renderProducts(products) {
    productsEl.replaceChildren();

    for (const product of products) {
      const li = document.createElement("li");
      li.className = "product-card";

      const img = document.createElement("img");
      img.className = "product-card__image";
      img.loading = "lazy";
      img.alt = product.title ? `${product.title} product image` : "";
      img.src = product.thumbnail || "";

      const body = document.createElement("div");
      body.className = "product-card__body";

      const name = document.createElement("h2");
      name.className = "product-card__name";
      name.textContent = product.title || "Untitled product";

      const price = document.createElement("p");
      price.className = "product-card__price";
      price.textContent = formatPrice(product.price);

      body.append(name, price);
      li.append(img, body);
      productsEl.append(li);
    }
  }

  function updatePaginationControls() {
    pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    paginationEl.hidden = totalPages <= 1;
  }

  async function loadPage(page) {
    if (inFlightController) {
      inFlightController.abort();
    }
    const controller = new AbortController();
    inFlightController = controller;

    currentPage = page;
    productsEl.replaceChildren();
    paginationEl.hidden = true;
    setStatus("loading", "Loading products…");

    const skip = (page - 1) * PAGE_SIZE;
    const url = `${API_BASE}?limit=${PAGE_SIZE}&skip=${skip}`;

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();

      if (controller.signal.aborted) {
        return;
      }

      const products = Array.isArray(data.products) ? data.products : [];
      const total = Number.isFinite(data.total) ? data.total : products.length;
      totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

      if (currentPage > totalPages) {
        currentPage = totalPages;
        return loadPage(currentPage);
      }

      renderProducts(products);

      if (products.length === 0) {
        setStatus("empty", "No products to display.");
      } else {
        setStatus(null);
      }

      updatePaginationControls();
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }
      setErrorStatus("Couldn't load products. Check your connection and try again.");
    } finally {
      if (inFlightController === controller) {
        inFlightController = null;
      }
    }
  }

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  });

  loadPage(1);
})();
