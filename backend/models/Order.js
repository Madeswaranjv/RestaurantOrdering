import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  customization: { type: mongoose.Schema.Types.Map, of: String, default: {} }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  grandTotal: { type: Number, required: true },
  status: {
    type: String,
    enum: ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PLACED',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'RAZORPAY', 'STRIPE'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED'],
    default: 'PENDING',
    index: true
  },
  deliveryAddress: { type: String, required: true },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  trackingUrl: { type: String, default: '' }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
