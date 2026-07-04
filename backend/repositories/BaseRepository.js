export default class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async find(filter = {}, populate = '', sort = {}, select = '') {
    return await this.model.find(filter).populate(populate).sort(sort).select(select);
  }

  async findOne(filter = {}, populate = '', select = '') {
    return await this.model.findOne(filter).populate(populate).select(select);
  }

  async findById(id, populate = '', select = '') {
    return await this.model.findById(id).populate(populate).select(select);
  }

  async create(data) {
    return await this.model.create(data);
  }

  async updateById(id, data, options = { new: true }) {
    return await this.model.findByIdAndUpdate(id, data, options);
  }

  async updateOne(filter, data, options = { new: true }) {
    return await this.model.findOneAndUpdate(filter, data, options);
  }

  async deleteById(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter = {}) {
    return await this.model.deleteMany(filter);
  }

  async countDocuments(filter = {}) {
    return await this.model.countDocuments(filter);
  }
}
