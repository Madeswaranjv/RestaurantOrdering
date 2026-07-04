import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  cuisines: [{ type: String, trim: true }],
  gallery: [{ type: String }],
  coverImage: { type: String, default: '' },
  address: { type: String, required: true },
  openingHours: { type: String, required: true }, // e.g. "09:00 AM - 10:00 PM"
  contactInfo: {
    email: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  rating: { type: Number, default: 5.0, min: 1.0, max: 5.0 }
}, {
  timestamps: true
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;
