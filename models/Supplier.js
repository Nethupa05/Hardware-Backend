import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  agreementStartDate: {
    type: Date,
    required: true
  },
  agreementEndDate: {
    type: Date,
    required: true
  },
  productsSupplied: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying of expired agreements
supplierSchema.index({ agreementEndDate: 1, isActive: 1 });

// Static method to find suppliers with expired agreements
supplierSchema.statics.findExpiredAgreements = function() {
  const today = new Date();
  return this.find({ 
    agreementEndDate: { $lt: today }, 
    isActive: true 
  });
};

// Method to check if agreement is expired
supplierSchema.methods.isAgreementExpired = function() {
  return new Date() > this.agreementEndDate;
};

export default mongoose.model('Supplier', supplierSchema);