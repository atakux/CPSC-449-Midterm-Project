const mongoose = require("mongoose");
const express = require("express");
const userRoute = require("./routes/userRoute");

const app = express();
app.use(express.json());

const dbURI = ``;

mongoose
    .connect(dbURI)
    .then((result) =>
        app.listen(3000, (req, res) => {
            console.log("Connnected to DB listening on port 3000");
        })
    )
    .catch((error) => console.log(error));

app.use("/api/user", userRoute);
