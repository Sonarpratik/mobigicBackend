const mongoose = require("mongoose");

const DB = process.env.MONGO_URL;
// "mongodb+srv://siddhisarees:BZMuyPwjWWko0og3@cluster0.x3dnzg2.mongodb.net/?retryWrites=true&w=majority"

mongoose.set('strictQuery', true);
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Successfull");
  })
  .catch((err) => console.log("NO connection"+err));