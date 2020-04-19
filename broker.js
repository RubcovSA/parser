const request = require('request-promise')
const Promise = require('bluebird')

const workers = ['http://localhost:3212']
const url = 'http://www.apodiscounter.de/partnerprogramme/krn.csv'

request.head(url)
    .on('response', async (response) => {
        const bytes = Number.parseInt(response.headers['content-length'])
        const range = 100
        const ranges = []

        let accum = 1
        for (let i=0; i < Number.parseInt(bytes/range); i++) {
            ranges.push({
                from: accum,
                to: accum + range - 1,
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