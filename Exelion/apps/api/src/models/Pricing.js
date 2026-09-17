import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const pricingSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		type: { type: String, enum: ['avulso', 'semanal'], required: true },
		quantity: { type: Number, required: true, min: 1, max: 5 },
		price: { type: Number, required: true, min: 0 },
	},
	{ timestamps: true },
);

applyIdTransform(pricingSchema);

const Pricing = mongoose.model('Pricing', pricingSchema);

export default Pricing;
