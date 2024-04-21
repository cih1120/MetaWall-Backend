const http = require('http')
const app = require('./app.js');
const port = process.env.PORT || 3005
app.listen(port);