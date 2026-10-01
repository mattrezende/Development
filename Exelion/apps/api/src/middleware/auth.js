import { Teacher } from '../models/index.js';
import { COOKIE_NAME, verifyToken } from '../utils/token.js';

async function authMiddleware(req, res, next) {
	const token = req.cookies?.[COOKIE_NAME];

	if (!token) {
		return res.status(401).json({ error: 'Not authenticated' });
	}

	let payload;
	try {
		payload = verifyToken(token);
	} catch {
		return res.status(401).json({ error: 'Invalid or expired session' });
	}

	const teacher = await Teacher.findById(payload.sub);

	if (!teacher) {
		return res.status(401).json({ error: 'Invalid or expired session' });
	}

	req.teacher = teacher;
	next();
}

export default authMiddleware;
export { authMiddleware };
