'use strict'

const redis = require('redis')
const { promisify}  = require('util')
const { reservationInventory } = require('../models/repositories/inventory.repo')
const redisClient = redis.createClient()

const pexpire = promisify(redisClient.pExpire).bind(redisClient)
const setnxAsync = promisify(redisClient.setNX).bind(redisClient)

const acquireLock = async (productId, quantity, cartId) => {
    const key = `lock_v2023_${productId}`
    const retryTimes = 10
    const expireTime = 3000 // 3 seconds tam lock
  

    for (let i = 0; i < retryTimes; i++) {
        // Tao 1 key, ai giu key thi dc vao thanh toan
        const result = await setnxAsync(key, expireTime)
        console.log(`result:::`, result)
        if(result === 1){
            // Thao tac voi Inventory
            const isReservation = await reservationInventory({productId, quantity, cartId})
            if(isReservation.modifiedCount){
                await pexpire(key,expireTime)
                return key
            }
            return null
        }
        else{
            await new Promise((resolve) => setTimeout(resolve, 50))
        }
        
    }
}

const releaseLock = async keyLock => {
    const delAsyncKey = promisify(redisClient.del).bind(redisClient)
    return await delAsyncKey(keyLock)
}


module.exports = {
    acquireLock,
    releaseLock
}