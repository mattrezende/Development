import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';

// Não há self-signup: esta é a única forma de criar/atualizar a conta do painel admin.
// Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run create-admin --prefix apps/api
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (no .env ou na linha de comando).');
    process.exit(1);
  }

  await connectDB();

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { passwordHash },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Conta admin pronta: ${user.email}`);
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Falha ao criar/atualizar o admin:', error);
  process.exit(1);
});
