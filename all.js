const http = require('http')
const dotenv = require('dotenv')
const express = require('express')
const bodyParser = require('body-parser');
const PostRouter = require('./routes/posts')
require('./connections')
dotenv.config({ path: './config.env' })

const app = express()

// 使用body-parser來解析urlencoded和json格式的request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/posts', PostRouter);

const port = process.env.PORT || 3005
app.listen(port)

module.exports = app
