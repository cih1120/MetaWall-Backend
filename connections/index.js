const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config({ path: './config.env' })
let DB
if (process.env.NODE_ENV === 'dev') {
    DB = process.env.DATABASE_LOCAL
} else {
    DB = process.env.DATABASE.replace(
        '<password>',
        process.env.DATABASE_PASSWORD
    )
}

mongoose.connect(DB).then(() => console.log('資料庫連線成功'))
