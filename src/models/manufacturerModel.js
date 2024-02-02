import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const manufacturerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Manufacturer name is required!']
    },
    country: {
      type: ObjectId,
      required: false
    },
    active: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Manufacturer = mongoose.model('Manufacturer', manufacturerSchema);

export default Manufacturer;