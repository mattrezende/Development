import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const termsAndConditionSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, unique: true, index: true },
		contentText: { type: String },
		documentUrlPath: { type: String },
	},
	{ timestamps: true },
);

applyIdTransform(termsAndConditionSchema);

const TermsAndCondition = mongoose.model('TermsAndCondition', termsAndConditionSchema);

export default TermsAndCondition;
