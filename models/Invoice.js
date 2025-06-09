import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  firm: String,
  invoiceNo: String,
  date: Date,
  customer: {
    name: String,
    address: String,
    gstin: String,
    state: String,
    stateCode: String,
  },
  transport: {
    name: String,
    biltyNo: String,
    vehicleNo: String,
    driver: String,
    license: String,
    mobile: String,
  },
  items: [
    {
      description: String,
      hsn: String,
      quantity: Number,
      weight: Number,
      rate: Number,
      total: Number,
    },
  ],
  tax: {
    cgst: Number,
    sgst: Number,
    igst: Number,
  },
  totalAmount: Number,

  amountPaid: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'partial', 'due'], 
    default: 'due' 
  },
});


export default mongoose.model('Invoice', invoiceSchema);
