import mongoose from 'mongoose';
import applyIdTransform from '../utils/applyIdTransform.js';

const expenseSchema = new mongoose.Schema(
	{
		teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, index: true },
		categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory', required: true },
		amount: { type: Number, required: true, min: 0 },
		description: { type: String },
		date: { type: Date, required: true },
	},
	{ timestamps: true },
);

applyIdTransform(expenseSchema);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
