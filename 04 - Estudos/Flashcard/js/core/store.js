export class Store {

static load(key, defaultValue){
return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

static save(key, value){
localStorage.setItem(key, JSON.stringify(value));
}

}