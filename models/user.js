/*
This model defines the user/customer role for an ecommerce platform.
*/

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Ensures cart only contains products that actually exist in the database
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
});

const User = new mongoose.model("User", userSchema);

module.exports = User;
