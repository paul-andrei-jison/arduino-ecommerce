'use strict';

const { getAllProducts } = require('../services/productService');

async function listProducts(req, res) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error('listProducts error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
}

module.exports = { listProducts };
