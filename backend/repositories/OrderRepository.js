import BaseRepository from './BaseRepository.js';
import Order from '../models/Order.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByUserId(userId) {
    return await this.model.find({ user: userId })
      .populate('items.menuItem')
      .populate('deliveryPartner', 'name phone avatar')
      .sort({ createdAt: -1 });
  }

  async findByDeliveryPartnerId(partnerId) {
    return await this.model.find({ deliveryPartner: partnerId })
      .populate('user', 'name phone')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });
  }

  async findActiveOrdersForDelivery() {
    // Orders ready to be picked up
    return await this.model.find({ status: 'READY_FOR_PICKUP' })
      .populate('user', 'name phone')
      .populate('items.menuItem')
      .sort({ createdAt: 1 });
  }

  async findDetailedOrderById(orderId) {
    return await this.model.findById(orderId)
      .populate('user', 'name email phone avatar')
      .populate('items.menuItem')
      .populate('deliveryPartner', 'name phone avatar');
  }

  async findAllDetailed() {
    return await this.model.find()
      .populate('user', 'name email')
      .populate('deliveryPartner', 'name')
      .sort({ createdAt: -1 });
  }
}

export default new OrderRepository();
