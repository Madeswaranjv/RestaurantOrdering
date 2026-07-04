import BaseRepository from './BaseRepository.js';
import Cart from '../models/Cart.js';

class CartRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }

  async findByUserId(userId, populateMenu = true) {
    let cart = await this.model.findOne({ user: userId });
    if (!cart) {
      cart = await this.model.create({ user: userId, items: [] });
    }
    if (populateMenu && cart.items.length > 0) {
      cart = await cart.populate('items.menuItem');
    }
    return cart;
  }

  async recalculateCart(userId) {
    const cart = await this.findByUserId(userId, true);
    let subtotal = 0;
    
    cart.items.forEach(item => {
      if (item.menuItem) {
        subtotal += item.menuItem.price * item.quantity;
      }
    });

    cart.subtotal = Number(subtotal.toFixed(2));
    cart.deliveryFee = subtotal > 0 ? 15.00 : 0.00;
    cart.tax = Number((subtotal * 0.1).toFixed(2));
    cart.grandTotal = Number((cart.subtotal + cart.deliveryFee + cart.tax).toFixed(2));

    await cart.save();
    return cart;
  }
}

export default new CartRepository();
