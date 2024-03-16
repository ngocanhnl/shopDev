'use strict'

const express = require('express')
const { apiKey, permissions } = require('../auth/checkAuth')

const router = express.Router()


//check api key
router.use(apiKey)
//check permissions
router.use(permissions('0000'))

router.use('/v1/api', require('./access/index') )

// router.post('/', (req,res)=>{
//     res.send("ok")
// })

module.exports = router