// IMPORT JSONWEBTOKEN PACKAGE-------
const jwt = require('jsonwebtoken')

// IMPORT USERMODEL FOR DB CALLS-----
const userModel = require("../models/userModel")

const adminModel=require("../models/adminModel")


const authentication = (req, res, next) => {
    try {
        let bearer = req.headers["Authorization"];
        if (!bearer) bearer = req.headers["authorization"];

        if (!bearer) {
            return res.status(400).send({ status: false, msg: "Token required! Please login to generate token" });
        }

        const splitToken = bearer.split(' ');

        const token = splitToken[1];
             
        jwt.verify(token, "functionup-radon", (err, user) => {
            if (err)
               { return res.status(401).send({ status: false, message: "please provide a valid token" })}
              
                req.user = user

                let tokenTime = req.user.exp;
                let createdTime = Date.now()
        
                if (createdTime > tokenTime) {
                    return res.status(400).send({ status: false, msg: "token is expired, login again" })
                }
                
                next();
        
        });

       
        

    } catch (error) {

        return res.status(500).send({ status: false, message: error.message })
    }
}




const authoriseAdmin = async function (req, res, next) {
    try {
      let { adminId } = req.params;
      if (!adminId) { return res.status(400).send({ status: false, message: "please provide userId" }) }
  
      if (!validateObjectId(adminId)) {
        return res.status(400).send({ status: false, message: "Invalid userId" })
      }
      let checkData = await adminModel.findOne({ _id: adminId });
      if (!checkData) {
        return res.status(404).send({ status: false, message: "Invalid userId" });
      }
  
      if (checkData._id != req.user.adminId) {
        return res
          .status(403)
          .send({ status: false, message: "Authorization failed." });
      }
  
  
      next();
    } catch (err) {
      return res
        .status(500)
        .send({ status: false, message: err.message });
    }
  };

module.exports = { authentication ,authoriseAdmin}