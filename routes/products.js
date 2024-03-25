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
const User = require('../models/user'); 
const Retailer = require('../models/retailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Validate that a request has a valid authentication token.
 * 
 * This middleware function checks that the request contains a valid
 * authentication token. The token is extracted from the 'Authorization'
 * header, and it is verified using the secret key 'secret123'.
 * 
 * If the token is valid, the middleware will call the next function in the
 * chain, otherwise it will return a 401 (Unauthorized) response to the client.
 * 
 * @param {Object} req The request object
 * @param {Object} res The response object
 * @param {Function} next The next function in the chain
 */
const validateToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader; // Bearer TOKEN

    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, "secret123");
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(403).json({ status: "error", error: "User does not exist" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ status: "error", error: "Invalid Token" });
    }
};


/**
 * Registers a new retailer
 * @route POST /api/products/register
 * @group products
 * @param {string} name.query.required - Name of the retailer
 * @param {string} email.query.required - Email of the retailer
 * @param {string} password.query.required - Password of the retailer
 * @param {string} storeName.query.required - Store name of the retailer
 * @returns {object} 201 - Created
 * @returns {Error} 400 - Bad Request
 */
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, storeName } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const retailer = await Retailer.create({
            name: name,
            email: email,
            password: hashedPassword,
            role: 'retailer',
            storeName: storeName,
        });

        const user = await User.create({
            _id: retailer._id,
            name: name,
            email: email,
            password: hashedPassword,
            role: 'retailer',
            storeName: storeName,
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            storeName: user.storeName
        });
    } catch (err) {
        res.json({ status: "error", error: err.message });
    }
});

/**
 * Log in as a retailer
 * 
 * This endpoint logs in a retailer.
 * 
 * Send a "POST" request to '/login' with JSON body of the form:
 * {
 *     "email": "email@example.com",
 *     "password": "password"
 * }
 * If successful, the response will be of the form:
 * {
 *     "status": "Ok",
 *     "user": "token"
 * }
 * where "token" is a JSON Web Token that can be used to authenticate requests to other endpoints.
 * 
 * Returns 403 if the user does not exist or is not a retailer.
 * Returns 400 if the request body is not valid JSON or does not contain all required fields.
 * Returns 500 if there is a server error.
 */
router.post('/login', async (req, res) => {
    try { 
        const { email, password } = req.body;

        const user = await User.findOne({ email: email });

        if (!user || user.role !== 'retailer') {
            return res.status(403).json({ status: "error", error: "User does not exist" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            const token = jwt.sign(
                {
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                "secret123"
            );

            res.json({ status: "Ok", user: token });
        } else {
            return res.json({ status: "error", user: "Wrong password" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
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

router.get("/myProducts", validateToken, async (req, res) => {
    try {
        const products = await Product.find({ retailer: req.user._id });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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
router.post('/', validateToken, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
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
router.patch('/:id', validateToken, getProduct, async (req, res) => {
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
router.delete('/:id', validateToken, getProduct, async (req, res) => {
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
};

// Export the router
module.exports = router;
