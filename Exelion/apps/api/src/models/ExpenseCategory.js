import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const expenseCategorySchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		name: { type: String, required: true },
		color: { type: String },
	},
	{ timestamps: true },
);

applyIdTransform(expenseCategorySchema);

const ExpenseCategory = mongoose.model('ExpenseCategory', expenseCategorySchema);

export default ExpenseCategory;
