// ===============================
// CLASSE USER PROFILE
// ===============================

class UserProfile {

constructor(){
this.avatarPreview = document.getElementById("avatarPreview");
this.profileInput = document.getElementById("profileImage");
this.userNameInput = document.getElementById("userName");
this.saveBtn = document.getElementById("saveProfile");

this.init();
}

init(){
this.loadProfile();
this.bindEvents();
}

bindEvents(){

// clicar na imagem abre seletor
this.avatarPreview.addEventListener("click", () => {
this.profileInput.click();
});

// ao selecionar imagem
this.profileInput.addEventListener("change", async (e) => {
const file = e.target.files[0];
if(!file) return;

const compressed = await this.compressImage(file);

this.avatarPreview.src = compressed;
this.saveToStorage({ photo: compressed });
});

// salvar nome
this.saveBtn.addEventListener("click", () => {
this.saveToStorage({ name: this.userNameInput.value });
alert("Perfil salvo com sucesso!");
});
}

// ===============================
// COMPRESSÃO DE IMAGEM
// ===============================

compressImage(file, maxWidth = 300){

return new Promise(resolve => {

const img = new Image();
const reader = new FileReader();

reader.onload = e => img.src = e.target.result;

img.onload = () => {

const canvas = document.createElement("canvas");
const scale = maxWidth / img.width;

canvas.width = maxWidth;
canvas.height = img.height * scale;

const ctx = canvas.getContext("2d");
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

resolve(canvas.toDataURL("image/jpeg", 0.7));
};

reader.readAsDataURL(file);

});

}

// ===============================
// STORAGE
// ===============================

saveToStorage(data){

let stored = JSON.parse(localStorage.getItem("userProfile")) || {};

let updated = { ...stored, ...data };

localStorage.setItem("userProfile", JSON.stringify(updated));

}

loadProfile(){

let stored = JSON.parse(localStorage.getItem("userProfile"));

if(!stored) return;

if(stored.photo){
this.avatarPreview.src = stored.photo;
}

if(stored.name){
this.userNameInput.value = stored.name;
}

}

}

// ===============================
// INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
new UserProfile();
});