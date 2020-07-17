var cubemsstorage = 'http://www.bems.ee.eng.chula.ac.th:9062/axis2/services/FIAPStorage';
//var cubemsstorage = 'http://161.200.90.9/dr100sto/axis2/services/FIAPStorage';
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var parseString = require('xml2js').parseString;
var microgear = require('microgear'); //request microgear module
var microgear_ = microgear.create({gearkey : "TFRSGLVc6kYvxZv", gearsecret : "smsdUbd8B1RUHXfonzLKcFbj3"}); // create microgear connection
microgear_.useTLS(true); // encrypt key && secret

microgear_.on("connected", function() {
    console.log('now connected'); // check if connected
    microgear_.subscribe("/CUBEMS/FetchData");
});



microgear_.on("message", function(topic, msg) {
    //setInterval(function() {
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', cubemsstorage, true);
        xmlhttp.setRequestHeader("SOAPAction", "http://soap.fiap.org/query");
        console.log('message received and xmlhttp instantiated'); 

        console.log('sending out POST to cubems storage');

        var xml_data = 
                    '<?xml version="1.0" encoding="UTF-8"?>' + 
                        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">' +
                            '<s:Body>' +
                                '<query>' +
                                    '<transport xmlns="http://gutp.jp/fiap/2009/11/">' +
                                        '<header>' +
                                            '<query id="12ed9de4-1c48-4b08-a41d-dac067fc1c0d" type="storage" acceptableSize="1000">' + 
                                                msg +
                                                //'<key id="bems.ee.eng.chula.ac.th/energy_consumption/department" attrName="time" select="maximum"></key> ' +
                                                //'<key id="bems.ee.eng.chula.ac.th/ee_health_pad/renewable_energy" attrName="time" select="maximum"></key> ' + 
                                            '</query>' +
                                        '</header>' +
                                    '</transport>' +
                                '</query>' + 
                            '</s:Body>' +
                        '</s:Envelope>';

        console.log(xml_data);
        xmlhttp.send(xml_data);
        console.log('sending XML data');
        
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == xmlhttp.DONE && xmlhttp.status == 200) {
                var PointIDs = [];
                var time = [];
                var SensorValues = [];
                var res = this.responseText;
                console.log(res);
                parseString(res, function(err, result) {
                    var temp = JSON.stringify(result);
                    console.log(temp);
                    JSON.parse(temp, function(k, v) {
                        console.log(k," : ",v);
                        if (k === 'id' && v.indexOf("bems") >= 0) {
                            PointIDs.push(v);
                        }
                        else if (k === 'time') {
                            time.push(v);
                        }
                        else if (k === '_') {
                            SensorValues.push(v);
                        }

                    });
                });
                
                console.log(PointIDs[0]);
                console.log(PointIDs[1]);
                console.log(time[0]);
                console.log(time[1]);
                console.log(SensorValues[0]);
                console.log(SensorValues[1]);
                microgear_.publish("/CUBEMS/ReturnData", PointIDs[0] + "  " + time[0] + "  " + SensorValues[0] + "\n" + PointIDs[1] + "  " + time[1] + "  " + SensorValues[1]);
                
                //microgear_.writeFeed("FeedCUBEMS", "Temperature:" + SensorValues[0] + "," + "Humidity:" + SensorValues[1]);
            }
        };
    //}, 15000);
    
});    


    
microgear_.connect("CUBEMS");

