import { buyProduct, getBoughtProducts } from './../services/boughtService.js';

export const handleBuy = async (req, res) => {
  try {
    if(!req.userTokenData) {
      return res.status(401).send({message: 'No access token'});
    }

    const user = req.userTokenData._id;
    if(!user) {
      return res.status(406).send({message: 'Ne postoji korisnik'});
    }
    
    if(!req.body.products) {
      return res.status(406).send({message: 'Ne postoji proizvod'});
    }
    
    
    const done = await buyProduct(user, req.body.products);
    
    return res.status(200).send(done);
    
  } catch (err) {
    return res.status(err.status || 500).send({message: err.message});
  }
}

/* This is for profile and admin checks */
export const handleGetBoughtProducts = async (req, res) => {
  try {
    const requestedBy = req.userTokenData;
    const { user, limit } = req.query;
    
    if (requestedBy.role !== 'Admin' || requestedBy._id !== user) {
      return res.status(403).send({message: 'Insufficient permissions!'});
    }

    const done = await getBoughtProducts(user);
    return res.status(200).json(done);
  } catch (err) {
    return res.status(err.status || 500).send({message: err.message});
  }
}