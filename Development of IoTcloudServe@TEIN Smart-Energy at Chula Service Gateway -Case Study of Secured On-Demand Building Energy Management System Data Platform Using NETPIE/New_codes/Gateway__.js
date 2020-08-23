var yourstorage = 'Your storage URL';
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var parseString = require('xml2js').parseString; // parse xml to json in the case that your storage return data in xml pattern
var microgear = require('microgear'); // request microgear module
var microgear_ = microgear.create({gearkey : "Your key", gearsecret : "Your secret"}); // To create microgear connection, replace "Your key" and "Your secret" with the key-secret pair generated in your NETPIE APPID; ex. "Your key" --> "pEsEMXAyOL1m3cv", "Your secret" --> "DE0ncsNHTR8D15dVB6Iwo9uKF"  
microgear_.useTLS(true); // encrypt key && secret

microgear_.on("connected", function() {
    console.log('now connected'); // check if connected
    microgear_.subscribe("Your subscribed topic"); // "Your subscribed topic" looks like file directory pattern; ex. "myTopicName/myRequestSensor/Bedroom"
});



microgear_.on("message", function(topic, msg) {
    //setInterval(function() {
        console.log(topic);
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open('POST', yourstorage, true);
        xmlhttp.setRequestHeader("SOAPAction", "http://soap.fiap.org/query");
        //console.log('message received and xmlhttp instantiated'); 

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
                parseString(res, function(err, result) { // parse xml to json in the case that your storage return data in xml pattern
                    var temp = JSON.stringify(result);
                    console.log(temp);
                    JSON.parse(temp, function(k, v) {
                        console.log(k," : ",v);
                        if (k === 'id' && v.indexOf("bems") >= 0 && !(PointIDs.includes(v))) {
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
                var db = "";
                var n = PointIDs.length;
                for (i = 0; i < n; i++) {db += PointIDs[i] + "     " + time[i] + "     " + SensorValues[i] + "\n"}
                console.log(db);
                microgear_.publish("Your publish topic", db); // "Your publish topic" looks like file directory pattern; ex. "myTopicName/returnedSensorData/Bedroom"
                
            }
        };
    
    
});    


    
microgear_.connect("Your APPID"); // "Your APPID" is the NETPIE APPID you have created in your NETPIE account; ex. "TestAPP"

