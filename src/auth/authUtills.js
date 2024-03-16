'use strict'

const JWT = require('jsonwebtoken')
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

module.exports = {
    createTokenPair
}