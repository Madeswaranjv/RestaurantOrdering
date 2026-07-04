import BaseRepository from './BaseRepository.js';
import Menu from '../models/Menu.js';

class MenuRepository extends BaseRepository {
  constructor() {
    super(Menu);
  }

  async queryMenuItems({ search, category, minPrice, maxPrice, isAvailable, featured, sort, page = 1, limit = 10 }) {
    const filter = {};

    // Text search if search keyword is provided
    if (search) {
      filter.$text = { $search: search };
    }

    // Filter by Category ID
    if (category) {
      filter.category = category;
    }

    // Filter by Price range
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Filter by Availability
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    // Filter by Featured flag
    if (featured !== undefined) {
      filter.featured = featured === 'true' || featured === true;
    }

    // Determine Sort Options
    let sortOption = {};
    if (sort) {
      if (sort === 'price_asc') sortOption = { price: 1 };
      else if (sort === 'price_desc') sortOption = { price: -1 };
      else if (sort === 'rating_desc') sortOption = { rating: -1 };
      else if (sort === 'newest') sortOption = { createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const pageNum = Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number(limit) > 0 ? Number(limit) : 10;
    const skipIndex = (pageNum - 1) * limitNum;

    // Execute query with projection for text score if searching
    let query;
    if (search) {
      query = this.model.find(
        filter,
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' }, ...sortOption });
    } else {
      query = this.model.find(filter).sort(sortOption);
    }

    query = query.populate('category')
      .limit(limitNum)
      .skip(skipIndex);

    const items = await query;
    const total = await this.model.countDocuments(filter);

    return {
      items,
      total,
      pages: Math.ceil(total / limitNum),
      page: pageNum
    };
  }
}

export default new MenuRepository();
