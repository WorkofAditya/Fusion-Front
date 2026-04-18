const shopsContainer = document.getElementById("shops")
const categoriesContainer = document.getElementById("categories")
const usedColors = new Map()
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
  const color = getColor(cat)

  return `
    <div class="category"
         style="--border:${color};">
      ${cat}
    </div>
  `
}).join("")
    }

  } catch (err) {
    console.error("Error loading data:", err)
  }
}

window.addEventListener("DOMContentLoaded", loadData)

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

  if (usedColors.has(text)) {
    return usedColors.get(text)
  }

  const available = colors.filter(c => !Array.from(usedColors.values()).includes(c))

  const pool = available.length ? available : colors

  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0
  }

  const color = pool[hash % pool.length]

  usedColors.set(text, color)

  return color
}
