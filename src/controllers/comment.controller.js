'use strict'

const CommnetService = require("../services/comment.service")

const {SuccessResponse} = require('../core/success.response')


class CommentController {

    createComment = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'Create new comment success',
            metadata: await CommnetService.createComment(req.body)
        }).send(res)
    }
    getCommentByParentId = async ( req, res, next ) => {
        new SuccessResponse({
            message: 'get getCommentByParentId success',
            metadata: await CommnetService.getCommentByParentId(req.query)
        }).send(res)
    }
    
}

module.exports  = new CommentController()