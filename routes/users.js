const express = require('express')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const User = require('../models/user')
const handleError = require('../service/handleError')
const router = express.Router()
const handleErrorAsync = require('../service/handleErrorAsync')
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
router.post(
    '/sign_up',
    express.json(),
    handleErrorAsync(async (req, res, next) => {
        console.log(req.body)
        let { email, password, confirmPassword, name } = req.body

        // 確認欄位是否都有填寫
        if (!email || !password || !confirmPassword || !name.trim()) {
            return next(handleError(400, '欄位未填寫正確！', next))
        }

        // 確認密碼欄位是否一致
        checkConfirmPassword(password, confirmPassword, next)

        // 確認密碼欄位是否足8碼
        checkPasswordLength(password)

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
)

// 會員登入
router.post(
    '/sign_in',
    express.json(),
    handleErrorAsync(async (req, res, next) => {
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
        checkPasswordLength(password)

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
)

// 更新密碼
router.post(
    '/update_password',
    express.json(),
    handleErrorAsync(async (req, res, next) => {
        let { password, confirmPassword } = req.body

        // 確認欄位是否都有填寫
        if (!password || !confirmPassword) {
            return next(handleError(400, '欄位未填寫正確！', next))
        }

        // 確認密碼欄位是否一致
        checkConfirmPassword(password, confirmPassword, next)

        // 確認密碼欄位是否足8碼
        checkPasswordLength(password)

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
)

// 取得個人資料
router.get(
    '/profile',
    isAuth,
    handleErrorAsync(async (req, res, next) => {
        const user = req.user
        res.status(200).json({
            status: 'success',
            user,
        })
    })
)

// 更新個人資料
router.patch(
    '/profile',
    isAuth,
    express.json(),
    handleErrorAsync(async (req, res, next) => {
        const { name } = req.body
        console.log(name)
        if (!name) {
            return next(handleError(400, '請填寫修改姓名', next))
        }
        await User.findByIdAndUpdate(req.user.id, {
            name,
        })
            .then((user) => generateSendJWT(user, 200, res))
            .catch((err) => {
                return next(handleError(400, '找不到使用者', next))
            })
    })
)

module.exports = router
