
require('dotenv').config()

const compression = require('compression');
const express = require('express');
const { default: helmet } = require('helmet');

const morgan = require('morgan');

const app = express();


//init middlewares
app.use(morgan("dev"))//co 5 loai
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
//ngan ben thu 3 doc cookie

//init database
require('./dbs/init.mongodb.js');



//CHECK OVERLOAD
// const {checkOverload} = require('../src/helpers/check.connect.js')
// checkOverload()

// init routes

app.use('/', require('./routes'))

//Handling error

app.use( ( req, res, next ) => {
    const error = new Error('Not Found')
    error.status = 404
    console.log("Handle 1")
    next(error)
})

app.use( ( error, req, res, next ) => {
    const statusCode = error.status || 500
    console.log(error)
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode ,
        stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})


module.exports = app;

