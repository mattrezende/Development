const menuOptions = [

{ name: 'X-Salada', price: 26, vegan: false, src: './xsalada.jpeg' },
{ name: 'X-Bacon', price: 28, vegan: false, src: './xbacon.png' },
{ name: 'X-Bacon Egg', price: 30, vegan: false, src: './bacon-egg.png' },
{ name: 'Monstruoso', price: 34, vegan: false, src: './monstruoso.png' },
{ name: 'Big Vegano', price: 32, vegan: true, src: './xvegan.png' },
{ name: 'X-Vegan', price: 28, vegan: true, src: './monstruoso-vegan.png' },

]

const cardsContainer = document.querySelector('ul.cards');

cardsContainer.innerHTML = `
        ${menuOptions.map(item => `
            <li>
                <img src="${item.src}" alt="${item.name}">
                <p>${item.name}</p>
                <span>R$ ${item.price},00</span>
            </li>
        `).join('')}
    `;