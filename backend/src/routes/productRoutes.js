'use strict';

const { Router } = require('express');
const {
  listProducts,
  getProductHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} = require('../controllers/productController');
const upload = require('../middleware/upload');
const { verifyToken } = require('../middleware/auth');

const router = Router();

router.get('/products', listProducts);
router.get('/products/:id', getProductHandler);

router.post('/products', verifyToken, upload.array('productImages', 5), createProductHandler);
router.put('/products/:id', verifyToken, upload.array('productImages', 5), updateProductHandler);
router.delete('/products/:id', deleteProductHandler);

module.exports = router;
