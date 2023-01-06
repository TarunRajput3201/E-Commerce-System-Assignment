const productModel = require("../models/productModel")
const { uploadFile } = require("./awsController")
const { validateString,
    validateRequest,
    imageExtValidator,
    validateObjectId,
    onlyWholeNumbers,
    decNumbers,
    } = require("../validator/validations")
const cartModel = require("../models/cartModel")


//=====================================CREATING PRODUCT===========================================================//

let createProduct = async function (req, res) {
    try {
        let bodyData = req.body


        if (validateRequest(bodyData)) { return res.status(400).send({ status: false, message: "please provide data in body" }) }
        let { title, description, price, isFreeShipping, style, availableSizes, installments, prductImage } = bodyData

        if (!title) { return res.status(400).send({ status: false, message: "please provide title" }) }

        if (!description) { return res.status(400).send({ status: false, message: "please provide description" }) }


        if (!price) { return res.status(400).send({ status: false, message: "please provide the price" }) }
        if (!decNumbers(price) || !decNumbers(price.toString())) { return res.status(400).send({ status: false, message: "price must be a number" }) }

       
         bodyData.currencyId = "INR" 
           
         bodyData.currencyFormat = "₹" 
            
        
        

       

         
        if(!("availableSizes" in bodyData)){ return res.status(400).send({ status: false, message: "please provide available sizes" }) }
       
        if (!validateString(availableSizes)) { return res.status(400).send({ status: false, message: "please select atleast one from  ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL']" }) }
        else {
            let size = availableSizes.split(",").map(x => (x))
            let items = []
            let availableSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            for (let i = 0; i < size.length; i++) {
                if (availableSize.includes(size[i].trim())) {
                    items.push(size[i].trim())
                }
                else { return res.status(400).send({ status: false, message: "please select from  ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'] only" }) }
            }
            bodyData.availableSizes = items
        }

        let product = req.files;
        if (product && product.length > 0) {
            if (!imageExtValidator(product[0].originalname)) { return res.status(400).send({ status: false, message: "only image file is allowed" }) }
            let uploadedFileURL = await uploadFile(product[0]);
            bodyData.productImage = uploadedFileURL
        } else {
            return res.status(400).send({ status: false, message: "please provide product image " });
        }

        if ("isFreeShipping" in bodyData) {
            if (!validateString(isFreeShipping)) { return res.status(400).send({ status: false, message: "please provide something in isFreeShipping" }) }
            if (!(isFreeShipping == "false" || isFreeShipping == "true")) { return res.status(400).send({ status: false, message: "please provide isFreeShipping value in true or false" }) }
            if (isFreeShipping == "false" || isFreeShipping == false) { productDoc.isFreeShipping = false }
            if (isFreeShipping == "true" || isFreeShipping == true) { productDoc.isFreeShipping = true }
        }
        if ("style" in bodyData) { if (!validateString(style)) { return res.status(400).send({ status: false, message: "please provide something in style" }) }}

        if ("installments" in bodyData) {
            if (!validateString(installments)) {bodyData.installments = 0}
            if (!onlyWholeNumbers(installments)) { return res.status(400).send({ status: false, message: "please provide valid installments in numbers" }) }
        }
        
        let isDuplicateTitle = await productModel.findOne({ title: title })
        if (isDuplicateTitle) { return res.status(400).send({ status: false, message: "this title already exists" }) }



        let createdData = await productModel.create(bodyData)
        res.status(201).send({ status: true, message: "user registered successfully", data: createdData })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


//=====================================GETTING PRODUCT BY QUERY================================================//


const getProduct = async function (req, res) {
    try {
        let { size, name, priceGreaterThan, priceLessThan, priceSort } = req.query

        let getFilter = Object.keys(req.query)
        if (getFilter.length) {
            for (let value of getFilter) {
                if (['size', 'name', 'priceGreaterThan', 'priceLessThan', 'priceSort'].indexOf(value) == -1)
                    return res.status(400).send({ status: false, message: `You can't filter Using '${value}' ` })
            }
        }



        let obj = {
            isDeleted: false,
        };

        let pric = {}

        let obj1 = {}

        if (size) {
            let availableSize = ["S", "XS", "M", "X", "L", "XXL", "XL"]

            let items = []
            let sizes = size.split(",")
            for (let i = 0; i < sizes.length; i++) {
                if (!availableSize.includes(sizes[i].trim())) { return res.status(400).send({ status: false, message: `please provide size from ${availableSize} ` }) }
                if (availableSize.includes(sizes[i].trim())) {

                    items.push(sizes[i].trim())
                }
            }
            //  console.log(sizes)
            obj.availableSizes = { $in: items }

        }


        if (name) {
            obj.title = name
        }

        if (priceGreaterThan) {
            pric.$gt = priceGreaterThan
            obj.price = pric
        }
        if (priceLessThan) {
            pric.$lt = priceLessThan
            obj.price = pric
        }

        if (priceSort) {
            if (!(priceSort == -1 || priceSort == 1)) { return res.status(400).send({ status: false, massege: "please provide sort value 1 or -1" }) }
            obj1.price = priceSort
        }

        let products = await productModel.find(obj).sort(obj1)
        if (products.length == 0) { return res.status(400).send({ status: false, massege: "No Products available" }) }

        return res.status(200).send({ status: true, message: "Success", data: products })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


//=====================================GETTING PRODUCT BY PRODUCTID================================================//


let getProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validateObjectId(productId)) { return res.status(400).send({ status: false, message: "please enter a valid objectId" }) }

        let data = await productModel.findOne({ _id: productId, isDeleted: false })

        if (!data) { return res.status(404).send({ status: false, message: "No product with this productId or deleted" }) }

        res.status(200).send({ status: true, data: data })
    }

    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


//=====================================UPDATING PRODUCT=======================================================//


const updateProduct = async function (req, res) {
    try {

        let productId = req.params.productId
        if (!validateObjectId(productId)) { return res.status(400).send({ status: false, msg: "pleade provide valid productId" }) }

        let imageUrl = req.files
        let data = req.body
        let { title, description, price, isFreeShipping, style, availableSizes, installments } = data

        let productDoc = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!productDoc) { return res.status(404).send({ status: false, msg: "No such product available" }) }

        if (validateRequest(data) && !imageUrl) { return res.status(400).send({ status: false, msg: "body can not be blank" }); }

        if ("title" in data) {
            if (!validateString(title)) { return res.status(400).send({ status: false, message: "Title can't be empty" }) }
            let uniqueTitle = await productModel.findOne({ title: title })
            if (uniqueTitle) { return res.status(400).send({ status: false, message: "Title already exist" }) }
            productDoc.title = title
        }

        if ("description" in data) {
            if (!validateString(description)) { return res.status(400).send({ status: false, message: "Description can't be empty" }) }
            productDoc.description = description
        }

        if ("price" in data) {
            if (!validateString(price)) { return res.status(400).send({ status: false, message: "price can't be empty" }) }
            if (!decNumbers(price)) { return res.status(400).send({ status: false, message: "please provide valid price" }) }
            
            let cart= await cartModel.find({productId:productId})
            
            if(cart.length>0){
            for(let i=0;i<cart.length;i++){
                for(let j=0;j<cart[i].items.length;j++){
                    if(cart[i].items[j].productId==productId){
                        cart[i].totalPrice=cart[i].totalPrice-(productDoc.price*cart[i].items[j].quantity)+(price*cart[i].items[j].quantity)
                        cart[i].save()
                    }
                }
            }
        }
            
            productDoc.price = price
        }

        if ("isFreeShipping" in data) {
            if (!validateString(isFreeShipping)) { return res.status(400).send({ status: false, message: "isFreeShipping can't be empty" }) }
            if (!(isFreeShipping == "false" || isFreeShipping == "true")) { return res.status(400).send({ status: false, message: "please provide isFreeShipping value in true or false" }) }
            if (isFreeShipping == "false" || isFreeShipping == false) { productDoc.isFreeShipping = false }
            if (isFreeShipping == "true" || isFreeShipping == true) { productDoc.isFreeShipping = true }
        }

        if ("availableSizes" in data) {
            if (!validateString(availableSizes)) { return res.status(400).send({ status: false, message: "availableSizes can't be empty" }) }
            let bodySizes = availableSizes.split(",")
            let docSizes = productDoc.availableSizes
            for (i = 0; i < bodySizes.length; i++) {
                if (!["S", "XS", "M", "X", "L", "XXL", "XL"].includes(bodySizes[i].trim())) { return res.status(400).send({ status: false, massege: "please provide size from [S, XS, M, X, L, XXL, XL] only" }) }
                bodySizes[i] = bodySizes[i].trim()
                if (!docSizes.includes(bodySizes[i])) {
                    productDoc.availableSizes.push(bodySizes[i])
                }
            }
        }

        if ("style" in data) {
            if (!validateString(style)) { return res.status(400).send({ status: false, message: "style can't be empty" }) }
            productDoc.style = style
        }

        if ("installments" in data) {
            if (!validateString(installments)) { return res.status(400).send({ status: false, message: "installments can't be empty" }) }
            if (!onlyWholeNumbers(installments)) { return res.status(400).send({ status: false, message: "pleade provide valid installments in numbers" }) }
            productDoc.installments = installments
        }

        if (imageUrl && imageUrl.length > 0) {
            if (!imageExtValidator(imageUrl[0].originalname)) { return res.status(400).send({ status: false, message: "only image file is allowed" }) }
            let uploadedFileURL = await uploadFile(imageUrl[0]);
            productDoc.productImage = uploadedFileURL
        }
        else if (!"productImage" in data) { return res.status(400).send({ status: false, msg: "Please select product Image" }) }
         
        

        productDoc.save()
        return res.status(200).send({ status: false, message: "success", data: productDoc })
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, error: err.message })
    }

}

//=====================================DELETING PRODUCT======================================================//


let deleteProductById = async function (req, res) {
    try {
        let productId = req.params.productId

        if (!validateObjectId(productId)) { return res.status(400).send({ status: false, message: "please enter a valid productId" }) }

        let deletedData = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { $set: { isDeleted: true, deletedAt: new Date } })
        if (!deletedData) { return res.status(404).send({ status: false, message: "No product with this productId or deleted" }) }

        res.status(200).send({ status: true, message: "product deleted succesfully" })
    }

    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }


}


module.exports = { createProduct, getProduct, getProductById, deleteProductById, updateProduct }
