import User from "../models/userModel.js";
import Product from "../models/productModel.js";
import Bought from "../models/boughtModel.js";
import mongoose from "mongoose";

export const buyProduct = async (user, products) => {
  try {
    if(!mongoose.Types.ObjectId.isValid(user)) {
      throw ({message: `${user} nije ObjectID!`});
    }
    
    const userObj = await User.findById(user);
    
    if(!userObj) {
      throw ({
        status: 400,
        message: `Korisnik sa ID-em ${user} ne postoji!`
      });
    }
    
    let totalPrice = 0;
    let productModels = [];
    let quantity = [];
    
    for (let i = 0; i < products.length; i++) {
      let elem = products[i];
      
      if(!mongoose.Types.ObjectId.isValid(elem.product)) {
        throw ({
          status: 400,
          message: `${elem.product} nije ObjectID!`
        });
      }
      
      const productModel = await Product.findById(elem.product);
      
      if(!productModel) {
        throw ({
          status: 400,
          message: `Proizvod sa ID-em ${elem.product} ne postoji!`
        });
      }
      
      if(productModel.quantity === 0) {
        throw ({
          status: 400,
          message: 'Proizvoda nema više na stanju!'
        })
      } 
      
      if(elem.quantity <= 0) {
        throw ({
          status: 400,
          message: `Greška prilikom odabira količine`
        })
      }
  
      if(elem.quantity > productModel.quantity) {
        elem.quantity = productModel.quantity;
      }
      
      totalPrice += elem.quantity * productModel.price;
      productModel.quantity -= elem.quantity;
      quantity.push(elem.quantity);
      productModels.push(productModel);
    }

    
    if(totalPrice > userObj.wallet) {
      throw ({
        status: 400,
        message: 'Nemate dovoljno novca za ovu transakciju!'
      });
    }

    userObj.wallet -= totalPrice;

    for(let i = 0; i < productModels.length; i++) {
      const model = productModels[i];
      await model.save();
    }
    
    
    const productIDs = productModels.map(elem => elem._id);
    
    await Bought.create({
      user: userObj._id, 
      product: productIDs, 
      quantity: quantity,
      total: totalPrice
    });
    
    await userObj.save();

    return {message: 'Proizvod/i uspešno kupljen/i!'};

  } catch (err) {
    throw err;
  }
}

export const getBoughtProducts = async (user) => {
  try {
    if(!mongoose.Types.ObjectId.isValid(user)) {
      throw {
        status: 400,
        message: `${user} nije ObjectID!`
      };
    }

    const boughtObj = await Bought.find({user: user}).sort({createdAt: -1});
    return boughtObj;
  } catch (err) {
    throw err;
  }
}