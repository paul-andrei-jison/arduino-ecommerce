'use strict';

const { Router } = require('express');
const { listProducts } = require('../controllers/productController');

const router = Router();

router.get('/products', listProducts);

module.exports = router;
