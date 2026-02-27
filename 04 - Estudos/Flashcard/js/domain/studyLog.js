import { Store } from "../core/store.js";

export class StudyLog {

constructor(){
this.log = Store.load("studyLog", {});
}

save(){
Store.save("studyLog", this.log);
}

add(count = 1){

const today = new Date().toISOString().split("T")[0];

if(!this.log[today]) this.log[today] = 0;

this.log[today] += count;

this.save();

}

getAll(){
return this.log;
}

}