'use strict'

const {product, electronic, clothing, furniture} = require('../models/product.model')
const {BadRequestError} = require('../core/error.response')
const {
    findAllDraftForShop,
    publishProductByShop,
    findAllPublishForShop,
    unPublishProductByShop,
    searchProductByUser,
    findAllProducts,
    findProduct,
    updateProductById
    } = require('../models/repositories/product.repo')
const { removeUndefineObject, updateNestedObjectParser } = require('../utils')
const { insertInventory } = require('../models/repositories/inventory.repo')




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
    static async updateProduct(type, productId, payload){

        const productClass = ProductFactory.productRegisTry[type]
        if(!productClass) throw new BadRequestError(`Invalid Product Type ${type}`)

        return new productClass(payload).updateProduct(productId)   
    }


    // PUT //
    static async publishProductByShop({product_shop, product_id}){
        return await publishProductByShop({product_shop, product_id})
    }
    static async unPublishProductByShop({product_shop, product_id}){
        return await unPublishProductByShop({product_shop, product_id})
    }


                ////// Query ///////

    // Find all drafts for shop
    static async findAllDraftForShop({ product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isDraft: true}

        return await findAllDraftForShop({query, limit, skip})

    }

    // Find all publish for shop
    static async findAllPublishForShop({ product_shop, limit = 50, skip = 0}){
        const query = {product_shop, isPublic: true}

        return await findAllPublishForShop({query, limit, skip})

    }


    // static async searchProduct({keySearch}){
    //     return await searchProductByUser({keySearch})
    // }

    // Search product for User
    static async searchProduct({keySearch}){
        return await searchProductByUser({keySearch})
    }

    // Find All Product
    static async findAllProducts({limit = 50, sort = 'ctime', page = 1, filter = {isPublic : true}}){
        return await findAllProducts({limit, sort, page, filter,
        select: ['product_name', 'product_price', 'product_thumbn']
        })
    }

    // Find product
    static async findProduct({product_id}){
        return await findProduct({product_id, unSelect: ['__v']})
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

    // Create new product
    async createProduct(product_id){
        const newProduct = await product.create({
            ...this,
            _id: product_id
        })
        if(newProduct){
            //add product_stock in invntory
            await insertInventory({
                productId: newProduct._id,
                stock: this.product_quantity,
                shopId: this.product_shop
            })
        }
        return newProduct
    }

    // Update product
    async updateProduct(productId, bodyUpdate){
        console.log('Update product')
        return await updateProductById({productId,bodyUpdate, model: product})
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


    async updateProduct( productId ){
        
        // 1.remove attr has value = null, undefine
        const objectParams = this
        // 2.check xem update o cho nao
        if(objectParams.product_attributes){
            // update child 
            await updateProductById({productId, objectParams, model: clothing})

        }
        
        const updateProduct = await super.updateProduct(productId,objectParams)
        return updateProduct
        
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
    async updateProduct( productId ){
        
        // 1.remove attr has value = null, undefine
        const objectParams = removeUndefineObject(this)
        // 2.check xem update o cho nao
        if(objectParams.product_attributes){
            // update child 
            await updateProductById({
                productId, 
                bodyUpdate: updateNestedObjectParser(objectParams.product_attributes), 
                model: furniture
            })

        }

        const updateProduct = await super.updateProduct(productId,updateNestedObjectParser(objectParams))
        return updateProduct
        
    }
}


// Register product type
ProductFactory.registerProductType('Clothing', Clothing)
ProductFactory.registerProductType('Electronics', Electronics)
ProductFactory.registerProductType('Furniture', Furniture)

module.exports = ProductFactory