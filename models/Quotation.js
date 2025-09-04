import mongoose from 'mongoose';

const quotationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  },
  productCategory: {
    type: String,
    required: true
  },
  product: {
    type: String,
    required: true
  },
  items: [{
    product: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    required: false
  },
  fileUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

quotationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Quotation', quotationSchema);