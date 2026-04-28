import express from 'express';
import { getStoreSettings } from '../controllers/storeController.js';

const router = express.Router();

router.get('/', getStoreSettings);

export default router;
