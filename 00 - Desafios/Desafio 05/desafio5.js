

const cart = [10, 244, 99, 2, 20, 33, 250]

function desconto(cart){
    return cart.map(preco =>{
        if (preco >=30){
            return preco - (preco * 0.1)
        }
        return preco

        });

}
const newCart = desconto(cart);

console.log(newCart);
console.log(cart);