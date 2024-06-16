const Post = require('../models/post')
const User = require('../models/user')
const Comment = require('../models/comments')
const handleError = require('../service/handleError')
const handleErrorAsync = require('../middlewares/handleErrorAsync')

const checkPost = (data, next) => {
    if (!data.title.trim()) {
        return handleError(400, '貼文標題未填寫', next)
    }
    if (!data.content.trim()) {
        return handleError(400, '貼文內容未填寫', next)
    }
}

// 取得所有貼文
const getPost = async (req, res, next) => {
    const timeSort =
        req.query.timeSort === 'asc' ? { createdAt: 1 } : { createdAt: -1 }
    const q =
        req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const skip = (page - 1) * limit
    const posts = await Post.find(q)
        .populate({
            path: 'user',
            select: 'name avatar ',
        })
        .populate({
            path: 'comments',
            select: 'comment user createdAt avatar',
        })
        .sort(timeSort)
        .skip(skip)
        .limit(limit)
    res.status(200).json({
        status: 'success',
        data: posts,
    })
}

// 取得特定貼文
const getPostById = async (req, res, next) => {
    const postId = req.params.id
    const post = await Post.findById(postId)
        .populate({
            path: 'user',
            select: 'name avatar ',
        })
        .populate({
            path: 'comments',
            select: 'comment user createdAt',
        })
    res.status(200).json({
        status: 'success',
        data: post,
    })
}

// 取得該用戶所有貼文
const getUserPost = async (req, res, next) => {
    const timeSort = req.query.timeSort === 'asc' ? 'createAt' : '-createdAt'
    const q =
        req.query.q !== undefined ? { content: new RegExp(req.query.q) } : {}
    const page = parseInt(req.query.page, 10) || 1
    const limit = parseInt(req.query.limit, 10) || 5
    const skip = (page - 1) * limit
    const userId = req.params.id
    const searchParams = { ...q, user: userId }
    const posts = await Post.find(searchParams)
        .populate({
            path: 'user',
            select: 'name avatar ',
        })
        .populate({
            path: 'comments',
            select: 'comment user createdAt',
        })
        .sort(timeSort)
        .skip(skip)
        .limit(limit)
    res.status(200).json({
        status: 'success',
        data: posts,
    })
}

// 新增貼文
const newPost = handleErrorAsync(async (req, res, next) => {
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

// 編輯單筆貼文
const editPost = handleErrorAsync(async (req, res, next) => {
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

    await Post.findOneAndUpdate({ _id: req.params.id }, req.body).then(() => {
        res.status(201).json({
            status: 'success',
            message: '編輯成功',
        })
    })
})

// 刪除全部貼文
const deleteAllPost = handleErrorAsync(async (req, res, next) => {
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

// 刪除單篇貼文
const deleteSpecifyPost = handleErrorAsync(async (req, res, next) => {
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

// 新增一則貼文的讚
const like = handleErrorAsync(async (req, res, next) => {
    const postId = req.params.id
    const userId = req.user.id
    const post = await Post.findById(postId)
    if (!post) {
        return next(handleError(401, 'post id 錯誤', next))
    }

    // 避免出現重複值，所以使用updateOne
    await Post.updateOne(
        {
            _id: postId,
            'likes.user': { $ne: userId },
        },
        {
            $addToSet: { likes: { user: userId } },
        }
    )
    await User.updateOne(
        {
            _id: userId,
            'likes.post': { $ne: postId },
        },
        {
            $addToSet: { likes: { post: postId } },
        }
    )
    // const res = await Post.findById(postId)

    res.status(200).json({
        status: 'success',
        data: post,
        message: '按讚成功',
    })
})

// 取消一則貼文的讚
const unLike = handleErrorAsync(async (req, res, next) => {
    const postId = req.params.id
    const userId = req.user.id
    const post = await Post.findById(postId)
    if (!post) {
        return next(handleError(401, 'post id 錯誤', next))
    }

    await Post.findByIdAndUpdate(postId, {
        $pull: { likes: { user: userId } },
    })
    await User.findByIdAndUpdate(userId, {
        $pull: { likes: { post: postId } },
    })

    res.status(200).json({
        status: 'success',
        message: '取消按讚成功',
    })
})

// 對一則貼文進行留言
const comment = handleErrorAsync(async (req, res, next) => {
    const postId = req.params.id
    const userId = req.user.id
    const { comment } = req.body
    if (!comment.trim()) {
        return next(handleError(400, '留言尚未填寫', next))
    }

    await Comment.create({
        comment,
        user: userId,
        post: postId,
    })

    const post = await Post.findById(postId)
        .populate({
            path: 'user',
            select: 'name avatar ',
        })
        .populate({
            path: 'comments',
            select: 'comment user createdAt avatar',
        })
    if (!post) {
        return next(handleError(400, 'post id 錯誤', next))
    }

    res.status(200).json({
        status: 'success',
        data: post,
    })
})

// 刪除一則貼文的留言
const removeComment = handleErrorAsync(async (req, res, next) => {
    const commentId = req.params.id // 假設 commentId 從路徑參數中獲取

    const comment = await Comment.findById(commentId)
    await Comment.findByIdAndDelete(commentId)
    console.log(comment)
    const post = await Post.findById(comment.post)
        .populate({
            path: 'user',
            select: 'name avatar ',
        })
        .populate({
            path: 'comments',
            select: 'comment user createdAt avatar',
        })
    if (!post) {
        return next(handleError(400, 'post id 錯誤', next))
    }

    res.status(200).json({
        status: 'success',
        data: post,
    })
})

module.exports = {
    getPost,
    getPostById,
    getUserPost,
    newPost,
    editPost,
    deleteAllPost,
    deleteSpecifyPost,
    like,
    unLike,
    comment,
    removeComment,
}
