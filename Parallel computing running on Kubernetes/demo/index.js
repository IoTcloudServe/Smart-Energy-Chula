const Hapi = require('@hapi/hapi');
const Wreck = require('@hapi/wreck');
const fs = require('fs');


const Datastore = require('nedb')
db = new Datastore({ filename: '/nfs/cubemlog/result.db', autoload: true });

const nanoidClass = require('nanoid')
id = nanoidClass.nanoid(5)

isPrime = (p) => {
    for (let i = 2n; i * i <= p; i++) {
        if (p % i === 0n) return false;
    }
    return true
}

const init = async () => {

    const server = Hapi.server({
        port: 8080
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {

                return 'Hello World! '+(new Date());
            }
        },
        {
            method: 'GET',
            path: '/loop/{lap}/{name}/{callingTime}/{labid}/{parallel}/{round}',
            handler: (request, h) => {
                callingTime = new Date(+request.params.callingTime)
                startAPI = new Date()
                lap = parseInt(request.params.lap)
                while(lap > 0) {
                    lap--
                }
                endAPI = new Date()
                result = {
                    labid: request.params.labid,
                    parallel: request.params.parallel,
                    round: request.params.round,
                    id: id,
                    callingTime: callingTime,
                    startAPI: startAPI,
                    endAPI: new Date(),
                    diffCallingTime: startAPI - callingTime,
                    diffStartAPI: endAPI  - startAPI,
                    diffTime: endAPI - callingTime,

                }
                db.insert(result)
                return result
            }
        },
        {
            method: 'GET',
            path: '/isprime/{number}',
            handler: (request, h) => {
                p = BigInt(request.params.number)
                return p+ ' is '+isPrime(p);
            }
        },
        {
            method: 'GET',
            path: '/listfiles',
            handler: (request, h) => {
                try {
                    files = []
                    fs.readdirSync('/nfs/cubemlog/Data fl 12 13 2016_01 - 2016_12/').forEach(file => {
                        files.push(file);
                    })
                    return files
                } catch (e) {
                    return e.message
                }

            }
        },
        {
            method: 'GET',
            path: '/csv/{name}/{callingTime}/{labid}/{parallel}/{round}',
            options: {timeout: {server: false, socket: false}},
            handler: async (request, h) => {
                callingTime = new Date(+request.params.callingTime)
                startAPI = new Date()
                try {
                    n = 0
                    sum = 0
                    stream = fs.createReadStream('/nfs/cubemlog/Data fl 12 13 2016_01 - 2016_12/'+request.params.name)

                    return await new Promise((resolve, reject) => {
                        parse = require('csv-parse')
                        array = []
                        startRead = new Date()
                        parser = parse({delimiter: ',', columns: true})
                        parser.on('readable', () => {
                            while (record = parser.read()) {
                                n++
                                if (record.VALUE != "OFF") {
                                    sum += parseInt(record.VALUE)
                                }

                            }
                        })
                        parser.on('error', (error) => {
                            db.insert({action: "error", id: id, name: request.params.name, time: new Date(), error: error.message})
                            reject(error.message)
                        })
                        parser.on('finish', () => {
                            endRead = new Date()
                            result = {
                                labid: request.params.labid,
                                parallel: request.params.parallel,
                                round: request.params.round,
                                n: n, sum: sum, id: id, name: request.params.name,
                                callingTime: callingTime,
                                startAPI: startAPI,
                                startRead: startRead,
                                endRead: endRead ,
                                diffCallingTime: startAPI - callingTime,
                                diffStartAPI: startRead  - startAPI,
                                diffRead: endRead - startRead,
                                diffTime: endRead - callingTime,

                            }
                            db.insert(result)
                            resolve(result)
                        })
                        stream.pipe(parser)
                    })
                } catch (e) {
                    return e.message
                }

            }
        }
    ]);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();