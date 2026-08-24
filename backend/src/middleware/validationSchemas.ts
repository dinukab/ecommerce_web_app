import { z } from 'zod';



/* Name validation rules: 2-80 characters/letters only*/
const nameSchema = z
  .string({ error: 'Full name is required.' })
  .trim()
  .min(2, 'Name must be at least 2 characters.')
  .max(80, 'Name must be at most 80 characters.')
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}\s'\-\.]*[\p{L}\p{M}\.']?$/u,
    'Name must contain only letters (any language), spaces, hyphens, or apostrophes.'
  );

/*Email validation rules*/
const emailSchema = z
  .string({ error: 'Email address is required.' })
  .trim()
  .toLowerCase()
  .min(5, 'Email address is too short.')
  .max(254, 'Email address is too long.')
  .email('Please enter a valid email address.');

/*Sri Lankan mobile number validation (must start with 07 and be 10 digits)*/
const sriLankanPhoneSchema = z
  .string({ error: 'Phone number is required.' })
  .trim()
  .transform((val) => val.replace(/[\s\-\(\)]/g, '')) // strip formatting
  .refine(
    (val) => /^\d+$/.test(val),
    { message: 'Phone number must contain only digits.' }
  )
  .refine(
    (val) => val.startsWith('07'),
    { message: 'Phone number must start with 07.' }
  )
  .refine(
    (val) => val.length === 10,
    { message: 'Phone number must be exactly 10 digits (e.g. 0771234567).' }
  );

/**
 * Password strength rules:
 *  - 8–128 characters
 *  - At least one uppercase letter
 *  - At least one lowercase letter
 *  - At least one digit
 */
const passwordSchema = z
  .string({ error: 'Password is required.' })
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password must be at most 128 characters.')
  .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
  .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
  .regex(/[0-9]/, 'Password must include at least one number.');

//REQUEST SCHEMAS//

/** POST /api/auth/register */
export const registerSchema = z.preprocess(
  (data: any) => {
    if (data && typeof data === 'object') {
      if (!data.name && data.fullName) {
        return { ...data, name: data.fullName };
      }
    }
    return data;
  },
  z.object({
    name: nameSchema,
    fullName: z.string().optional(),
    email: emailSchema,
    password: passwordSchema,
    phone: z.union([sriLankanPhoneSchema, z.literal(''), z.undefined()]).optional(),
  })
);

/** POST /api/auth/login */
export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ error: 'Password is required.' })
    .min(1, 'Password is required.'),
  rememberMe: z.boolean().optional().default(false),
});

/** PUT /api/auth/profile — all fields optional */
export const updateProfileSchema = z
  .object({
    name: nameSchema.optional(),
    phone: z.union([sriLankanPhoneSchema, z.literal('')]).optional(),
  })
  .refine((data) => data.name !== undefined || data.phone !== undefined, {
    message: 'Provide at least one field to update (name or phone).',
  });

/** PUT /api/auth/password */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string({ error: 'Current password is required.' })
    .min(1, 'Current password is required.'),
  newPassword: passwordSchema,
});

/** POST /api/auth/forgot-password */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// ─────────────────────────────────────────────────────────────────────────────
// ORDER SCHEMAS
// ─────────────────────────────────────────────────────────────────────────────

const orderItemSchema = z.object({
  product: z.string().min(1, 'Product ID is required.'),
  name: z.string().min(1, 'Product name is required.'),
  quantity: z.number().positive('Quantity must be a positive number.'),
  price: z.number().min(0, 'Price must be a positive number.'),
  image: z.string().optional().default(''),
});

const shippingAddressSchema = z.object({
  fullName: nameSchema,
  addressLine1: z.string().trim().min(3, 'Address line 1 is required.'),
  addressLine2: z.string().trim().optional().default(''),
  city: z.string().trim().min(1, 'City is required.'),
  district: z.string().trim().min(1, 'District is required.'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Postal code must be exactly 5 digits.'),
  phone: sriLankanPhoneSchema,
});

/** POST /api/orders */
export const createOrderSchema = z.object({
  orderItems: z
    .array(orderItemSchema)
    .min(1, 'At least one order item is required.'),
  shippingAddress: shippingAddressSchema,
  deliveryMethod: z
    .enum(['standard', 'express', 'pickup'], {
      error: 'Invalid delivery method.',
    })
    .default('standard'),
  paymentMethod: z
    .enum(['cash-on-delivery', 'payhere'], {
      error: 'Invalid payment method.',
    })
    .default('cash-on-delivery'),
  orderNotes: z.string().max(500, 'Order notes must be at most 500 characters.').optional().default(''),
});
