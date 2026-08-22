export function notFound(_req, res) {
  res.status(404).json({ message: 'Rota não encontrada' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({ message: error.message });
  }

  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Identificador inválido' });
  }

  const status = error.status || 500;
  res.status(status).json({ message: error.message || 'Erro interno do servidor' });
}
