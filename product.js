const API_BASE = "https://fusion-back.onrender.com"
const productPage = document.getElementById("productPage")

function getQueryParam(key) {
  const params = new URLSearchParams(window.location.search)
  return params.get(key)
}

function renderProduct(product) {
  productPage.innerHTML = `
    <section class="gallery">
      <img src="${product.image}" alt="${product.name}">
    </section>

    <section class="details">
      <p class="category">${product.category}</p>
      <h1>${product.name}</h1>

      <div class="rating-row">
        <span class="rating-text">${product.rating} rating</span>
      </div>

      <p class="description">${product.description}</p>

      <h2>About this item</h2>
      <ul>
        ${(product.highlights || []).map((item) => `<li>${item}</li>`).join("")}
      </ul>
    </section>

    <aside class="buy-box">
      <p class="price">₹${Number(product.price).toLocaleString("en-IN")}</p>

      <div class="local-info">
        <p class="available">Available at</p>
        <h3>${product.shop || "Nearby Stores"}</h3>
        <p class="note">Check nearby shops for availability and best price</p>
      </div>

      <button type="button" class="visit-btn">View Nearby Shops</button>
    </aside>
  `
}

async function loadProduct() {
  const productId = getQueryParam("id")

  if (!productId) {
    productPage.innerHTML = "<p class='error'>Invalid product. Please go back and select a product again.</p>"
    return
  }

  try {
    const res = await fetch(`${API_BASE}/products`)
    const products = await res.json()
    const product = products.find((item) => item._id === productId)

    if (!product) {
      productPage.innerHTML = "<p class='error'>Product not found.</p>"
      return
    }

    renderProduct(product)
  } catch (err) {
    console.error(err)
    productPage.innerHTML = "<p class='error'>Could not load product details.</p>"
  }
}

window.addEventListener("DOMContentLoaded", loadProduct)
