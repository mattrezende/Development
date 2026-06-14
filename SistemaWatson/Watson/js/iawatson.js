async function enviarPergunta(){

 const input = document.getElementById("pergunta")
 const respostaDiv = document.getElementById("resposta")

 const mensagem = input.value.trim()

 if(!mensagem) return

 respostaDiv.textContent = "Watson está pensando..."

 try{

   const res = await fetch("http://localhost:3000/chat",{

     method:"POST",
     headers:{
       "Content-Type":"application/json"
     },
     body:JSON.stringify({
       message:mensagem
     })

   })

   const data = await res.json()

   respostaDiv.textContent = data.reply

   input.value = ""

 }catch(err){

   respostaDiv.textContent = "Erro ao falar com o Watson."

 }

}