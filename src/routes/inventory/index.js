const express = require('express')
const InventoryController = require('../../controllers/inventory.controller')
const {asyncHandler} = require('../../auth/checkAuth')
const {authenticationV2 } = require('../../auth/authUtills')
const router = express.Router()

//get amount a discount



//authentication

router.use(authenticationV2)

router.post('', asyncHandler(InventoryController.addStockToInventory))


module.exports = router