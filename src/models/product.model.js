'use strict'

//!dmbg
const {Schema, model} = require('mongoose'); // Erase if already required
const slugify = require('slugify')


const DOCUMENT_NAME = 'product'
const COLLECTON_NAME = 'products'


// Declare the Schema of the Mongo model
const productSchema = new Schema({
    product_name:{ type: String, required: true },
    product_thumb:{ type: String, required:true },
    product_description: String,
    product_slug: String,
    product_price: { type: Number, required: true },
    product_quantity:{ type: Number, required: true },
    product_type:{ type: String, required: true, enum: ['Electronics', 'Clothing', 'Furniture']  },
    product_shop:{ type: Schema.Types.ObjectId, ref: 'shop'},
    product_attributes:{ type: Schema.Types.Mixed, required: true},
    // more
    product_ratingAverage:{
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        //4.342342 => 43
        set: (value)=> Math.round(value*10)/10
    },
    product_variations: {type: Array, default: []},
    isDraft: {type: Boolean, default: true, index: true, select: false},
    isPublic: {type: Boolean, default: false, index: true, select: false},



},{
    collection: COLLECTON_NAME,
    timestamps: true
});


// Create index for search
productSchema.index({product_name: 'text', product_description: 'text'})

// Documents middleware: run before .save(), .create()

productSchema.pre('save', function (next){
    this.product_slug = slugify(this.product_name, {lower: true})
    next()
})




//define the product type = clothing

const clothingSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'shop'}
},{
    collection: 'clothes',
    timestamps: true
})

//define the product type = electronic

const electronicSchema = new Schema({
    manufacturer: {type: String, required: true},
    model: String,
    color: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'shop'}
},{
    collection: 'electronics',
    timestamps: true
})

//define the product type = furniture

const furnitureSchema = new Schema({
    brand: {type: String, required: true},
    size: String,
    material: String,
    product_shop: {type: Schema.Types.ObjectId, ref: 'shop'}
},{
    collection: 'furnitures',
    timestamps: true
})



//Export the model
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronics', electronicSchema),
    clothing: model('Clothings', clothingSchema),
    furniture: model('Furniture', furnitureSchema),
}