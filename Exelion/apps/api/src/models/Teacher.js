import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const teacherSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		passwordHash: { type: String, required: true, select: false },
		name: { type: String, required: true },
		professionalDescription: { type: String },
		contactPhone: { type: String },
		contactEmail: { type: String },
		baseAddress: { type: String },
		baseCity: { type: String },
		bannerImagePath: { type: String },
		profilePhotoPath: { type: String },
		mercadoPagoPublicKey: { type: String },
		mercadoPagoAccessToken: { type: String, select: false },
		instagramUsername: { type: String },
		singleLessonPrice: { type: Number },
	},
	{ timestamps: true },
);

// mercadoPagoAccessToken is intentionally NOT hidden here — it's `select: false` at the
// schema level instead, so it's excluded by default (e.g. public profile lookups) but the
// owner-facing routes (auth.js /me, teachers.js /me) can opt back in with .select('+mercadoPagoAccessToken')
// so the teacher can see their own connection status.
applyIdTransform(teacherSchema, ['passwordHash']);

const Teacher = mongoose.model('Teacher', teacherSchema);

export default Teacher;
