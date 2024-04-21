const express = require('express')
const Post = require('../models/post')
const User = require('../models/user')
const handleError = require('../service/handleError')
const router = express.Router()

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

router.post('/', async (req, res, next) => {
    try {
        if (!req.body.title) {
            return handleError(res, '貼文標題未填寫')
        }
        if (req.body.tags.length == 0) {
            return handleError(res, '貼文標籤未填寫')
        }
        if (!req.body.content) {
            return handleError(res, '貼文內容未填寫')
        }

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
    } catch (error) {
        console.log('error ' + error)
        return handleError(res, '新增失敗')
    }
})

module.exports = router
