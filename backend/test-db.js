import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Restaurant from './models/Restaurant.js';
import Menu from './models/Menu.js';
import Order from './models/Order.js';

dotenv.config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected successfully!');
    
    const userCount = await User.countDocuments();
    const restaurantCount = await Restaurant.countDocuments();
    const menuCount = await Menu.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log(`Users: ${userCount}`);
    console.log(`Restaurants: ${restaurantCount}`);
    console.log(`Menus: ${menuCount}`);
    console.log(`Orders: ${orderCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

checkDB();
