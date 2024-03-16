'use strict'

const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const shopModel = require("../models/shop.model")
const KeyTokenService = require('./keyToken.service')
const { createTokenPair } = require('../auth/authUtills')
const { getInfoData } = require('../utils/index')
const { BadRequestError, AuthFailureErorr } = require('../core/error.response')

const { findByEmail } = require('./shop.service')

//Should replace value to '0001'
const roleShop = {
    SHOP: 'SHOP',
    WRITER: 'WRITER',
    EDITOR: 'EDITOR',
    ADMIN: 'ADMIN'
}


class AccessService{


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
        const tokens = await createTokenPair({userId: foundShop._id,email}, publicKey, privateKey)
        await KeyTokenService.createKeyToken({
            refreshToken: tokens.refreshToken,
            privateKey, publicKey
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