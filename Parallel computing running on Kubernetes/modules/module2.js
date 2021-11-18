exports.plugin = {
    name: "module2",
    once: true,
    register: async (server, options) => {

        const fs = require('fs');

        server.route([
            {
                method: 'GET',
                path: '/now',
                handler: async (request) => {
                    let scraper = require('table-scraper');
                    let sensordata = []
                    let tabledata = await scraper
                        .get('http://www.bems.ee.eng.chula.ac.th:9062')
                        .then((tableData) => {
                            tableData = tableData.shift() // Extract Data
                            tableData.shift() // Remove head table
                            for (let each of tableData) {
                                if (each['0'].indexOf("http") != -1) {
                                    sensordata.push(each)
                                }
                            }
                            return sensordata
                        })
                    let result = {};
                    for (let each of tabledata) {
                        sensor = each['0'].split("/")
                        const type = sensor.pop()
                        sensor.shift() // Remove "http://bems.ee...
                        sensor.shift()
                        sensor.shift()
                        zone = sensor.join("-")
                        sensor.shift()
                        floor = sensor.shift()
                        date = new Date(each['1'])
                        result[zone] = {
                            type: type,
                            date: each['1'],
                            value: each['2'],
                            floor: floor
                        }
                    }
                    return result

                }
            }
        ]);
    }
}
