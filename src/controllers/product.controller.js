'use strict'

const ProductService = require("../services/product.service")
const ProductServiceV2 = require("../services/product.service.xxx")
const {SuccessResponse} = require('../core/success.response')


class ProductController {

    // createProduct = async ( req, res, next ) => {
    //     new SuccessResponse({
    //         message: 'create product success',
    //         metadata: await ProductService.createProduct(req.body.product_type,{
    //             ...req.body,
    //             product_shop: req.user.userId
    //         })
    //     }).send(res)
    // }

    createProduct = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'create product success',
            metadata: await ProductServiceV2.createProduct(req.body.product_type,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    updateProduct = async ( req, res, next ) => {
        console.log('update product controller')
        new SuccessResponse({
            message: 'update product success',
            metadata: await ProductServiceV2.updateProduct(req.body.product_type, req.params.productId,{
                ...req.body,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    publishProductByShop = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'update publish product success',
            metadata: await ProductServiceV2.publishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }
    unPublishProductByShop = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'update unPublishProductByShop product success',
            metadata: await ProductServiceV2.unPublishProductByShop({
                product_id: req.params.id,
                product_shop: req.user.userId
            })
        }).send(res)
    }

    // QUERY //

    /**
     * @description get all Draft for shop
     * @param {Number} limit 
     * @param {Number} skip 
     * @return {JSON}
     */
    getAllDraftForShop = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get all draft success',
            metadata: await ProductServiceV2.findAllDraftForShop({product_shop: req.user.userId})
        }).send(res)
    }

    getAllPublishForShop = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get all publish success',
            metadata: await ProductServiceV2.findAllPublishForShop({product_shop: req.user.userId})
        }).send(res)
    }

    getListSearchProduct = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get all getListSearchProduct success',
            metadata: await ProductServiceV2.searchProduct(req.params)
        }).send(res)
    }

    findAllProducts = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get all findAllProducts success',
            metadata: await ProductServiceV2.findAllProducts(req.query)
        }).send(res)
    }
    findProduct = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get all findProduct success',
            metadata: await ProductServiceV2.findProduct({
                product_id: req.params.product_id
            })
        }).send(res)
    }


    // END QUERY //
   
}

module.exports = new ProductController()