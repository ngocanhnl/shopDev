'use strict'


const {model, Schema} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory'
const COLLECTON_NAME = 'Inventories'


// Declare the Schema of the Mongo model
const inventorySchema = new Schema({
   inven_productId: {type: Schema.Types.ObjectId, ref: 'product'},
   inven_location: {type: String, default: 'unknow'},
   inven_stock: {type: Number, required: true},
   inven_shopId: {type: Schema.Types.ObjectId, ref: 'shop'},
   inven_reservations: {type: Array, default: []}
    /*
        cartId,
        stock:1,
        createOn:
    */
    

},{
    timestamps: true,
    collection: COLLECTON_NAME
});

//Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema)
}