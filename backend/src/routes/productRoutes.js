'use strict';

const { Router } = require('express');
const {
  listProducts,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = require('../controllers/productController');

const router = Router();

router.get('/products', listProducts);
router.get('/products/:id', getProductHandler);

router.post('/products', createProductHandler);
router.put('/products/:id', updateProductHandler);
router.delete('/products/:id', deleteProductHandler);

module.exports = router;
