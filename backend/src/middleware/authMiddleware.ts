import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { TenantRequest } from '../types/index.js';

export const protect = async (req: TenantRequest, res: Response, next: NextFunction) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'supersecretkey'
    ) as any;

    // Reject a token minted for a different tenant before touching the database.
    if (decoded.tenant && decoded.tenant !== req.tenantDbName) {
      return res.status(401).json({
        success: false,
        message: 'This session belongs to a different store',
      });
    }

    const { Customer } = req.models!;
    const user = await Customer.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

export const admin = (req: TenantRequest, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Not authorized as an admin',
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
