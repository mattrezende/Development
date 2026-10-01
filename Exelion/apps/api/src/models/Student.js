import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const studentSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		name: { type: String, required: true },
		email: { type: String },
		phone: { type: String },
		address: { type: String },
		cep: { type: String },
		healthNotes: { type: String },
		status: { type: String, enum: ['active', 'pending', 'cancelled'], default: 'pending' },
		dateOfBirth: { type: Date },
	},
	{ timestamps: true },
);

applyIdTransform(studentSchema);

const Student = mongoose.model('Student', studentSchema);

export default Student;
