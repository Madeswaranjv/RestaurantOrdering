import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  customization: { type: mongoose.Schema.Types.Map, of: String, default: {} } // e.g., { Size: "Large", Spiciness: "Mild" }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [cartItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 }
}, {
  timestamps: true
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
