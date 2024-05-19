const express = require('express')
const Post = require('../models/post')
const User = require('../models/user')
const handleError = require('../service/handleError')
const router = express.Router()
const handleErrorAsync = require('../middlewares/handleErrorAsync')
const { isAuth } = require('../service/auth')
const { ObjectId } = require('mongoose').Types

const checkPost = (data, next) => {
    if (!data.title.trim()) {
        return handleError(400, '貼文標題未填寫', next)
    }
    if (data.tags.length === 0) {
        return handleError(400, '貼文標籤未填寫', next)
    }
    if (!data.content.trim()) {
        return handleError(400, '貼文內容未填寫', next)
    }
}

// 取得所有貼文
router.get('/', async (req, res, next) => {
    const timeSort = req.query.timeSort === 'asc' ? 'createAt' : '-createdAt'
    const q =
        req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
    console.log(q)
    const posts = await Post.find(q)
        .populate({
            path: 'user',
            select: 'name avatar ',
        })
        .sort(timeSort)
    res.status(200).json({
        status: 'success',
        data: posts,
    })
})

// 新增貼文
router.post(
    '/',
    isAuth,
    express.json(),
    handleErrorAsync(async (req, res, next) => {
        checkPost(req.body, next)
        const post = { ...req.body, user: req.user._id.toString() }
        await Post.create(post)
            .then(() => {
                res.status(201).json({
                    status: 'success',
                    message: '新增成功',
                })
            })
            .catch((error) => {
                console.log('error ' + error)
                return handleError(400, '新增失敗', next)
            })
    })
)

// 編輯單筆貼文
router.patch(
    '/:id',
    isAuth,
    express.json(),
    handleErrorAsync(async (req, res, next) => {
        checkPost(req.body, next)
        const id = req.params.id
        let post
        await Post.findById(id)
            .then((res) => {
                post = res
            })
            .catch((error) => {
                console.log('error ' + error)
                return handleError(400, '查無此貼文', next)
            })

        // 比對登入ID與貼文ID是否一致
        if (req.user._id.toString() !== post.user.toString()) {
            return handleError(400, '使用者錯誤，無編輯權限', next)
        }

        await Post.findOneAndUpdate({ _id: req.params.id }, req.body).then(
            () => {
                res.status(201).json({
                    status: 'success',
                    message: '編輯成功',
                })
            }
        )
    })
)

// 刪除全部貼文
router.delete(
    '/',
    handleErrorAsync(async (req, res, next) => {
        console.log(req.originalUrl)
        if (req.originalUrl !== '/posts') {
            return handleError(400, '查無此ID', next)
        }
        await Post.deleteMany({}).then(() => {
            res.status(200).json({
                status: 'success',
                message: '刪除全部貼文成功',
            })
        })
    })
)

// 刪除單筆貼文
router.delete(
    '/:id',
    handleErrorAsync(async (req, res, next) => {
        console.log(req.params.id)
        await Post.deleteOne({ _id: req.params.id })
            .then(() => {
                res.status(200).json({
                    status: 'success',
                    message: '刪除單筆貼文成功',
                })
            })
            .catch((error) => {
                console.log('error ' + error)
                return handleError(400, '查無此ID', next)
            })
    })
)

module.exports = router
