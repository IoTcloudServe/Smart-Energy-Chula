


# SMART ENGERGY CHULA

## Demo

**To list all files**: http://testingress.default.202.28.193.102.xip.io/listfiles
**To compute a data file**: http://testingress.default.202.28.193.102.xip.io/csv/108.csv/1594942979391/MHFW7/1/1

##### [1] Define a service
***List all jobs***
```
files = []
fs.readdirSync('/nfs/cubemlog/Data fl 12 13 2016_01 - 2016_12/').forEach(file => {
    files.push(file);
})
return files
```
***Compute and Log for each***
```
callingTime = new Date()
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
            db.insert({action: "error", id: id, name: name, time: new Date(), error: error.message})
            reject(error.message)
        })
        parser.on('finish', () => {
            endRead = new Date()
            result = {
                // Logging Data
                labid: labid,
                parallel: parallel,
                round: round,
                n: n, sum: sum, id: id, name: name,
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
```

##### [2] Wrap the service into a web server

***Define 3 properties***:
- Endpoint path
- Http Method
- Your code from [1]

```
const Hapi = require('@hapi/hapi');
const init = async () => {

    const server = Hapi.server({
        port: 8080
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request, h) => {
                // Add your code here...
                return;
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

##### [3] To containerize a service into a simple web server
```
#Dockerfile

FROM node:12-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
CMD node index.js
EXPOSE 8080
```
##### [4] To create requests (local.js)

```
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

```


**Kittipat Saengkaenpetch**
