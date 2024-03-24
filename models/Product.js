/**
 * models/Product.js
 * 
 * Model for a product.
 * 
 * This module exports a Mongoose model for representing products.
 * 
 * The model has the following fields:
 * - name: The name of the product. This field is required.
 * - price: The price of the product. This field is required.
 * - description: A brief description of the product. Optional.
 * - retailer: User ID of a user with a "retailer" role. 
 * 
 * The module also exports the model as a named export.
 * 
 */

const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: String,
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Product', productSchema);
