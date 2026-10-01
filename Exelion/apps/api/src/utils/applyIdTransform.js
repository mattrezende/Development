// Mongo's _id is an ObjectId; the frontend (ported from PocketBase, where every
// record had a plain `id` string) expects `.id`. This keeps that contract instead
// of touching every call site across the app.
function applyIdTransform(schema, hiddenFields = []) {
	schema.set('toJSON', {
		virtuals: true,
		transform: (_doc, ret) => {
			ret.id = ret._id.toString();
			delete ret._id;
			delete ret.__v;
			for (const field of hiddenFields) delete ret[field];
			return ret;
		},
	});
}

export default applyIdTransform;
export { applyIdTransform };
