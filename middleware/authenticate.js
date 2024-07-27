const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const VerifyToken = (req, res) => {
 
  let authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];
  if(token!==null&&token.length>0){

    const verfiyToken = jwt.verify(token, "your_secret_key");
    const tokenExpirationDateInSeconds = verfiyToken.exp; // Expiration time in seconds
    const currentTimeInSeconds = Math.floor(Date.now() / 1000); // Current time in seconds
    
    if (tokenExpirationDateInSeconds < currentTimeInSeconds) {
      res.status(401).json({message:"Token has expired"})
    }
    return { verfiyToken, token };
  }else{
    res.status(401).json({message:"Please Send Token"})

  }

};



// Verify the token is real or not
const Authenticate = async (req, res, next) => {
  try {
    const { verfiyToken, token } = VerifyToken(req, res);

    const rootUser = await User.findOne({
      _id: verfiyToken.userId,
      "tokens.token": token,
    });

    if (!rootUser) {
      throw new Error("User not found");
    }else{

      
      req.token = token;
      req.rootUser = rootUser;
      req.userID = rootUser._id;
        next();

  
    }
    } catch (err) {
      console.log(err)
      res.status(401).json({message:"UnAuthoriseds"});
  }
};
const GetUser = async (req, res, next) => {
  try {
    const { verfiyToken, token } = VerifyToken(req, res);

    const rootUser = await User.findOne({
      _id: verfiyToken.userId,
      "tokens.token": token,
    });

    if (!rootUser) {
     next()
    }else{

      
      req.token = token;
      req.rootUser = rootUser;
      req.userID = rootUser._id;
 
        next();

     
    }
    } catch (err) {
      console.log(err)
      next()
      // res.status(401).json({message:"UnAuthoriseds"});
  }
};



module.exports = {
  Authenticate,
  GetUser
};
