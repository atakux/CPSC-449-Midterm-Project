# CPSC-449-Midterm-Project

## Description
This is the midterm project for CPSC 449. The goal of the project is to create a simple RESTful API for a store that sells products. The API should allow clients to view a list of products, view a specific product, create a new product, update an existing product, and delete a product.

## Running the API
To run the API, follow these instructions:

1. Install npm dependencies: `npm install`
2. Start the server locally: `npm start`
3. Test the API using a tool like Postman
    1. Open Postman and type `https://localhost:3000` into the URL bar
    2. To view a list of all products, send a GET request to `https://localhost:3000/products`
    3. To view a specific product, send a GET request to `https://localhost:3000/products/:id` where `:id` is the ID of the product you want to view
    4. To create a new product, send a POST request to `https://localhost:3000/products` with the product data in the request body (see the "Product Data" section below for more information)
    5. To update an existing product, send a PATCH request to `https://localhost:3000/products/:id` where `:id` is the ID of the product you want to update (see the "Product Data" section below for more information)
    6. To delete a product, send a DELETE request to `https://localhost:3000/products/:id` where `:id` is the ID of the product you want to delete

## Product Data
When creating or updating a product, the request body should be a JSON object with the following fields:

* `name` (string, required): The name of the product
* `price` (number, required): The price of the product
* `description` (string, optional): A description of the product

Example product data:
```json
{
  "name": "Product 1",
  "price": 9.99,
  "description": "A great product"
}
```
