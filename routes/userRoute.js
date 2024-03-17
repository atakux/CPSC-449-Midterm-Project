const express = require("express");
const router = express.Router();
const User = require("../model/user");
const Product = require("../model/product");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    try {
        const newPassword = await bcrypt.hash(req.body.password, 10);
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: newPassword,
        });

        res.status(200).send("User Added to the Database");
    } catch (err) {
        res.json({ staus: "error", error: "Duplicate email" });
    }
});

router.post("/login", async (req, res) => {
    const user = await User.findOne({
        email: req.body.email,
    });

    if (!user) {
        return res.json({ status: "error", error: "Invalid Login" });
    }

    const isPasswordValid = await bcrypt.compare(
        req.body.password,
        user.password
    );

    if (isPasswordValid) {
        const token = jwt.sign(
            {
                name: user.name,
                email: user.email,
            },
            "secret123"
        );

        return res.json({ status: "Ok", user: token });
    } else {
        return res.json({ status: "error", user: false });
    }
});

router.get("/cart", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader;

    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, "secret123");

        const user = await User.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.json({ status: "error", error: "Not a user" });
        }

        res.status(200).send(user.cart);
    } catch (error) {
        return res.json({ status: "error", error: "Invalid Token" });
    }
});

router.post("/cart", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader;

    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, "secret123");

        const user = await User.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.json({ status: "error", error: "Not a user" });
        }

        const product = await Product.findOne({
            _id: req.body.product,
        });

        if (!product) {
            return res.json({ status: "error", error: "Not a product" });
        }

        await User.updateOne(
            { email: decoded.email },
            { $push: { cart: req.body.product } }
        );

        return res.json({ status: "Ok" });
    } catch (error) {
        return res.json({ status: "error", error: "Invalid Token" });
    }
});

router.delete("/cart", async (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader;

    if (token == null) return res.sendStatus(401);

    try {
        const decoded = jwt.verify(token, "secret123");

        const user = await User.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.json({ status: "error", error: "Not a user" });
        }

        const product = await Product.findOne({
            _id: req.body.product,
        });

        if (!product) {
            return res.json({ status: "error", error: "Not a product" });
        }

        const index = user.cart.indexOf(req.body.product);

        if (index !== -1) {
            user.cart.splice(index, 1);
            await user.save();
        }

        return res.json({ status: "Ok" });
    } catch (error) {
        return res.json({ status: "error", error: "Invalid Token" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
