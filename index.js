const mongoose = require("mongoose");
const express = require("express");
const Product = require('./models/Product'); // Import Product model
const productRouter = require('./routes/products'); // Import product routes

const config = require("./config");

const app = express();
app.use(express.json())


const dbURI = `mongodb+srv://${dbUsername}:${dbPassword}@test.vxujlr8.mongodb.net/?retryWrites=true&w=majority&appName=test`;
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to DB");
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.error(error));

// Use product routes
app.use('/products', productRouter);
