const redisPubsubService = require('../services/redisPubsub.service')
const RedisPubSubService = require('../services/redisPubsub.service')


class ProductServiceTest{
    purchaseProduct( productId, quantity){
        const order = {
            productId,
            quantity
        }
        console.log('purchase_product')
        redisPubsubService.publish('purchase_events', JSON.stringify(order))
    }

}

module.exports = new ProductServiceTest()