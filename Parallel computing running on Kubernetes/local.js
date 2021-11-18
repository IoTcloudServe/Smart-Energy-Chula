const Wreck = require('@hapi/wreck');

let path = 'https://data.iotcloudserve.net';

let main = async () => {

    // GET A LIST OF FILES

    const files = await Wreck
        .get(path + '/listfiles', { json: true })
        .then((res) => res.payload)
        .catch((e) => console.log("Error: " + e.message))

    const executejob = (file) => Promise.resolve()
        .then(async () => {
            const started = new Date();
            // console.log(`Started executing ${file}: ${started}`)
            // const res = await Wreck.get(path + `/csv/${file}`, { json: true, timeout: 1000 });
            const res = await Wreck.get(path + `/csv/${file}`, { json: true});
            const finised = new Date();
            // console.log(`Finished executing ${file}: ${finised}`)
            console.log(`Executing time ${file}: ${finised.getTime() - started.getTime()}`)
            return res.payload;
        })
        .catch((e) => console.log(`${file} Error: ${e.message}`))

    let laps = []
    const parallel = 1
    const maxlap = 1

    console.log(`Files: ${files.length}, Parallel: ${parallel}, Max-Lap: ${maxlap}`);

    while (files.length > 0) laps.push(files.splice(0, parallel))
    laps = laps.splice(0, maxlap)

    let result = [];

    const timestart = new Date();

    while (laps.length > 0) {
        lap = laps.shift()
        lapresult = await Promise.all(lap.map((file) => executejob(file)))
        result = result.concat(lapresult);
    }

    const timeend = new Date();

    let summarize = {
        sum: 0,
        n: 0
    }

    result.map((res) => {
        if (res == undefined) console.log(res)
        if (res.sum != null) summarize.sum += res.sum
        summarize.n += res.n
    })

    console.log("time consumed: "+(timeend.getTime() - timestart.getTime()));
    console.log(summarize);
}

main();
