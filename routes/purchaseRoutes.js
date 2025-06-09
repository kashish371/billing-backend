import express from 'express';
import { createPurchase, getAllPurchases } from '../controllers/purchaseController.js';

const router = express.Router();

router.post('/', createPurchase);
router.get('/', getAllPurchases);

export default router;