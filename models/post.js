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
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            default: '6623d734d8fa49fa45525e8b',
        },
        likes: {
            type: Number,
            default: 0,
        },
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
