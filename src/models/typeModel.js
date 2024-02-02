import mongoose from "mongoose";

// Laki, srednji, teski, MBT, IFV, SPG, APC, AC
const typeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    }
  }
);

const ModelType = mongoose.model('modeltypes', typeSchema);

export default ModelType;