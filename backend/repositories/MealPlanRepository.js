import BaseRepository from './BaseRepository.js';
import MealPlan from '../models/MealPlan.js';

class MealPlanRepository extends BaseRepository {
  constructor() {
    super(MealPlan);
  }

  async findByUserId(userId) {
    return await this.model.find({ user: userId }).sort({ createdAt: -1 });
  }
}

export default new MealPlanRepository();
