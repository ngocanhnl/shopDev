'use strict'

const {Schema, model} = require('mongoose'); // Erase if already required


const DOCUMENT_NAME = 'Cart'
const COLLECTON_NAME = 'Carts'

// Declare the Schema of the Mongo model
const cartSchema = new Schema({
    cart_state: {
        type: String, required: true,
        enum: ['active','completed', 'failed', 'pending'],
        default: 'active'
    },
    cart_products: {type: Array,required: true, default: []},
    /*
        [
            {
                productId,
                shopId,
                quantity,
                price,
                name
            }
        ]
    */
    cart_count_product: { type: Number, default: 0 },
    cart_userId: {type: Number, required: true}


},{
    collection: COLLECTON_NAME,
    timestamps: true
});

//Export the model
module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}