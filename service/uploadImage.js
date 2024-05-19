const multer = require('multer')
const path = require('path')

// 驗證圖片大小與格式
const uploadImage = multer({
    limits: {
        fileSize: 2 * 1024 * 1024, // 不超過2mb
    },
    fileFilter(req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase() // 取得副檔名
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            cb(new Error('檔案格式錯誤，僅限上傳 jpg， jpeg 與 png 格式。'))
        }
        cb(null, true)
    },
}).any()

module.exports = uploadImage
