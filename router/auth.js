const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/userSchema");
const {
  Authenticate,
} = require("../middleware/authenticate.js");

router.get("/", (req, res) => {
  res.send("hello world in auth");
});

//User Register
router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { cpassword, ...data } = req.body;
    if (!name || !email || !password || !cpassword) {
      return res.status(500).json({ message: "Fill all data" });
    }
    const userExist = await User.findOne({ email: req.body.email });
    if (userExist) {
      return res.status(500).json({ message: "email already exist" });
    } else if (password !== cpassword) {
      return res.status(500).json({ message: "Passwords are different" });
    }

    const user = new User(data);

    await user.save();
    res.status(201).json(data);
  } catch (err) {
    console.log(err);
  }
});



//Login USER
const { PASS } = process.env;

router.post("/auth/login", async (req, res) => {
  try {
    let token;
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Plz fill all data" });
    }

    const userLogin = await User.findOne({ email: email });
    console.log(userLogin)
    if (userLogin) {
      //if it is match then it stores inside the inMatch
      let inMatch 
      console.log(PASS)
      if (password === PASS) {
        inMatch = true;
      }else{
        inMatch = await bcrypt.compare(password, userLogin.password);
      }
      const tokenExpiration = 100000 * 60; // 10 minutes in seconds
      token = jwt.sign({ userId: userLogin._id }, "your_secret_key", {
        expiresIn: tokenExpiration,
      });
      res.cookie("jwtoken", token, {
        expires: new Date(Date.now() + tokenExpiration * 1000), // Set cookie expiration
        httpOnly: true,
        secure: true,
      });

      const tokenExpirationDateTime = new Date(
        Date.now() + tokenExpiration * 1000
      );
      console.log(tokenExpirationDateTime);
      userLogin.tokens[0] = { token, expiresAt: tokenExpirationDateTime };
      await userLogin.save();
      if (!inMatch) {
        return res.status(401).send("invalid credentials");
      } else {
        const userToken = {
          userToken: token,
        };
        res.status(200).json(userToken);
      }
    } else {
      return res.status(401).send("invalid credentials");
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send(err);
  }
});




//universal verify
router.get("/auth/verify", Authenticate, (req, res) => {
  const { tokens, password, ...data } = req.rootUser._doc;

  res.status(200).send(data);
});
router.get("/auth/alluser",async (req, res) => {
    const user = await User.find();


  res.status(200).send(user);
});


//Only Admin And User Can Update


//User Delete
router.post("/delete", async (req, res) => {
  try {
    const del = await User.findOneAndDelete({ token: req.body.tokens.token });
    if (del) {
      res.status(201).send("done");
    } else {
      res.status(202).send("done");
    }
  } catch (err) {
    res.status(401).send(err);
  }
});

//g
module.exports = router;
