import { Router } from 'express';
import authRoutes from './auth.routes.js';
import eventosRoutes from './eventos.routes.js';
import postagensRoutes from './postagens.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);
router.use('/postagens', postagensRoutes);

export default router;
