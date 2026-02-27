import express from 'express';
import { PrismaClient } from '../generated/prisma/client'

const app = express();
const porta = 3000;

app.use(express.json()); // 👈 importante

const prisma = new PrismaClient();

app.get('/', (req, res) => {
  res.send('Home do servidor');
});

app.get('/usuarios', (req, res) => {
  res.status(200).json(user)
});


app.post('/usuarios', async (req, res) => {
  await prima.user.create({
    data: {
      email: req.body.email,
      age: req.body.age,
      name: req.body.name
    }
  })

  res.status(201).json({ message: 'Usuário criado com sucesso!' });
});



app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});

// user: mattrezende    password: DevClubrezende