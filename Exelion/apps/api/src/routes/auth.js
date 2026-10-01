import express from 'express';
import bcrypt from 'bcryptjs';
import { Teacher } from '../models/index.js';
import authMiddleware from '../middleware/auth.js';
import { COOKIE_NAME, signToken, cookieOptions } from '../utils/token.js';
import logger from '../utils/logger.js';

const router = express.Router();
const SALT_ROUNDS = 10;

router.post('/signup', async (req, res) => {
	const { email, password, name, professionalDescription } = req.body;

	if (!email || !password || !name) {
		return res.status(400).json({ error: 'email, password and name are required' });
	}

	if (password.length < 8) {
		return res.status(400).json({ error: 'Password must be at least 8 characters' });
	}

	const existing = await Teacher.findOne({ email: email.toLowerCase() });
	if (existing) {
		return res.status(409).json({ error: 'An account with this email already exists' });
	}

	const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
	const teacher = await Teacher.create({
		email,
		passwordHash,
		name,
		professionalDescription,
	});

	res.cookie(COOKIE_NAME, signToken(teacher._id), cookieOptions());
	logger.info(`New teacher signed up: ${teacher._id}`);
	res.status(201).json({ teacher });
});

router.post('/login', async (req, res) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: 'email and password are required' });
	}

	const teacher = await Teacher.findOne({ email: email.toLowerCase() }).select('+passwordHash +mercadoPagoAccessToken');

	if (!teacher) {
		return res.status(401).json({ error: 'Invalid email or password' });
	}

	const valid = await bcrypt.compare(password, teacher.passwordHash);
	if (!valid) {
		return res.status(401).json({ error: 'Invalid email or password' });
	}

	res.cookie(COOKIE_NAME, signToken(teacher._id), cookieOptions());
	res.json({ teacher });
});

router.post('/logout', (req, res) => {
	res.clearCookie(COOKIE_NAME, { path: '/' });
	res.json({ success: true });
});

router.get('/me', authMiddleware, async (req, res) => {
	const teacher = await Teacher.findById(req.teacher._id).select('+mercadoPagoAccessToken');
	res.json({ teacher });
});

router.post('/password-reset', (req, res) => {
	res.status(501).json({
		error: 'Password reset via email is not available yet. Please contact support.',
	});
});

export default router;
