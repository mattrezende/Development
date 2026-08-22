import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não configurada (ver apps/api/.env.example)');
  }

  mongoose.connection.on('error', (error) => {
    console.error('Erro de conexão com o MongoDB:', error);
  });

  await mongoose.connect(uri);
  console.log('Conectado ao MongoDB');
}
