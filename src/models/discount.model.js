'use strict'


const {model, Schema} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Discount'
const COLLECTON_NAME = 'discounts'


// Declare the Schema of the Mongo model
const discountSchema = new Schema({
    discount_name: {type: String, required: true},
    discount_description: {type: String, required: true},
    discount_type: {type: String, default: 'fixed_amount'},//percentage
    discount_value: {type: Number, required: true},//10.000 || 10(%)
    discount_code: {type: String, required: true},
    discount_start_date: {type: Date, required: true}, //Ngay bat dau
    discount_end_date: {type: Date, required: true},//Ngay ket thuc
    discount_max_uses: {type: Number, required: true},//So luong discount
    discount_used_count: {type: Number, required: true},//So luong discount da dung
    discount_users_used: {type: Array, default: []},//Ai da dung
    discount_max_use_per_user: {type: Number, required: true},//So luong discount nay dc dung tren 1 user
    discount_min_order_value: {type: Number, required: true},//Gia min de dc ap dung
    discount_shopId: {type: Schema.Types.ObjectId, ref: 'shop'},

    discount_is_active: {type: Boolean, required: true},
    discount_applies_to: {type: String, required: true, enum: ['all','specific']},
    discount_product_ids: {type: Array, default: []},//So sp dc ap dung

},{
    timestamps: true,
    collection: COLLECTON_NAME
});

//Export the model
module.exports = model(DOCUMENT_NAME, discountSchema);