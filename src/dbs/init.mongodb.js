'use strict'
const {db:{host, name, port}} = require('../configs/config.mongodb')
const connectString = `mongodb://${host}:${port}/${name}`
// const connectString = `mongodb://localhost:27017/shopDev`
const mongoose = require('mongoose')
const {countConnect} = require('../helpers/check.connect')



class Database{

    constructor(){
        this.connect()
       
    }

    //connect
    connect(type = 'mongodb'){

        //dev
        if(1===1){
            mongoose.set('debug',true)
            mongoose.set('debug',{ color: true})
        }
        console.log(connectString)
        mongoose.connect(connectString)
        .then(_ => {
            console.log(`Connected Mongodb Success PRO`, countConnect())
        })
        .catch(err => console.log("Error Connect"))
    }
    static getInstance(){
        if(!Database.instance){
            Database.instance = new Database()
        }
        return Database.instance
    }

}


const instanceMongoDb = Database.getInstance()
module.exports = instanceMongoDb