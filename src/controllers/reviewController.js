import { submitReview, checkUserBought, getReviewsByProductId } from "../services/reviewService.js";

export const handleAddReview = async (req, res) => {
  try {
    const user = req.body.user;
    const product = req.body.product;
  
    if(!user) {
      return res.status(400).send({message: 'Korisnik je nedefinisan!'});
    }

    if(!product) {
      return res.status(400).send({message: 'Proizvod je nedefinisan!'});
    }

    const done = await submitReview(req.body);
    return res.status(200).json(done);

  } catch(err) {
    return res.status(err.status || 500).send({ message: err.message});
  }
}

export const handleGetReview = async (req, res) => {
  try {
    if(!req.query.user) {
      return res.status(400).send({message: 'Korisnik je nedefinisan!'});
    }

    if(!req.query.product) {
      return res.status(400).send({message: 'Proizvod je nedefinisan!'});
    }

    const boughtProduct = await checkUserBought(req.query);

    if (!boughtProduct) {
      return res.status(400).send({message: 'Korisnik nije kupio ovaj proizvod', bought: false});
    } 

    return res.status(200).send({message: 'Korisnik je kupio ovaj proizvod!', bought: true});

  } catch (err) {
    return res.status(err.status || 500).send({ message: err.message, bought: false});
  }
}

export const handleGetReviews = async (req, res) => {
  try {
    if(!req.query.product) {
      return res.status(400).send({message: 'Proizvod je nedefinisan!'});
    }
    
    const done = await getReviewsByProductId(req.query.product);
    return res.status(200).json(done);

  } catch (err) {
    return res.status(err.status || 500).send({ message: err.message });
  }
}