import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/database.js';

dotenv.config();

const products = [
  // Vegetables
  { name: 'Fresh Carrots (500g)', sku: 'VEG-001', category: 'Vegetables', sellingPrice: 120, costPrice: 60, stock: 200, lowStockThreshold: 30, badge: '', rating: 4.5, numReviews: 34, images: ['https://placehold.co/400x400/e8f5e9/388e3c?text=Carrots'] },
  { name: 'Tomatoes (1kg)', sku: 'VEG-002', category: 'Vegetables', sellingPrice: 180, costPrice: 90, stock: 150, lowStockThreshold: 30, badge: 'New Arrival', rating: 4.3, numReviews: 21, images: ['https://placehold.co/400x400/e8f5e9/388e3c?text=Tomatoes'] },
  { name: 'Baby Spinach (200g)', sku: 'VEG-003', category: 'Vegetables', sellingPrice: 220, costPrice: 110, stock: 80, lowStockThreshold: 20, badge: '', rating: 4.7, numReviews: 18, images: ['https://placehold.co/400x400/e8f5e9/388e3c?text=Spinach'] },

  // Fruits
  { name: 'Bananas (6 pack)', sku: 'FRT-001', category: 'Fruits', sellingPrice: 150, costPrice: 70, stock: 120, lowStockThreshold: 25, badge: '', rating: 4.6, numReviews: 45, images: ['https://placehold.co/400x400/fff9c4/f9a825?text=Bananas'] },
  { name: 'Apple Red (1kg)', sku: 'FRT-002', category: 'Fruits', sellingPrice: 350, costPrice: 180, stock: 90, lowStockThreshold: 20, badge: 'Best Seller', rating: 4.8, numReviews: 67, images: ['https://placehold.co/400x400/fff9c4/f9a825?text=Apples'] },

  // Meat
  { name: 'Chicken Breast (500g)', sku: 'MEA-001', category: 'Meat', sellingPrice: 650, costPrice: 400, stock: 60, lowStockThreshold: 10, badge: '', rating: 4.5, numReviews: 29, images: ['https://placehold.co/400x400/fce4ec/c62828?text=Chicken'] },
  { name: 'Beef Mince (500g)', sku: 'MEA-002', category: 'Meat', sellingPrice: 850, costPrice: 550, stock: 40, lowStockThreshold: 10, badge: '', rating: 4.4, numReviews: 22, images: ['https://placehold.co/400x400/fce4ec/c62828?text=Beef'] },

  // Seafood
  { name: 'Prawns Fresh (500g)', sku: 'SEA-001', category: 'Seafood', sellingPrice: 1200, costPrice: 750, stock: 30, lowStockThreshold: 5, badge: '', rating: 4.7, numReviews: 15, images: ['https://placehold.co/400x400/e3f2fd/1565c0?text=Prawns'] },
  { name: 'Fish Fillet (400g)', sku: 'SEA-002', category: 'Seafood', sellingPrice: 900, costPrice: 550, stock: 35, lowStockThreshold: 5, badge: 'New Arrival', rating: 4.5, numReviews: 11, images: ['https://placehold.co/400x400/e3f2fd/1565c0?text=Fish'] },

  // Processed Meats
  { name: 'Chicken Sausages (400g)', sku: 'PRC-001', category: 'Processed Meats', sellingPrice: 480, costPrice: 280, stock: 70, lowStockThreshold: 15, badge: '', rating: 4.2, numReviews: 33, images: ['https://placehold.co/400x400/fce4ec/b71c1c?text=Sausages'] },

  // Bakery
  { name: 'Whole Wheat Bread', sku: 'BAK-001', category: 'Bakery', sellingPrice: 220, costPrice: 110, stock: 100, lowStockThreshold: 20, badge: 'Best Seller', rating: 4.6, numReviews: 89, images: ['https://placehold.co/400x400/fff8e1/e65100?text=Bread'] },
  { name: 'Butter Croissants (4 pack)', sku: 'BAK-002', category: 'Bakery', sellingPrice: 380, costPrice: 200, stock: 50, lowStockThreshold: 10, badge: 'New Arrival', rating: 4.8, numReviews: 42, images: ['https://placehold.co/400x400/fff8e1/e65100?text=Croissants'] },

  // Snacks
  { name: 'Potato Chips (150g)', sku: 'SNK-001', category: 'Snacks', sellingPrice: 190, costPrice: 100, stock: 200, lowStockThreshold: 40, badge: '', rating: 4.4, numReviews: 120, images: ['https://placehold.co/400x400/fff3e0/bf360c?text=Chips'] },

  // Grains & Pulses
  { name: 'Red Lentils (1kg)', sku: 'GRN-001', category: 'Grains & Pulses', sellingPrice: 280, costPrice: 150, stock: 150, lowStockThreshold: 30, badge: '', rating: 4.5, numReviews: 56, images: ['https://placehold.co/400x400/f3e5f5/6a1b9a?text=Lentils'] },

  // Cooking Essentials
  { name: 'Sunflower Oil (1L)', sku: 'CKE-001', category: 'Cooking Essentials', sellingPrice: 450, costPrice: 280, stock: 120, lowStockThreshold: 20, badge: 'Best Seller', rating: 4.6, numReviews: 78, images: ['https://placehold.co/400x400/fffde7/f57f17?text=Oil'] },
  { name: 'Sea Salt (500g)', sku: 'CKE-002', category: 'Cooking Essentials', sellingPrice: 120, costPrice: 60, stock: 200, lowStockThreshold: 40, badge: '', rating: 4.4, numReviews: 34, images: ['https://placehold.co/400x400/fffde7/f57f17?text=Salt'] },

  // Dairy
  { name: 'Full Cream Milk (1L)', sku: 'DAI-001', category: 'Dairy', sellingPrice: 280, costPrice: 160, stock: 100, lowStockThreshold: 20, badge: 'Best Seller', rating: 4.7, numReviews: 95, images: ['https://placehold.co/400x400/e8eaf6/283593?text=Milk'] },
  { name: 'Cheddar Cheese (200g)', sku: 'DAI-002', category: 'Dairy', sellingPrice: 480, costPrice: 290, stock: 60, lowStockThreshold: 12, badge: '', rating: 4.5, numReviews: 44, images: ['https://placehold.co/400x400/e8eaf6/283593?text=Cheese'] },

  // Beverages
  { name: 'Green Tea (25 bags)', sku: 'BEV-001', category: 'Beverages', sellingPrice: 320, costPrice: 160, stock: 150, lowStockThreshold: 25, badge: '', rating: 4.6, numReviews: 88, images: ['https://placehold.co/400x400/e8f5e9/1b5e20?text=Green+Tea'] },
  { name: 'Orange Juice (1L)', sku: 'BEV-002', category: 'Beverages', sellingPrice: 380, costPrice: 210, stock: 80, lowStockThreshold: 15, badge: 'New Arrival', rating: 4.4, numReviews: 52, images: ['https://placehold.co/400x400/e8f5e9/1b5e20?text=OJ'] },

  // Household
  { name: 'Dish Soap (500ml)', sku: 'HOU-001', category: 'Household', sellingPrice: 220, costPrice: 110, stock: 120, lowStockThreshold: 20, badge: '', rating: 4.3, numReviews: 67, images: ['https://placehold.co/400x400/e0f7fa/006064?text=Dish+Soap'] },

  // Personal Care
  { name: 'Shampoo (400ml)', sku: 'PRC-PC-001', category: 'Personal Care', sellingPrice: 450, costPrice: 250, stock: 90, lowStockThreshold: 15, badge: 'Best Seller', rating: 4.5, numReviews: 73, images: ['https://placehold.co/400x400/fce4ec/880e4f?text=Shampoo'] },

  // Kitchen & Dining
  { name: 'Ceramic Dinner Plate Set (4)', sku: 'KIT-001', category: 'Kitchen & Dining', sellingPrice: 1800, costPrice: 1000, stock: 30, lowStockThreshold: 5, badge: '', rating: 4.7, numReviews: 28, images: ['https://placehold.co/400x400/f3e5f5/4a148c?text=Plates'] },

  // Pet Care
  { name: 'Dry Dog Food (2kg)', sku: 'PET-001', category: 'Pet Care', sellingPrice: 1200, costPrice: 700, stock: 40, lowStockThreshold: 8, badge: '', rating: 4.6, numReviews: 35, images: ['https://placehold.co/400x400/e8eaf6/1a237e?text=Dog+Food'] },

  // Stationery
  { name: 'A4 Notebook (100 pages)', sku: 'STA-001', category: 'Stationery', sellingPrice: 180, costPrice: 90, stock: 200, lowStockThreshold: 40, badge: '', rating: 4.4, numReviews: 55, images: ['https://placehold.co/400x400/e8f5e9/33691e?text=Notebook'] },

  // Meat & Poultry
  { name: 'Whole Chicken (1.2kg)', sku: 'MPL-001', category: 'Meat & Poultry', sellingPrice: 920, costPrice: 580, stock: 50, lowStockThreshold: 10, badge: '', rating: 4.5, numReviews: 40, images: ['https://placehold.co/400x400/fce4ec/b71c1c?text=Whole+Chicken'] },

  // Dairy & Eggs
  { name: 'Free Range Eggs (12 pack)', sku: 'DEG-001', category: 'Dairy & Eggs', sellingPrice: 480, costPrice: 280, stock: 100, lowStockThreshold: 20, badge: 'Best Seller', rating: 4.8, numReviews: 112, images: ['https://placehold.co/400x400/fff8e1/e65100?text=Eggs'] },
  { name: 'Greek Yoghurt (500g)', sku: 'DEG-002', category: 'Dairy & Eggs', sellingPrice: 360, costPrice: 200, stock: 70, lowStockThreshold: 15, badge: '', rating: 4.6, numReviews: 64, images: ['https://placehold.co/400x400/fff8e1/e65100?text=Yoghurt'] },

  // Chilled Food
  { name: 'Fresh Pasta (400g)', sku: 'CHF-001', category: 'Chilled Food', sellingPrice: 420, costPrice: 240, stock: 60, lowStockThreshold: 12, badge: 'New Arrival', rating: 4.4, numReviews: 30, images: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Pasta'] },

  // Frozen Food
  { name: 'Frozen Peas (500g)', sku: 'FRZ-001', category: 'Frozen Food', sellingPrice: 260, costPrice: 130, stock: 90, lowStockThreshold: 18, badge: '', rating: 4.3, numReviews: 47, images: ['https://placehold.co/400x400/e8f5e9/1b5e20?text=Frozen+Peas'] },
  { name: 'Frozen Pizza Margherita', sku: 'FRZ-002', category: 'Frozen Food', sellingPrice: 780, costPrice: 440, stock: 40, lowStockThreshold: 8, badge: 'Best Seller', rating: 4.5, numReviews: 88, images: ['https://placehold.co/400x400/e8f5e9/1b5e20?text=Frozen+Pizza'] },

  // Soft Drinks & Water
  { name: 'Sparkling Water (1.5L)', sku: 'SDW-001', category: 'Soft Drinks & Water', sellingPrice: 180, costPrice: 90, stock: 200, lowStockThreshold: 40, badge: '', rating: 4.2, numReviews: 60, images: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Water'] },
  { name: 'Cola (2L)', sku: 'SDW-002', category: 'Soft Drinks & Water', sellingPrice: 240, costPrice: 130, stock: 150, lowStockThreshold: 30, badge: '', rating: 4.3, numReviews: 75, images: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Cola'] },

  // Tea & Coffee
  { name: 'Ground Coffee (250g)', sku: 'TCF-001', category: 'Tea & Coffee', sellingPrice: 680, costPrice: 380, stock: 80, lowStockThreshold: 15, badge: 'Best Seller', rating: 4.8, numReviews: 95, images: ['https://placehold.co/400x400/efebe9/3e2723?text=Coffee'] },
  { name: 'Ceylon Black Tea (50 bags)', sku: 'TCF-002', category: 'Tea & Coffee', sellingPrice: 380, costPrice: 200, stock: 120, lowStockThreshold: 20, badge: '', rating: 4.6, numReviews: 72, images: ['https://placehold.co/400x400/efebe9/3e2723?text=Tea'] },

  // Juices & Cordials
  { name: 'Apple Juice (1L)', sku: 'JCR-001', category: 'Juices & Cordials', sellingPrice: 320, costPrice: 170, stock: 90, lowStockThreshold: 18, badge: '', rating: 4.4, numReviews: 48, images: ['https://placehold.co/400x400/fff9c4/e65100?text=Apple+Juice'] },

  // Malt & Milk Drinks
  { name: 'Chocolate Malt Drink (400g)', sku: 'MMD-001', category: 'Malt & Milk Drinks', sellingPrice: 580, costPrice: 320, stock: 70, lowStockThreshold: 14, badge: 'Best Seller', rating: 4.7, numReviews: 83, images: ['https://placehold.co/400x400/efebe9/3e2723?text=Malt+Drink'] },

  // Rice & Grains
  { name: 'Basmati Rice (2kg)', sku: 'RGR-001', category: 'Rice & Grains', sellingPrice: 580, costPrice: 320, stock: 120, lowStockThreshold: 25, badge: 'Best Seller', rating: 4.7, numReviews: 102, images: ['https://placehold.co/400x400/fffde7/f57f17?text=Rice'] },
  { name: 'Rolled Oats (1kg)', sku: 'RGR-002', category: 'Rice & Grains', sellingPrice: 340, costPrice: 180, stock: 100, lowStockThreshold: 20, badge: '', rating: 4.5, numReviews: 68, images: ['https://placehold.co/400x400/fffde7/f57f17?text=Oats'] },

  // Flour & Baking
  { name: 'All Purpose Flour (1kg)', sku: 'FBK-001', category: 'Flour & Baking', sellingPrice: 220, costPrice: 110, stock: 150, lowStockThreshold: 30, badge: '', rating: 4.5, numReviews: 58, images: ['https://placehold.co/400x400/fafafa/424242?text=Flour'] },
  { name: 'Baking Powder (100g)', sku: 'FBK-002', category: 'Flour & Baking', sellingPrice: 120, costPrice: 60, stock: 200, lowStockThreshold: 40, badge: '', rating: 4.6, numReviews: 44, images: ['https://placehold.co/400x400/fafafa/424242?text=Baking+Powder'] },

  // Pasta & Noodles
  { name: 'Spaghetti (500g)', sku: 'PAN-001', category: 'Pasta & Noodles', sellingPrice: 240, costPrice: 120, stock: 130, lowStockThreshold: 25, badge: '', rating: 4.4, numReviews: 61, images: ['https://placehold.co/400x400/fff3e0/bf360c?text=Spaghetti'] },
  { name: 'Instant Noodles (5 pack)', sku: 'PAN-002', category: 'Pasta & Noodles', sellingPrice: 180, costPrice: 90, stock: 200, lowStockThreshold: 40, badge: 'Best Seller', rating: 4.3, numReviews: 145, images: ['https://placehold.co/400x400/fff3e0/bf360c?text=Noodles'] },

  // Canned & Preserved
  { name: 'Canned Tuna in Brine (185g)', sku: 'CAN-001', category: 'Canned & Preserved', sellingPrice: 280, costPrice: 150, stock: 180, lowStockThreshold: 35, badge: '', rating: 4.5, numReviews: 79, images: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Tuna'] },
  { name: 'Canned Chickpeas (400g)', sku: 'CAN-002', category: 'Canned & Preserved', sellingPrice: 220, costPrice: 110, stock: 150, lowStockThreshold: 30, badge: '', rating: 4.4, numReviews: 54, images: ['https://placehold.co/400x400/e3f2fd/0d47a1?text=Chickpeas'] },

  // Sauces & Condiments
  { name: 'Tomato Ketchup (500g)', sku: 'SAC-001', category: 'Sauces & Condiments', sellingPrice: 240, costPrice: 120, stock: 140, lowStockThreshold: 25, badge: 'Best Seller', rating: 4.6, numReviews: 97, images: ['https://placehold.co/400x400/fce4ec/b71c1c?text=Ketchup'] },
  { name: 'Soy Sauce (250ml)', sku: 'SAC-002', category: 'Sauces & Condiments', sellingPrice: 180, costPrice: 90, stock: 120, lowStockThreshold: 20, badge: '', rating: 4.4, numReviews: 52, images: ['https://placehold.co/400x400/fce4ec/b71c1c?text=Soy+Sauce'] },

  // Snacks & Biscuits
  { name: 'Digestive Biscuits (400g)', sku: 'SNB-001', category: 'Snacks & Biscuits', sellingPrice: 260, costPrice: 130, stock: 160, lowStockThreshold: 30, badge: 'Best Seller', rating: 4.5, numReviews: 113, images: ['https://placehold.co/400x400/fff8e1/e65100?text=Biscuits'] },
  { name: 'Mixed Nuts (200g)', sku: 'SNB-002', category: 'Snacks & Biscuits', sellingPrice: 480, costPrice: 280, stock: 90, lowStockThreshold: 18, badge: '', rating: 4.7, numReviews: 76, images: ['https://placehold.co/400x400/fff8e1/e65100?text=Nuts'] },

  // Confectionery
  { name: 'Dark Chocolate Bar (100g)', sku: 'CON-001', category: 'Confectionery', sellingPrice: 320, costPrice: 170, stock: 100, lowStockThreshold: 20, badge: '', rating: 4.8, numReviews: 88, images: ['https://placehold.co/400x400/efebe9/3e2723?text=Chocolate'] },
  { name: 'Gummy Bears (150g)', sku: 'CON-002', category: 'Confectionery', sellingPrice: 180, costPrice: 90, stock: 140, lowStockThreshold: 25, badge: 'New Arrival', rating: 4.4, numReviews: 65, images: ['https://placehold.co/400x400/efebe9/3e2723?text=Gummies'] },

  // Oral Care
  { name: 'Whitening Toothpaste (100ml)', sku: 'ORL-001', category: 'Oral Care', sellingPrice: 280, costPrice: 150, stock: 130, lowStockThreshold: 25, badge: '', rating: 4.5, numReviews: 72, images: ['https://placehold.co/400x400/e8eaf6/283593?text=Toothpaste'] },

  // Cleaning & Laundry
  { name: 'Laundry Detergent (2kg)', sku: 'CLN-001', category: 'Cleaning & Laundry', sellingPrice: 680, costPrice: 380, stock: 80, lowStockThreshold: 15, badge: 'Best Seller', rating: 4.6, numReviews: 91, images: ['https://placehold.co/400x400/e0f7fa/006064?text=Detergent'] },
  { name: 'Floor Cleaner (1L)', sku: 'CLN-002', category: 'Cleaning & Laundry', sellingPrice: 320, costPrice: 170, stock: 100, lowStockThreshold: 20, badge: '', rating: 4.3, numReviews: 48, images: ['https://placehold.co/400x400/e0f7fa/006064?text=Floor+Cleaner'] },

  // Baby Products
  { name: 'Baby Diapers (30 count)', sku: 'BAB-001', category: 'Baby Products', sellingPrice: 1200, costPrice: 700, stock: 60, lowStockThreshold: 12, badge: 'Best Seller', rating: 4.8, numReviews: 105, images: ['https://placehold.co/400x400/fce4ec/880e4f?text=Diapers'] },
  { name: 'Baby Shampoo (200ml)', sku: 'BAB-002', category: 'Baby Products', sellingPrice: 380, costPrice: 200, stock: 80, lowStockThreshold: 15, badge: '', rating: 4.6, numReviews: 59, images: ['https://placehold.co/400x400/fce4ec/880e4f?text=Baby+Shampoo'] },
];

const seedProducts = async () => {
  try {
    await connectDB();

    // Clear only existing products
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert all products with storeId
    const toInsert = products.map(p => ({
      ...p,
      storeId: 'STORE-2025-001',
      featured: false,
      brand: 'OneShop',
      description: `Quality ${p.name} available at OneShop.`,
    }));

    const inserted = await Product.insertMany(toInsert);
    console.log(`✅ Inserted ${inserted.length} products across all categories`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

seedProducts();
