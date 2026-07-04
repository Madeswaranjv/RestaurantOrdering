import BaseRepository from './BaseRepository.js';
import Category from '../models/Category.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }
}

export default new CategoryRepository();
