import mongoose from 'mongoose';

const eventoSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    subtitulo: { type: String, trim: true },
    data: { type: Date, required: true },
    horario: { type: String, required: true, trim: true },
    local: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

eventoSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Evento', eventoSchema);
