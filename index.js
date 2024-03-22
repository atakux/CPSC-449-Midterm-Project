/**
 * index.js
 *
 * This is the main entry point for the API. It sets up the MongoDB connection,
 * defines the API routes and starts the Express.js server.
 *
 */

const mongoose = require("mongoose");
const express = require("express");

const userRoute = require("./routes/userRoute"); // Import user routes
const Product = require('./models/Product'); // Import Product model
const productRouter = require('./routes/products'); // Import product routes

// Import config file to retrieve retailer's username and password
const config = require("./config");

const app = express();
app.use(express.json());

// MongoDB connection URL
const dbURI = `mongodb+srv://${config.dbUsername}:${config.dbPassword}@test.vxujlr8.mongodb.net/?retryWrites=true&w=majority&appName=test`;

/**
 * Connect to MongoDB
 *
 * Establishes a connection to the MongoDB database and logs the
 * successful connection to the console.
 *
 * The connection is established using the mongoose library, which
 * provides a programmatic API for interacting with MongoDB.
 *
 * The `useNewUrlParser`, `useUnifiedTopology` options are required
 * when connecting to a MongoDB server version 4.0 or later.
 *
 */
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Connected to DB");
    /**
     * Start the Express server
     *
     * Starts the Express server and listens for incoming HTTP requests
     * on port 3000. When the server is started, logs a message to the
     * console indicating that the server is running.
     * 
     */
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => console.error(error));

/**
 * Use product and user routes
 *
 * Registers the product and user routes as a middleware in the Express app.
 *
 * The product routes are defined in the ./routes/products.js file.
 * The user routes are defined in the ./routes/userRoute.js
 */
app.use('/products', productRouter);
app.use("/api/user", userRoute);
