'use strict'

const {product, electronic, clothing, furniture} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')
const {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser
    } = require('../models/repositories/product.repo')




class ProductFactory{

    static productRegisTry = {} //key-class

    static registerProductType = (type, classRef) => {
        ProductFactory.productRegisTry[type] = classRef
    }


    static async createProduct(type, payload){

        const productClass = ProductFactory.productRegisTry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Type ${type}`)

        return new productClass(payload).createProduct()   
    }


    // PUT //
    static async publishProductByShop({product_shop, product_id}){
        return await publishProductByShop({product_shop, product_id})
    }
    static async unPublishProductByShop({product_shop, product_id}){
        return await unPublishProductByShop({product_shop, product_id})
    }


    // Query //

    static async findAllDraftForShop({ product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isDraft: true}

        return await findAllDraftForShop({query, limit, skip})

    }
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isPublic: true}

        return await findAllPublishForShop({query, limit, skip})

    }

    static async searchProduct({keySearch}){
        return await searchProductByUser({keySearch})
    }



}


//define base product class

class Product{

    constructor({
        product_name,product_thumb,
        product_description,product_price,
        product_quantity,product_type,
        product_shop,product_attributes
    }){
        this.product_name = product_name
        this.product_thumb = product_thumb
        this.product_description = product_description
        this.product_price = product_price
        this.product_quantity = product_quantity
        this.product_type = product_type
        this.product_shop = product_shop
        this.product_attributes = product_attributes
    }

    //create new product
    async createProduct(product_id){
        return await product.create({
            ...this,
            _id: product_id
        })
    }
}

//define sub-class for different type Clothings

class Clothing extends Product{

    async createProduct(){
        console.log("createProduct clothing")
        const newClothing = await clothing.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newClothing) throw new BadRequestError('create new clothing error!')

        const newProduct = await super.createProduct(newClothing._id)
        if(!newProduct) throw new BadRequestError('create new product error!')
        console.log("createProduct clothing")
        return newProduct
    }
}

// define sub-class for different type Electronics

class Electronics extends Product{

    async createProduct(){
        const newElectronic = await electronic.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newElectronic) throw new BadRequestError('create new electronic error!')

        const newProduct = await super.createProduct(newElectronic._id)
        if(!newProduct) throw new BadRequestError('create new product error!')

        return newProduct
    }
}

//  define sub-class for different type Electronics

class Furniture extends Product{

    async createProduct(){
        const newFurniture = await furniture.create({
            ...this.product_attributes,
            product_shop: this.product_shop
        })
        if(!newFurniture) throw new BadRequestError('create new Furniture error!')

        const newProduct = await super.createProduct(newFurniture._id)
        if(!newProduct) throw new BadRequestError('create new product error!')

        return newProduct
    }
}


// Register product type
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory