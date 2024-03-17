const mongoose = require("mongoose");
const express = require("express");

const app = express();
app.use(express.json())

const dbUsername = "atakux";
const dbPassword = "7JH2iNx316hlqhhA";

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
