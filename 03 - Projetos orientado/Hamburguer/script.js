const menuOptions = [
  { name: 'X-Salada', price: 26, vegan: false, src: './xsalada.jpeg' },
  { name: 'X-Bacon', price: 28, vegan: false, src: './xbacon.png' },
  { name: 'X-Bacon Egg', price: 30, vegan: false, src: './bacon-egg.png' },
  { name: 'Monstruoso', price: 34, vegan: false, src: './monstruoso.png' },
  { name: 'Big Vegano', price: 32, vegan: true, src: './xvegan.png' },
  { name: 'X-Vegan', price: 28, vegan: true, src: './monstruoso-vegan.png' }
]


let currentItems = [...menuOptions]


const cardsContainer = document.querySelector('ul.cards')
const buttonForEach = document.querySelector('.foreach')
const buttonForMap = document.querySelector('.map')
const buttonForReduce = document.querySelector('.reduce')
const buttonForFilter = document.querySelector('.filter')
const buttonForReset = document.querySelector('.reset')


function renderCards(items) {
  currentItems = items

  cardsContainer.innerHTML = items
    .map(item => `
      <li>
        <img src="${item.src}" alt="${item.name}">
        <p>${item.name}</p>
        <span>R$ ${item.price.toFixed(2)}</span>
      </li>
    `)
    .join('')
}

function showAll() {
  renderCards(menuOptions)
}

function mapAll() {
  const discountedItems = currentItems.map(item => ({
    ...item,
    price: item.price * 0.9
  }))
  renderCards(discountedItems)
}

function filterAll() {
  const veganItems = currentItems.filter(item => item.vegan)
  renderCards(veganItems)
}

function reduceAll() {
  const total = currentItems.reduce(
    (acc, item) => acc + item.price,
    0
  )

  cardsContainer.innerHTML = `
    <li>
      <p>Total do pedido:</p>
      <span>R$ ${total.toFixed(2)}</span>
    </li>
  `
}

function resetApp() {
  renderCards(menuOptions)
}

buttonForEach.addEventListener('click', showAll)
buttonForMap.addEventListener('click', mapAll)
buttonForFilter.addEventListener('click', filterAll)
buttonForReduce.addEventListener('click', reduceAll)
buttonForReset.addEventListener('click', resetApp)

renderCards(menuOptions)
