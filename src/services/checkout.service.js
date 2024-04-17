'use strict'

const { findCartById } = require("../models/repositories/cart.repo");
const {
    BadRequestError,
    NotFoundErorr
} = require('../core/error.response');
const { checkProductByServer } = require("../models/repositories/product.repo");
const { getDiscountAmount } = require("./discount.service");
const { acquireLock, releaseLock } = require("./redis.service");
const {order} = require('../models/order.model')

class CheckOutService{


    /*
    {
        cartId,
        userId,
        shop_order_ids:[
            {
                shopId,
                shop_discounts: [],
                item_products:[
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
            {
                shopId,
                shop_discounts: [
                    {
                        "shopId",
                        "discountId",
                        codeId
                    }
                ],
                item_products:[
                    {
                        price,
                        quantity,
                        productId
                    }
                ]
            }
        ]
    }
    
    */

    static async checkOutReview ({cartId, userId, shop_order_ids}) {
        // Check cartId
        const foundCart = await findCartById(cartId)
        if(!foundCart) throw new NotFoundErorr('Cart is not exists')
        
        const checkout_order = {
            totalPrice: 0, // Tong tien hang
            feeShip: 0, // phi van chuyen,
            totalDiscount: 0, // tong tien discount giam,
            totalCheckout: 0 // tong thanh toan
        }, shop_order_ids_new = []

        // Tinh tong bill
        for (let i = 0; i < shop_order_ids.length; i++) {
           const { shopId, shopDiscounts = [], item_products = []} = shop_order_ids[i]
            
            // Check product avaiable
            const checkProductServer = await checkProductByServer(item_products)
            console.log(`Check product server`, checkProductServer)
            if(!checkProductServer[0]) throw new BadRequestError('order wrong')

            // Tong tien don hang
            const checkoutPrice = checkProductServer.reduce( (acc, product)=>{
                return acc + (product.quantity * product.price)
            }, 0)

            // Tong tien truoc khi xu ly
            checkout_order.totalPrice += checkoutPrice

            const itemCheckout = {
                shopId,
                shopDiscounts,
                priceRaw: checkoutPrice, // tien trc khi giam gia
                priceApplyDiscount: checkoutPrice,
                item_products: checkProductServer
            }

            // new shop_dicounts ton tai > 0, check xem co hop le hay khong
            // console.log(`shopDicounts::`, shopDiscounts)
            if(shopDiscounts.length > 0){
                // Gia su chi co 1 discount
                // get amount discount
                // console.log("123")

                const {totalPrice = 0, discount = 0} = await getDiscountAmount({
                    codeId: shopDiscounts[0].codeId,
                    userId,
                    shopId,
                    products: checkProductServer
                })
                // console.log("1233")
                // Tong cong discount dc giam gia
                checkout_order.totalDiscount += discount

                //Neu tien giam gia > 0
                if(discount > 0){
                    itemCheckout.priceApplyDiscount = checkoutPrice - discount
                }


            }
            checkout_order.totalCheckout += itemCheckout.priceApplyDiscount
            shop_order_ids_new.push(itemCheckout)

        }

        return {
            shop_order_ids,
            shop_order_ids_new,
            checkout_order
        }
    
    
    }

    static async orderByUser({
        shop_order_ids,
        cartId,
        userId,
        user_address = {},
        user_payment = {}
    }){
        const {shop_order_ids_new, checkout_order} = await CheckOutService.checkOutReview({
            cartId,
            userId,
            shop_order_ids
        }) 

        // Check lai xem sp co vuot ton kho hay k ?
        // Get new array of product

        const products = shop_order_ids_new.flatMap( order => order.item_products)
        console.log(`[1]-products::`, products)
        const acquireProduct = []
        for (let i = 0; i < products.length; i++) {
            const {productId, quantity} = products[i]
            const keyLock = await acquireLock(productId, quantity, cartId)
            acquireProduct.push(keyLock ? true : false )
            if(keyLock){
                await releaseLock(keyLock)
            }
        }

        //check neu co 1 sp het hang trong kho
        if(acquireProduct.includes(false)) throw new BadRequestError('Mot sp da duoc cap nhap vui long quay lai')
        const newOrder = await order.create({
             order_userId: userId,
             order_checkout: checkout_order,
             order_shipping: user_address,
             order_payment: user_payment,
             order_products: shop_order_ids_new
        })

        // TH: insert thanh cong => remove hang trong inventory
        if(newOrder){
            // Remove order
        }

        return newOrder
    }
}

module.exports = CheckOutService