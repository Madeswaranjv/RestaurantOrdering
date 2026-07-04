import BaseRepository from './BaseRepository.js';
import Notification from '../models/Notification.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  async findByUserId(userId) {
    return await this.model.find({ user: userId }).sort({ createdAt: -1 });
  }

  async markAsRead(id, userId) {
    return await this.model.findOneAndUpdate(
      { _id: id, user: userId },
      { read: true },
      { new: true }
    );
  }
}

export default new NotificationRepository();
