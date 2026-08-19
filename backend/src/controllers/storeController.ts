import { Response } from 'express';
import type { TenantRequest } from '../types/index.js';

export const getStoreSettings = async (req: TenantRequest, res: Response) => {
  try {
    const { StoreSetting } = req.models!;

    // One storesettings document per tenant database — no storeId filter needed,
    // the database itself is the tenant boundary.
    const settings = await StoreSetting.findOne({});

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
