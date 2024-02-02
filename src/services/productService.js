import mongoose, { model } from "mongoose";
import { ObjectId } from "mongodb";

/* Models */
import Product from "../models/productModel.js";
import Country from "../models/countryModel.js";
import Manufacturer from "../models/manufacturerModel.js";
import ModelType from "../models/typeModel.js";

export const addProduct = async (product, country, man, model) => {
  try {
    if (!country) {
      throw {
        status: 400,
        message: 'Greška u odabiru zemlje!'
      };
    }
    if (!man) {
      throw {
        status: 400,
        message: 'Greška u odabiru proizvodjača!'
      };
    }
    if (!model) {
      throw {
        status: 400,
        message: 'Greška u odabiru tipa modela!'
      };
    }

    product.country = country._id;
    product.manufacturer = man._id;
    product.modelType = model._id;

    let productObj = await Product.findOne({
      $and: [
        { "name": product.name },
        { "variation": product.variation },
        { "year": product.year },
        { "scale": product.scale },
        { "country": product.country },
        { "manufacturer": product.manufacturer }
      ]
    });

    if (productObj) {
      if (!productObj.deleted) {
        throw {
          status: 400,
          message: 'Već postoji ovaj proizvod!'
        };
      }

      await Product.updateOne({ "_id": productObj._id }, { "$set": { "deleted": false } });
      return product;
    }

    await Product.create(product);
    return { "message": `Proizvod ${product.name} uspešno kreiran!` };

  } catch (err) {
    throw err;
  }
}

export const deleteProduct = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(new ObjectId(id))) {
      throw {
        status: 400,
        message: `'${id}' nije ObjectID!`
      };
    }

    let productObj = await Product.findById(new ObjectId(id));

    if (!productObj) {
      throw {
        status: 400,
        message: 'Proizvod ne postoji!'
      };
    }

    productObj.deleted = true;
    await productObj.save();
    return { message: `Proizvod '${productObj.name}${productObj.variation}' je uspešno obrisan!` };
  } catch (err) {
    throw err;
  }
}

export const getProduct = async (id = 'all', notIn = [], limit = 6, filters = {}) => {
  try {
    if (id !== 'all' && !mongoose.Types.ObjectId.isValid(id)) {
      throw {
        status: 400,
        message: `'${id}' nije ObjectID!`
      };
    }
    
    if(Object.keys(filters).length) {
      return await getFilteredProducts(filters, notIn, limit);
    }

    if (id === 'all') {
      return await Product.find({ deleted: false, _id: { $nin: notIn } }).limit(limit);
    }

    const product = await Product.findById(id);

    if (!product) {
      throw {
        status: 400,
        message: `Proizvod sa ID-em '${id}' ne postoji!`
      };;
    }

    return product;

  } catch (err) {
    throw err;
  }
}

export const editProduct = async (product) => {
  try {
    if (product.quantity < 0 || !product.quantity) {
      product.quantity = 0;
    }

    if (!product.name) {
      throw {
        status: 400,
        message: `Naziv ne sme biti nedefinisan!`
      };
    }

    if (!product.price) {
      throw {
        status: 400,
        message: 'Model mora imati cenu!'
      };
    }

    const countryObj = await Country.findById(new ObjectId(product.country));

    if (!countryObj) {
      throw {
        status: 400,
        message: `Država sa ID-em ${product.country} ne postoji!`
      };
    }

    const manObj = await Manufacturer.findById(new ObjectId(product.manufacturer));

    if (!manObj) {
      throw {
        status: 400,
        message: `Proizvodjač sa ID-em ${product.manufacturer} ne postoji!`
      };
    }

    const modelObj = await ModelType.findById(new ObjectId(product.modelType));

    if (!modelObj) {
      throw {
        status: 400,
        message: `Tip sa ID-em ${product.modelType} ne postoji!`
      };
    }

    const productObj = await Product.findOne({
      $and: [
        { "name": product.name },
        { "variation": product.variation },
        { "year": product.year },
        { "scale": product.scale },
        { "country": product.country },
        { "manufacturer": product.manufacturer },
        { "deleted": !product.deleted }
      ]
    });

    if (productObj) {
      throw {
        status: 409,
        message: 'Ovaj model već postoji!'
      };
    }

    const checkIfSame = await Product.findOne({ ...product });

    if (checkIfSame) {
      throw {
        status: 304,
        message: 'Ništa nije promenjeno...'
      };
    }

    await Product.updateOne({ "_id": new ObjectId(product._id) }, { "$set": { ...product } });
    return { "message": `Proizvod uspešno izmenjen!` }
  } catch (err) {
    throw err;
  }

}

export const getUsedCountries = async () => {
  try {
    const uniqueCountries = await Product.distinct('country');

    let countries = [];

    for (let i = 0; i < uniqueCountries.length; i++) {
      const id = uniqueCountries[i];
      const country = await Country.findById(id);
      const count = await Product.find({ country: uniqueCountries[i] }).count();
      countries.push({ country, count });
    }

    return countries;
  } catch (err) {
    throw new Error(err);
  }
}

export const getUsedManufacturers = async () => {
  try {
    const uniqueManufacturers = await Product.distinct('manufacturer');

    let manufacturers = [];

    for (let i = 0; i < uniqueManufacturers.length; i++) {
      const id = uniqueManufacturers[i];
      const manufacturer = await Manufacturer.findById(id);
      const count = await Product.find({ manufacturer: uniqueManufacturers[i] }).count();
      manufacturers.push({ manufacturer, count });
    }

    return manufacturers;

  } catch (err) {
    throw err;
  }
}

export const getUsedModelTypes = async () => {
  try {
    const uniqueTypes = await Product.distinct('modelType');

    let types = [];

    for (let i = 0; i < uniqueTypes.length; i++) {
      const id = uniqueTypes[i];
      const type = await ModelType.findById(id);
      const count = await Product.find({ modelType: uniqueTypes[i] }).count();
      types.push({ type, count });
    }
    return types;

  } catch (err) {
    throw err;
  }

}

export const getArrayProduct = async (data) => {
  try {
    let result = [];
    let ObjResult = {};
    // Horror inbound, get unique values from 2d array
    for (let i = 0; i < Object.keys(data).length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        let inRes = false;
        for(let k = 0; k < result.length; k++) {
          if(data[i][j] === result[k]) {
            inRes = true;
            break;
          }
        }

        if(!inRes) {
          result.push(data[i][j]);
        }
      }
    }

    for (let i = 0; i < result.length; i++) {
      ObjResult[result[i]] = await Product.findOne({_id: result[i]}, {name: 1, variation: 1, scale: 1, images: 1, tags: 1, _id: 0});
    }


    return ObjResult;

  } catch (err) {
    throw err;
  }
}

export const search = async (query) => {
  try {
    const result = await Product.find({$or: [
      { name: {$regex: query} },
      { variation: {$regex: query} },
      { year: {$regex: query} }
    ]});

    return result;
  } catch (err) {
    throw err;
  }
}

const getFilteredProducts = async (filters, notIn = [], limit = 6) => {
  // filters -> countries, mafunacturers, tags, types
  try {
    let filterWord = {
      $or: []
    }
    
    
    if(filters.modelType) {
      filterWord.$or.push({modelType: {$in: filters.modelType}});
    }
    
    if(filters.country) {
      filterWord.$or.push({country: {$in: filters.country}});
    }

    if(filters.manufacturer) {
      filterWord.$or.push({manufacturer: {$in: filters.manufacturer}});
    }

    if (!filterWord.$or.length) {
      return getProduct();
    }
        
    const products = await Product.find({ $and: [{...filterWord, _id: { $nin: notIn } }]}).limit(limit);
    return products;
  } catch (err) {
    throw err;
  }
}