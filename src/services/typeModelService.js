import mongoose from "mongoose";
import ModelType from "../models/typeModel.js";

export const getType = async (type) => {
  try {
    let typeObj;

    if (type.id) {
      if (!mongoose.Types.ObjectId.isValid(type.id)) {
        throw {
          status: 400,
          message: `'${country.id}' nije ObjectID!`
        };
      }

      typeObj = await ModelType.findById(type.id);

      if (!typeObj) {
        throw {
          status: 400,
          message: `Tip sa ID-em '${country.id}' ne postoji!`
        };
      }
    } else if (type.name) {
      typeObj = await ModelType.findOne({ "name": type.name });

      if (!typeObj) {
        throw {
          status: 400,
          message: `Tip '${country.name}' ne postoji!`
        };
      }
    } else {
      typeObj = await ModelType.find();
    }

    return typeObj;

  } catch (err) {
    throw err;
  }
}