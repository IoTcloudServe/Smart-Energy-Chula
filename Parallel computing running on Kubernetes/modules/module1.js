exports.plugin = {
    name: "module1",
    once: true,
    register: async (server, options) => {

        const fs = require('fs');

        server.route([
            {
                method: 'GET',
                path: '/hello',
                handler: (request) => "hello"
            },
            {
                method: 'GET',
                path: '/csv/{pir}/{energy}',
                handler: async (request, h) => {
                    try {

                        parse = require('csv-parse')
                        parser = parse({ delimiter: ',', columns: true })

                        const streamPIR = fs.createReadStream(__dirname + '/../csv/' + request.params.pir)
                        let pirslot = {}

                        await new Promise((resolve, reject) => {
                            parser.on('readable', () => {
                                while (record = parser.read()) {
                                    let time = new Date(record.TIME)
                                    time.setSeconds(0)
                                    time = time.getTime()
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

                        const streamEnergy = fs.createReadStream(__dirname + '/../csv/' + request.params.energy)

                        let energystat = {
                            allenergy: 0,
                            wastedenergy: 0,
                            usefulenergy: 0,
                            insight: {
                                wastedenergy: {},
                                usefulenergy: {}
                            }
                        }

                        parser = parse({ delimiter: ',', columns: true })

                        await new Promise((resolve, reject) => {
                            parser.on('readable', () => {
                                while (record = parser.read()) {
                                    let time = new Date(record.TIME)
                                    let insightTime = new Date(record.TIME)

                                    time.setSeconds(0);
                                    time = time.getTime()

                                    insightTime = insightTime.getFullYear()+"-"+(insightTime.getMonth()+1);

                                    if (!(insightTime in energystat.insight.wastedenergy)) {
                                        energystat.insight.wastedenergy[insightTime] = 0;
                                        energystat.insight.usefulenergy[insightTime] = 0;
                                    }
                                    
                                    if (time in pirslot) {

                                        let energyusage = parseFloat(record.VALUE)
                                        if (energyusage < 0) energyusage = 0;
                                        energyusage = energyusage/60;
                                        let HASPERSON = pirslot[time];

                                        if(!HASPERSON) {
                                            if(pirslot[time-1000*60*1]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*2]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*3]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*4]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*5]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*6]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*7]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*8]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*9]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*10]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*11]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*12]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*13]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*14]) HASPERSON = true;
                                            else if(pirslot[time-1000*60*15]) HASPERSON = true;
                                        }

                                        energystat.allenergy += energyusage
                                        if (HASPERSON) {
                                            energystat.usefulenergy += energyusage;
                                            energystat.insight.usefulenergy[insightTime] += energyusage;
                                        } else {
                                            if (energyusage > 15) {
                                                energystat.wastedenergy += energyusage;
                                                energystat.insight.wastedenergy[insightTime] += energyusage;
                                            }
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
