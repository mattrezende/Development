import express from 'express';
import cors from 'cors';
import { UPLOAD_ROOT } from './storage/local.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_ROOT));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
