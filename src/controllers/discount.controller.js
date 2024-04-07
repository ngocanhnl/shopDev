'use strict'

const DiscountService = require("../services/discount.service")

const {SuccessResponse} = require('../core/success.response')


class DiscountController {

    createDiscount = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'create discount success',
            metadata: await DiscountService.createDiscountCode({
                ...req.body,
                shopId: req.user.userId
            })
        }).send(res)
    }
    getAllDiscountCode = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Successfull code found',
            metadata: await DiscountService.getAllDiscountCodesByShop({
                ...req.query,
                shopId: req.user.userId
            })
        }).send(res)
    }
    getDiscountAmount = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Successfull code found',
            metadata: await DiscountService.getDiscountAmount({
                ...req.body
            })
        }).send(res)
    }
    getAllDiscountCodeWithProduct = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Successfull code found',
            metadata: await DiscountService.getAllDiscountCodeWithProduct({
                ...req.query,

            })
        }).send(res)
    }

}

module.exports = new DiscountController()