import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const enrollmentSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
		scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', index: true },

		firstName: { type: String },
		lastName: { type: String },
		email: { type: String },
		cpf: { type: String },
		documentType: { type: String },
		areaCode: { type: String },
		phoneNumber: { type: String },
		zipCode: { type: String },
		street: { type: String },
		streetNumber: { type: String },
		neighborhood: { type: String },
		city: { type: String },
		state: { type: String },

		enrollmentType: { type: String, enum: ['avulso', 'semanal'] },
		lessonType: { type: String, enum: ['weekly', 'single'] },
		quantity: { type: Number, default: 1 },
		unitPrice: { type: Number, default: 0 },
		totalPrice: { type: Number, default: 0 },

		paymentStatus: {
			type: String,
			enum: ['pending', 'approved', 'rejected'],
			default: 'pending',
		},
		paymentId: { type: String },
		paymentMethod: { type: String, enum: ['pix', 'credit_card', 'debit_card', 'recurring'] },

		status: { type: String, enum: ['active', 'inactive'], default: 'active' },
		enrollmentDate: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

enrollmentSchema.index({ teacherId: 1, paymentStatus: 1 });

applyIdTransform(enrollmentSchema);

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;
