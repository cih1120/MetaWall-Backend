const mongoose = require('mongoose')
const Post = require('../models/post')
const { Schema } = mongoose
const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: [true, '請輸入您的名字'],
            minlength: [2, '名字需要至少兩個字元'],
        },
        email: {
            type: String,
            required: [true, '請輸入您的 Email'],
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, '請輸入您的密碼'],
            select: false,
        },
        avatar: String,
        createdAt: {
            type: Date,
            default: new Date(),
        },
        followers: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'user',
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
        following: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'user',
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
        gender: {
            type: String,
            required: [true, '請輸入您的性別'],
            enum: ['female', 'male'],
        },
        likes: [
            {
                posts: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Post',
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
    },
    {
        versionKey: false,
        timestamps: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)

const User = mongoose.model('user', UserSchema)

module.exports = User
