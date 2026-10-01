import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const notificationSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		type: {
			type: String,
			enum: [
				'new_enrollment',
				'payment_approved',
				'payment_failed',
				'schedule_booked',
				'student_cancelled',
				'new_student',
			],
			required: true,
		},
		title: { type: String, required: true },
		message: { type: String },
		relatedData: { type: mongoose.Schema.Types.Mixed },
		read: { type: Boolean, default: false },
	},
	{ timestamps: true },
);

notificationSchema.index({ teacherId: 1, read: 1 });

applyIdTransform(notificationSchema);

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
