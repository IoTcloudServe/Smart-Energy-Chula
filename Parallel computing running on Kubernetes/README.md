This markdown was exported from [Data-Forge Notebook](http://www.data-forge-notebook.com)

# Cloud-Based Smart Energy Framework for Accelerated Data Analytics with Parallel Computing of Orchestrated Containers: Study Case of CU-BEMS

#### The Simple, Data Wrangling, Data Analytics Framework for IoTCloudserve cluster

Build Powerful, Scalable parallel computing on simple way

### CU-BEMS
- [Introduction](#CU-BEMS)

### Contents
- [Design Concept]

### Related libraries
- [hapi - Web server - The Simple, Secure Framework Developers Trust](https://hapi.dev/)
- [Data-Forge - JavaScript data wrangling, transformation and analysis toolkit](http://www.data-forge-js.com/)
- [CSV-Parser](https://csv.js.org/parse/)


### Resources and References
- [Energy Research Data (Smart Grid Research Unit, Chulalongkorn University)](https://sgrudata.github.io/)
- [CU-BEMS](https://www.bems.chula.ac.th/)
- [Research - CU-BEMS, smart building electricity consumption and indoor environmental sensor datasets](https://www.nature.com/articles/s41597-020-00582-3)

## CU-BEMS

“Data-centric IoT-cloud service platform for smart communities” or IoTcloudServe@TEIN project has been established since 20 June 2018. The main purpose of this project is to integrate networked collaborative efforts of research and educational communities from developed-countries (Korea, Japan), from another developing country (Malaysia), and from a least developed country (Laos) `1`. In the project, we should like to achieve a framework design and a proof-ofconcept implementation for a data-centric IoT-cloud platform that can help enable IoT-domain service diversification. As an example for IoT-domain service demonstration, herein, the focus is concerned with the IoTcloudServe@TEIN’s SmartEnergy@Chula service based on the earlier completed socalled CU-BEMS (Chulalongkorn University’s Building Energy Management System) testbed.

CU-BEMS, with the technical support of CU-BEMS IEEE1888 protocol server engine from the University of Tokyo `2` `3`, is readily available with more than 250 energy-related sensors `4` `5` and smart meters `6` that send the real-time energy and room ambient readings to CU-BEMS storage. With
the total data generation rate up to 800 data points in every second, the design of CU-BEMS is to monitor, control and analyze actual energy consumption profiles as well as relevant building’s ambient environments. The main goal is not only to show site energy management automation in engineering
department buildings but also to raise people awareness `7`; for example; a smart meter records energy usage of airconditioning systems inside a room and motion sensors in that area check the people movement. If no motion is detected in that room, then the CU-BEMS will alarm the waste energy
usage of the air-conditioning system for energy saving. For information-pushing model design in CU-BEMS, the testbed provides Interactive Display as a Service (IDaaS) to notify to building users the real-time energy-related information to create awareness to staffs and students inside campus `8`.

- `1` IoTcloudServe@TEIN, 2018, Facebook about, viewed August 2018, https://www.facebook.com/iotcloudserve/
- `2` Ochiai, H. , Ishiyama, M., Momose, T., Fujiwara, N., Ito, K., Inagaki, H., Nakagawa, A. and Esaki, H. FIAP: Facility Information Access Protocol for Data-Centric Building Automation Systems. in IEEE INFOCOM M2MCN workshop, 2011
- `3` IEEE1888-2011: IEEE Standard for Ubiquitous Green Community Control Network, 2011.
- `4` Inthasut, T. and Aswakul, C. ZigBee Wireless Sensor Network with IEEE1888 Gateway for Building Energy Management System. Proceedings of ICEIC 2014, Kota Kinabalu, Malaysia : 2014.
- `5` Inthasut, T. and Aswakul, C. Development and Reliability Testing of IEEE1888 Gateway for ZigBee Wireless Sensor Network in Chulalongkorn University’s Building Energy Management System. Proceedings of ISIPS 2014, Fukuoka, Japan, 13 November 2014. (Excellent Paper Award).
- `6` Le, D. H. and Pora, W. Development of smart meter for building energy management system based on the IEEE 1888 standard with Wi-Fi communication. In Proceedings of ICEIC 2014, Kota Kinabalu, Malaysia, January 2014.
- `7` Khawsa-ard, P. and Aswakul, C. Application of simple computer board game with gesture sensor input for increasing awareness in electrical energy consumption. ITC-CSCC 2014, 2014.
- `8` Khawsa-ard, P. and Aswakul, C. IEEE1888 interactive display as a service (IDaaS): Example in building energy management system. COMPSAC 2015, 2015.

## Acknowledgement

CU-BEMS designed & built by Chula-EE core faculty team members and 30+ BEng/MEng students at Chula-EE since 2013 with various international collaborations and main financial support from Energy Conservation Promotion Fund (ENCON Fund), under the Energy Policy and Planning Office (EPPO), Ministry of Energy

## CU-BEMS DESIGN PRINCIPLES

Protocol/Information: Proprietary/Closed =>  `Open/Sharing`

Information Visualization: Pull Type => `Push Type`

Demand Control: Centralized/Top Down => `Decentralized/Bottom Up (Self-Awareness/User Participation)`

Vendor Oriented (Dependency) => `User Oriented (Freedom)`

## Architecture

### Container

1. Web server
    - Container name:
    -
2. Static web hosting
3. SFTP server

### Storage (as a PV)

1. smartenergystorage

![Design Concept Parallel](assets/images/zonearch.png "Design Concept")

## Design Concept - Working with mountains of data
![Design Concept Parallel](assets/images/datawrangling.png "Design Concept")

![Design Concept Parallel](assets/images/designconceptparallel.png "Design Concept")

Ref: Data Wrangling with JavaScript Book by Ashley Davis

![Design Concept](assets/images/designconcept.png "Design Concept")

![Design Concept](assets/images/localjs.png "Design Concept")

## index.js


```javascript
const Hapi = require('@hapi/hapi');
const fs = require('fs');

const init = async () => {

    const server = Hapi.server({
        port: 8080
    });

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
            path: '/csv/{name}',
            handler: async (request, h) => {
                try {
                    n = 0
                    sum = 0
                    stream = fs.createReadStream(__dirname + '/csv/' + request.params.name)

                    return await new Promise((resolve, reject) => {
                        parse = require('csv-parse')
                        parser = parse({ delimiter: ',', columns: true })
                        parser.on('readable', () => {
                            while (record = parser.read()) {
                                n++
                                for (var name in record) {
                                    if (name.indexOf("(kW)") != -1) sum += parseFloat(record[name]) || 0;
                                }
                            }
                        })
                        parser.on('error', (error) => reject(error.message))
                        parser.on('finish', () => {
                            result = {
                                n: n, sum: sum, id: id, name: request.params.name
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
```

## local.js


```javascript
const Wreck = require('@hapi/wreck');

let path = 'http://hapiserver.parallelcomputingdemo.202.28.193.102.xip.io';

let main = async () => {

    // GET A LIST OF FILES

    const files = await Wreck
        .get(path + '/listfiles', { json: true })
        .then((res) => res.payload)
        .catch((e) => console.log("Error: " + e.message))

    const executejob = (file) => Wreck
        .get(path + `/job/${file}`, { json: true })
        .then((res) => res.payload)
        .catch((e) => console.log("Error: " + e.message))

    let laps = []
    const parallel = 1
    const maxlap = 1
    while (files.length > 0) laps.push(files.splice(0, parallel))
    laps = laps.splice(0, maxlap)

    let result = []

    while (laps.length > 0) {
        lap = laps.shift()
        lapresult = await Promise.all(lap.map((file) => executejob(file)))
        result = result.concat(lapresult);
    }

    let summarize = {
        sum: 0,
        n: 0
    }

    result.map((res) => {
        if (res.sum != null) summarize.sum += res.sum
        summarize.n += res.n
    })

    console.log(summarize);
}

main();
```
![This is me!](assets/images/result.png "Kittipat Saengkaenpetch")

![This is me!](assets/images/myprofile.jpeg "Kittipat Saengkaenpetch")



This markdown was exported from [Data-Forge Notebook](http://www.data-forge-notebook.com)