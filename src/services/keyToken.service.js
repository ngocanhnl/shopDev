'use strict'

const keytokenModel = require("../models/keytoken.model")

class KeyTokenService{
    //userId == shopId
    static createKeyToken = async ({userId, publicKey, privateKey, refreshToken})=>{

        try {
            //level ultimate
            //const publicKeyString = publicKey.toString() // publiKey is buffer cause rsa
            
            /*
            level 0
            const tokens = await keytokenModel.create({
                user: userId,
                publicKey,
                privateKey
            })

            return tokens ? tokens.publicKey : null
            */
           
            //level xxx

            const filter = {user: userId}, update = {
                publicKey, privateKey, refreshTokensUsed : [], refreshToken
            }, options = { upsert: true, new: true}//neu chua co se tao moi, con co roi se update

            const tokens = await keytokenModel.findOneAndUpdate(filter,update,options)

            return tokens ? tokens.publicKey : null

        } catch (error) {
            return error
        }

    }

}

module.exports = KeyTokenService