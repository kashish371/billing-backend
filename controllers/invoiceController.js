import Invoice from '../models/Invoice.js';
import { generateInvoicePDF } from '../utils/pdfGenerator.js';

export const createInvoice = async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    generateInvoicePDF(invoice, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchInvoices = async (req, res) => {
  try {
    const { name } = req.query;
    const invoices = await Invoice.find({ 'customer.name': { $regex: name, $options: 'i' } });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const updateAmountPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { amountPaid } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    invoice.amountPaid = amountPaid;

    // Update payment status
    if (amountPaid >= invoice.totalAmount) {
      invoice.paymentStatus = 'paid';
    } else if (amountPaid > 0) {
      invoice.paymentStatus = 'partial';
    } else {
      invoice.paymentStatus = 'due';
    }

    await invoice.save();

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getSalesGraphData = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: {
            firm: '$firm',
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          totalSales: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ];

    const results = await Invoice.aggregate(pipeline);

    const formatted = {};
    results.forEach(({ _id, totalSales }) => {
      const key = `${_id.month}/${_id.year}`;
      if (!formatted[key]) formatted[key] = { month: key };
      formatted[key][_id.firm] = totalSales;
    });

    res.json(Object.values(formatted));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load sales data' });
  }
};
