const jwt = require('jsonwebtoken')
const handleErrorAsync = require('./handleErrorAsync')
const handleError = require('./handleError')
const User = require('../models/user')

const isAuth = handleErrorAsync(async (req, res, next) => {
    let token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return handleError(401, '您尚未登入！', next)
    }

    // 驗證JWT token
    const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
            if (err) {
                reject(err)
            } else {
                resolve(payload)
            }
        })
    })

    const currentUser = await User.findById(decoded.id).select('-password')
    req.user = currentUser
    next()
})

const generateSendJWT = (user, statusCode, res) => {
    // 產生JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_DAY,
    })
    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        data: {
            user: {
                token,
                name: user.name,
            },
        },
    })
}

module.exports = {
    isAuth,
    generateSendJWT,
}
