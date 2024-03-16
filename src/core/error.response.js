'use strict'


const StatusCode = {
    FORBIDDEN: 403,
    CONFLICT: 409
}


const ReasonStatusCode = {
    FORBIDDEN: 'Bad request error',
    CONFLICT: 'Conflict erorr'
}

const {StatusCodes, ReasonPhrases} = require('../utils/httpStatusCode')

class ErrorResponse extends Error{

    constructor(message, status){
        super(message)
        this.status = status
    }
}


class ConflictRequestError extends ErrorResponse{
    
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN){
        super(message,statusCode)
        console.log("Error")
    }
}

class BadRequestError extends ErrorResponse{
    
    constructor(message = ReasonStatusCode.CONFLICT, statusCode = StatusCode.FORBIDDEN){
        super(message,statusCode)
        console.log("Error")
    }
}

class AuthFailureErorr extends ErrorResponse{
    
    constructor(message = ReasonPhrases.UNAUTHORIZED, statusCode = StatusCodes.UNAUTHORIZED){
        super(message,statusCode)
    }
}


module.exports = {
    ConflictRequestError,
    BadRequestError,
    AuthFailureErorr
}