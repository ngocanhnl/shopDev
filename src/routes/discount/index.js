const express = require('express')
const discountController = require('../../controllers/discount.controller')
const {asyncHandler} = require('../../auth/checkAuth')
const {authenticationV2 } = require('../../auth/authUtills')
const router = express.Router()

//get amount a discount


router.post('/amount', asyncHandler(discountController.getDiscountAmount))
router.get('/list_product_code', asyncHandler(discountController.getAllDiscountCodeWithProduct))

//authentication

router.use(authenticationV2)

router.post('', asyncHandler(discountController.createDiscount))
router.get('', asyncHandler(discountController.getAllDiscountCode))

module.exports = router