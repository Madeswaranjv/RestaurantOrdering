import BaseRepository from './BaseRepository.js';
import Contact from '../models/Contact.js';

class ContactRepository extends BaseRepository {
  constructor() {
    super(Contact);
  }
}

export default new ContactRepository();
