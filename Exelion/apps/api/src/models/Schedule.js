import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const scheduleSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		dayOfWeek: {
			type: String,
			enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
			required: true,
		},
		startTime: { type: String, required: true },
		endTime: { type: String, required: true },
		recurrence: { type: String, enum: ['weekly', 'once'], default: 'weekly' },
		availabilityStatus: {
			type: String,
			enum: ['Disponível', 'Reservado', 'Ocupado'],
			default: 'Disponível',
			index: true,
		},
		reservedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

applyIdTransform(scheduleSchema);

const Schedule = mongoose.model('Schedule', scheduleSchema);

export default Schedule;
