import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import OpenAI from "openai"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY

})

app.post("/chat", async (req,res)=>{

 try{

   const {message} = req.body

   const completion = await openai.chat.completions.create({
     model:"gpt-4o-mini",
     messages:[
       {
         role:"system",
         content:"Você é Watson, um assistente de estudos para concursos."
       },
       {
         role:"user",
         content:message
       }
     ]
   })

   res.json({
     reply: completion.choices[0].message.content
   })

 }catch(err){

   res.status(500).json({error:"Erro na IA"})

 }

})

app.listen(3000,()=>{
 console.log("Servidor rodando em http://localhost:3000")
})