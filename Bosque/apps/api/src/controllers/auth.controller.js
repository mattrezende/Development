import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  const valid = user && (await user.comparePassword(password));

  if (!valid) {
    return res.status(401).json({ message: 'Email ou senha incorretos' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  return res.json({ token, user: user.toJSON() });
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado' });
  }
  return res.json({ user: user.toJSON() });
}
