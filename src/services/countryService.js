import mongoose from "mongoose";
import Country from "../models/countryModel.js";

export const getCountry = async (country) => {
  try {
    let countryObj;

    if (country.id) {
      if (country.id !== 'all' && !mongoose.Types.ObjectId.isValid(country.id)) {
        throw  {
          status: 400,
          message: `'${country.id}' nije ObjectID!`
        }
      }

      countryObj = await Country.findById(country.id);

      if (!countryObj) {
        throw  {
          status: 400,
          message: `Država sa ID-em '${country.id}' ne postoji!`
        };
      }

    } else if (country.name) {
      countryObj = await Country.findOne({ "name": country.name });

      if (!countryObj) {
        throw {
          status: 400,
          message: `Država '${country.name}' ne postoji!`
        }; 
      
      }

    } else {
        country.active === '1' ? 
        countryObj = await Country.find({code: {$exists: true}}).sort({ "name": 1 }) 
        : countryObj = await Country.find().sort({ "name": 1 });
      
    }

    return countryObj;

  } catch (err) {
    throw err;
  }
}