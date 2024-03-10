'use strict'

const mongoose = require('mongoose')
const _SECOND = 5000
const os = require('os')
const process = require('process')
//count connect
const countConnect = ()=>{
    const numConnection = mongoose.connections.length;
    console.log(`Number of connection::${numConnection}`)
    return numConnection
}


//check overload
const checkOverload = ()=>{
    setInterval( ()=>{
        const numConnection = mongoose.connections.length;
        const numCores = os.cpus().length;
        const memoryUsage = process.memoryUsage().rss;
        //Example maximum number of connection based on number of cores
        const maxConnection = numCores*5;
        console.log(`Active connection::${numConnection}`)
        console.log(`Memory Usage::${memoryUsage/1024/1024} MB`)
        
        if(numConnection > maxConnection){
            console.log('Connection overload detected')
        }
    }, _SECOND)//Monitor every 5 seconds
}

module.exports = {
    countConnect,
    checkOverload
}