const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            required: [true, '留言內容未填寫'],
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'user',
            require: ['true', '留言者未填寫'],
        },
        post: {
            type: mongoose.Schema.ObjectId,
            ref: 'post',
            require: ['true', '貼文ID未填寫'],
        },
    },
    {
        versionKey: false,
        timestamps: false,
    }
)

commentSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name id createdAt avatar',
    })

    next()
})
const Comment = mongoose.model('Comment', commentSchema)
module.exports = Comment
