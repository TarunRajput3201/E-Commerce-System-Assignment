let mongoose = require("mongoose")

let productSchema = new mongoose.Schema(
  {

    title: { type: String, require: true, unique: true, trim: true },
    description: { type: String, require: true, trim: true },
    price: { type: Number, require: true, },
    currencyId: { type: String, require: true, trim: true },
    currencyFormat: { type: String, require: true },
    isFreeShipping: { type: Boolean, default: false },
    productImage: { type: String, require: true },
    style: { type: String, trim: true },
    availableSizes: [{ type: String, trim: true }],
    installments: { type: Number },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false }

  },
  { timestamps: true })

module.exports = mongoose.model('Product', productSchema)