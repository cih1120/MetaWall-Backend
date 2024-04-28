const express = require('express')
const Post = require('../models/post')
const User = require('../models/user')
const handleError = require('../service/handleError')
const router = express.Router()
const handleErrorAsync = require('../service/handleErrorAsync')

router.get('/', async (req, res, next) => {
    const timeSort = req.query.timeSort == 'asc' ? 'createAt' : '-createdAt'
    const q =
        req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
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

const checkPost = (data, next) => {
    if (!data.title) {
        return handleError(400, '貼文標題未填寫', next)
    }
    if (data.tags.length == 0) {
        return handleError(400, '貼文標籤未填寫', next)
    }
    if (!data.content) {
        return handleError(400, '貼文內容未填寫', next)
    }
}

router.post(
    '/',
    express.json(),
    handleErrorAsync(async (req, res, next) => {
        checkPost(req.body, next)

        await Post.create(req.body)
            .then(() => {
                console.log(req.body)
                res.status(201).json({
                    status: 'success',
                    message: '新增成功',
                })
            })
            .catch((error) => {
                console.log('error ' + error)
                return handleError(res, '新增失敗')
            })
    })
)

module.exports = router
