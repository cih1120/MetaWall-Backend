const multer = require('multer')
const path = require('path')

// 驗證圖片大小與格式
const uploadImage = multer({
    limits: {
        fileSize: 2 * 1024 * 1024, // 不超過2mb
    },
    fileFilter(req, file, cb) {
        const fileSize = parseInt(req.headers['content-length'])

        if (fileSize > 2 * 1024 * 1024) {
            // 自定義檔案大小錯誤
            cb(new Error('檔案大小超過 2MB 的限制。'))
        }

        const ext = path.extname(file.originalname).toLowerCase() // 取得副檔名
        if (ext !== '.jpg' && ext !== '.png' && ext !== '.jpeg') {
            cb(new Error('檔案格式錯誤，僅限上傳 jpg， jpeg 與 png 格式。'))
        }
        cb(null, true)
    },
}).any()

module.exports = uploadImage
