// Get account ID from URL params
const urlParams = new URLSearchParams(window.location.search);
const accountId = urlParams.get('accountId');

// DOM elements
const productsList = document.getElementById('products-list') as any;

async function fetchProducts() {
  if (!accountId) return;

  try {
    const response = await fetch(`/api/products/${accountId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function renderProducts(products: any[]) {
  if (products.length === 0) {
    productsList.innerHTML = "<p>No products found</p>";
    return;
  }

  const templateProductDiv = document.querySelector(".product.hidden") as any;

  const existingProducts = productsList.querySelectorAll(
    ".product:not(.hidden)"
  );
  existingProducts.forEach((product: { remove: () => any; }) => product.remove());

  products.forEach((product: { name: any; price: number; period: any; priceId: any; }) => {
    const productDiv = templateProductDiv.cloneNode(true);
    productDiv.classList.remove('hidden');

    productDiv.setAttribute('data-key', product.name);
    const nameEl = productDiv.querySelector('.product-name');
    if (nameEl) nameEl.textContent = product.name;

    const priceEl = productDiv.querySelector('.product-price');
    if (priceEl) {
      priceEl.textContent = `$${product.price / 100}`;
      if (product.period) {
        priceEl.textContent += ` / ${product.period}`;
      }
    }

    const priceIdInput = productDiv.querySelector('input[name="priceId"]');
    if (priceIdInput) priceIdInput.value = product.priceId;

    const accountIdInput = productDiv.querySelector('input[name="accountId"]');
    if (accountIdInput) accountIdInput.value = accountId;

    productsList.appendChild(productDiv);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
  productsList.classList.remove('hidden');
});