'use strict'

const { BadRequestError } = require("../core/error.response")
const { inventory } = require("../models/inventory.model")
const { getProductById } = require("../models/repositories/product.repo")
const { convertToObjectIdMongoDb } = require("../utils")

class InventoryService{


    static async addStockToInventory({
        stock,
        productId,
        shopId,
        location = '123, Nguyen Trai, HCM city'
    }){
        const product = getProductById(productId)
        if(!product) throw new BadRequestError('Product does not exists')
        const query = {
            inven_shopId: convertToObjectIdMongoDb(shopId),
            inven_productId: convertToObjectIdMongoDb(productId),
        }, updateSet = {
            $inc:{
                inven_stock: stock
            },
            $set:{
                inven_location: location
            }
        }, options = {upsert: true, new: true}


        return await inventory.findOneAndUpdate(query, updateSet, options)
    }
}

module.exports = InventoryService