const API_BASE = "https://fusion-back.onrender.com";
const INITIAL_CATEGORY_COUNT = 8
const MAX_HOME_SHOPS = 5
const MAX_HOME_PRODUCTS = 8

const usedColors = new Map()

const categoriesContainer = document.getElementById("categories")
const shopsResults = document.getElementById("shopsResults")
const productsResults = document.getElementById("productsResults")
const searchInput = document.getElementById("searchInput")
const filterBtn = document.getElementById("filterBtn")
const mainLogo = document.getElementById("mainLogo")
const loader = document.getElementById("loader")

const state = {
  categories: [],
  shops: [],
  products: [],
  selectedCategory: null,
  searchTerm: "",
  categoriesExpanded: false,
  currentShopIndex: 0
}

let shopAutoSlide = null

function showLoader() {
  loader?.classList.remove("hidden")
}

function hideLoader() {
  loader?.classList.add("hidden")
}

function getColor(text) {
  const colors = ["#c7d2fe","#bbf7d0","#fde68a","#fecdd3","#ddd6fe","#bae6fd","#a7f3d0","#fdba74","#f9a8d4","#93c5fd","#86efac","#fcd34d","#fca5a5","#c4b5fd","#67e8f9"]

  if (usedColors.has(text)) return usedColors.get(text)

  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }

  const color = colors[hash % colors.length]
  usedColors.set(text, color)
  return color
}

function renderCategories() {
  if (!categoriesContainer) return

  const visibleCategories = state.categoriesExpanded
    ? state.categories
    : state.categories.slice(0, INITIAL_CATEGORY_COUNT)

  const hiddenCount = Math.max(0, state.categories.length - INITIAL_CATEGORY_COUNT)

  categoriesContainer.innerHTML = [
    `<button class="category ${state.selectedCategory ? "" : "active"}" data-category="">All</button>`,
    ...visibleCategories.map(c => `
      <button class="category ${c === state.selectedCategory ? "active" : ""}" data-category="${c}" style="--border:${getColor(c)};">
        ${c}
      </button>
    `),
    (!state.categoriesExpanded && hiddenCount > 0)
      ? `<button class="category" id="showMoreBtn">+${hiddenCount}</button>`
      : ""
  ].join("")

  categoriesContainer.querySelectorAll(".category[data-category]").forEach(btn => {
    btn.onclick = () => {
      state.selectedCategory = btn.dataset.category || null
      renderCategories()
      renderResults()
    }
  })

  document.getElementById("showMoreBtn")?.addEventListener("click", () => {
    state.categoriesExpanded = true
    renderCategories()
  })
}

function renderResults() {

  const searchTerm = state.searchTerm.trim().toLowerCase()
  const isSearching = Boolean(searchTerm)
  const hasCategory = Boolean(state.selectedCategory)
  const isDefaultView = !isSearching && !hasCategory

  categoriesContainer?.classList.toggle("hidden", isSearching)

  const filteredProducts = state.products.filter(p => {
    const categoryMatch = !hasCategory || p.category === state.selectedCategory
    const searchMatch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.category.toLowerCase().includes(searchTerm) ||
      (p.description || "").toLowerCase().includes(searchTerm)

    return categoryMatch && searchMatch
  })

  const visibleProducts = isDefaultView
    ? filteredProducts.slice(0, MAX_HOME_PRODUCTS)
    : filteredProducts

  const filteredShops = state.shops.filter(s => {
    if (!searchTerm && !state.selectedCategory) return true

    const searchMatch =
      !searchTerm ||
      s.name.toLowerCase().includes(searchTerm) ||
      s.category.toLowerCase().includes(searchTerm)

    const categoryMatch =
      !state.selectedCategory ||
      s.category === state.selectedCategory

    return searchMatch && categoryMatch
  })

  const visibleShops = isDefaultView
    ? filteredShops.slice(0, MAX_HOME_SHOPS)
    : filteredShops

  state.currentShopIndex = 0

  mainLogo?.classList.toggle("hidden", hasCategory)

  if (visibleShops.length) {
    renderShopSlider(visibleShops)

    clearInterval(shopAutoSlide)

    if (visibleShops.length > 1) {
      shopAutoSlide = setInterval(() => {
        slideTo(1, visibleShops)
      }, 2000)
    }
  } else {
    shopsResults.innerHTML = `<div class="empty-state">No shops found.</div>`
    clearInterval(shopAutoSlide)
  }

  productsResults.innerHTML = visibleProducts.length
    ? visibleProducts.map(p => `
      <a class="product-link" href="product.html?id=${p._id}">
        <article class="product-card">
          <img class="product-image" src="${p.image}">
          <div class="product-meta">
            <h3>${p.name}</h3>
            <p class="product-category">${p.category}</p>
            <p class="product-description">${p.description || ""}</p>
          </div>
        </article>
      </a>
    `).join("")
    : `<div class="empty-state">No products found.</div>`
}

function renderShopSlider(shops) {

  const current = shops[state.currentShopIndex]
  const next = shops[(state.currentShopIndex + 1) % shops.length]

  shopsResults.innerHTML = `
    <div class="shop-slide">
      <div class="shop-slide-inner" id="sliderTrack">
        
        <div class="shop-slide-item">
          <img src="${current.image}">
          <div class="shop-overlay">${current.name}</div>
        </div>

        <div class="shop-slide-item">
          <img src="${next.image}">
          <div class="shop-overlay">${next.name}</div>
        </div>

      </div>

      <button class="shop-nav shop-prev">&#60;</button>
      <button class="shop-nav shop-next">&#62;</button>
    </div>

    <div class="shop-dots">
      ${shops.map((_, i) => `
        <div class="shop-dot ${i === state.currentShopIndex ? "active" : ""}"></div>
      `).join("")}
    </div>
  `

  const prev = shopsResults.querySelector(".shop-prev")
  const nextBtn = shopsResults.querySelector(".shop-next")

  prev.onclick = () => slideTo(-1, shops)
  nextBtn.onclick = () => slideTo(1, shops)
}

function slideTo(direction, shops) {

  const track = document.getElementById("sliderTrack")

  track.style.transform = `translateX(${direction === 1 ? "-100%" : "100%"})`

  setTimeout(() => {
    state.currentShopIndex =
      (state.currentShopIndex + direction + shops.length) % shops.length
    renderShopSlider(shops)
  }, 400)
}

async function loadData() {
  showLoader()
  try {
    const [s, c, p] = await Promise.all([
      fetch(`${API_BASE}/shops`),
      fetch(`${API_BASE}/categories`),
      fetch(`${API_BASE}/products`)
    ])

    state.shops = await s.json()
    state.categories = await c.json()
    state.products = await p.json()

    renderCategories()
    renderResults()
  } catch {
    shopsResults.innerHTML = "<div class='empty-state'>Unable to load data.</div>"
  } finally {
    hideLoader()
  }
}

searchInput?.addEventListener("input", e => {
  state.searchTerm = e.target.value
  renderResults()
})

filterBtn?.addEventListener("click", () => searchInput?.focus())

window.addEventListener("DOMContentLoaded", loadData)
