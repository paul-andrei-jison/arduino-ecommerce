'use strict';

const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../services/productService');

async function listProducts(req, res) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    console.error('listProducts error:', err);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
}

async function getProductHandler(req, res) {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('getProductHandler error:', err);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
}

async function createProductHandler(req, res) {
  try {
    const { name, description, category, price, stock } = req.body;
    const uploadedPaths = (req.files ?? []).map(f => `/uploads/${f.filename}`);
    const primaryIdx = parseInt(req.body.primaryImage ?? '0', 10);
    const primaryImage = uploadedPaths[primaryIdx] ?? uploadedPaths[0] ?? null;

    const productId = await createProduct({
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images: uploadedPaths,
      primaryImage,
    });
    res.status(201).json({
      id: productId,
      name,
      description,
      category,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      images: uploadedPaths,
      primaryImage,
    });
  } catch (err) {
    console.error('createProductHandler error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProductHandler(req, res) {
  try {
    const { id } = req.params;
    const uploadedPaths = (req.files ?? []).map(f => `/uploads/${f.filename}`);

    const updateData = { ...req.body };
    delete updateData.primaryImage;

    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock, 10);

    if (uploadedPaths.length > 0) {
      const primaryIdx = parseInt(req.body.primaryImage ?? '0', 10);
      updateData.images = uploadedPaths;
      updateData.primaryImage = uploadedPaths[primaryIdx] ?? uploadedPaths[0];
    }

    await updateProduct(id, updateData);
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

module.exports = { listProducts, getProductHandler, createProductHandler, updateProductHandler, deleteProductHandler };
