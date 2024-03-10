
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
//ngan ben thu 3 doc cookie

//init database
require('./dbs/init.mongodb.js');



//CHECK OVERLOAD
// const {checkOverload} = require('../src/helpers/check.connect.js')
// checkOverload()

// init routes

app.use('/', require('./routes'))

//handling error



module.exports = app;

