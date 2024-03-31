const express = require('express')
const productController = require('../../controllers/product.controller')
const {asyncHandler} = require('../../auth/checkAuth')
const { authentication } = require('../../auth/authUtills')
const router = express.Router()


router.get('/search/:keySearch',asyncHandler(productController.getListSearchProduct))


//authentication

router.use(authentication)

/////////
router.post('',asyncHandler(productController.createProduct))
router.post('/publish/:id',asyncHandler(productController.publishProductByShop))
router.post('/unpublish/:id',asyncHandler(productController.unPublishProductByShop))


// QUERY //
router.get('/drafts/all',asyncHandler(productController.getAllDraftForShop))
router.get('/publish/all',asyncHandler(productController.getAllPublishForShop))



module.exports = router