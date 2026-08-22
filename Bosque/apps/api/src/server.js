import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 8090;

async function main() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`API do Bosque de Francisco rodando na porta ${PORT}`);
  });
}

main().catch((error) => {
  console.error('Falha ao iniciar a API:', error);
  process.exit(1);
});
