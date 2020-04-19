const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const yaml_config = require('node-yaml-config');
const config = yaml_config.load(__dirname + '/config/worker.yml')
const csv = require('csvtojson')

const app = express()
const port = config.server.port

app.use(bodyParser.json())

app.post('/', (req, res) => {
    const range = req.body
    const {
        from, to, url, options: csvOptions
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
        parseLine(line, csvOptions)
        console.log(count++)
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


function parseLine(str, options) {
    console.log('oprions ', options)
    return csv({
        noheader: true,
        ...options,
        eol: options.eol === '\\n' && '\n' || options.eol
    })
        .fromString(str)
        .then((csvRow)=>{
            console.log(csvRow.map(i => Object.values(i)))
        })
}
