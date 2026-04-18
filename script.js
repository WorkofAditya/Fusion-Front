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
      categoriesContainer.innerHTML = categories.map(cat => {
        let cls = ""

        if (cat.includes("Gaming")) cls = "cat-gaming"
        else if (cat.includes("Electronic")) cls = "cat-electronics"
        else if (cat.includes("Home")) cls = "cat-home"
        else if (cat.includes("Gadgets")) cls = "cat-gadgets"
        else if (cat.includes("Stationary")) cls = "cat-stationary"

        return `<div class="category ${cls}">${cat}</div>`
      }).join("")
    }

  } catch (err) {
    console.error("Error loading data:", err)
  }
}

window.addEventListener("DOMContentLoaded", loadData)
