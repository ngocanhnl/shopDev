'use strict'

const {cart} = require('../models/cart.model')
const {
    BadRequestError,
    NotFoundErorr
} = require('../core/error.response')
const { getProductById } = require('../models/repositories/product.repo')

/*
    Key features: Cart Service
    - add product to cart [User]
    - reduce product quantity by one [User]
    - increase product quantity by one [User]
    - get cart [User]
    - delete cart [User]
    - delte cart item [User]

*/


class CartService {

    /// START REPO CART ///

    static async createUserCart({userId, product}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateOrInsert = {
            $addToSet:{
                cart_product: product
            }
        }, options= {upsert: true, new: true}

        return await cart.findOneAndUpdate(query, updateOrInsert, options)

    }
    static async updateUserCartQuantity({userId, product}){
        const {productId, quantity} = product
        const query = {
            cart_userId: userId,
            'cart_products.productId' : productId,//Cau lenh mongoose tim productId trong mang
            cart_state: 'active'
        },
        updateSet = {
            $inc:{
                'cart_products.$.quantity': quantity// $ tuong trung cho doi tuong duoc tim thay o query
            }
        }, options= {upsert: true, new: true}

        return await cart.findOneAndUpdate(query, updateSet, options)

    }
    /// END REPO CART ///

    static async addProductToCart({userId, product}){

        // Check cart cua user da ton tai hay chua
        const userCart = await cart.findOne({cart_userId: userId})
        if(!userCart){
            // Tao cart cho user
           return await  CartService.createUserCart({userId,product})
        }

        // Neu co gio hang nhung chua co san pham 
        if(!userCart.cart_products.length){
            userCart.cart_products = [product]
            return await userCart.save()
        }

        // Gio hang ton tai, va co sp nay thi update quantity
        return await CartService.updateUserCartQuantity({userId,product})

    }
    
    /*
    
        shop_order_ids: [
            {
                shopId,
                item_product:[
                    {
                        quantity,
                        price,
                        shopId,
                        old_quantity,
                        productId
                    }
                ],
                version
            }
        ]
    */

    // Tang/giam quantity khi user an +/- trong cart
    static async addProductToCartV2({userId, shop_order_ids}){
        const {productId, quantity, old_quantity} = shop_order_ids[0]?.item_product[0]
    
        // Chech product
        const foundProduct = await getProductById(productId)
        if(!foundProduct) throw new NotFoundErorr(`Not found product ${productId}`)
        
        //compare
        if(foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId){
            throw new NotFoundErorr(`Not found shop of product`)
        }

        if(quantity === 0 ){
            //delete
        }
        return await CartService.updateUserCartQuantity({
            userId,
            product:{
                productId,
                quantity: quantity - old_quantity
            }
        })
    }
    static async deleteUserCart({userId, productId}){
        const query = {cart_userId: userId, cart_state: 'active'},
        updateSet = {
            $pull: {
                cart_products:{
                    productId
                }
            }
        }
        const deleteCart = await cart.updateOne(query, updateSet)
        return deleteCart
    }

    static async getListUserCart({userId}){
        return await cart.findOne({
            cart_userId: userId
        }).lean()
    }

}

module.exports = CartService