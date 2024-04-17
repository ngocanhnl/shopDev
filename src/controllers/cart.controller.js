'use strict'

const CartService = require("../services/cart.service")

const {SuccessResponse} = require('../core/success.response')


class CartController {

    addToCart = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Create new cart success',
            metadata: await CartService.addProductToCart(req.body)
        }).send(res)
    }
    // +/-
    update = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Create new cart success V2' ,
            metadata: await CartService.addProductToCartV2(req.body)
        }).send(res)
    }
    delete = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'delete cart success',
            metadata: await CartService.deleteUserCart(req.body)
        }).send(res)
    }
    listToCart = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get list to cart success',
            metadata: await CartService.getListUserCart(req.query)
        }).send(res)
    }
}

module.exports  = new CartController()