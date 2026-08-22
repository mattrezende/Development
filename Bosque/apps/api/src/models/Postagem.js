import mongoose from 'mongoose';

const imagemSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    url: { type: String, required: true }
  },
  { _id: false }
);

const postagemSchema = new mongoose.Schema(
  {
    titulo: { type: String, required: true, trim: true },
    subtitulo: { type: String, trim: true },
    conteudo: { type: String, required: true, maxlength: 50000 },
    imagens: { type: [imagemSchema], default: [] }
  },
  { timestamps: true }
);

postagemSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export default mongoose.model('Postagem', postagemSchema);
