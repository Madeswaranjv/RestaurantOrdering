import BaseRepository from './BaseRepository.js';
import Review from '../models/Review.js';

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }

  async findDetailed(filter = {}) {
    return await this.model.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
  }
}

export default new ReviewRepository();
