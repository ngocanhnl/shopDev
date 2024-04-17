'use strict'

const {product, electronic, clothing, furniture} = require('../product.model')
const {Types} = require('mongoose')

const {getSelectData, getUnSelectData, convertToObjectIdMongoDb} = require('../../utils/index')


const findAllProducts = async ({limit, sort, page, filter, select}) => {

    const skip = (page - 1) * limit
    const sortBy = sort === 'ctime' ? {_id: -1} : {_id: 1}


    const products = await product.find(filter)
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select(getSelectData(select))
    .lean()
    
    return products

}

const findProduct = async ({product_id, unSelect}) => {
    return await product.findById(product_id).select(getUnSelectData(unSelect))
}

const updateProductById = async ({
    productId,
    bodyUpdate,
    model,
    isNew = true
}) => {
    return await model.findByIdAndUpdate(productId,bodyUpdate,{
        new: isNew
    })
}


const findAllDraftForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip})
}
const findAllPublishForShop = async ({query, limit, skip}) => {
    return await queryProduct({query, limit, skip})
}
const searchProductByUser = async ({keySearch}) => {
    const regexSearch = new RegExp(keySearch)
    const  results = await product.find({
        isPublic: true,
        $text: { $search: regexSearch}
    }, {score: {$meta: 'textScore'}})
    .sort({score: {$meta: 'textScore'}})
    .lean()



    return results
}

const publishProductByShop = async({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null

    foundShop.isDraft = false
    foundShop.isPublic = true
    //Return ve 1 neu update thanh cong : 0
    const {modifiedCount} = await product.updateOne({_id: new Types.ObjectId(product_id)},foundShop);
    
    return modifiedCount
}
const unPublishProductByShop = async({product_shop, product_id}) => {
    const foundShop = await product.findOne({
        product_shop: new Types.ObjectId(product_shop),
        _id: new Types.ObjectId(product_id)
    })
    if(!foundShop) return null

    foundShop.isDraft = true
    foundShop.isPublic = false
    //Return ve 1 neu update thanh cong : 0
    const {modifiedCount} = await product.updateOne({_id: new Types.ObjectId(product_id)},foundShop);
    
    return modifiedCount
}


const queryProduct = async ({query, limit, skip}) => {
    return await product.find(query)
        .populate('product_shop', 'name email -_id')
        .sort({updateAt: -1})
        .skip(skip)
        .limit(limit)
        .lean()
        .exec()
}

const getProductById = async (productId) => {
    return await product.findOne({_id: convertToObjectIdMongoDb(productId)})
}

const checkProductByServer = async (products) => {
    return await Promise.all( products.map( async product =>{
        const foundProduct = await getProductById(product.productId)
        if(foundProduct){
            return {
                price: foundProduct.product_price,
                quantity: product.quantity,
                productId: product.productId
            }
        }
    
    }))
}
module.exports = {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById,
    getProductById,
    checkProductByServer
}