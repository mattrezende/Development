export class Scheduler {

static apply(card, quality){

if(quality < 3){
card.repetitions = 0;
card.interval = 1;
}else{

if(card.repetitions === 0) card.interval = 1;
else if(card.repetitions === 1) card.interval = 6;
else card.interval = Math.round(card.interval * card.easeFactor);

card.repetitions++;
}

card.easeFactor =
card.easeFactor +
(0.1 - (5-quality)*(0.08+(5-quality)*0.02));

if(card.easeFactor < 1.3) card.easeFactor = 1.3;

const date = new Date();
date.setDate(date.getDate() + card.interval);

card.nextReview = date.toISOString().split("T")[0];

}

static today(cards){

const today = new Date().toISOString().split("T")[0];

return cards.filter(c => c.nextReview <= today);

}

}