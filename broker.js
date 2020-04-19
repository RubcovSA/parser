const request = require('request-promise')
const Promise = require('bluebird')
const yaml_config = require('node-yaml-config');
const config = yaml_config.load(__dirname + '/config/broker.yml')

const { workers, shops } = config
const url = 'http://www.apodiscounter.de/partnerprogramme/krn.csv'
const { server: { port } } = config

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    const { shop } = req.query
    const data = shops.find(x => x.name === shop)
    if (!data) return res.send(404)
    const url = data.link
    const { delimiter } = data

    res.send(200)

    request.head(url)
        .on('response', async (response) => {
            const bytes = Number.parseInt(response.headers['content-length'])
            const range = 1000
            const ranges = []

            let accum = 1
            for (let i=0; i < Number.parseInt(bytes/range); i++) {
                ranges.push({
                    shop: 'test',
                    from: accum,
                    to: accum + range - 1,
                    delimiter,
                    url
                })
                accum += range
            }

            function nextTask(worker) {
                if (!ranges.length) return

                return request.post({
                    url: worker,
                    headers: {
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify(ranges.pop())
                }).then(() => nextTask(worker))
            }

            await Promise.map(workers, worker => nextTask(worker))
        })
        .on('end', () => console.log('end'))
})

app.listen(port, err => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})
