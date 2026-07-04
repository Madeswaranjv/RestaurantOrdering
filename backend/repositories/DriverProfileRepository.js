import BaseRepository from './BaseRepository.js';
import DriverProfile from '../models/DriverProfile.js';

class DriverProfileRepository extends BaseRepository {
  constructor() {
    super(DriverProfile);
  }

  async findByUserId(userId) {
    return await this.model.findOne({ user: userId });
  }
}

export default new DriverProfileRepository();
