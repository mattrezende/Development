import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const serviceAreaSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		cepRangeStart: { type: String, required: true },
		cepRangeEnd: { type: String, required: true },
	},
	{ timestamps: true },
);

applyIdTransform(serviceAreaSchema);

const ServiceArea = mongoose.model('ServiceArea', serviceAreaSchema);

export default ServiceArea;
