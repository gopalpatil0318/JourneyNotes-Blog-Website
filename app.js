const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./routes/route");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json()); 




mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connect to mongoDB");
  })
  .catch((err) => {
    console.log("Error connecting mongoDb ", err);
  });


app.use("/", routes);

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
