const express = require('express')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const User = require('../models/user')
const handleError = require('../service/handleError')
const handleErrorAsync = require('../middlewares/handleErrorAsync')
const { isAuth, generateSendJWT } = require('../service/auth')

const checkPasswordLength = (password, next) => {
    if (!validator.isLength(password, { min: 8 })) {
        return next(handleError(400, '密碼不足8碼！', next))
    }
}
const checkConfirmPassword = (password, confirmPassword, next) => {
    if (password !== confirmPassword) {
        return next(handleError(400, '密碼不一致！', next))
    }
}
const createPasswordHash = async (password) => {
    return await bcrypt.hash(password, 12)
}

// 註冊會員
const signUp = handleErrorAsync(async (req, res, next) => {
    let { email, password, confirmPassword, name } = req.body

    // 確認欄位是否都有填寫
    if (!email || !password || !confirmPassword || !name.trim()) {
        return next(handleError(400, '欄位未填寫正確！', next))
    }

    if (name.length < 2) {
        return next(handleError(400, '暱稱需要2個字元以上', next))
    }

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
        return next(handleError(400, '找不到使用者', next))
    }

    // 確認密碼是否正確
    const auth = await bcrypt.compare(password, user.password)
    if (!auth) {
        return next(handleError(400, '密碼錯誤', next))
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
    await User.findByIdAndUpdate(req.user.id, {
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
    const user = req.user
    res.status(200).json({
        status: 'success',
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
                avatar: user.avatar,
            },
        },
    })
})

// 更新個人資料
const updateProfile = handleErrorAsync(async (req, res, next) => {
    const { name, avatar, gender } = req.body
    if (name && name.length <= 2) {
        return next(handleError(400, '暱稱不得小於2個字', next))
    }

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

module.exports = {
    signUp,
    signIn,
    updatePassword,
    getUserProfile,
    updateProfile,
}
