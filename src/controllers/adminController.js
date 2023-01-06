const adminModel = require("../models/adminModel")

const { uploadFile } = require("../controllers/awsController")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { validateString,
    
    validateRequest,
    validateEmail,
    regexPhoneNumber,
    regxName,
    
    validatePassword,
    imageExtValidator, 
    
} = require("../validator/validations")



//=====================================CREATING admin PROFILE===========================================================//


let createAdmin = async function (req, res) {
    try {
        let bodyData = req.body
        
        let {  fname, lname, email, password, phone } = bodyData
        if (validateRequest(bodyData)) { return res.status(400).send({ status: false, message: "please provide the data in the body" }) }

        if (!validateString(fname)) { return res.status(400).send({ status: false, message: "please provide the first name" }) }
        if (!regxName(fname)) { return res.status(400).send({ status: false, message: "please provide a valid first name" }) }

        if (!validateString(lname)) { return res.status(400).send({ status: false, message: "please provide the last name" }) }
        if (!regxName(lname)) { return res.status(400).send({ status: false, message: "please provide a valid last name" }) }

        if (!validateString(email)) { return res.status(400).send({ status: false, message: "please provide the email" }) }
        if (!validateEmail(email)) { return res.status(400).send({ status: false, message: "please provide a valid email" }) }

        if (!validateString(phone)) { return res.status(400).send({ status: false, message: "please provide the phone number" }) }
        if (!regexPhoneNumber(phone)) { return res.status(400).send({ status: false, message: "please provide a valid phone number" }) }

        if (!validateString(password)) { return res.status(400).send({ status: false, message: "please provide the password" }) }
        if (!validatePassword(password)) { return res.status(400).send({ status: false, message: "Please provide a valid password with atleast one uppercase one lowercase  one special character and must be between 8-15" }) }

        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(password, salt);
        bodyData.password = encryptedPassword

        let profile = req.files;
        if (profile && profile.length > 0) {
            if (!imageExtValidator(profile[0].originalname)) { return res.status(400).send({ status: false, message: "only image file is allowed" }) }
            let uploadedFileURL = await uploadFile(profile[0]);
            bodyData.profileImage = uploadedFileURL
        } else {
            return res.status(400).send({ status: false, message: "please provide profile image " });
        }

        let isDuplicateEmail = await adminModel.findOne({ email:email })
        if (isDuplicateEmail) { return res.status(400).send({ status: false, message: "this email already exists" }) }

        let isDuplicatePhone = await adminModel.findOne({ phone:phone })
        if (isDuplicatePhone) { return res.status(400).send({ status: false, message: "this phone number already exists" }) }

        let newadmin = await adminModel.create(bodyData)
        newadmin=newadmin.toObject()
        delete(newadmin.password)
        res.status(201).send({ status: true, message: "admin registered successfully", data: newadmin })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

//=====================================admin LOGIN===========================================================//

let adminLogin = async function (req, res) {
    try {
        let email = req.body.email
        let password = req.body.password
        if (!validateString(email)){return res.status(400).send({ status: false, message: "email is required" })}
        if (!validateEmail(email)){ return res.status(400).send({ status: false, message: "please provide a valid email" }) }
        
        if (!validateString(password)) {return res.status(400).send({ status: false, message: "password is required" })}
        

        let admin = await adminModel.findOne({ email: email });
        if (!admin)
            return res.status(401).send({status: false,message: "email is not correct",});

        const passwordDetails = await bcrypt.compare(password, admin.password)
        if (!passwordDetails) {
            return res.status(401).send({ status: false, msg: "password is incorrect pls provide correct password" })
        }
        let token = jwt.sign(
            {
                adminId: admin._id.toString(),
                iat: new Date().getTime(),
                exp: new Date().setDate(new Date().getDate() + 1)
                 
            },
            "functionup-radon"
            // {expiresIn:"60s"}
        );

        res.status(200).send({ status: true, message: "Success", data: { adminId: admin._id, token: token } });
    }
    catch (err) {

        return res.status(500).send({ status: false, message: err.message })
    }
}

//=================================GETTING admin PROFILE BY adminID================================================//


let getAdminDetails = async function (req, res) {
    try {
        let adminId = req.params.adminId

        if (!mongoose.isValidObjectId(adminId)) { return res.status(400).send({ status: false, message: "please enter valid adminId" }) }
        let tokenadminId=req.admin.adminId
        if(tokenadminId!==adminId){return res.status(403).send({status:false,message:"authorization failed"})}

        let getadminDoc = await adminModel.findById(adminId,{password:0}).lean()
        if (!getadminDoc) { return res.status(404).send({ status: false, message: "No such admin is available" }) }
        
        res.status(200).send({ status: true, message: "admin profile details", data: getadminDoc })

    } catch (error) {
        return res.status(500).send({ status: false, message: error.message })
    }
}

//=====================================UPDATING admin PROFILE===========================================================//


const UpdateAdminprofile = async function (req, res) {
    try {
        let adminId = req.params.adminId
        if (!mongoose.isValidObjectId(adminId)) { return res.status(400).send({ status: false, msg: "pleade provide valid id" }) }
        let tokenadminId = req.admin.adminId
        if (tokenadminId !== adminId) { return res.status(403).send({ status: false, message: "authorization failed" }) }

        let bodyData = JSON.parse(JSON.stringify(req.body))

        let { fname, lname, email, phone, password } = bodyData

        let profile = req.files

        if (validateRequest(bodyData) && !profile) { return res.status(400).send({ status: false, msg: "body can not be blank" }) }

        let adminData = await adminModel.findById(adminId)
        if (!adminData) { return res.status(400).send({ status: false, msg: "No such admin is available" }) }

        if (bodyData.hasOwnProperty('fname')) {
            if (!validateString(fname)){return res.status(400).send({ status: false, message: "please provide first name" })}
            if (!regxName(fname)) { return res.status(400).send({ status: false, msg: "provide valid first name" }) }
            adminData.fname = fname
        }

        if (bodyData.hasOwnProperty("lname")) {
            if (!validateString(lname)){return res.status(400).send({ status: false, message: "please provide last name" })}
            if (!regxName(lname)) { return res.status(400).send({ status: false, msg: "provide valid last name" }) }
            adminData.lname = lname
        }

        if (bodyData.hasOwnProperty("email")) {
            if (!validateString(email)){return res.status(400).send({ status: false, message: "please provide email" })}
            if (!validateEmail(email)) { return res.status(400).send({ status: false, msg: "provide valid email" }) }
            let uniqueEmail = await adminModel.findOne({ email: email })
            if (uniqueEmail) { return res.status(400).send({ status: false, msg: "This email is already registered" }) }
            adminData.email = email
        }

        if (bodyData.hasOwnProperty("phone")) {
            if (!validateString(phone)){return res.status(400).send({ status: false, message: "please provide phone number" })}
            if (!regexPhoneNumber(phone)) { return res.status(400).send({ status: false, msg: "provide valid phone number" }) }
            let uniquephone = await adminModel.findOne({ phone: phone })
            if (uniquephone) { return res.status(400).send({ status: false, msg: "This phone number is already registered" }) }
            adminData.phone = phone
        }


        if (profile && profile.length > 0) {
            if (!imageExtValidator(profile[0].originalname)) { return res.status(400).send({ status: false, message: "only image file is allowed" }) }
            let uploadedFileURL = await uploadFile(profile[0]);
            adminData.profileImage = uploadedFileURL
        }
        else if (bodyData.hasOwnProperty("profileImage")) { return res.status(400).send({ status: false, message: "please provide profile image" }) }

        if (bodyData.hasOwnProperty("password")) {
            if (!validateString(password)){return res.status(400).send({ status: false, message: "please provide password" })}
            if (password.length < 8 || password.length > 15) { return res.status(400).send({ status: false, message: "password must be between 8-15" }) }
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(password, salt);
            adminData.password = encryptedPassword
        }


        adminData.save()
        res.status(200).send({ status: true, data: adminData })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, error: err.message })
    }
}
module.exports = { createAdmin, adminLogin, getAdminDetails, UpdateAdminprofile }