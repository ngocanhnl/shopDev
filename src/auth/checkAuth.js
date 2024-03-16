'use strict'
const {findById} = require('../services/apikey.service')

const HEADER = {
    API_KEY : 'x-api-key',
    ATUHORIZATION : 'authorization'
 }


const apiKey = async( req, res, next ) =>{

    try {

    
        const key = req.headers[HEADER.API_KEY]?.toString()

        if(!key){
            return res.status(403).json({
                messages: 'Fobbiden error'
            })
        }
        //check Obj key in db
        console.log("ok")
        const objKey = await findById(key)
        if(!objKey){
            return res.status(403).json({
                messages: 'Fobbiden error'
            })
        }

        req.objKey = objKey;

        return next()

    } catch (error) {
        
    }
    
}

const permissions = (permissions)=>{
    return (req, res, next)=>{
        if(!req.objKey.permissions){
            return res.status(403).json({
                messages: 'permissions denied'
            })
        }
        console.log(`permission::`, req.objKey.permissions)

        const validPermission = req.objKey.permissions.includes(permissions)
        if(!validPermission){
            return res.status(403).json({
                messages: 'permissions denied'
            })
        }
        return next()
    }
    
}

const asyncHandler = fn =>{
    return (req,res,next) =>{
        console.log("AsysncHandler")
        fn(req,res,next).catch(next)
    }
}

module.exports = {
    apiKey,
    permissions,
    asyncHandler
}