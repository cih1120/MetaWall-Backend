const express = require('express')
const validator = require('validator')
const User = require('../models/user')
const router = express.Router()
const uploadImage = require('../middlewares/uploadImage')
const { isAuth, generateSendJWT } = require('../service/auth')
const { uploadAvatar } = require('../controller/upload.controller')

const {
    signUp,
    signIn,
    updatePassword,
    getUserProfile,
    updateProfile,
} = require('../controller/user.controller')

// 註冊會員
router.post('/sign_up', express.json(), signUp)

// 會員登入
router.post('/sign_in', express.json(), signIn)

// 更新密碼
router.post('/update_password', express.json(), updatePassword)

// 取得個人資料
router.get('/profile', isAuth, getUserProfile)

// 更新個人資料
router.patch('/profile', isAuth, express.json(), updateProfile)

// 上傳用戶大頭貼
router.post('/profile/avatar', isAuth, uploadImage, uploadAvatar)

module.exports = router
