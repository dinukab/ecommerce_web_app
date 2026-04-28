import { Request, Response } from 'express';
import StoreSetting from '../models/StoreSetting.js';

export const getStoreSettings = async (req: Request, res: Response) => {
  try {
    // Fetch the primary store setting (assuming single store for now)
    // You can also filter by a specific storeId if needed: { storeId: '69e539fd180ff885ce56ca57' }
    const settings = await StoreSetting.findOne({ storeId: '69e539fd180ff885ce56ca57' });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Store settings not found'
      });
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
