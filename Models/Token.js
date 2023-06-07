import mongoose, { Schema } from 'mongoose';

const tokenSchema = Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  verified: {
    type: Boolean,
    default: false
}
});

export default mongoose.model('Token', tokenSchema);
