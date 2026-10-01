import jwt from 'jsonwebtoken';
import { NodeEnv } from '../constants/common.js';

const COOKIE_NAME = 'exelion_session';
const TOKEN_TTL = '7d';

function signToken(teacherId) {
	return jwt.sign({ sub: String(teacherId) }, process.env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function verifyToken(token) {
	return jwt.verify(token, process.env.JWT_SECRET);
}

function cookieOptions() {
	return {
		httpOnly: true,
		secure: process.env.NODE_ENV === NodeEnv.Production,
		sameSite: 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000,
		path: '/',
	};
}

export { COOKIE_NAME, signToken, verifyToken, cookieOptions };
