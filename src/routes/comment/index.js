const express = require('express')
const commentController = require('../../controllers/comment.controller')
const {asyncHandler} = require('../../auth/checkAuth')
const {authenticationV2 } = require('../../auth/authUtills')
const router = express.Router()

//authentication

router.use(authenticationV2)

router.post('', asyncHandler(commentController.createComment))
router.get('', asyncHandler(commentController.getCommentByParentId))


module.exports = router