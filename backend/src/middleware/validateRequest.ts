import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Generic Zod v4 validation middleware factory.
 * Usage: router.post('/route', validateRequest(schema), handler)
 */
export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      res.status(400).json({
        success: false,
        message: errors[0]?.message ?? 'Validation failed.',
        errors,
      });
      return;
    }

    // Replace req.body with the parsed (sanitised/coerced) data
    req.body = result.data;
    next();
  };
};
