const express = require('express')
const User = require('../models/user')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const handleError = require('../service/handleError')
const handleErrorAsync = require('../middlewares/handleErrorAsync')
const { isAuth, generateSendJWT } = require('../service/auth')
const {
    checkNameLength,
    checkGender,
    checkPasswordLength,
    checkConfirmPassword,
    createPasswordHash,
} = require('../validation/user')

// 註冊會員
const signUp = handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name, gender } = req.body

    // 確認欄位是否都有填寫
    if (!email || !password || !confirmPassword || !name.trim() || !gender) {
        return next(handleError(400, '欄位未填寫正確！', next))
    }

    // 確認性別是否填寫正確
    checkGender(gender, next)

    // 確認暱稱長度
    checkNameLength(name, next)

    // 確認密碼欄位是否一致
    checkConfirmPassword(password, confirmPassword, next)

    // 確認密碼欄位是否足8碼
    checkPasswordLength(password, next)

    // Email格式是否正確
    if (!validator.isEmail(email)) {
        return next(handleError(400, 'Email 格式不正確！', next))
    }

    // 確認此Email是否被註冊過
    const isEmailUnique = await User.findOne({ email })
    if (isEmailUnique) {
        return next(handleError(406, 'Email 已經被註冊過', next))
    }

    //加密密碼
    password = await createPasswordHash(password)
    const newUser = await User.create({
        email,
        password,
        name,
        gender,
    })
    generateSendJWT(newUser, 201, res)
})

// 會員登入
const signIn = handleErrorAsync(async (req, res, next) => {
    let { email, password } = req.body

    // 確認欄位是否都有填寫
    if (!email || !password) {
        return next(handleError(400, '帳號密碼不可為空', next))
    }

    // Email格式是否正確
    if (!validator.isEmail(email)) {
        return next(handleError(400, 'Email 格式不正確！', next))
    }

    // 確認密碼欄位是否足8碼
    checkPasswordLength(password, next)

    // 確認email 是否已經註冊過
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
        return next(handleError(406, '找不到使用者', next))
    }

    // 確認密碼是否正確
    const auth = await bcrypt.compare(password, user.password)
    if (!auth) {
        return next(handleError(407, '密碼錯誤', next))
    }
    generateSendJWT(user, 200, res)
})

// 更新密碼
const updatePassword = handleErrorAsync(async (req, res, next) => {
    let { password, confirmPassword } = req.body

    // 確認欄位是否都有填寫
    if (!password || !confirmPassword) {
        return next(handleError(400, '欄位未填寫正確！', next))
    }

    // 確認密碼欄位是否一致
    checkConfirmPassword(password, confirmPassword, next)

    // 確認密碼欄位是否足8碼
    checkPasswordLength(password, next)
    newPassword = await createPasswordHash(password)
    await User.findByIdAndUpdate(req.user._id, {
        password: newPassword,
    })
        .then((user) => {
            generateSendJWT(user, 200, res)
        })
        .catch((err) => {
            return next(handleError(400, '找不到使用者', next))
        })
})

// 取得個人資料
const getUserProfile = handleErrorAsync(async (req, res, next) => {
    const id = req.user._id
    let user = {}
    User.findById(id)
        .populate({
            path: 'followers.user',
            select: 'name avatar',
        })
        .populate({
            path: 'following.user',
            select: 'name avatar',
        })
        .populate({
            path: 'likes.posts',
            select: 'name avatar',
        })
        .then((data) => {
            user = { ...data._doc, id }
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        _id: user._id,
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        createdAt: user.createdAt,
                        avatar: user.avatar,
                        gender: user.gender,
                        followers: user.followers,
                        following: user.following,
                        likes: user.likes,
                    },
                },
            })
        })
})

// 取得其他用戶資料
const getUserProfileById = handleErrorAsync(async (req, res, next) => {
    const userId = req.params.id
    const user = await User.findById(userId)
        .populate({
            path: 'followers.user',
            select: 'name avatar',
        })
        .populate({
            path: 'following.user',
            select: 'name avatar',
        })
        .populate({
            path: 'likes.posts',
            select: 'user',
        })
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                avatar: user.avatar,
                gender: user.gender,
                followers: user.followers,
                following: user.following,
                likes: user.likes,
            },
        },
    })
})

// 更新個人資料
const updateProfile = handleErrorAsync(async (req, res, next) => {
    const { name, avatar, gender } = req.body

    // 確認性別是否填寫正確
    checkGender(gender, next)

    // 確認暱稱長度
    checkNameLength(name, next)

    const updateFields = {
        name,
        gender,
    }

    if (avatar) {
        updateFields.avatar = avatar
    }

    await User.findByIdAndUpdate(req.user.id, {
        ...updateFields,
    })
        .then((user) => generateSendJWT(user, 200, res))
        .catch((err) => {
            return next(handleError(400, '找不到使用者', next))
        })
})

// 追蹤用戶
const follow = handleErrorAsync(async (req, res, next) => {
    const followerId = req.params.id
    const userId = req.user.id
    if (followerId === userId) {
        return next(handleError(401, '您無法追蹤自己', next))
    }

    const follower = await User.findById(followerId)
    if (!follower) {
        return next(handleError(400, 'follower id 錯誤', next))
    }

    // 避免出現重複值，所以使用updateOne
    const updateUserResult = await User.updateOne(
        {
            _id: userId,
            'following.user': { $ne: followerId },
        },
        {
            $addToSet: { following: { user: followerId } },
        }
    )
    const updateFollowerResult = await User.updateOne(
        {
            _id: followerId,
            'follower.user': { $ne: userId },
        },
        {
            $addToSet: { followers: { user: userId } },
        }
    )
    // 檢查更新結果
    if (
        updateUserResult.nModified === 0 ||
        updateFollowerResult.nModified === 0
    ) {
        return next(handleError(500, '更新追蹤狀態時出現錯誤', next))
    }

    res.status(200).json({
        status: 'success',
        message: '追蹤成功',
    })
})

// 取消追蹤用戶
const unFollow = handleErrorAsync(async (req, res, next) => {
    const followerId = req.params.id
    const userId = req.user.id
    if (followerId === userId) {
        return next(handleError(401, '您無法取消追蹤自己', next))
    }

    const follower = await User.findById(followerId)
    if (!follower) {
        return next(handleError(400, 'follower id 錯誤', next))
    }

    await User.findByIdAndUpdate(userId, {
        $pull: { following: { user: followerId } },
    })
    await User.findByIdAndUpdate(followerId, {
        $pull: { followers: { user: userId } },
    })

    res.status(200).json({
        status: 'success',
        message: '取消追蹤成功',
    })
})

module.exports = {
    signUp,
    signIn,
    updatePassword,
    getUserProfile,
    getUserProfileById,
    updateProfile,
    follow,
    unFollow,
}
