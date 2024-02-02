import { handleGetCountry } from './controllers/countryController.js';
import { handleAddManufacturer, handleDeleteManufacturer, handleGetManufacturers } from './controllers/manufacturerController.js';
import { 
  handleAddProduct, handleDeleteProduct, handleEditProduct, 
  handleGetCountriesInProducts, /*handleGetFilteredProducts,*/ 
  handleGetManufacturersInProducts, handleGetProduct, handleGetProductArray, handleGetTypesInProducts, handleSearch,

 } from './controllers/productController.js';

import { handleGetType } from './controllers/typeModelController.js';
import { handleBuy, handleGetBoughtProducts } from './controllers/boughtController.js';
import { handleAddReview, handleGetReview, handleGetReviews } from './controllers/reviewController.js';

import {
  handleGetUser, handleLoginUser, handleUserRegister,
  handleRefresh, handleLogout, authenticateUser,
  checkValidAccess, authorizeUser, checkRole, handleGetId, handleCountUsers, handleRoleChange
} from './controllers/userController.js';

import upload from './multer/multerConfig.js';

import Country from './models/countryModel.js';

/**
 * @param {Express} app
 */

export default (app) => {
  //#region Products
  app.post('/products/add', upload.array('images[]', 5),async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res, next) => {
    authorizeUser(req, res, next);
  }, async (req, res) => {
    handleAddProduct(req, res);
  });

  app.post('/products/delete', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res, next) => {
    authorizeUser(req, res, next);
  }, async (req, res) => {
    handleDeleteProduct(req, res);
  });

  app.post('/products/edit', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res, next) => {
    authorizeUser(req, res, next);
  }, async (req, res) => {
    handleEditProduct(req, res);
  });

  // Either conditional endpoint, or to create 2 endpoints to do 
  // almost the same thing
  app.get('/products', async (req, res) => {
    if(req.query.array) {
      handleGetProductArray(req, res);
    } else {
      handleGetProduct(req, res);
    }
  });

  app.post('/products/buy', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    handleBuy(req, res);
  });

  app.get('/products/user/bought', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    handleGetBoughtProducts(req, res);
  });

  app.get('/products/countries', async (req, res) => {
    handleGetCountriesInProducts(req, res);
  });

  app.get('/products/manufacturers', async (req, res) => {
    handleGetManufacturersInProducts(req, res);
  });

  app.get('/products/types', async (req, res) => {
    handleGetTypesInProducts(req, res);
  });

  // app.get('/products/filters', async (req, res) => {
  //   handleGetFilteredProducts(req, res);
  // });

  app.get('/products/search', async (req, res) => {
    handleSearch(req, res);
  });
  //#endregion

  //#region Types 
  app.get('/types', async (req, res) => {
    handleGetType(req, res);
  })
  //#endregion

  //#region Manufacturers 
  app.post('/manufacturers/add', async (req, res) => {
    handleAddManufacturer(req, res);
  });

  app.post('/manufacturers/delete', async (req, res) => {
    handleDeleteManufacturer(req, res);
  });

  app.get('/manufacturers', async (req, res) => {
    handleGetManufacturers(req, res);
  });

  //#endregion

  //#region Users
  app.post('/register', async (req, res) => {
    handleUserRegister(req, res);
  });

  // todo: fix potential users data leak...
  app.get('/users', async (req, res) => {
    handleGetUser(req, res);
  });

  app.post('/users/id', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    handleGetId(req, res);
  })

  app.post('/users/role', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res, next) => {
    authorizeUser(req, res, next);
  }, async (req, res) => {
    handleRoleChange(req, res);
  });

  app.get('/users/count', async (req, res) => {
    handleCountUsers(req, res);
  });
  //#endregion

  //#region Sessions
  app.post('/login', async (req, res) => {
    handleLoginUser(req, res);
  });

  app.post('/refresh', async (req, res) => {
    handleRefresh(req, res);
  });

  app.post('/logout', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    handleLogout(req, res);
  });

  app.post('/authenticate', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    checkValidAccess(req, res);
  });
  

  // for admins and moderators
  app.post('/authorize', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res, next) => {
    authorizeUser(req, res, next);
  }, async (req, res) => {
    checkRole(req, res);
  });

  app.post('/role', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    checkRole(req, res);
  });
  //#endregion

  /* Countries */
  app.get('/countries', async (req, res) => {
    handleGetCountry(req, res);
  });

  app.post('/fake', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    res.status(200).send(JSON.stringify(req.userTokenData));
  });

  //#region Reviews
  app.get('/reviews', async (req, res) => {
    handleGetReviews(req, res);
  });

  app.get('/review', async (req, res) => {
    handleGetReview(req, res);
  });

  app.post('/review/add', async (req, res, next) => {
    authenticateUser(req, res, next);
  }, async (req, res) => {
    handleAddReview(req, res);
  });
  //#endregion

  /* Random stuff */
  app.post('/countries', async (req, res) => {
    try {
      const country = await Country.create(req.body);
      res.status(200).json(country);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  });
  // app.post('/add', async (req, res) => {
  //     try {
  //         const model = await ModelType.create(req.body);
  //         res.status(200).json(model);
  //     }catch (err){ console.log(err) }
  // } )
}

