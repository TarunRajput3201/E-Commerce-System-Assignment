const express = require("express")
const router = express.Router()
const { createUser, userLogin, getUser, Updateprofile } = require("../controllers/userController")
const { createProduct, getProduct, getProductById, updateProduct, deleteProductById } = require("../controllers/productController")
const { createCart, updateCart, getCart, deleteCart } = require("../controllers/cartController")
const { createOrder, getOrderList,updateOrder } = require("../controllers/orderController")
const { authentication ,authoriseAdmin} = require("../middleware/auth")
const { createAdmin, adminLogin, getAdminDetails, UpdateAdminprofile }=require("../controllers/adminController")

//================================== Admin API'S=======================================================//

router.post("/register", createAdmin)
router.post("/login", adminLogin)
router.get("/user/:adminId", authentication, getAdminDetails)
router.put("/user/:adminId", authentication, UpdateAdminprofile)



//==================================USER API'S========================================================//

router.post("/register", createUser)
router.post("/login", userLogin)
router.get("/user/:userId", authentication, getUser)
router.put("/user/:userId", authentication, Updateprofile)

//==================================PRODUCTS API'S====================================================//

router.post("/products/:adminId",authentication,authoriseAdmin ,createProduct)
router.get("/products",getProduct)
router.get("/products/:productId", getProductById)
router.put("/products/:productId/:adminId", authentication,authoriseAdmin,updateProduct)
router.delete("/products/:productId", authentication,authoriseAdmin,deleteProductById)

//==================================CART API'S=========================================================//

router.post("/users/:userId/cart", authentication, createCart)
router.put("/users/:userId/cart", authentication, updateCart)
router.get("/users/:userId/cart",authentication , getCart)
router.delete("/users/:userId/cart", authentication, deleteCart)

//==================================ORDER API'S========================================================//

router.post("/users/:userId/orders", authentication, createOrder)
router.get("/users/:adminId/orders",authentication,authoriseAdmin,getOrderList)
router.put("/users/:userId/orders",authentication, updateOrder)



router.all("/**", function (req, res) {
    return res.status(404).send({ status: false, message: "No such api found" })
})


module.exports = router;