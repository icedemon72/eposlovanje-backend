import mongoose from "mongoose";
import Manufacturer from "../models/manufacturerModel.js";
import Country from "../models/countryModel.js";

export const addManufacturer = async (data) => {
  try {
    const manObj = await Manufacturer.findOne({ "name": data.name });
    let body = {};

    if (manObj) {
      throw {
        status: 400,
        message: `Proizvodjač '${data.name}' već postoji!`
      };
    }

    if (data.country) {
      const countryObj = await Country.findById(data.country);

      if (!countryObj) {
        throw {
          status: 400,
          message: `Zemlja sa ID-em '${data.country}' ne postoji!`
        };
      }

      body = {
        "name": data.name,
        "country": countryObj._id
      }

    } else {
      body = {
        "name": data.name
      }
    }

    const manufacturer = await Manufacturer.create(body);

    if (!manufacturer) {
      throw {
        status: 500,
        message: 'Greška pri pristupu proizvodjaču!'
      };
    }

    return manufacturer;

  } catch (err) {
    throw err;
  }
}

export const deleteManufacturer = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw {
        status: 400,
        message: `'${id}' nije ObjectID!`
      };
    }

    let manObj = await Manufacturer.findById(id);

    if (manObj) {
      manObj.active = false;
      await manObj.save();
      return { message: `Proizvodjač '${manObj.name}' je uspešno obrisan!` };
    }

    throw {
      status: 400,
      message: 'Proizvodjač ne postoji!'
    };
  } catch (err) {
    throw err;
  }
}

export const getManufacturers = async (id = 'all') => {
  try {
    if (id !== 'all' && !mongoose.Types.ObjectId.isValid(id)) {
      throw {
        status: 400,
        message: `'${id}' nije ObjectID!`
      };
    }

    if (id === 'all') {
      return Manufacturer.find();
    }

    const manufacturer = await Manufacturer.findById(id);

    if (!manufacturer) {
      throw {
        status: 400,
        message: `Proizvodjač sa ID-em '${id}' ne postoji!`
      };
    }

    return manufacturer;

  } catch (err) {
    throw err;
  }
}