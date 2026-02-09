#!/usr/bin/env node
// Simple static server for the media test folder (CommonJS)
const http = require('http')
const fs = require('fs')
const path = require('path')

const port = process.env.PORT || 5173
const root = path.resolve(__dirname)

function sendFile(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 500; res.end('Server error'); return }
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0])
  if (urlPath === '/') urlPath = '/index.html'
  const file = path.join(root, urlPath)
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    sendFile(res, file)
  })
})

server.listen(port, () => {
  console.log(`Media test server running at http://localhost:${port}/`)
})
