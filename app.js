const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8000;
const dotenv = require("dotenv");
dotenv.config();

// const PORT = process.env.PORT;

const cors = require("cors");
app.use(cors());

//Connection is achieved
require("./db/conn");

//to understand json file
app.use(express.json());

app.use(require("./router/auth.js"));
app.use(require("./router/fileupload.js"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get("*", (req, res) => {
  res.status(404).send("hello hahaha ur wrong");
});

app.listen(port, () => {
  console.log(`server is running on port no ${port}`);
});
