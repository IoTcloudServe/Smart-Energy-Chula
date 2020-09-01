exports.plugin = {
    name: "module1",
    once: true,
    register: async (server, options) => {

        server.route([
            {
                method: 'GET',
                path: '/csv/{pir}/{energy}',
                handler: async (request, h) => {
                    try {

                        parse = require('csv-parse')
                        parser = parse({ delimiter: ',', columns: true })

                        const streamPIR = fs.createReadStream(__dirname + '/csv/' + request.params.pir)
                        let pirslot = {}

                        await new Promise((resolve, reject) => {
                            parser.on('readable', () => {
                                while (record = parser.read()) {
                                    const time = (new Date(record.TIME)).getTime()
                                    switch (record.VALUE) {
                                        case '1.0':
                                            pirslot[time] = true;
                                            break;
                                        case 'ON':
                                            pirslot[time] = true;
                                            break;
                                        default:
                                            pirslot[time] = false;
                                            break;
                                    }
                                }

                            })
                            parser.on('error', (error) => reject(error.message))
                            parser.on('finish', () => {
                                console.log("read pir done")
                                resolve()
                            })
                            streamPIR.pipe(parser)
                        })

                        const streamEnergy = fs.createReadStream(__dirname + '/csv/' + request.params.energy)

                        let energystat = {
                            allenergy: 0,
                            wastedenergy: 0,
                            usefulenergy: 0
                        }

                        parser = parse({ delimiter: ',', columns: true })

                        await new Promise((resolve, reject) => {
                            parser.on('readable', () => {
                                while (record = parser.read()) {
                                    const time = (new Date(record.TIME)).getTime()
                                    if (time in pirslot) {

                                        let energyusage = parseFloat(record.VALUE)
                                        if (energyusage < 0) energyusage = 0;
                                        const HASPERSON = pirslot[time];
                                        energystat.allenergy += energyusage
                                        if (HASPERSON) {
                                            energystat.usefulenergy += energyusage
                                        } else {
                                            energystat.wastedenergy += energyusage
                                        }
                                    }
                                }
                            })
                            parser.on('error', (error) => {
                                console.log(error)
                                reject(error.message)
                            })
                            parser.on('finish', () => {
                                console.log("read energy done")
                                resolve()
                            })
                            streamEnergy.pipe(parser)
                        })

                        return energystat;
                    } catch (e) {
                        return e.message
                    }
                }
            }
        ]);
    }
}