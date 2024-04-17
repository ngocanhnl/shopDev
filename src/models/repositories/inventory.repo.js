'use strict'

const { convertToObjectIdMongoDb } = require('../../utils')
const {
    inventory
} = require('../inventory.model')
const {Types} = require('mongoose')


const insertInventory = async({
    productId, stock, location = 'unknow', shopId
}) => {
    return await inventory.create({
        inven_productId: productId,
        inven_stock: stock,
        inven_location: location,
        inven_shopId: shopId
    })
}

const reservationInventory = async ({productId, quantity, cartId}) => {
    const query = {
        inven_productId: convertToObjectIdMongoDb(productId),
        inven_stock: {$gte: quantity},
        inven_shopId: shopId
    }, updateSet = {
        $inc: {
            inven_stock: -quantity
        },
        $push:{
            inven_reservations:{
                quantity,
                cartId,
                createOn: new Date()
            }
        }
    }, options = {upsert: true, new: true}

    return await inventory.updateOne(query, updateSet)
}


module.exports = {
    insertInventory,
    reservationInventory
}