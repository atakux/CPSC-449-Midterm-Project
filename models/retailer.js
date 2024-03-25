//models/retailer.js
const mongoose = require('mongoose');

const retailerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    storeName: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const Retailer = new mongoose.model('Retailer', retailerSchema);

module.exports = Retailer;