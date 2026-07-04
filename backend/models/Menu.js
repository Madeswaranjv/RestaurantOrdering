import mongoose from 'mongoose';

const customizationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Size", "Spiciness"
  options: [{ type: String, required: true }] // e.g. ["Regular", "Large"] or ["Mild", "Hot"]
}, { _id: false });

const menuSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  images: [{ type: String }],
  price: { type: Number, required: true, min: 0 },
  ingredients: [{ type: String, trim: true }],
  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fats: { type: Number, default: 0 }
  },
  featured: { type: Boolean, default: false },
  rating: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
  isAvailable: { type: Boolean, default: true, index: true },
  customizationOptions: [customizationOptionSchema]
}, {
  timestamps: true
});

// Text index for search
menuSchema.index({ name: 'text', description: 'text', ingredients: 'text' });

const Menu = mongoose.model('Menu', menuSchema);
export default Menu;
