const http = require('http')
const dotenv = require('dotenv')
const express = require('express')
const IndexRouter = require('./routes/index')
const PostRouter = require('./routes/posts')
const resErrorDev = require('./service/resErrorDev')
const resErrorProd = require('./service/resErrorProd')
dotenv.config({ path: './config.env' })
const app = express()

// 紀錄uncaughtException錯誤，停掉該process
process.on('uncaughtException', (err) => {
    console.error('uncaughtException')
    console.error(err)
    process.exit(1)
})

// Mongo DB連線
require('./connections')

// Routes
app.use('/', IndexRouter)
app.use('/posts', PostRouter)
app.use(function (res, res, next) {
    res.statusCode(
        404,
        json({
            status: 'error',
            message: '無此路由',
        })
    )
})

// 錯誤處理
app.use(function (err, req, res, next) {
    // dev
    err.statusCode = err.statusCode || 500
    if (process.env.NODE_ENV === 'dev') {
        return resErrorDev(err, res)
    }
    // production
    if (err.name === 'ValidationError') {
        err.message = '資料欄位未填寫正確，請重新輸入！'
        err.isOperational = true
        return resErrorProd(err, res)
    }
    resErrorProd(err, res)
})

// 未捕捉到的 catch
process.on('unhandledRejection', (err, promise) => {
    console.error('未捕捉到的 rejection:', promise, '原因: ', err)
})

module.exports = app
