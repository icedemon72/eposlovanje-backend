import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

import Review from '../models/reviewModel.js'
import Bought from '../models/boughtModel.js';

export const submitReview = async (data) => {
  try {
    if(!mongoose.Types.ObjectId.isValid(new ObjectId(data.user))) {
      throw (`${data.user} nije ObjectID!`);
    }

    if(!mongoose.Types.ObjectId.isValid(new ObjectId(data.product))) {
      throw (`${data.product} nije ObjectID!`);
    }

    data.score = parseInt(data.score);

    if(!data.score) {
      throw {
        status: 400,
        message: 'Mora postojati ocena!'
      };
    }
    
    if(data.score < 1) {
      throw {
        status: 400,
        message: 'Ocena ne može biti manja od 1!'
      };
    }
    
    if(data.score > 5) {
      throw {
        status: 400,
        message: 'Ocena ne može biti veća od 5!'
      };
    }
    
    if(!data.review) {
      data.review = 'Ova recenzija je bez teksta.'
    }

    let isAlreadyReviewed = await Review.findOne({user: data.user, product: data.product});

    if(isAlreadyReviewed) {
      if(isAlreadyReviewed.score !== data.score || isAlreadyReviewed.review !== data.review) {
        isAlreadyReviewed.score = data.score;
        isAlreadyReviewed.review = data.review;
        await isAlreadyReviewed.save();
        return {message: 'Recenzija uspešno izmenjena!'}
      } 
      
      throw {
        status: 400,
        message: 'Proizvod je već ocenjen!'
      };

    }

    const boughtItemsObj = await Bought.findOne({user: data.user, product: data.product});

    if(!boughtItemsObj) {
      throw {
        status: 400,
        message: 'Korisnik nije kupio ovaj proizvod!'
      };
    }

    await Review.create({...data});
    return {message: "Recenzija uspešno kreirana!"};

  } catch (err) {
    throw err;
  }
}

export const getReviewsByProductId = async (product) => {
  try {
    if(!mongoose.Types.ObjectId.isValid(new ObjectId(product))) {
      throw {
        status: 400,
        message: `${product} nije ObjectID!`
      };
    }

    const products = await Review.find({ product: product });
    return products;

  } catch (err) {
    throw err;
  }
}

export const checkUserBought = async (data) => await Bought.findOne({ $and: [{user: data.user}, {product: data.product}] });