# CPSC-449-Midterm-Project

## Description
This is the midterm project for CPSC 449. The goal of the project is to create a simple RESTful API for a store that sells products. Authentication is based on tokens and email/password login.

- The API allows **retailers** to create a new product, update an existing product, and delete a product. Retailers have moderate access to the API, only able to modify their products.

- The API allows **users** to view the cart, add items to the cart, remove items from the cart, update their password, and delete their account. Users have the least access to the API, only able to modify their individual cart and account.

- The API allows **admin** to delete users, update users, view all users, delete products, and update products. Admin has full access to everything in the API.

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
4. To create retailer account, send a POST request to `https://localhost:3000/products/register` with the retailer data in the request body (see the "Retailer Data" section below for more information)
5. To login to an existing retailer account, send a POST request to `https://localhost:3000/products/login` with the retailer email and password in the request body
6. Once a retailer is created and logged in, the following routes are available (ensure the token given during login is in the Authorization header):
    1. To create a new product, send a POST request to `https://localhost:3000/products` with the product data in the request body (see the "Product Data" section below for more information)
    2. To update an existing product, send a PATCH request to `https://localhost:3000/products/:id` where `:id` is the ID of the product you want to update (see the "Product Data" section below for more information)
    3. To delete a product, send a DELETE request to `https://localhost:3000/products/:id` where `:id` is the ID of the product you want to delete

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
## Retailer Data
When creating a retailer, the request body should be a JSON object with the following fields:

* `name` (string, required): The name of the retailer
* `email` (string, required): The email of the retailer
* `password` (string, required): The password of the retailer
* `storeName` (string, required): The name of the store
* `role` (string, required): The role of the retailer

Example retailer data:
```json
{
  "name": "John Doe",
  "email": "sample@example.com",
  "password": "password123",
  "storeName": "Store 1",
  "role": "retailer"
}
```


## Testing Admin Component
For testing the Admin component, follow these instructions:

1. Open Postman and type `https://localhost:3000` into the URL bar
2. To delete a user, send a DELETE request to `https://localhost:3000/admin/deleteUser` with the ID of the user (see the "User Data" for more information).
3. To update a user, send a PATCH request to `https://localhost:3000/admin/updateUser` with the new credentials you would like to update the user with (see the "User Data" for more information).
4. To delete a product, send a DELETE request to `https://localhost:3000/admin/deleteProduct` with the ID of the product (see the "Product Data" for more information).
5. To update a product, send a PATCH request to `https://localhost:3000/admin/updateProduct` with the new product information you would like to update the product with (see the "Product Data" for more information).
6. To pull all users, send a GET request to `https://localhost:3000/admin/getUsers`.



## Testing Users Component
For testing the users component, follow these instructions:

1. Open Postman and type `https://localhost:3000` into the URL bar
2. To create an account, send a POST request to `https://localhost:3000/user/register` with the new user data in the request body (see the "User Data" section below for more information)
3. To login to an existing account, send a POST request to `https://localhost:3000/user/login` with the user email and password in the request body
4. Once a user is created and logged in, the following routes are available (ensure the token given during login is in the Authorization header):
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
  "password": "password123",
  "role": "customer"
}
```
