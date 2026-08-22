import { Router } from 'express';
import { list, create, update, remove } from '../controllers/postagens.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadPostagemImagens } from '../storage/local.js';

const router = Router();

router.get('/', asyncHandler(list));
router.post('/', requireAuth, uploadPostagemImagens, asyncHandler(create));
router.put('/:id', requireAuth, uploadPostagemImagens, asyncHandler(update));
router.delete('/:id', requireAuth, asyncHandler(remove));

export default router;
