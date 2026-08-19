import type { Connection } from 'mongoose';

import CartModel, { cartSchema } from '../models/Cart.js';
import CategoryModel, { categorySchema } from '../models/Category.js';
import CustomerModel, { customerSchema } from '../models/Customer.js';
import DeliveryZoneModel, { deliveryZoneSchema } from '../models/DeliveryZone.js';
import OrderModel, { orderSchema } from '../models/Order.js';
import ProductModel, { productSchema } from '../models/Product.js';
import ReviewModel, { reviewSchema } from '../models/Review.js';
import StockHistoryModel, { stockHistorySchema } from '../models/StockHistory.js';
import StoreOrderModel, { storeOrderSchema } from '../models/StoreOrder.js';
import StoreSettingModel, { storeSettingSchema } from '../models/StoreSetting.js';
import WishlistModel, { wishlistSchema } from '../models/Wishlist.js';
import ContactMessageModel, { contactMessageSchema } from '../models/contactMessage.js';
import FAQModel, { faqSchema } from '../models/faq.js';
import ShippingInfoModel, { shippingInfoSchema } from '../models/shippingInfo.js';

/**
 * The full set of storefront models, compiled against one tenant's database.
 * Each property keeps the exact type of the corresponding default-connection
 * model, so controllers get identical typing after switching to req.models.
 */
export interface TenantModels {
  Cart: typeof CartModel;
  Category: typeof CategoryModel;
  Customer: typeof CustomerModel;
  DeliveryZone: typeof DeliveryZoneModel;
  Order: typeof OrderModel;
  Product: typeof ProductModel;
  Review: typeof ReviewModel;
  StockHistory: typeof StockHistoryModel;
  StoreOrder: typeof StoreOrderModel;
  StoreSetting: typeof StoreSettingModel;
  Wishlist: typeof WishlistModel;
  ContactMessage: typeof ContactMessageModel;
  FAQ: typeof FAQModel;
  ShippingInfo: typeof ShippingInfoModel;
}

/**
 * Compiles (or reuses) every storefront model on the given tenant connection.
 * mongoose caches compiled models per connection, so this is cheap to call on
 * every request.
 */
export function getModels(conn: Connection): TenantModels {
  const model = <T>(name: string, schema: any): T =>
    (conn.models[name] ?? conn.model(name, schema)) as T;

  return {
    Cart:           model<typeof CartModel>('Cart', cartSchema),
    Category:       model<typeof CategoryModel>('Category', categorySchema),
    Customer:       model<typeof CustomerModel>('Customer', customerSchema),
    DeliveryZone:   model<typeof DeliveryZoneModel>('DeliveryZone', deliveryZoneSchema),
    Order:          model<typeof OrderModel>('Order', orderSchema),
    Product:        model<typeof ProductModel>('Product', productSchema),
    Review:         model<typeof ReviewModel>('Review', reviewSchema),
    StockHistory:   model<typeof StockHistoryModel>('StockHistory', stockHistorySchema),
    StoreOrder:     model<typeof StoreOrderModel>('StoreOrder', storeOrderSchema),
    StoreSetting:   model<typeof StoreSettingModel>('StoreSetting', storeSettingSchema),
    Wishlist:       model<typeof WishlistModel>('Wishlist', wishlistSchema),
    ContactMessage: model<typeof ContactMessageModel>('ContactMessage', contactMessageSchema),
    FAQ:            model<typeof FAQModel>('FAQ', faqSchema),
    ShippingInfo:   model<typeof ShippingInfoModel>('ShippingInfo', shippingInfoSchema),
  };
}
