const Hapi = require('@hapi/hapi');
const fs = require('fs');

const path = require('path');

const init = async () => {

    const server = Hapi.server({
        port: 8080
    });

    const Glob = require('glob');

    await server.register(Glob.sync("./modules/**/*.js").map((js) => require(js)));

    server.route([
        {
            method: 'GET',
            path: '/listfiles',
            handler: (request, h) => {
                try {
                    files = []
                    fs.readdirSync('./csv/').forEach(file => files.push(file))
                    return files
                } catch (e) {
                    return e.message
                }

            }
        },
        {
            method: 'GET',
            path: '/listfilesAndSize',
            handler: (request, h) => {
                try {
                    files = []
                    
                    fs.readdirSync('./csv/').forEach(file => files.push(file));
                    const response = [];
                    for (let file of files) {
                        const extension = path.extname(file);
                        const fileSizeInBytes = fs.statSync('./csv/'+file).size;
                        response.push({ name: file, extension, fileSizeInBytes });
                    }
                    return response;
                } catch (e) {
                    return e.message
                }

            }
        },
        {
            method: 'GET',
            path: '/csv/{name}',
            handler: async (request, h) => {
                try {
                    n = 0
                    sum = 0
                    stream = fs.createReadStream(__dirname + '/csv/' + request.params.name)

                    return new Promise((resolve, reject) => {
                        parse = require('csv-parse')
                        parser = parse({ delimiter: ',', columns: true })
                        const starttime = new Date();
                        parser.on('readable', () => {
                            while (record = parser.read()) {
                                n++
                                for (var name in record) {
                                    if (name.indexOf("VALUE") != -1) sum += parseFloat(record[name]) || 0;
                                }
                            }
                        })
                        parser.on('error', (error) => reject(error.message))
                        parser.on('finish', () => {
                            const endtime = new Date();
                            result = {
                                n: n, sum: sum, name: request.params.name, runtime: (endtime.getTime() - starttime.getTime())
                            }
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
