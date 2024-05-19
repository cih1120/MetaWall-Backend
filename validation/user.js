const bcrypt = require('bcryptjs')
const validator = require('validator')
const handleError = require('../service/handleError')

const checkNameLength = (name, next) => {
    if (!validator.isLength(name, { min: 2 })) {
        return next(handleError(400, '暱稱需要2個字元以上', next))
    }
}

const checkGender = (gender, next) => {
    if (gender !== 'female' && gender !== 'male') {
        return next(handleError(400, '性別填寫錯誤', next))
    }
}

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

module.exports = {
    checkNameLength,
    checkGender,
    checkPasswordLength,
    checkConfirmPassword,
    createPasswordHash,
}
