import BaseRepository from './BaseRepository.js';
import Restaurant from '../models/Restaurant.js';

class RestaurantRepository extends BaseRepository {
  constructor() {
    super(Restaurant);
  }

  async getSingleRestaurant() {
    return await this.model.findOne();
  }
}

export default new RestaurantRepository();
