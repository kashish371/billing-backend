import express from 'express';
import {
  createInvoice,
  getInvoicePDF,
  searchInvoices,
  getSalesGraphData,
} from '../controllers/invoiceController.js';
import { updateAmountPaid } from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/', createInvoice);
router.get('/pdf/:id', getInvoicePDF);
router.get('/customer', searchInvoices);


router.put('/:id/payment', updateAmountPaid);


router.get('/sales-graph', getSalesGraphData);

export default router;