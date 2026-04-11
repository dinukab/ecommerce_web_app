import dotenv from 'dotenv';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Review from './models/Review.js';
import connectDB from './config/database.js';
dotenv.config();
const seedData = async () => {
    try {
        await connectDB();
        // Clear existing data
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Review.deleteMany({});
        console.log('Cleared existing data');
        // Create categories
        const categories = await Category.insertMany([
            {
                name: 'Electronics',
                slug: 'electronics',
                description: 'Electronic devices and gadgets',
            },
            {
                name: 'Headphones',
                slug: 'headphones',
                description: 'Audio headphones and earbuds',
            },
            {
                name: 'Speakers',
                slug: 'speakers',
                description: 'Portable and home speakers',
            },
        ]);
        console.log('Created categories');
        // Create products
        const products = await Product.insertMany([
            {
                name: 'Product_001',
                description: 'Premium wireless headphones with active noise cancellation. Experience exceptional sound quality with our latest audio technology.',
                price: 1800,
                originalPrice: 2000,
                category: categories[1]._id,
                stock: 50,
                rating: 5,
                numReviews: 245,
                badge: 'Best Seller',
                featured: true,
                specifications: {
                    brand: 'OneShop',
                    model: 'Product_001',
                    weight: '250g',
                    dimensions: '20 x 18 x 8 cm',
                },
            },
            {
                name: 'Product_002',
                description: 'High-performance portable speaker with 360-degree sound. Perfect for parties and outdoor adventures.',
                price: 2100,
                originalPrice: 2400,
                category: categories[2]._id,
                stock: 30,
                rating: 4,
                numReviews: 189,
                featured: true,
                specifications: {
                    brand: 'OneShop',
                    model: 'Product_002',
                    weight: '500g',
                    dimensions: '15 x 15 x 20 cm',
                },
            },
            {
                name: 'Product_003',
                description: 'Professional studio monitor headphones. Crystal clear audio for music production.',
                price: 3200,
                category: categories[1]._id,
                stock: 20,
                rating: 5,
                numReviews: 312,
                badge: 'New Arrival',
                featured: true,
                specifications: {
                    brand: 'OneShop',
                    model: 'Product_003',
                    weight: '300g',
                    dimensions: '22 x 20 x 10 cm',
                },
            },
            {
                name: 'Product_004',
                description: 'Compact Bluetooth earbuds with charging case. Comfortable fit for all-day wear.',
                price: 1500,
                originalPrice: 1800,
                category: categories[1]._id,
                stock: 100,
                rating: 4,
                numReviews: 156,
                specifications: {
                    brand: 'OneShop',
                    model: 'Product_004',
                    weight: '50g',
                    dimensions: '5 x 5 x 3 cm',
                },
            },
            {
                name: 'Product_005',
                description: 'Experience premium quality with our latest product. Designed with cutting-edge technology.',
                price: 2300,
                originalPrice: 2500,
                category: categories[0]._id,
                stock: 40,
                rating: 5,
                numReviews: 428,
                badge: 'Best Seller',
                featured: true,
                specifications: {
                    brand: 'OneShop',
                    model: 'Product_005',
                    weight: '500g',
                    dimensions: '20 x 15 x 5 cm',
                },
            },
        ]);
        console.log('Created products');
        // Create reviews
        const reviews = await Review.insertMany([
            {
                product: products[0]._id,
                user: 'John Doe',
                rating: 5,
                title: 'Excellent Product!',
                text: 'This product exceeded my expectations. The quality is outstanding and it works perfectly.',
            },
            {
                product: products[0]._id,
                user: 'Jane Smith',
                rating: 4,
                title: 'Great value for money',
                text: 'Very satisfied with this purchase. Good quality and fast delivery.',
            },
            {
                product: products[0]._id,
                user: 'Mike Johnson',
                rating: 5,
                title: 'Highly recommended',
                text: 'Amazing product! Would definitely buy again.',
            },
        ]);
        console.log('Created reviews');
        console.log('Seed data inserted successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};
seedData();
