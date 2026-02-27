export function renderHeatmap(container, log){

container.innerHTML = "";

Object.keys(log).forEach(date=>{

const value = log[date];

const div = document.createElement("div");

div.className = "heat-cell";

if(value > 0) div.classList.add("level1");
if(value > 5) div.classList.add("level2");
if(value > 15) div.classList.add("level3");

div.title = `${date} → ${value} cards`;

container.appendChild(div);

});

}