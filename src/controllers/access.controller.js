'use strict'

const AccessService = require("../services/access.service")
const {OK, CREATED, SuccessResponse} = require('../core/success.response')


class AccessController {

    login = async ( req, res, next ) => {
        new SuccessResponse({
            metadata: await AccessService.login(req.body)
        }).send(res)
    }

    signUp = async (req, res, next)=>{
        console.log("Controller.signup");
        // return res.status(201).json(await AccessService.signUp(req.body))
       new CREATED({
        message: 'Registered Success',
        metadata: await AccessService.signUp(req.body)
       }).send(res)
    }
}

module.exports = new AccessController()