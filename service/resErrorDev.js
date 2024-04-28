// 開發環境錯誤
function resErrorDev(err, res) {
    return res.status(err.statusCode).json({
        status: 'false',
        error: err,
        message: err.message,
        stack: err.stack,
    })
}

module.exports = resErrorDev
