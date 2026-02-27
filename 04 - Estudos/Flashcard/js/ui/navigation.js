export function initNavigation(){

document.querySelectorAll(".row-wrapper").forEach(wrapper=>{

const container = wrapper.querySelector(".row-container");
const prev = wrapper.querySelector(".prev");
const next = wrapper.querySelector(".next");

prev?.addEventListener("click", ()=>{
container.scrollBy({ left:-300, behavior:"smooth" });
});

next?.addEventListener("click", ()=>{
container.scrollBy({ left:300, behavior:"smooth" });
});

});

}