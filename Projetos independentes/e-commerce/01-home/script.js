/* =========================
   MENU HAMBURGUER (MOBILE)
========================= */
const menuToggle = document.getElementById('menu-toggle');
const nav = document.querySelector('.nav');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
}

/* =========================
   CARRINHO
========================= */
const cart = [];

const cartSidebar = document.getElementById('cartSidebar');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');

const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

/* Abrir carrinho */
openCart.addEventListener('click', () => {
  cartSidebar.classList.add('active');
});

/* Fechar carrinho */
closeCart.addEventListener('click', () => {
  cartSidebar.classList.remove('active');
});

/* =========================
   ADICIONAR PRODUTOS
========================= */
document.querySelectorAll('.add-cart').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);

    addToCart(name, price);
    cartSidebar.classList.add('active'); // abre carrinho ao adicionar
  });
});

function addToCart(name, price) {
  const item = cart.find(p => p.name === name);

  if (item) {
    item.qty++;
  } else {
    cart.push({ name, price, qty: 1 });
  }

  renderCart();
}

/* =========================
   RENDERIZAR CARRINHO
========================= */
function renderCart() {
  cartItems.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    total += item.price * item.qty;

    const div = document.createElement('div');
    div.classList.add('cart-item');

    div.innerHTML = `
      <span>${item.name} x${item.qty}</span>
      <strong>R$ ${(item.price * item.qty).toFixed(2)}</strong>
    `;

    cartItems.appendChild(div);
  });

  cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}
