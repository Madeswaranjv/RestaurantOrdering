import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  subject: { type: String, trim: true, default: 'General Inquiry' },
  message: { type: String, required: true, trim: true },
  resolved: { type: Boolean, default: false }
}, {
  timestamps: true
});

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
