import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;
// Country, Manufacturer, 
const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nije uneto ime proizvoda!']
    },
    variation: {
      type: String,
      required: false,
      default: ''
    },
    description: {
      type: String,
      required: false,
      default: 'Nema opisa'
    },
    scale: {
      type: String,
      required: false,
      default: 'NaN'
    },
    quantity: {
      type: Number,
      required: [true, 'Nije uneta količina proizvoda!'],
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      required: [true, 'Nije uneta cena proizvoda!'],
      min: 0
    },
    images: [{
      filename: {
        type: String,
      },
      path: {
        type: String,
      }
    }],
    modelType: {
      type: ObjectId,
      required: true
    },
    year: {
      type: String,
      required: [true, 'Nije uneta godina proizvodnje vozila!']
    },
    tags: {
      type: [String],
      required: false,
      default: []
    },
    country: {
      type: ObjectId,
      required: true
    },
    manufacturer: {
      type: ObjectId,
      required: true
    },
    deleted: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;