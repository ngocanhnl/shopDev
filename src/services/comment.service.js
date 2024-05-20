'use strict'

const { NotFoundErorr } = require('../core/error.response')
const Comment = require('../models/comment.model')
const { convertToObjectIdMongoDb } = require('../utils')


/*
    key features: Comment service
    + Add comment [User, Shop]
    + Get a list of comment [User, Shop]
    + delete comment [User, Shop, Admin]

*/

class CommentService{
    static async createComment({
        productId, userId, content, parentCommentId = null
    }){
        const comment = new Comment({
            comment_productId: productId,
            comment_content: content,
            comment_userId: userId,
            comment_parentId: parentCommentId
        })

        let rightValue = 0
        if(parentCommentId){
            //reply
            const parentComment = await Comment.findById(parentCommentId)
            if(!parentComment) throw new NotFoundErorr('parent comment not found')

            rightValue = parentComment.comment_right
            
            // update many comment
            await Comment.updateMany({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_right: {$gte: rightValue}//gte >=
            },{
                $inc: {comment_right: 2}
            })
            
            await Comment.updateMany({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_left: {$gt: rightValue}//gte >=
            },{
                $inc: {comment_left: 2}
            })

        }
        else{
            const maxRightValue = await Comment.findOne({
                comment_productId: convertToObjectIdMongoDb(productId)
            }, 'comment_right', {sort: {comment_right: -1}})

            if(maxRightValue){
                rightValue = maxRightValue + 1
            }
            else{
                rightValue = 1
            }

        }

        //insert to comment
        comment.comment_left = rightValue
        comment.comment_right = rightValue + 1

        await comment.save()
        return comment

    }

    static async getCommentByParentId({
        productId,
        parentCommentId,
        limit = 50,
        offset = 0//skip
    }){
        if(parentCommentId){
            const parent = await Comment.findById(parentCommentId)
            if(!parent) throw new NotFoundErorr('Not found comment')
            
            const comments = await Comment.find({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_left: {$gt: parent.comment_left},
                comment_right: {$lte: parent.comment_right}
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            }).sort({ comment_left: 1})

            return comments


         }
            const comments = await Comment.find({
                comment_productId: convertToObjectIdMongoDb(productId),
                comment_parentId: parentCommentId
            }).select({
                comment_left: 1,
                comment_right: 1,
                comment_content: 1,
                comment_parentId: 1
            }).sort({ comment_left: 1})

            return comments




    }
}

module.exports = CommentService