const Wreck = require('@hapi/wreck');
const nanoidClass = require('nanoid');
labid = nanoidClass.nanoid(5);
timeoutPromise = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

main = async () => {
    const res = await Wreck.get('http://testingress.default.202.28.193.102.xip.io/listfiles', {json: true})
    files = res.payload
    console.log(files.length)
    laps = []
    parallel = 1
    round = 1
    while (files.length > 0) laps.push(files.splice(0, parallel)) // จำนวนที่ทำพร้อมกัน
    laps = laps.splice(0,round) // ทำทั้งหมดแค่ deleteCount - start รอบ

    result  = []
    while (laps.length > 0) {
        lap = laps.shift()
        lapresult = (await Promise.all(lap.map((file) => {
            callingTime = (new Date()).getTime()
            return Wreck.get(`http://testingress.default.202.28.193.102.xip.io/csv/${file}/${callingTime}/${labid}/${parallel}/${round}`, {json: true})
                .then((res) => {
                    console.log(`http://testingress.default.202.28.193.102.xip.io/csv/${file}/${callingTime}/${labid}/${parallel}/${round}`);
                    return res.payload;
                }).catch((e) => {error: e.message})
        })))
        result = result.concat(lapresult);
    }
    summarize = {
        sum: 0,
        n: 0
    }
    result.map((res) => {
        if (res.sum != null) summarize.sum += res.sum
        summarize.n += res.n
    })
    console.log(summarize);
}
main()

    // loop = 1000000000
    // parallel = 10
    // round = 1
    // while (round > 0) {
    //     round--
    //     console.log(await Promise.all(Array.from(Array(parallel).keys()).map(() => {
    //         callingTime = (new Date()).getTime()
    //         console.log(`http://egatiotingress.default.202.28.193.100.xip.io/loop/${loop}/name/${callingTime}/${labid}/${parallel}/${round}`)
    //         return Wreck.get(`http://egatiotingress.default.202.28.193.100.xip.io/loop/${loop}/name/${callingTime}/${labid}/${parallel}/${round}`, {json: true})
    //             .then((res) => res.payload).catch((e) => {error: e.message})
    //     })))
    // }
