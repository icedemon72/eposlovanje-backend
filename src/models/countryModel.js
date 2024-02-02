import mongoose from 'mongoose';

const countrySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Country name is required!'],
      unique: true
    },
    fullname: {
      type: String,
      required: false,
      default: '',
      unique: true
    },
    flag: {
      type: String,
      required: false,
      default: 'default.jpg'
    },
    code: {
      type: String,
      required: false
    }
  }
);

const Country = mongoose.model('Country', countrySchema);

export default Country;