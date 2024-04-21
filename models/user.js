const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: [true, '請輸入您的名字'],
    },
    email: {
        type: String,
        required: [true, '請輸入您的 Email'],
        unique: true,
        lowercase: true,
        select: false,
    },
    avatar: String,
})

const User = mongoose.model('user', UserSchema)

module.exports = User
