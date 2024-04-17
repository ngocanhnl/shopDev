'use strict'

const discount = require('../models/discount.model')
const {
    BadRequestError,
    NotFoundErorr
} = require('../core/error.response')

const {findAllDiscountCodeSelect, findAllDiscountCodeUnSelect, checkDiscountExists}= require('../models/repositories/discount.repo') 

const {findAllProducts} = require('../models/repositories/product.repo')
const { convertToObjectIdMongoDb } = require('../utils')
const { filter, identity } = require('lodash')

/*
    Discount service
    1 - Generator Discount Code [Shop | Admin]
    2 - Get discount amount [User]
    3 - Get all discount codes [User | Shop]
    4 - Verify Discount code [User]
    5 - Delete Discount code [Shop | Admin]
    6 - Cancle discount code [User]

*/

class DiscountService{

    static async createDiscountCode(payload){
        const {
            code, start_date, end_date, is_active,
            shopId, min_order_value, product_ids, applies_to, name, description,
            type,value, max_value, max_uses, uses_count, max_uses_per_user, user_used
        } = payload
        // Kiem tra
        if(new Date() < new Date(start_date || new Date() > new Date(end_date))){
            throw new BadRequestError('Discount code has expired')
        }

        if(new Date(start_date) > new Date(end_date)){
            throw new BadRequestError('Start_date must be before end_date')
        }
        // Create index for discount code
        const foundDiscount = await discount.findOne({
            discount_code: code,
            discount_shopId: shopId
        }).lean()

        if(foundDiscount && foundDiscount.discount_is_active){
            throw new BadRequestError('Discount exits')
        }


        const newDiscount = await discount.create({
            discount_name: name,
            discount_description: description,
            discount_type: type,
            discount_value: value,
            discount_code: code,
            discount_start_date: new Date(start_date),
            discount_end_date: new Date(end_date),
            discount_max_uses: max_uses,
            discount_used_count: uses_count,
            discount_users_used: user_used,
            discount_max_use_per_user: max_uses_per_user,
            discount_min_order_value: min_order_value,
            discount_shopId: shopId,
        
            discount_is_active: is_active,
            discount_applies_to: applies_to,
            discount_product_ids: applies_to === 'all' ? [] : product_ids 
        })

        return newDiscount

    }


    //Update Discunt code (Same with update product)

    static async getAllDiscountCodeWithProduct({
        code, shopId, userId, limit, page
    }){
        // create index for discount_code
        const foundDiscount =  await discount.findOne({
            discount_code: code,
            discount_shopId: shopId
        }).lean()
        console.log(`FoundDiscount::`,foundDiscount)
        if(!foundDiscount && foundDiscount.discount_is_active){
            throw new NotFoundErorr('Discount not exists')
        }

        const {discount_applies_to, discount_product_ids} = foundDiscount
        let products
        if(discount_applies_to === 'all'){
            products = await findAllProducts({
                filter:{
                    product_shop: convertToObjectIdMongoDb(shopId),
                    isPublic: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }

        if(discount_applies_to === 'specific'){
            products = await findAllProducts({
                filter:{
                   _id: {$in: discount_product_ids},
                    isPublic: true
                },
                limit: +limit,
                page: +page,
                sort: 'ctime',
                select: ['product_name']
            })
        }
        return products
    }

    // get All discount code of shop
    static async getAllDiscountCodesByShop({
        limit, page, shopId
    }){
        const discounts = await findAllDiscountCodeSelect({
            limit: +limit,
            page: +page,
            filter:{
                discount_shopId: convertToObjectIdMongoDb(shopId),
                discount_is_active: true
            },
            select: ['discount_name', 'discount_code'],
            model: discount
        })
        return discounts
    }


    /*
        Apply Discout code
        products = [
            {
                productId,
                shopId,
                quantity,
                price,
                name
            },
            ...
        ]
    */

    static async getDiscountAmount({codeId, userId, shopId, products}){
        const foundDiscount = await checkDiscountExists({model: discount, filter: {
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        }
    })
        
        if(!foundDiscount) throw new NotFoundErorr('Discount is not exists')

        const {
            discount_is_active,
            discount_max_uses,
            discount_min_order_value,
            discount_start_date,
            discount_end_date,
            discount_max_use_per_user,
            discount_users_used,
            discount_type,
            discount_value
        } = foundDiscount
        
        if(!discount_is_active) throw new NotFoundErorr('Discount code expired')
        if(!discount_max_uses) throw new NotFoundErorr('Discounts are out')

        if(new Date() < new Date(discount_start_date) || new Date() > new Date(discount_end_date)){
            throw new NotFoundErorr('Discount code expired')
        }

        // Check xem discount co gtri toi thieu hay k?
        let totalOrder = 0
        if(discount_min_order_value > 0){
            // get total
            totalOrder = products.reduce( (acc, product) => {
                return acc + (product.quantity * product.price)
            },0)
            if(totalOrder < discount_min_order_value){
                throw new NotFoundErorr(`Discount requires a minimum order value of ${discount_min_order_value}`)
            }
        }

        if(discount_max_use_per_user > 0){
            const userUseDiscount = discount_users_used.find(user => user.userId === userId)
            console.log(userUseDiscount)
        
        }

        // Check xem discount nay  la fixed amount hay ...
        const amount = discount_type === 'fixed_amount' ? discount_value : totalOrder * (discount_value / 100)
        console.log(`discount::` , amount)

        return {
            totalOrder,
            discount: amount,
            totalPrice: totalOrder - amount
        }
    }

    static async deleteDiscountCode({shopId, codeId}){
        const deleted = await discount.findByIdAndDelete({
            discount_code: codeId,
            discount_shopId: convertToObjectIdMongoDb(shopId)
        })
        return deleted
    }

    static async cancelDiscountCode({codeId,shopId,userId}){
        const foundDiscount = await checkDiscountExists({
            model: discount,
            filter: {
                discount_code: codeId,
                discount_shopId: convertToObjectIdMongoDb(shopId)
            }
        })

        if(!foundDiscount){
            throw new NotFoundErorr(`Discount not found`)
        }

        const result = await discount.findByIdAndUpdate(foundDiscount._id,{
            $pull:{
                discount_users_used: userId
            },
            $inc:{
                discount_max_uses: 1,
                discount_used_count: -1
            }
        })
        return result
    }
}

module.exports = DiscountService