const handleError = (res, message) => {
    res.status(400).json({
        status: 'false',
        message: message,
    })
}

module.exports = handleError
