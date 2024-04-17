const express = require('express')
const checkoutController = require('../../controllers/checkout.controller')
const {asyncHandler} = require('../../auth/checkAuth')
const {authenticationV2 } = require('../../auth/authUtills')
const router = express.Router()


router.post('/review', asyncHandler(checkoutController.checkoutReview))

module.exports = router