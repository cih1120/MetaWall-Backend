const express = require('express')
const router = express.Router()
const { isAuth } = require('../service/auth')
const uploadImage = require('../middlewares/uploadImage')
const { uploadPostPhoto } = require('../controller/upload.controller')
const {
    getPost,
    newPost,
    editPost,
    deleteAllPost,
    deleteSpecifyPost,
} = require('../controller/post.controller')

// 取得所有貼文
router.get('/', getPost)

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

module.exports = router
