import { Store } from "../core/store.js";

export class CardManager {

constructor(){
this.cards = Store.load("cards", []);
}

save(){
Store.save("cards", this.cards);
}

create(data){

const card = {
id: Date.now(),
deckId: data.deckId,
discipline: data.discipline,
question: data.question,
answer: data.answer,

repetitions:0,
interval:0,
easeFactor:2.5,
nextReview:new Date().toISOString().split("T")[0],

history:[]
};

this.cards.push(card);
this.save();

return card;

}

getAll(){
return this.cards;
}

}