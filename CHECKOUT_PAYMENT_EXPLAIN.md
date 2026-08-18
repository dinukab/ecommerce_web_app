# Comprehensive Checkout & Payment System Explanation

This document provides a detailed explanation of the complete checkout and payment workflow, including frontend responsibilities, backend logic, API routes, and database models for your e-commerce application.

---

## Table of Contents

1. [Frontend Responsibilities](#frontend-responsibilities)
2. [Backend Responsibilities](#backend-responsibilities)
3. [API Routes](#api-routes)
4. [Database Models](#database-models)
5. [Complete Flow Diagram](#complete-flow-diagram)

---

## Frontend Responsibilities

### 1. Checkout Page (`frontend/src/app/checkout/page.tsx`)

The checkout page serves as the main interface for users to complete their purchase. It's a single-page form (currently) that handles all 5 checkout steps in one view.

#### Key State Variables:

```typescript
const [formData, setFormData] = useState({
  fullName: '',                 // Customer's full name
  email: '',                    // Customer's email address
  phone: '',                    // Customer's contact number
  addressLine1: '',             // Primary address
  addressLine2: '',             // Secondary/Apartment number (optional)
  city: '',                     // City name
  district: '',                 // District (from DISTRICTS array)
  postalCode: '',               // Postal code
  deliveryMethod: 'standard',   // 'standard', 'express', or 'pickup'
  paymentMethod: 'cash-on-delivery', // 'cash-on-delivery' or 'payhere'
  orderNotes: ''                // Special delivery instructions
});

const [deliveryData, setDeliveryData] = useState({ 
  fee: 0,                       // Calculated delivery fee in LKR
  days: 0                       // Estimated delivery days
});

const [loading, setLoading] = useState(false);     // Form submission state
const [error, setError] = useState('');            // Error messages
const [verifyingAuth, setVerifyingAuth] = useState(true); // Auth verification state
```

#### Initialization & Authentication (`useEffect` Hook 1):

**Purpose**: Verify user authentication and pre-fill form data

**Logic**:
1. **Check Cart**: If cart is empty, redirect user to home page to prevent checkout without items
2. **Verify Authentication**: Check if `auth_token` exists in localStorage
   - If no token → redirect to `/login?redirect=/checkout`
3. **Fetch User Data**: Call `api.getMe(token)` to get logged-in user's profile
4. **Pre-fill Form**: Auto-populate `fullName`, `email`, and `phone` fields with user data
5. **Error Handling**: If token is invalid or expired, clear it and redirect to login

```typescript
useEffect(() => {
  if (cart.length === 0) {
    router.push('/');
    return;
  }

  const verifyAuth = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/login?redirect=/checkout');
      return;
    }

    try {
      const res = await api.getMe(token);
      if (res.success && res.data) {
        const user = res.data;
        setFormData(prev => ({
          ...prev,
          fullName: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        }));
      }
    } catch (err: any) {
      if (err.message.includes('authorized') || err.message.includes('token')) {
        localStorage.removeItem('auth_token');
        router.replace('/login?redirect=/checkout');
      }
    } finally {
      setVerifyingAuth(false);
    }
  };

  verifyAuth();
}, [cart, router]);
```

#### Delivery Fee Calculation (`useEffect` Hook 2):

**Purpose**: Calculate delivery fee based on district and delivery method

**Triggers**: When `formData.district` or `formData.deliveryMethod` changes

**Logic**:
1. Skip calculation if district is not selected
2. Call backend API: `POST /api/delivery/calculate`
3. Backend returns: `{ fee, estimatedDays, zoneName, zoneId }`
4. Update `deliveryData` state with calculated values
5. This fee is then added to the cart total for display

```typescript
useEffect(() => {
  const calculateFee = async () => {
    if (!formData.district) return;
    try {
      const res = await api.calculateDeliveryFee({
        district: formData.district,
        deliveryMethod: formData.deliveryMethod
      });
      if (res.success && res.data) {
        const data = res.data;
        setDeliveryData({ fee: data.fee, days: data.estimatedDays });
      }
    } catch (err) {
      console.error('Fee calculation error:', err);
    }
  };
  calculateFee();
}, [formData.district, formData.deliveryMethod]);
```

#### Form Input Handling:

**Function**: `handleChange()`

**Purpose**: Update form state as user types

**Logic**: Updates the `formData` object with new values from any input/select/textarea

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};
```

#### Order Submission (`handleSubmit` - Core Function):

**Purpose**: Validate form, prepare order data, send to backend, and handle payment

**Detailed Flow**:

**Step 1: Validation**
```typescript
// Check if user is still authenticated
const token = localStorage.getItem('auth_token');
if (!token) {
  router.push('/login?redirect=/checkout');
  return;
}

// Validate required fields
if (!formData.district) {
  setError('Please select a delivery district.');
  return;
}
if (!formData.addressLine1 || !formData.city || !formData.postalCode) {
  setError('Please fill in all required address fields.');
  return;
}
```

**Step 2: Prepare Order Data**
```typescript
const orderData = {
  // Map cart items to order format (from CartContext)
  orderItems: cart.map(item => ({
    product: item._id,              // Product ID from database
    name: item.name,                // Product name
    quantity: item.quantity,        // Quantity in cart
    price: item.sellingPrice,       // Price from cart (re-validated on backend)
    image: item.images?.[0] || ''   // Product image URL
  })),
  
  // Customer shipping information
  shippingAddress: {
    fullName: formData.fullName,
    addressLine1: formData.addressLine1,
    addressLine2: formData.addressLine2,
    city: formData.city,
    district: formData.district,
    postalCode: formData.postalCode,
    phone: formData.phone
  },
  
  // Delivery & payment options
  deliveryMethod: formData.deliveryMethod,     // 'standard', 'express', 'pickup'
  paymentMethod: formData.paymentMethod,       // 'cash-on-delivery', 'payhere'
  orderNotes: formData.orderNotes              // Special instructions
};
```

**Step 3: API Call to Create Order**
```typescript
const res = await api.createOrder(token, orderData);
```

The backend will:
- Validate all product stock
- Re-calculate all prices from database (security measure)
- Calculate delivery fees
- Save order to database
- Deduct stock for each product
- Generate PayHere payment hash (if payhere selected)

**Step 4: Handle Response (Cash on Delivery)**
```typescript
if (formData.paymentMethod === 'cash-on-delivery') {
  // Simple case: Clear cart and show confirmation
  clearCart();
  router.push(`/orders/confirmation/${order._id}`);
}
```

**Step 5: Handle Response (PayHere Payment)**
```typescript
if (formData.paymentMethod === 'payhere') {
  // Backend returned order with PayHere credentials
  const payment = {
    "sandbox": true,  // Testing mode
    "merchant_id": order.payhereMerchantId,        // From environment
    "hash": order.payhereHash,                     // Security signature from backend
    "return_url": `${window.location.origin}/orders/confirmation/${order._id}`,
    "cancel_url": `${window.location.origin}/checkout`,
    "notify_url": `${API_URL}/api/orders/payhere-notify`, // Server IPN callback
    "order_id": order._id,
    "items": "Ecommerce Order",
    "amount": subtotal + deliveryData.fee,        // Total amount to charge
    "currency": "LKR",
    "first_name": formData.fullName.split(' ')[0],
    "last_name": formData.fullName.split(' ').slice(1).join(' ') || formData.fullName.split(' ')[0],
    "email": formData.email,
    "phone": formData.phone,
    "address": formData.addressLine1,
    "city": formData.city || formData.district,
    "country": "Sri Lanka"
  };

  // Initialize PayHere payment gateway
  const payhere = (window as any).payhere;
  if (payhere) {
    // Success callback
    payhere.onCompleted = function onCompleted(pOrderId: string) {
      clearCart();
      router.push(`/orders/confirmation/${order._id}?payment=success`);
    };
    
    // Dismissal callback (user closes popup)
    payhere.onDismissed = function onDismissed() {
      setLoading(false);
      // Order remains in database with paymentStatus: 'pending'
      // User can retry payment or contact support
    };
    
    // Error callback
    payhere.onError = function onError(error: any) {
      setError('Payment failed: ' + error);
      setLoading(false);
    };
    
    // Start payment process (opens PayHere modal)
    payhere.startPayment(payment);
  }
}
```

#### PayHere JavaScript Library:

```typescript
// PayHere script is loaded via Next.js Script tag
<Script
  src="https://www.payhere.lk/lib/payhere.js"
  strategy="lazyOnload"
/>

// PayHere is then available globally as window.payhere
// It provides methods like startPayment() and callback handlers
```

---

### 2. Order Confirmation Page (`frontend/src/app/orders/confirmation/[orderId]/page.tsx`)

**Purpose**: Display success message and order summary after checkout

**Key Features**:
- Shows "Order Confirmed!" message with success icon
- Displays order number and tracking number
- Shows estimated delivery date
- Lists all ordered items
- Displays shipping address
- Shows payment status
- Provides links to order details and home page

**Core Logic**:
1. Extract `orderId` from URL parameters
2. Fetch order details from backend: `GET /api/orders/:id`
3. Display order information with formatted dates and totals

```typescript
useEffect(() => {
  const fetchOrder = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await api.getOrderById(token, orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchOrder();
}, [orderId]);
```

---

### 3. Order Details Page (`frontend/src/app/orders/[orderId]/page.tsx`)

**Purpose**: Allow customers to view order status, track delivery, and see detailed order information

**Key Features**:
- **Order Header**: Shows order ID, status badge, creation date, estimated delivery date
- **Tracking Number**: Prominently displayed with copy-to-clipboard functionality
- **Order Timeline**: Visual representation of order status progression:
  - `pending` → `confirmed` → `shipped` → `delivered` (or `cancelled`)
- **Order Items**: Lists all products with:
  - Product image
  - Product name
  - Unit price
  - Quantity
  - Subtotal (price × quantity)
- **Shipping Address**: Full delivery address details
- **Price Breakdown**:
  - Subtotal (items price)
  - Delivery Fee
  - Total Amount
- **Payment Status**: Shows payment method and current payment status

**Core Logic**:
```typescript
// Fetch order on component mount
useEffect(() => {
  const fetchOrder = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    try {
      const res = await api.getOrderById(token, orderId);
      if (res.success && res.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  fetchOrder();
}, [orderId]);

// Copy tracking number to clipboard
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  setCopySuccess(true);
  setTimeout(() => setCopySuccess(false), 2000);
};
```

---

## Backend Responsibilities

### 1. Order Creation API (`backend/src/controllers/orderController.ts`)

**Endpoint**: `POST /api/orders`
**Authentication**: Required (via JWT token)
**Request Body**:
```json
{
  "orderItems": [
    {
      "product": "60d5ec49c1234567890abcde",
      "name": "Product Name",
      "quantity": 2,
      "price": 1500,
      "image": "https://..."
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "Colombo",
    "district": "Colombo",
    "postalCode": "00100",
    "phone": "+94712345678"
  },
  "deliveryMethod": "standard",
  "paymentMethod": "cash-on-delivery",
  "orderNotes": "Please call before delivery"
}
```

#### `createOrder()` Function - Detailed Flow:

**Phase 1: Data Extraction & Initialization**
```typescript
const {
  orderItems,
  shippingAddress,
  deliveryMethod,
  paymentMethod,
  orderNotes,
} = req.body;

// Validate that order has items
if (!orderItems || orderItems.length === 0) {
  return res.status(400).json({ success: false, message: 'No order items' });
}
```

**Phase 2: Product Validation & Price Recalculation (Security)**

This is the **most critical** part of order processing. The backend **never trusts** prices from the frontend.

```typescript
let itemsPrice = 0;
const validatedItems = [];

for (const item of orderItems) {
  // 1. Verify product exists in database
  const product = await Product.findById(item.product);
  if (!product) {
    return res.status(404).json({ 
      success: false, 
      message: `Product not found: ${item.name}` 
    });
  }

  // 2. Check sufficient stock available
  if (product.stock < item.quantity) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
    });
  }

  // 3. CRITICAL: Use database price, ignore frontend price
  // This prevents users from manipulating prices on client side
  const itemTotal = product.sellingPrice * item.quantity;
  itemsPrice += itemTotal;

  // 4. Store validated item data
  validatedItems.push({
    product: product._id,
    name: product.name,
    quantity: item.quantity,
    price: product.sellingPrice,  // Database price, not frontend price
    image: product.images?.[0] || '',
  });
}
```

**Phase 3: Delivery Zone Lookup & Fee Calculation**

```typescript
let deliveryFee = 0;
let estimatedDays = 0;
let zoneId = null;

if (deliveryMethod !== 'pickup') {
  // 1. Find delivery zone matching customer's district
  const zone = await DeliveryZone.findOne({
    districts: { $regex: new RegExp(`^${shippingAddress.district}$`, 'i') },
    isActive: true,
  });

  if (!zone) {
    return res.status(400).json({
      success: false,
      message: 'Delivery not available for this district',
    });
  }

  // 2. Get base delivery fee and estimated days from zone
  deliveryFee = zone.deliveryFee;
  estimatedDays = zone.estimatedDays;
  zoneId = zone._id;

  // 3. Adjust for express delivery
  if (deliveryMethod === 'express') {
    deliveryFee = deliveryFee * 1.5;  // 50% additional charge
    estimatedDays = Math.max(1, Math.ceil(estimatedDays / 2));  // Half the time
  }
}
```

**Phase 4: Calculate Final Total & Estimated Delivery Date**

```typescript
const totalPrice = itemsPrice + deliveryFee;
const estimatedDeliveryDate = new Date();
estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + estimatedDays);
```

**Phase 5: Create & Save Order to Database**

```typescript
const order = new Order({
  user: req.user._id,                    // From JWT token (authenticated user)
  customerName: shippingAddress.fullName,
  items: validatedItems,
  orderItems: validatedItems,
  subtotal: itemsPrice,
  total: totalPrice,
  status: 'pending',
  shippingAddress,
  deliveryZone: zoneId,
  deliveryMethod,
  paymentMethod,
  paymentStatus: 'pending',              // Will change to 'paid' after payment
  orderStatus: 'pending',                // Will progress through workflow
  itemsPrice,
  deliveryFee,
  totalPrice,
  estimatedDeliveryDate,
  orderNotes,
  storeId: '69e539fd180ff885ce56ca57',   // Store identifier
  storeName: 'Open Door',                 // Store name
});

// Database transaction - save order
const createdOrder = await order.save();

if (!createdOrder) {
  return res.status(500).json({ 
    success: false, 
    message: 'Failed to save order to database' 
  });
}
```

**Phase 6: Deduct Stock (Post-Order Save)**

```typescript
try {
  for (const item of validatedItems) {
    // Decrement stock for each product
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },  // Reduce stock by quantity ordered
    });
  }
} catch (stockError) {
  console.error('Error updating stock:', stockError);
  // Order is already saved - this is acceptable, admin can investigate
}
```

**Phase 7: Handle Payment Method**

**For Cash on Delivery**:
```typescript
if (paymentMethod !== 'payhere') {
  return res.status(201).json({
    success: true,
    message: 'Order placed successfully and saved to database',
    data: createdOrder
  });
}
```

**For PayHere Payment**:
```typescript
if (paymentMethod === 'payhere') {
  const merchantId = process.env.PAYHERE_MERCHANT_ID || '1228499';
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  const orderId = createdOrder._id.toString();
  const amount = createdOrder.totalPrice.toFixed(2);
  const currency = 'LKR';

  // Generate secure payment hash
  let hash = '';
  if (merchantSecret) {
    // 1. Hash the merchant secret with MD5
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    // 2. Create payment signature
    // Format: MD5(merchant_id + order_id + amount + currency + hashed_secret)
    hash = crypto
      .createHash('md5')
      .update(merchantId + orderId + amount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();
  }

  // Prepare PayHere parameters
  const payhereParams = {
    sandbox: true,
    merchant_id: merchantId,
    return_url: `${process.env.FRONTEND_URL}/orders/confirmation/${orderId}`,
    cancel_url: `${process.env.FRONTEND_URL}/checkout`,
    notify_url: `${process.env.BACKEND_URL}/api/orders/payhere-notify`,
    order_id: orderId,
    items: createdOrder.orderItems.map((i: any) => i.name).join(', '),
    amount: amount,
    currency: currency,
    hash: hash,  // Security signature
    first_name: shippingAddress.fullName.split(' ')[0],
    last_name: shippingAddress.fullName.split(' ').slice(1).join(' ') || 'User',
    email: req.user.email,
    phone: shippingAddress.phone,
    address: shippingAddress.addressLine1,
    city: shippingAddress.city,
    country: 'Sri Lanka',
  };

  return res.status(201).json({
    success: true,
    message: 'Order placed successfully and saved to database',
    data: {
      ...createdOrder.toObject(),
      payhereParams,
      payhereHash: hash,
      payhereMerchantId: merchantId
    }
  });
}
```

---

### 2. Get My Orders API

**Endpoint**: `GET /api/orders/my-orders`
**Authentication**: Required
**Purpose**: Fetch all orders for the logged-in user

```typescript
export const getMyOrders = async (req: any, res: Response) => {
  try {
    // Find all orders for the authenticated user, sorted by newest first
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

### 3. Get Order By ID API

**Endpoint**: `GET /api/orders/:id`
**Authentication**: Required
**Purpose**: Fetch specific order details

```typescript
export const getOrderById = async (req: any, res: Response) => {
  try {
    // Fetch order and populate user reference
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Security: Only owner or admin can view order
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    return res.json({ success: true, data: order });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

### 4. Update Order Status API (Admin Only)

**Endpoint**: `PUT /api/orders/:id/status`
**Authentication**: Required (Admin only)
**Purpose**: Update order status through workflow

```typescript
export const updateOrderStatus = async (req: any, res: Response) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status
    order.orderStatus = orderStatus;
    order.status = orderStatus;

    // When order is delivered, mark payment as paid
    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    // When order is cancelled, restore stock
    if (orderStatus === 'cancelled') {
      order.cancelledAt = new Date();
      order.cancelReason = req.body.cancelReason || 'Cancelled by admin';

      // Restore stock for all items
      for (const item of order.orderItems) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },  // Add back to inventory
        });
      }
    }

    const updatedOrder = await order.save();
    return res.json({ success: true, data: updatedOrder });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

### 5. Track Order API (Public - No Auth Required)

**Endpoint**: `GET /api/orders/track/:trackingNumber`
**Authentication**: Not required
**Purpose**: Allow customers to track orders using tracking number only

```typescript
export const trackOrder = async (req: Request, res: Response) => {
  try {
    // Find order by tracking number (case-insensitive)
    const order = await Order.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase(),
    }).select(
      'orderStatus estimatedDeliveryDate shippingAddress trackingNumber createdAt orderItems'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Invalid tracking number' });
    }

    // Return only public data (no sensitive info like prices)
    const publicData = {
      id: order._id,
      orderId: order.orderId,
      status: order.status || order.orderStatus,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
      city: order.shippingAddress?.city,
      district: order.shippingAddress?.district,
      itemsCount: order.items?.length || order.orderItems?.length || 0,
      trackingNumber: order.trackingNumber,
    };

    return res.json({ success: true, data: publicData });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
```

---

### 6. PayHere Notification Handler (IPN - Instant Payment Notification)

**Endpoint**: `POST /api/orders/payhere-notify`
**Authentication**: Not required (PayHere calls this directly)
**Purpose**: Receive payment confirmation from PayHere gateway

```typescript
export const payhereNotify = async (req: Request, res: Response) => {
  try {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
    } = req.body;

    // Get merchant secret from environment
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || '';
    
    // 1. Hash the merchant secret
    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    // 2. Create expected signature
    // Format: MD5(merchant_id + order_id + amount + currency + status_code + hashed_secret)
    const expectedMd5Sig = crypto
      .createHash('md5')
      .update(
        merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        hashedSecret
      )
      .digest('hex')
      .toUpperCase();

    // 3. Verify signature matches (prevents tampering)
    // status_code 2 = Payment successful
    if (md5sig === expectedMd5Sig && status_code === '2') {
      // Update order payment status
      await Order.findByIdAndUpdate(order_id, {
        paymentStatus: 'paid',
        paymentMethod: 'payhere',
      });
    }

    // PayHere requires 200 OK response
    return res.status(200).send();
  } catch (err: any) {
    console.error('PayHere Notify Error:', err);
    return res.status(500).send();
  }
};
```

---

### 7. Delivery Controller (`backend/src/controllers/deliveryController.ts`)

#### Get Delivery Zones API

**Endpoint**: `GET /api/delivery/zones`
**Authentication**: Not required
**Purpose**: Fetch all active delivery zones for dropdown/display

```typescript
export const getDeliveryZones = async (req: Request, res: Response) => {
  try {
    // Get all active zones, sorted by name
    const zones = await DeliveryZone.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: zones });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

#### Calculate Delivery Fee API

**Endpoint**: `POST /api/delivery/calculate`
**Authentication**: Not required
**Request Body**:
```json
{
  "district": "Colombo",
  "deliveryMethod": "standard"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "fee": 500,
    "estimatedDays": 2,
    "zoneName": "Zone 1",
    "zoneId": "60d5ec49c1234567890abcde"
  }
}
```

**Purpose**: Calculate delivery fee in real-time as user changes district/method

```typescript
export const calculateDeliveryFee = async (req: Request, res: Response) => {
  try {
    const { district, deliveryMethod } = req.body;
    
    // Validate input
    if (!district) {
      return res.status(400).json({ 
        success: false, 
        message: 'District is required' 
      });
    }

    // Handle pickup (no fee)
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

    // Find matching delivery zone
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

    // Start with base fee and days
    let fee = zone.deliveryFee;
    let days = zone.estimatedDays;

    // Adjust for express delivery
    if (deliveryMethod === 'express') {
      fee = fee * 1.5;                              // 50% more
      days = Math.max(1, Math.ceil(days / 2));     // Half time, minimum 1 day
    }

    // Return calculated values
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
```

#### Create Delivery Zone API (Admin Only)

**Endpoint**: `POST /api/delivery/zones`
**Authentication**: Required (Admin only)
**Purpose**: Admin can create new delivery zones

```typescript
export const createDeliveryZone = async (req: Request, res: Response) => {
  try {
    const zone = await DeliveryZone.create(req.body);
    res.status(201).json({ success: true, data: zone });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
```

---

## API Routes

### Order Routes (`backend/src/routes/orderRoutes.ts`)

```typescript
import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder,
  payhereNotify,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST: Create new order (requires authentication)
router.post('/', protect, createOrder);

// GET: Fetch all orders for logged-in user (requires authentication)
router.get('/my-orders', protect, getMyOrders);

// GET: Track order by tracking number (public, no auth required)
router.get('/track/:trackingNumber', trackOrder);

// GET: Fetch specific order by ID (requires authentication)
router.get('/:id', protect, getOrderById);

// POST: PayHere payment notification (called by PayHere, no auth)
router.post('/payhere-notify', payhereNotify);

// PUT: Update order status (admin only)
router.put('/:id/status', protect, admin, updateOrderStatus);

export default router;
```

### Delivery Routes (`backend/src/routes/deliveryRoutes.ts`)

```typescript
import express from 'express';
import { 
  getDeliveryZones, 
  calculateDeliveryFee, 
  createDeliveryZone 
} from '../controllers/deliveryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET: Fetch all active delivery zones (public)
router.get('/zones', getDeliveryZones);

// POST: Calculate delivery fee for a district (public)
router.post('/calculate', calculateDeliveryFee);

// POST: Create new delivery zone (admin only)
router.post('/zones', protect, admin, createDeliveryZone);

export default router;
```

---

## Database Models

### Order Model (`backend/src/models/Order.ts`)

```typescript
// Order Item Schema (embedded)
const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    image: { type: String },
  },
  { _id: false }
);

// Main Order Schema
const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

    // Order Identification
    orderId: { type: String, unique: true },                    // Auto-generated: ORD-XXXXXX
    customerName: { type: String },
    trackingNumber: { type: String, unique: true },             // Auto-generated: OSXXXXXX

    // Items
    items: { type: [orderItemSchema] },
    orderItems: { type: [orderItemSchema], required: true },

    // Financial Details
    subtotal: { type: Number, default: 0 },                     // Items total
    itemsPrice: { type: Number, required: true, default: 0 },   // Same as above
    deliveryFee: { type: Number, required: true, default: 0 },
    total: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },   // Same as above

    // Shipping Information
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      district: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    deliveryZone: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryZone' },
    deliveryMethod: {
      type: String,
      enum: ['standard', 'express', 'pickup'],
      default: 'standard'
    },

    // Payment Information
    paymentMethod: {
      type: String,
      enum: ['cash-on-delivery', 'bank-transfer', 'payhere'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'declined'],
      default: 'pending'
    },

    // Order Status Tracking
    status: { type: String, default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },

    // Dates
    estimatedDeliveryDate: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    
    // Additional Info
    cancelReason: { type: String },
    orderNotes: { type: String },
    storeId: { type: String, required: true, default: '69e539fd180ff885ce56ca57' },
    storeName: { type: String, default: 'Open Door' },
  },
  { timestamps: true }  // Adds createdAt and updatedAt
);

// Auto-generate unique identifiers before saving
orderSchema.pre('save', function (next) {
  // Generate order ID if not exists
  if (!this.orderId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const suffix = Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
    this.orderId = `ORD-${suffix}`;
  }

  // Generate tracking number if not exists
  if (!this.trackingNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.trackingNumber = `OS${timestamp}${random}`;
  }
  next();
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
```

### DeliveryZone Model (`backend/src/models/DeliveryZone.ts`)

```typescript
const deliveryZoneSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    
    districts: { 
      type: [String],   // Array of district names covered by this zone
      required: true 
    },
    
    deliveryFee: { 
      type: Number,     // Base delivery fee in LKR
      required: true, 
      min: 0 
    },
    
    estimatedDays: { 
      type: Number,     // Standard delivery time in days
      required: true, 
      min: 1 
    },
    
    isActive: { 
      type: Boolean, 
      default: true    // Soft delete via isActive flag
    },
    
    storeId: { 
      type: String, 
      required: true, 
      default: 'STORE-2025-001' 
    },
  },
  { 
    timestamps: true,
    collection: 'deliveryzones'
  }
);

export default mongoose.model('DeliveryZone', deliveryZoneSchema);
```

**Example DeliveryZone Document**:
```json
{
  "_id": "60d5ec49c1234567890abcde",
  "name": "Western Zone",
  "districts": ["Colombo", "Gampaha", "Kalutara"],
  "deliveryFee": 500,
  "estimatedDays": 2,
  "isActive": true,
  "storeId": "STORE-2025-001",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

---

## Complete Flow Diagram

### Checkout & Payment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CHECKOUT FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. CHECKOUT PAGE LOAD
   ↓
   ├─ Check if cart is empty → Redirect to home
   ├─ Verify auth token exists
   ├─ Fetch user data (name, email, phone)
   └─ Pre-fill form fields

2. USER FILLS FORM
   ↓
   ├─ Enter contact info (name, email, phone)
   ├─ Enter shipping address (address, city, district, postal code)
   ├─ Select delivery method (standard/express/pickup)
   │  └─ Triggers real-time delivery fee calculation
   │     → POST /api/delivery/calculate
   │     → Updates deliveryData state
   ├─ Select payment method (cash-on-delivery/payhere)
   └─ Enter optional order notes

3. USER SUBMITS ORDER
   ↓
   ├─ Validate required fields
   ├─ Prepare orderData object
   └─ Send to backend
      → POST /api/orders (with auth token)

┌─────────────────────────────────────────────────────────────────┐
│              BACKEND ORDER PROCESSING                           │
└─────────────────────────────────────────────────────────────────┘

4. BACKEND RECEIVES ORDER
   ↓
   ├─ Extract orderItems, shippingAddress, paymentMethod, etc.
   └─ Validate order has items

5. VALIDATE & RE-CALCULATE PRICES (Security)
   ↓
   ├─ For each item in order:
   │  ├─ Check product exists
   │  ├─ Check stock available
   │  └─ Use database price (ignore frontend price)
   ├─ Calculate total itemsPrice
   └─ Create validatedItems array

6. CALCULATE DELIVERY FEE
   ↓
   ├─ Find DeliveryZone matching district
   ├─ Get base deliveryFee and estimatedDays
   ├─ If express: multiply fee by 1.5, halve days
   └─ Calculate estimatedDeliveryDate

7. CREATE & SAVE ORDER
   ↓
   ├─ Create Order document with:
   │  ├─ User ID (from JWT)
   │  ├─ Validated items
   │  ├─ Shipping address
   │  ├─ Delivery method and fee
   │  ├─ Payment method and status
   │  ├─ Timestamps
   │  └─ Auto-generated orderId and trackingNumber
   ├─ Save to database
   └─ Verify save successful

8. DEDUCT STOCK
   ↓
   ├─ For each item:
   │  └─ Decrement product stock
   └─ Handle any errors gracefully

9. PREPARE RESPONSE BASED ON PAYMENT METHOD
   ↓
   ├─ CASH ON DELIVERY:
   │  └─ Return order data (paymentStatus: pending)
   │
   └─ PAYHERE:
      ├─ Generate secure payment hash:
      │  ├─ MD5(merchantSecret) → hashedSecret
      │  └─ MD5(merchant_id + order_id + amount + currency + hashedSecret)
      ├─ Prepare PayHere parameters
      └─ Return order + payhereHash + payhereMerchantId

┌─────────────────────────────────────────────────────────────────┐
│                 FRONTEND HANDLES RESPONSE                       │
└─────────────────────────────────────────────────────────────────┘

10. CASH ON DELIVERY PATH
    ↓
    ├─ Clear user's shopping cart
    ├─ Redirect to confirmation page
    └─ Display "Order Confirmed!" message

11. PAYHERE PAYMENT PATH
    ↓
    ├─ Build payment object with PayHere hash
    ├─ Call window.payhere.startPayment(payment)
    └─ PayHere opens payment modal
       │
       ├─ User enters card details in PayHere popup
       │
       ├─ PayHere processes payment
       │
       └─ Payment complete/failed/dismissed

12. PAYHERE PAYMENT RESULTS
    ↓
    ├─ PAYMENT SUCCESS:
    │  ├─ onCompleted callback fires
    │  ├─ Clear cart
    │  └─ Redirect to confirmation page
    │
    ├─ PAYMENT FAILED:
    │  ├─ onError callback fires
    │  └─ Show error message
    │
    └─ PAYMENT DISMISSED:
       ├─ onDismissed callback fires
       ├─ Order remains in database (paymentStatus: pending)
       └─ Allow user to retry or contact support

13. PAYHERE IPN CALLBACK (Instant Payment Notification)
    ↓
    ├─ PayHere server calls: POST /api/orders/payhere-notify
    ├─ Verify MD5 signature authenticity
    ├─ If status_code === '2' (success):
    │  └─ Update order: paymentStatus = 'paid'
    └─ Respond with 200 OK

┌─────────────────────────────────────────────────────────────────┐
│              ORDER CONFIRMATION & TRACKING                      │
└─────────────────────────────────────────────────────────────────┘

14. CONFIRMATION PAGE
    ↓
    ├─ Fetch order data: GET /api/orders/:orderId
    ├─ Display:
    │  ├─ Success message
    │  ├─ Order number
    │  ├─ Tracking number
    │  ├─ Estimated delivery date
    │  ├─ Order items
    │  ├─ Shipping address
    │  └─ Price breakdown
    └─ Provide links to:
       ├─ View order details
       └─ Continue shopping

15. ORDER DETAILS PAGE (Track Status)
    ↓
    ├─ Fetch order: GET /api/orders/:orderId
    ├─ Display:
    │  ├─ Order status timeline
    │  ├─ Current status badge
    │  ├─ Tracking number (with copy button)
    │  ├─ Creation and estimated delivery dates
    │  ├─ All items with images
    │  ├─ Shipping address
    │  ├─ Payment method and status
    │  └─ Price breakdown
    └─ Allow copying tracking number

16. PUBLIC TRACKING (No Login Required)
    ↓
    ├─ Customer visits: GET /api/orders/track/:trackingNumber
    ├─ Returns public data:
    │  ├─ Status
    │  ├─ City/District
    │  ├─ Estimated delivery date
    │  └─ Item count
    └─ No sensitive price information exposed
```

---

## Key Security Measures

1. **Price Recalculation**: Backend always uses database prices, never trusts frontend prices
2. **Stock Validation**: Checks available stock before creating order
3. **JWT Authentication**: Protects all user-specific endpoints
4. **Role-Based Access**: Admin-only endpoints for status updates and zone management
5. **Payment Hash Verification**: PayHere payment signature prevents tampering
6. **MD5 Signature Validation**: Ensures IPN notifications are from PayHere
7. **Tracking Number Encryption**: Public tracking uses tracking number, not user ID
8. **Order Ownership**: Ensures users can only view their own orders

---

## Order Status Workflow

```
┌──────────┐     ┌───────────┐      ┌──────────┐      ┌───────────┐      ┌──────────┐
│ pending  │  →  │ confirmed │  →   │ shipped  │  →   │ delivered │
└──────────┘     └───────────┘      └──────────┘      └───────────┘
      ↓                                                        ↓
      └─────────────────────────────────────────────────────────→ cancelled
```

- **pending**: Order created, awaiting processing
- **confirmed**: Order confirmed, payment received (for PayHere)
- **shipped**: Order dispatched for delivery
- **delivered**: Order received by customer
- **cancelled**: Order cancelled, stock restored

