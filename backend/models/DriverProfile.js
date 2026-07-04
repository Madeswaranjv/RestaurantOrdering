import mongoose from 'mongoose';

const driverProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  vehicleType: {
    type: String,
    required: true,
    default: 'Bicycle'
  },
  vehicleNumber: {
    type: String,
    required: true,
    default: 'N/A'
  },
  licenseNumber: {
    type: String,
    required: true,
    default: 'N/A'
  },
  isOnline: {
    type: Boolean,
    default: false,
    index: true
  },
  averageRating: {
    type: Number,
    default: 5.0,
    min: 1.0,
    max: 5.0
  },
  completedDeliveries: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const DriverProfile = mongoose.model('DriverProfile', driverProfileSchema);
export default DriverProfile;
