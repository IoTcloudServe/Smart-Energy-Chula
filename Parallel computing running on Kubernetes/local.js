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