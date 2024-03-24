/**
 * routes/products.js
 * 
 * This file defines the routes for the products API.
 * 
 * The routes are defined using the Express.js framework.
 * 
 * The following routes are defined:
 * 
 * GET /products - get all products
 * GET /products/:id - get a single product by id
 * POST /products - create a new product
 * PATCH /products/:id - update a product by id
 * DELETE /products/:id - delete a product by id
 * 
 * Most of the routes have basic authentication enabled, which means that you must provide
 * the retailer's username and password via HTTP basic authentication. The
 * credentials can be found in the config.js file.
 * 
 * The only exceptions are the GET /products route and the GET /products/:id route, 
 * which does not use basic authentication.
 * 
 * 
 */

const express = require("express");
const router = express.Router();
const Product = require('../models/Product');

// Import config file to retrieve retailer's username and password
const config = require('../config');

/**
 * Basic authentication middleware.
 *
 * This middleware checks that the request is authenticated with valid
 * credentials (username and password). If the credentials are invalid, it sends a
 * 401 Unauthorized response. If the credentials are valid, it calls the next
 * middleware.
 *
 * The credentials are extracted from the 'Authorization' header of the request.
 * If the header is not present or does not start with 'Basic ', the request is
 * considered unauthenticated and a 401 Unauthorized response is sent.
 *
 * The 'Authorization' header is expected to be in the form "Basic <credentials>",
 * where <credentials> is a base64 encoded string of the form
 * "<username>:<password>".
 *
 * The username and password are extracted from the base64 decoded string and
 * compared to the values in the config.js file. If they match, the request is
 * considered authenticated and the next middleware is called. Otherwise, a 401
 * Unauthorized response is sent.
 */
const basicAuth = (req, res, next) => {
  // Extract credentials from 'Authorization' header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    // No or invalid 'Authorization' header, unauthenticated request
    res.status(401).send('Unauthorized');
    return;
  }

  // Decode base64 encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Check if credentials match config.js
  if (username === config.dbUsername && password === config.dbPassword) {
    // Authenticated, proceed to the next middleware
    next();
  } else {
    // Invalid credentials, unauthorized request
    res.status(401).send('Unauthorized');
  }
};

/**
 * Create a new product
 * 
 * This endpoint POSTs a new product.
 * 
 * Send a "POST" request to '/products' with the new product data in the request body.
 * The request body should be a JSON object with the following keys:
 * { 
 *      name: 'Product name',
 *      price: 123.45,
 *      description: 'Product description',
 * }
 * 
 * The response will be a JSON object with the product's data.
 * 
 * Format: 
 * { 
 *      _id: '123', 
 *      name: 'Product name', 
 *      price: 123.45,
 *      description: 'Product description',
 * } 
 *
 * The request must be authenticated, which means that you must provide
 * the retailer's username and password via HTTP basic authentication. 
 * The credentials can be found in the config.js file.
 * 
 */
router.post('/', basicAuth, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * Get all products
 * 
 * This endpoint GETs all products.
 * 
 * Send a "GET" request to '/products' to get a JSON list of all products.
 * Each product in the list will have the following format:
 * { 
 *      _id: '123', 
 *      name: 'Product name', 
 *      price: 123.45,
 *      description: 'Product description'
 * }
 */
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get a specific product
 * 
 * This endpoint GETs a product by its id.
 * 
 * The id of the product to get should be provided in the url,
 * e.g. in the url 'http://localhost:3000/products/123' the id is '123'.
 * 
 * The response will be a JSON object with the product's data.
 * 
 * Format: 
 * { 
 *      _id: '123', 
 *      name: 'Product name', 
 *      price: 123.45,
 *      description: 'Product description'
 * } 
 * 
 * The request does not use basic authentication.
 */
router.get('/:id', getProduct, (req, res) => {
    res.json(res.product);
});

/**
 * Update a product
 * 
 * This endpoint PATCHes (updates) a product by its id.
 * 
 * The id of the product to update should be provided in the url,
 * e.g. in the url 'http://localhost:3000/products/123' the id is '123'.
 * 
 * The updated data should be provided in the request body,
 * in a JSON object with the data to update.
 * 
 * The following fields can be updated:
 *  - name
 *  - description
 *  - price
 * 
 * e.g. 
 * {
 *      name: 'New product name',
 *      description: 'New product description',
 *      price: 123.45
 * }
 * 
 * The response will be a JSON object with the updated product's data.
 * 
 * Format: 
 * { 
 *      _id: '123', 
 *      name: 'Product name', 
 *      price: 123.45,
 *      description: 'Product description'
 * } 
 * 
 * The request must be authenticated, which means that you must provide
 * the retailer's username and password via HTTP basic authentication. 
 * The credentials can be found in the config.js file.
 * 
 */
router.patch('/:id', basicAuth, getProduct, async (req, res) => {
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

/**
 * Delete a product by id
 * 
 * This endpoint DELETES a product by its id.
 * 
 * The id of the product to delete should be provided in the url,
 * e.g. in the url 'http://localhost:3000/products/123' the id is '123'.
 * 
 * The request must be authenticated, which means that you must provide
 * the retailer's username and password via HTTP basic authentication. 
 * The credentials can be found in the config.js file.
 * 
 * The response will be a JSON object with a single key:value pair:
 * { message: 'Product deleted' }.
 */
router.delete('/:id', basicAuth, getProduct, async (req, res) => {
    try {
        await res.product.deleteOne();
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * Get a product by id
 * 
 * This endpoint GETs a product by its id.
 * 
 * The id of the product to get should be provided in the url,
 * e.g. in the url 'http://localhost:3000/products/123' the id is '123'.
 * 
 * The response will be a JSON object with the product's data.
 * 
 * Format: 
 * { 
 *      _id: '123', 
 *      name: 'Product name', 
 *      price: 123.45,
 *      description: 'Product description'
 * } 
 *
 */
async function getProduct(req, res, next) {
    // Find the product by its id
    let product;
    try {
        product = await Product.findById(req.params.id);
        // If the product is not found, return a 404 Not Found response
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        // If there is an error, return a 500 Internal Server Error response
        return res.status(500).json({ message: error.message });
    }
    // Save the product in the response object
    res.product = product;
    // Call the next function in the route chain
    next();
}

// Export the router
module.exports = router;
