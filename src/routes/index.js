'use strict'

const express = require('express')

const router = express.Router()


router.use('/v1/api', require('./access/index') )

// router.post('/', (req,res)=>{
//     res.send("ok")
// })

module.exports = router