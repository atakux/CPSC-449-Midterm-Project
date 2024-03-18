const express = require("express");
const router = express.Router();
const Product = require('../models/Product');

// Before all '/' should be "products"

// Create a new product
//  enter the new data in "body > raw" 
//  then send a "POST" request to create a new product
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all products
//  send a "GET" request to get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific product
//  replace ":id" with the id of the product to get
//  then send a "GET" request
router.get('/:id', getProduct, (req, res) => {
    res.json(res.product);
});

// Update a product 
//  replace ":id" with the id of the product to update,
//  then send a "POST" request with the updated data
router.patch('/:id', getProduct, async (req, res) => {
    if (req.body.name != null) {
        res.product.name = req.body.name;
    }
    if (req.body.description != null) {
        res.product.description = req.body.description;
    }
    if (req.body.price != null) {
        res.product.price = req.body.price;
    }

    try {
        const updatedProduct = await res.product.save();
        res.json(updatedProduct);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a product
//  replace ":id" with the id of the product to delete
//  then send a "DELETE" request
router.delete('/:id', getProduct, async (req, res) => {
    try {
        await res.product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a product
//  main function to get a product
async function getProduct(req, res, next) {
    let product;
    try {
        product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
    res.product = product;
    next();
}

module.exports = router;
