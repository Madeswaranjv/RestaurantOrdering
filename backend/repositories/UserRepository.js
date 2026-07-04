import BaseRepository from './BaseRepository.js';
import User from '../models/User.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async findByGoogleId(googleId) {
    return await this.model.findOne({ googleId });
  }
}

export default new UserRepository();
