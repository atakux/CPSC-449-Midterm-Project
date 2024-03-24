/*
models/admin.js
This model defines the admin role for an ecommerce platform.
*/

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

const Admin = new mongoose.model("Admin", userSchema);

module.exports = Admin;