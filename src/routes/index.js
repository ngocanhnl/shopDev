'use strict'

const express = require('express')
const { apiKey, permissions } = require('../auth/checkAuth')

const {
    pushToLogDiscord
} = require('../middleware/index')
const router = express.Router()
// Add log to discord
router.use(pushToLogDiscord)


//check api key
router.use(apiKey)
//check permissions
router.use(permissions('0000'))


router.use('/v1/api/inventory', require('./inventory/index') )
router.use('/v1/api/checkout', require('./checkout/index') )
router.use('/v1/api/discount', require('./discount/index') )
router.use('/v1/api/cart', require('./cart/index') )
router.use('/v1/api/product', require('./product/index') )
router.use('/v1/api/comment', require('./comment/index') )
router.use('/v1/api', require('./access/index') )


// router.post('/', (req,res)=>{
//     res.send("ok")
// })

module.exports = router