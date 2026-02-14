import express from 'express';

const app = express();
const porta = 3000;

app.use(express.json()); // 👈 importante

const user = [];

app.get('/', (req, res) => {
  res.send('Home do servidor');
});

app.get('/usuarios', (req, res) => {
  res.status(200).json(user)
});


app.post('/usuarios', (req, res) => {
  user.push(req.body);
  res.status(201).json({ message: 'Usuário criado com sucesso!' });
});



app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});

// user: mattrezende    password: DevClubrezende