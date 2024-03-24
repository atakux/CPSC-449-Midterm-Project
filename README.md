# CPSC-449-Midterm-Project

## Description
This is the midterm project for CPSC 449. The goal of the project is to create a simple RESTful API for a store that sells products. The API should allow clients to view a list of products, view a specific product, create a new product, update an existing product, and delete a product.

## To run the project
1. Install npm dependencies: `npm install`
2. Start the server locally: `npm start`
3. Test the API using a tool like Postman
4. Open Postman and type `https://localhost:3000` into the URL bar

## Testing Products Component
For testing the products component, follow these instructions:

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

## Testing Users Component
For testing the users component, follow these instructions:

1. Open Postman and type `https://localhost:3000` into the URL bar
2. To create an account, send a POST request to `https://localhost:3000/user/register` with the new user data in the request body (see the "User Data" section below for more information)
3. To login to an existing account, send a POST request to `https://localhost:3000/user/login` with the user email and password in the request body
4. Once a user is created and logged in, the following routes are available:
    1. To view the cart, send a GET request to `https://localhost:3000/user/cart`
    2. To add an item to the cart, send a POST request to `https://localhost:3000/user/cart/` with the body containing the ID of the product to add to the cart
    3. To remove an item from the cart, send a DELETE request to `https://localhost:3000/user/cart/` with the body containing the ID of the product to remove from the cart
    4. To delete an account, send a DELETE request to `https://localhost:3000/user`
    5. To update a password, send a PATCH request to `https://localhost:3000/user/pass` with the new password in the request body

## User Data
When creating an account, the request body should be a JSON object with the following fields:

* `name` (string, required): The name or username of the user
* `email` (string, required): The email of the user
* `password` (string, required): The password of the user

Example user data:
```json
{
  "name": "John Doe",
  "email": "sample@example.com",
  "password": "password123"
}
```