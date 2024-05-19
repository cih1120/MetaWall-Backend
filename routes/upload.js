const express = require('express')
const router = express.Router()
const handleError = require('../service/handleError')
const handleErrorAsync = require('../middlewares/handleErrorAsync')
const sizeOf = require('image-size')
const uploadImage = require('../middlewares/uploadImage')

const { v4: uuidv4 } = require('uuid')
const firebaseAdmin = require('../service/firebase')
const bucket = firebaseAdmin.storage().bucket()

const { isAuth, generateSendJWT } = require('../service/auth')

// 上傳用戶大頭貼
router.post(
    '/',
    isAuth,
    uploadImage,
    handleErrorAsync(async (req, res, next) => {
        if (!req.files.length) {
            return next(handleError(400, '尚未上傳檔案', next))
        }
        const file = req.files[0]

        const dimensions = sizeOf(file.buffer)
        if (dimensions.width !== dimensions.height) {
            return next(handleError(400, '圖片長寬不符合 1:1 尺寸', next))
        }

        // 基於上傳檔案名稱，建立一個blob物件
        const blob = bucket.file(
            `images/${uuidv4()}.${file.originalname.split('.').pop()}`
        )
        // 建立一個可以寫入blob的物件
        const blobStream = blob.createWriteStream()

        blobStream.on('finish', () => {
            const config = {
                action: 'read', // 權限
                expires: '12-31-2500', // 網址有效期限
            }
            // 取得檔案的網址
            blob.getSignedUrl(config, (err, fileUrl) => {
                res.send({
                    fileUrl,
                })
            })
        })

        blobStream.on('error', (err) => {
            return next(handleError(500, '檔案上傳失敗', next))
        })

        // 將檔案的 buffer 寫入 blobStream
        blobStream.end(file.buffer)
    })
)

module.exports = router
