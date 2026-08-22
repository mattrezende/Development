import { Router } from 'express';
import { list, create, update, remove } from '../controllers/eventos.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(list));
router.post('/', requireAuth, asyncHandler(create));
router.put('/:id', requireAuth, asyncHandler(update));
router.delete('/:id', requireAuth, asyncHandler(remove));

export default router;
