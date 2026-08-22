import Postagem from '../models/Postagem.js';
import { filesToImagens, deleteImagens } from '../storage/local.js';

export async function list(req, res) {
  const sort = req.query.sort || '-createdAt';
  const postagens = await Postagem.find().sort(sort);
  res.json(postagens);
}

export async function create(req, res) {
  const { titulo, subtitulo, conteudo } = req.body;
  const imagens = filesToImagens(req.files);

  const postagem = await Postagem.create({ titulo, subtitulo, conteudo, imagens });
  res.status(201).json(postagem);
}

export async function update(req, res) {
  const { titulo, subtitulo, conteudo } = req.body;
  const postagem = await Postagem.findById(req.params.id);

  if (!postagem) {
    return res.status(404).json({ message: 'Postagem não encontrada' });
  }

  if (titulo !== undefined) postagem.titulo = titulo;
  if (subtitulo !== undefined) postagem.subtitulo = subtitulo;
  if (conteudo !== undefined) postagem.conteudo = conteudo;

  // Novas imagens enviadas são adicionadas às existentes (mesmo comportamento do PocketBase).
  const novasImagens = filesToImagens(req.files);
  if (novasImagens.length > 0) {
    postagem.imagens.push(...novasImagens);
  }

  await postagem.save();
  return res.json(postagem);
}

export async function remove(req, res) {
  const postagem = await Postagem.findByIdAndDelete(req.params.id);
  if (!postagem) {
    return res.status(404).json({ message: 'Postagem não encontrada' });
  }
  deleteImagens(postagem.imagens);
  return res.status(204).end();
}
