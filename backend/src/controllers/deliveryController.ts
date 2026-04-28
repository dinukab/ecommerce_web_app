import { Request, Response } from 'express';
import DeliveryZone from '../models/DeliveryZone.js';

// GET /api/delivery/zones
export const getDeliveryZones = async (req: Request, res: Response) => {
  try {
    const zones = await DeliveryZone.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: zones });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/delivery/calculate
export const calculateDeliveryFee = async (req: Request, res: Response) => {
  try {
    const { district, deliveryMethod } = req.body;
    
    if (!district) {
      return res.status(400).json({ success: false, message: 'District is required' });
    }

    if (deliveryMethod === 'pickup') {
      return res.json({ 
        success: true, 
        data: { 
          fee: 0, 
          estimatedDays: 0,
          zoneName: 'Pickup'
        } 
      });
    }

    const zone = await DeliveryZone.findOne({ 
      districts: { $regex: new RegExp(`^${district}$`, 'i') },
      isActive: true 
    });

    if (!zone) {
      return res.status(404).json({ 
        success: false, 
        message: 'No delivery zone found for this district' 
      });
    }

    let fee = zone.deliveryFee;
    let days = zone.estimatedDays;

    if (deliveryMethod === 'express') {
      fee = fee * 1.5;
      days = Math.max(1, Math.ceil(days / 2));
    }

    res.json({ 
      success: true, 
      data: { 
        fee, 
        estimatedDays: days,
        zoneName: zone.name,
        zoneId: zone._id
      } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/delivery/zones (Admin Only)
export const createDeliveryZone = async (req: Request, res: Response) => {
  try {
    const zone = await DeliveryZone.create(req.body);
    res.status(201).json({ success: true, data: zone });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
