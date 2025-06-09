import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  firm: {
    type: String,
    enum: ['Mohit Industries', 'L.K. Industries', 'Shri Sanwariya Trading Company'],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  products: [
    {
      description: String,
      quantity: Number,
      weight: Number,
      rate: Number,
      total: Number,
    }
  ],
  tax: {
    cgst: Number,
    sgst: Number,
    igst: Number,
  },
  totalAmount: Number,
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
export default Purchase;
