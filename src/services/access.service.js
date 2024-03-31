'use strict'

const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const shopModel = require("../models/shop.model")
const KeyTokenService = require('./keyToken.service')
const { createTokenPair, verifyJWT } = require('../auth/authUtills')
const { getInfoData } = require('../utils/index')
const { BadRequestError, AuthFailureErorr, ForbiddenErorr } = require('../core/error.response')

const { findByEmail } = require('./shop.service')
const keytokenModel = require('../models/keytoken.model')

//Should replace value to '0001'
const roleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}


class AccessService{

    //v1
    // static handlerRefreshToken = async (refreshToken) => {
        
    //     //Check refreshToken da duoc dung hay chua
    //     const foundToken = await KeyTokenService.findByRefreshTokenUsed(refreshToken)
    //     if(foundToken){
    //         //decode xem day la user nao
    //         const {userId, email} = await verifyJWT(refreshToken, foundToken.privateKey)
    //         console.log({userId, email})
    //         //xoa tat ca token trong keyStore
    //         await KeyTokenService.deleteKeyById(userId)
    //         throw new ForbiddenErorr('Something wrong! Please relogin')
    
    //     }
    //     const holderToken = await KeyTokenService.findByRefreshToken(refreshToken)
    //     if(!holderToken) throw new AuthFailureErorr('Shop was not registered 1')

    //     //Verify token
    //     const {userId, email} = await verifyJWT(refreshToken, holderToken.privateKey)
    //     console.log('2---',{userId, email})

    //     //Check userId
    //     //**** */
    //     const foundShop = await findByEmail({email})
    //     if(!foundShop) throw new AuthFailureErorr('Shop was not registered 2')

    //     //Create cap token moi
    //     const tokens = await createTokenPair({userId,email}, holderToken.publicKey, holderToken.privateKey)

    //     //Update trong db
    //     // await holderToken.update({
    //     //     $set: {
    //     //         refreshToken: tokens.refreshToken
    //     //     },
    //     //     $addToSet: {
    //     //         refreshTokenUsed: refreshToken
    //     //     }
    //     // })
    //     await keytokenModel.updateOne({
    //         user: userId
    //     },{
    //         refreshToken: tokens.refreshToken,
    //         $push: { refreshTokensUsed: refreshToken  },
    //     })
    //     return {
    //         user: {userId, email},
    //         tokens
    //     }
    // }

    //v2 fixed
    static handlerRefreshTokenV2 = async ({refreshToken, user, keyStore}) => {
        const {userId, email}  = user
        if(keyStore.refreshTokensUsed.includes(refreshToken)){
            await KeyTokenService.deleteKeyById(userId)
            throw new ForbiddenErorr('Something wrong! Please relogin')
        }

        if(keyStore.refreshToken !== refreshToken){
            throw new AuthFailureErorr('Shop was not registered 1')
        }

        const foundShop = await findByEmail({email})
        if(!foundShop) throw new AuthFailureErorr('Shop was not registered 2')
        
        const tokens = await createTokenPair({userId,email}, keyStore.publicKey, keyStore.privateKey)

        await keytokenModel.updateOne({
            user: userId
        },{
            refreshToken: tokens.refreshToken,
            $push: { refreshTokensUsed: refreshToken  },
        })

        // await keyStore.update({
        //     $set:{
        //         refreshToken: tokens.refreshToken
        //     },
        //     $addToSet:{
        //         refreshTokensUsed: refreshToken
        //     }
        // })
        return {
            user,
            tokens
        }
        
        
    }

    static logout = async (keyStore) => {
        const delKey = await KeyTokenService.removeKeyById(keyStore._id)
        console.log({delKey})
        return delKey
    }
    /*
        1-Check email in db
        2-Match password
        3-Create AT vs RT and save in db
        4-Generate tokens
        5-Get data return login  

    */
    static login = async ({ email, password, refreshToken = null }) => {
        //1.
        const foundShop = await findByEmail({email})
        if(!foundShop) throw new BadRequestError('Shop not registered')

        //2.
        const match = bcrypt.compare(password, foundShop.password)
        if(!match) throw new AuthFailureErorr('Authentication error')

        //3.
        const publicKey = crypto.randomBytes(64).toString('hex');
        const privateKey = crypto.randomBytes(64).toString('hex');

        //4.
        const {_id: userId} = foundShop
        const tokens = await createTokenPair({userId,email}, publicKey, privateKey)
        console.log(tokens.refreshToken)
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey, userId
        })
        //5.
        return {
                shop: getInfoData({fileds:['_id','name','email'], object: foundShop}),
                tokens
                
            }

    }

    static signUp = async ({name, email, password})=>{
        // try {
            //step 1: check email exits??
            console.log("AccessService.signup")
            const hoderShop = await shopModel.findOne({email}).lean()
            if(hoderShop){
                throw new BadRequestError('Error: Shop aldready registered!')
            }
            const passwordHash = await bcrypt.hash(password, 10)
            const newShop = await shopModel.create({
                name, email, password: passwordHash, roles: [roleShop.SHOP]
            })
            if(newShop){
               //Level 1
                const publicKey = crypto.randomBytes(64).toString('hex');
                const privateKey = crypto.randomBytes(64).toString('hex');
                // console.log({privateKey, publicKey})
                const keyStore = await KeyTokenService.createKeyToken({
                    userId: newShop._id,
                    publicKey,
                    privateKey
                })
                if(!keyStore){
                    return{
                        code: 'xxxx',
                        message: 'publicKeyString error'
                    }
                }
        
                //created token pair
                const tokens = await createTokenPair({userId: newShop._id,email}, publicKey, privateKey)
                console.log(`Created token success`, tokens)

                return {
                    code: 201,
                    metadata:{
                        shop: getInfoData({fileds:['_id','name','email'], object: newShop}),
                        tokens
                    }
                }


            }
            return {
                code: 201,
                metadata:null
            }



        // } catch (error) {
            console.log(err)
            return {
                code: 'xxx',
                message: error.message,
                status: 'error'
            }
        // }
    }



}


module.exports = AccessService