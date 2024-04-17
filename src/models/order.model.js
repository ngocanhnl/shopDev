'use strict'

const {Schema, model} = require('mongoose'); // Erase if already required


const DOCUMENT_NAME = 'Order'
const COLLECTON_NAME = 'Orders'

// Declare the Schema of the Mongo model
const orderSchema = new Schema({
    order_userId: {type: Number, required: true},
    order_checkout: {type: Object, default: {}},
    /*
        order_checkout = {
            totalPrice,
            totalApplyDiscount,
            feeShip
        }
    */
    order_shipping: {type: Object, default: {}},
    /*
        street,
        city,
        state,
        Country
    */
    order_payment: {type: Object, default: {}},
    order_products: {type: Array, required: true},
    order_trackingNumber: {type: String, default: '#0000117042024'},
    order_status: {type: String, enum: ['pending','confirmed','shipped','cancelled','delivered'], default: 'pending'}


},{
    collection: COLLECTON_NAME,
    timestamps: true
});

//Export the model
module.exports = {
    order: model(DOCUMENT_NAME, orderSchema)
}