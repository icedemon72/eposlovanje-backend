import mongoose from "mongoose";

const ObjectId = mongoose.Schema.Types.ObjectId;

const boughtSchema = mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true
    },
    product: {
      type: [ObjectId],
      required: true
    },
    quantity: {
      type: [Number],
      default: 1
    },
    total: {
      type: Number,
      default: 0
    },
  },
  {
    timestamps: true
  }
);

const Bought = mongoose.model('Bought', boughtSchema);

export default Bought;