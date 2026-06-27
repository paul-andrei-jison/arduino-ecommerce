'use strict';

const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../services/productService');

async function listProducts(req, res) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error('listProducts error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
}

async function createProductHandler(req, res) {
  try {
    const { name, description, category, price, stock } = req.body;
    const productId = await createProduct({ name, description, category, price, stock });
    res.status(201).json({
      id: productId,
      name,
      description,
      category,
      price,
      stock,
    });
  } catch (err) {
    console.error('createProductHandler error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProductHandler(req, res) {
  try {
    const { id } = req.params;
    await updateProduct(id, req.body);
    res.status(200).json({ message: `Product ${id} updated successfully` });
  } catch (err) {
    console.error('updateProductHandler error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function deleteProductHandler(req, res) {
  try {
    const { id } = req.params;
    await deleteProduct(id);
    res.status(200).json({ message: `Product ${id} deleted successfully` });
  } catch (err) {
    console.error('deleteProductHandler error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

module.exports = { listProducts, createProductHandler, updateProductHandler, deleteProductHandler };
