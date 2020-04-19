const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const yaml_config = require('node-yaml-config');
const config = yaml_config.load(__dirname + '/config/worker.yml')

const app = express()
const port = config.server.port

app.use(bodyParser.json())

app.post('/', (req, res) => {
    const range = req.body
    const {
        from, to, url, delimiter
    } = range
    const options = {
        url,
        headers: {
            'Range': `bytes=${from}-${to}`,
        }
    }
    console.log(options)
    const readable = request(options)

    let count = 0
    readable.on('data', (chunk) => {
        const line = chunk.toString('utf8')
        console.log(count++)
        console.log(line.split(delimiter))
    });

    readable.on('end', () => res.send(200))
    readable.on('error', () => res.send(500))
})

app.listen(port, err => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})

