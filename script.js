const API_BASE = "https://fusion-back.onrender.com";
const INITIAL_CATEGORY_COUNT = 8

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
  categoriesExpanded: false
}

function showLoader() {
  if (loader) loader.classList.remove("hidden")
}

function hideLoader() {
  if (loader) loader.classList.add("hidden")
}

function getColor(text) {
  const colors = [
    "#c7d2fe",
    "#bbf7d0",
    "#fde68a",
    "#fecdd3",
    "#ddd6fe",
    "#bae6fd",
    "#a7f3d0",
    "#fdba74",
    "#f9a8d4",
    "#93c5fd",
    "#86efac",
    "#fcd34d",
    "#fca5a5",
    "#c4b5fd",
    "#67e8f9"
  ]

  if (usedColors.has(text)) return usedColors.get(text)

  const available = colors.filter((c) => !Array.from(usedColors.values()).includes(c))
  const pool = available.length ? available : colors

  let hash = 0
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }

  const color = pool[hash % pool.length]
  usedColors.set(text, color)
  return color
}

function renderCategories() {
  if (!categoriesContainer) return

  const visibleCategories = state.categoriesExpanded
    ? state.categories
    : state.categories.slice(0, INITIAL_CATEGORY_COUNT)

  const hiddenCount = Math.max(0, state.categories.length - INITIAL_CATEGORY_COUNT)

  const markup = [
    `<button class="category ${state.selectedCategory ? "" : "active"}" data-category="">All</button>`,
    ...visibleCategories.map((category) => {
      const activeClass = category === state.selectedCategory ? "active" : ""
      const color = getColor(category)
      return `
        <button
          class="category ${activeClass}"
          data-category="${category}"
          type="button"
          style="--border:${color};"
        >
          ${category}
        </button>`
    })
  ]

  if (!state.categoriesExpanded && hiddenCount > 0) {
    markup.push(`
      <button class="category" id="showMoreBtn" type="button">
        +${hiddenCount}
      </button>
    `)
  }

  categoriesContainer.innerHTML = markup.join("")

  categoriesContainer.querySelectorAll(".category[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const category = btn.dataset.category || null
      state.selectedCategory = category
      renderCategories()
      renderResults()
    })
  })

  const showMoreBtn = document.getElementById("showMoreBtn")
  if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
      state.categoriesExpanded = true
      renderCategories()
    })
  }
}

function renderResults() {

const searchTerm=state.searchTerm.trim().toLowerCase()
const isSearching=Boolean(searchTerm)
const hasCategory=!isSearching && Boolean(state.selectedCategory)

categoriesContainer?.classList.toggle("hidden",isSearching)

const filteredProducts=state.products.filter((product)=>{

const categoryMatch=
!hasCategory || product.category===state.selectedCategory

const searchMatch=
!searchTerm ||
product.name.toLowerCase().includes(searchTerm) ||
product.category.toLowerCase().includes(searchTerm) ||
(product.description || "").toLowerCase().includes(searchTerm)

return categoryMatch && searchMatch

})


const filteredShops=hasCategory
? []
: state.shops.filter((shop)=>{

if(!searchTerm) return true

return(
shop.name.toLowerCase().includes(searchTerm) ||
shop.category.toLowerCase().includes(searchTerm)
)

})


if(hasCategory){

mainLogo?.classList.add("hidden")

}else{

mainLogo?.classList.remove("hidden")

}


shopsResults.innerHTML=

filteredShops.length
? filteredShops.map(shop=>`

<article class="shop-card">
<h3>${shop.name}</h3>
<p>${shop.category}</p>
</article>

`).join("")
:
`<div class="empty-state">No shops found.</div>`


productsResults.innerHTML=

filteredProducts.length
? filteredProducts.map(product=>`

<a class="product-link"
href="product.html?id=${product._id}"
aria-label="Open ${product.name} details">

<article class="product-card">

<img
class="product-image"
src="${product.image}"
alt="${product.name}"
loading="lazy">

<div class="product-meta">
<h3>${product.name}</h3>

<p class="product-category">
${product.category}
</p>

<p class="product-description">
${product.description || ""}
</p>

</div>

</article>

</a>

`).join("")
:
`<div class="empty-state">No products found.</div>`

}

async function loadData() {
  showLoader()

  try {
    const [shopsRes, catRes, productsRes] = await Promise.all([
      fetch(`${API_BASE}/shops`),
      fetch(`${API_BASE}/categories`),
      fetch(`${API_BASE}/products`)
    ])

    state.shops = await shopsRes.json()
    state.categories = await catRes.json()
    state.products = await productsRes.json()

    renderCategories()
    renderResults()
  } catch (error) {
    console.error(error)
    if (resultsContainer) {
      resultsContainer.innerHTML =
        "<div class='empty-state'>Unable to load data.</div>"
    }
  } finally {
    hideLoader()
  }
}

searchInput?.addEventListener("input", (event) => {
  state.searchTerm = event.target.value
  renderResults()
})

filterBtn?.addEventListener("click", () => {
  searchInput?.focus()
})

window.addEventListener("DOMContentLoaded", loadData)
