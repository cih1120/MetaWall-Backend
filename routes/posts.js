const express = require('express')
const router = express.Router()
const { isAuth } = require('../service/auth')
const uploadImage = require('../middlewares/uploadImage')
const { uploadPostPhoto } = require('../controller/upload.controller')
const {
    getPost,
    getUserPost,
    newPost,
    editPost,
    deleteAllPost,
    deleteSpecifyPost,
    like,
    unLike,
    comment,
} = require('../controller/post.controller')

// 取得所有貼文
router.get('/', getPost)

// 取得特定用戶貼文
router.get('/user/:id', getUserPost)

// 新增貼文
router.post('/', isAuth, express.json(), newPost)

// 編輯單筆貼文
router.patch('/:id', isAuth, express.json(), editPost)

// 刪除全部貼文
router.delete('/', deleteAllPost)

// 刪除單筆貼文
router.delete('/:id', deleteSpecifyPost)

// 上傳圖片
router.post('/photo', isAuth, uploadImage, uploadPostPhoto)

// 新增一則貼文的讚
router.post('/:id/like', isAuth, like)

// 取消一則貼文的讚
router.delete('/:id/un_like', isAuth, unLike)

// 對一則貼文進行留言
router.post('/:id/comment', isAuth, express.json(), comment)

module.exports = router
