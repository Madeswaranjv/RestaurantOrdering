import CartRepository from '../repositories/CartRepository.js';
import MenuRepository from '../repositories/MenuRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await CartRepository.findByUserId(req.user._id, true);
  res.status(200).json(
    new ApiResponse(200, { cart }, 'Cart retrieved successfully')
  );
});

export const addToCart = asyncHandler(async (req, res) => {
  const { menuItemId, quantity = 1, customization = {} } = req.body;

  // 1. Verify menu item exists
  const menuItem = await MenuRepository.findById(menuItemId);
  if (!menuItem) {
    throw new ApiError(404, 'Menu item not found');
  }

  // 2. Fetch or create cart
  const cart = await CartRepository.findByUserId(req.user._id, false);

  // 3. Find if item with same ID and customization already exists
  const existingItemIndex = cart.items.findIndex(item => 
    item.menuItem.toString() === menuItemId &&
    JSON.stringify(item.customization || {}) === JSON.stringify(customization)
  );

  if (existingItemIndex > -1) {
    // Increment quantity
    cart.items[existingItemIndex].quantity += Number(quantity);
  } else {
    // Add new item
    cart.items.push({
      menuItem: menuItemId,
      quantity: Number(quantity),
      customization
    });
  }

  await cart.save();
  const updatedCart = await CartRepository.recalculateCart(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { cart: updatedCart }, 'Item added to cart successfully')
  );
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { menuItemId, quantity, customization = {} } = req.body;

  const cart = await CartRepository.findByUserId(req.user._id, false);

  const itemIndex = cart.items.findIndex(item => 
    item.menuItem.toString() === menuItemId &&
    JSON.stringify(item.customization || {}) === JSON.stringify(customization)
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  if (Number(quantity) <= 0) {
    // Remove item if quantity is 0 or less
    cart.items.splice(itemIndex, 1);
  } else {
    // Update quantity
    cart.items[itemIndex].quantity = Number(quantity);
  }

  await cart.save();
  const updatedCart = await CartRepository.recalculateCart(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { cart: updatedCart }, 'Cart updated successfully')
  );
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params; // MenuItem ID

  const cart = await CartRepository.findByUserId(req.user._id, false);

  // Filter out any items matching the menuItem ID (regardless of customization)
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(item => item.menuItem.toString() !== itemId);

  if (cart.items.length === initialLength) {
    throw new ApiError(404, 'Item not found in cart');
  }

  await cart.save();
  const updatedCart = await CartRepository.recalculateCart(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { cart: updatedCart }, 'Item removed from cart')
  );
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await CartRepository.findByUserId(req.user._id, false);
  cart.items = [];
  await cart.save();

  const updatedCart = await CartRepository.recalculateCart(req.user._id);

  res.status(200).json(
    new ApiResponse(200, { cart: updatedCart }, 'Cart cleared successfully')
  );
});
