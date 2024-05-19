const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, '貼文標題未填寫'],
        },
        tags: {
            type: [String],
            required: [true, '貼文標籤未填寫'],
            enum: ['遊記', '發問', '閒聊', '美食'],
        },
        content: {
            type: String,
            required: [true, '貼文內容未填寫'],
        },
        user: {
            type: String,
            ref: 'user',
            required: [true, '貼文作者錯誤'],
        },
        likes: [
            {
                user: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'User',
                },
                createdAt: {
                    type: Date,
                    default: Date.now(),
                },
            },
        ],
        photo: {
            type: String,
        },
        createdAt: {
            type: Date,
            default: new Date(),
        },
    },
    {
        versionKey: false,
        timestamps: false,
    }
)

const Post = mongoose.model('Post', PostSchema)

module.exports = Post
