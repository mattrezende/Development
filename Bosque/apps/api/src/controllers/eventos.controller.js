import Evento from '../models/Evento.js';

export async function list(req, res) {
  const sort = req.query.sort || 'data';
  const eventos = await Evento.find().sort(sort);
  res.json(eventos);
}

export async function create(req, res) {
  const evento = await Evento.create(req.body);
  res.status(201).json(evento);
}

export async function update(req, res) {
  const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!evento) {
    return res.status(404).json({ message: 'Evento não encontrado' });
  }
  return res.json(evento);
}

export async function remove(req, res) {
  const evento = await Evento.findByIdAndDelete(req.params.id);
  if (!evento) {
    return res.status(404).json({ message: 'Evento não encontrado' });
  }
  return res.status(204).end();
}
