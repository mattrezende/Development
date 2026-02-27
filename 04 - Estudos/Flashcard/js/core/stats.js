export class Stats {

static calculate(cards){

let total = cards.length;

let reviewsToday = 0;
let correct = 0;
let wrong = 0;

const today = new Date().toISOString().split("T")[0];

cards.forEach(c=>{

c.history?.forEach(h=>{

if(h.date.startsWith(today)){

reviewsToday++;

if(h.quality >= 3) correct++;
else wrong++;

}

});

});

const accuracy =
reviewsToday === 0 ? 0 :
(correct / reviewsToday) * 100;

return {
total,
reviewsToday,
accuracy: accuracy.toFixed(1)
};

}

}