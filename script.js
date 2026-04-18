const shopsContainer = document.getElementById("shops")
const categoriesContainer = document.getElementById("categories")

async function loadData() {
  try {
    const shopsRes = await fetch("https://fusion-back.onrender.com/shops")
    const shops = await shopsRes.json()

    if (shopsContainer) {
      shopsContainer.innerHTML = shops.map(shop =>
        `<article class="shop-card">${shop.name}</article>`
      ).join("")
    }

    const catRes = await fetch("https://fusion-back.onrender.com/categories")
    const categories = await catRes.json()

    if (categoriesContainer) {
      categoriesContainer.innerHTML = categories.map(cat =>
        `<div class="category">${cat}</div>`
      ).join("")
    }

  } catch (err) {
    console.error("Error loading data:", err)
  }
}

window.addEventListener("DOMContentLoaded", loadData)
