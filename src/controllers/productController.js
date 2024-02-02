import { 
  addProduct, deleteProduct, editProduct, 
  getArrayProduct, 
  /*getFilteredProducts,*/ getProduct, getUsedCountries,
  getUsedManufacturers, getUsedModelTypes, search
} from "../services/productService.js";
import { ObjectId } from 'mongodb';
import 'dotenv/config';
/* Models */
import Manufacturer from "../models/manufacturerModel.js";
import Country from "../models/countryModel.js";
import ModelType from "../models/typeModel.js";

export const handleAddProduct = async (req, res) => {
  try {
    const uploadedImages = req.files;

    if (!uploadedImages) {
      return res.status(400).send({ message: 'Nisu unete slike!' })
    }

    const imagesData = uploadedImages.map((file) => ({
      filename: file.filename,
      path: file.path
    }));

    const product = {
      ...req.body,
      images: imagesData
    }

    const countryObj = await Country.findById(new ObjectId(product.country)),
      manObj = await Manufacturer.findById(new ObjectId(product.manufacturer)),
      modelObj = await ModelType.findById(new ObjectId(product.modelType));

    const productObj = await addProduct(product, countryObj, manObj, modelObj);
    return res.status(200).json(productObj);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export async function handleEditProduct(req, res) {
  try {
    let product = {
      ...req.body
    }

    const done = await editProduct(product);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message })
  }
}

export const handleDeleteProduct = async (req, res) => {
  try {
    const done = deleteProduct(req.body.id);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message })
  }
}

export const handleGetProduct = async (req, res) => {
  try {
    if (!req.query.id) {
      req.query.id = 'all';
    }

    const done = await getProduct(req.query.id, req.query.notIn, req.query.limit, req.query.filters);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleGetProductArray = async (req, res) => {
  try {
    if(!req.query.products) {
      return res.status(400).send({message: 'Nema proizvoda'});
    }

    const done = await getArrayProduct(req.query.products);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({message: err.message})
  }
}

export const handleGetCountriesInProducts = async (req, res) => {
  try {
    const done = await getUsedCountries();
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleGetManufacturersInProducts = async (req, res) => {
  try {
    const done = await getUsedManufacturers();
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleGetTypesInProducts = async (req, res) => {
  try {
    const done = await getUsedModelTypes();
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}

export const handleSearch = async(req, res) => {
  try {
    if(!req.query.query) {
      req.query.query = '';
    }

    const done = await search(req.query.query);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({ "message": err.message });
  }
}
