'use strict'

const JWT = require('jsonwebtoken')
const asyncHandler = require('../helpers/asyncHandler')
const {findByUserId} = require('../services/keyToken.service')
const { AuthFailureErorr, NotFoundErorr } = require('../core/error.response')


const HEADER = {
    API_KEY : 'x-api-key',
    CLIENT_ID: 'x-client-id',
    ATHORIZATION : 'authorization',
    REFRESHTOKEN: 'x-rtoken-id'
 }
/*
publicKey: verify token, khong luu vao database, chi dien ra 1 lan khi login
privateKey: login
payload: chua thong tin mang theo tu he thong nay sang he thong khac thong qua token
*/

const createTokenPair = async (payload, publicKey, privateKey) =>{
    try {

        const accessToken = await JWT.sign(payload, publicKey,{
            expiresIn: '2 days'
        })
        const refreshToken = await JWT.sign(payload, privateKey,{
            expiresIn: '7 days'
        })
        //Verify

        JWT.verify(accessToken, publicKey,(err, decode)=>{
            if(err){
                console.log(`error verify::`, err)
            }
            else{
                console.log(`decode verify::`, decode)
            }
        })

        return {accessToken, refreshToken}
    } catch (error) {
        
    }
}

const authentication = asyncHandler( async(req, res, next) => {
    /*
        1 - Check userId missing ??
        2 - Get accessToken
        3 - Verify token
        4 - Check user in db
        5 - Check keyStore with this userId
        6 - All ok => return next()    
    */
        //1.
        const userId = req.headers[HEADER.CLIENT_ID]
        if(!userId) throw new AuthFailureErorr('Invalid Request')

        //2.
        const keyStore = await findByUserId(userId)
        if(!keyStore) throw new NotFoundErorr('Not found keyStore')

        //3
        const accessToken = req.headers[HEADER.ATHORIZATION]
        if(!accessToken) throw new AuthFailureErorr('Invalid Request')

        try {
            
            const decodeUser = JWT.verify(accessToken, keyStore.publicKey)//
            // const decode = JWT.verify(accessKey, keySecret)
            console.log('decodeUser by verify accesToken:::', decodeUser)
            if(userId !== decodeUser.userId) throw new AuthFailureErorr('Invalid User')

            req.keyStore = keyStore
            req.user = decodeUser //{userId, email}
            return next()

        } catch (error) {
            throw error
        }

})

const authenticationV2 = asyncHandler( async(req, res, next) => {
    /*
        1 - Check userId missing ??
        2 - Get accessToken
        3 - Verify token
        4 - Check user in db
        5 - Check keyStore with this userId
        6 - All ok => return next()    
    */
        //1.
        const userId = req.headers[HEADER.CLIENT_ID]
        if(!userId) throw new AuthFailureErorr('Invalid Request')

        //2.
        const keyStore = await findByUserId(userId)
        if(!keyStore) throw new NotFoundErorr('Not found keyStore')

        //3
        if(req.headers[HEADER.REFRESHTOKEN]){
            try {
                const refreshToken = req.headers[HEADER.REFRESHTOKEN]
                const decodeUser = JWT.verify(refreshToken, keyStore.privateKey)//
                // const decode = JWT.verify(accessKey, keySecret)
                
                if(userId !== decodeUser.userId) throw new AuthFailureErorr('Invalid UserId')
    
                req.keyStore = keyStore
                req.user = decodeUser //{userId, email}
                req.refreshToken = refreshToken
                return next()
    
            } catch (error) {
                throw error
            }
        }
        const accessToken = req.headers[HEADER.ATHORIZATION]
        if(!accessToken) throw new AuthFailureErorr('Invalid Request')

        try {
            const decodeUser = JWT.verify(accessToken, keyStore.publicKey)//
            // const decode = JWT.verify(accessKey, keySecret)
            
            if(userId !== decodeUser.userId) throw new AuthFailureErorr('Invalid User')

            req.keyStore = keyStore
            req.user = decodeUser //{userId, email}
            return next()

        } catch (error) {
            throw error
        }

})

const verifyJWT = async (token, keySecret) => {
    return await JWT.verify(token, keySecret)
}

module.exports = {
    createTokenPair,
    authentication,
    authenticationV2,
    verifyJWT

}