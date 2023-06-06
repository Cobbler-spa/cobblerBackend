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
});

export default mongoose.model('Token', tokenSchema);
