const express = require('express')
const {Writable, Readable, PassThrough} = require('stream')
const request = require('request')
// get links from config file
const bodyParser = require('body-parser')

const app = express()
const port = 3212

app.use(bodyParser.json())

app.post('/', (req, res) => {
    const range = req.body
    const {
        from, to, length, url
    } = range
    const options = {
        url,
        headers: {
            'Range': `bytes=${from}-${to}/${length}`,
        }
    }
    console.log(options)
    const readable = request(options)

    let count = 0
    readable.on('data', (chunk) => {
        const line = chunk.toString('utf8')
        console.log(count++)
        console.log(line.split(';'))
        // put into redis by link name
    });

    readable.on('end', () => {
        // writable.end();
        res.send(200)
    });
    readable.on('error', () => {
        // writable.end();
        res.send(500)
    });
})

app.listen(port, err => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})

