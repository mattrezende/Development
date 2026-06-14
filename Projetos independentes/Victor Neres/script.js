// MENU MOBILE

const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

menuBtn.onclick = () => {
menu.classList.toggle("active");
};



// ANIMAÇÃO SCROLL

const reveals = document.querySelectorAll(".reveal");

window.addEventListener("scroll", () => {

for(let el of reveals){

const windowHeight = window.innerHeight;
const elementTop = el.getBoundingClientRect().top;
const visible = 100;

if(elementTop < windowHeight - visible){

el.classList.add("active");

}

}

});