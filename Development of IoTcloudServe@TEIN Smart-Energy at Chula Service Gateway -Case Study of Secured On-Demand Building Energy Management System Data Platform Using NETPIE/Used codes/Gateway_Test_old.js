var yourstorage = "Your storage URL";
var microgear = require('microgear'); //request microgear module
var microgear_ = microgear.create({key : "Your key", secret : "Your secret"}); // create microgear connection
microgear_.useTLS(true); // encrypt key && secret

microgear_.on("connected", function() {
    console.log('now connected');
    microgear_.subscribe("Your subscribed topic"); //"Your subscribed topic" looks like file directory pattern; ex. "myTopicName/myRequestSensor/Bedroom"
});

microgear_.on("message", function(topic, msg) {
    // test 25 times per case
        setInterval(function() {
            var cpuUsage = require("./CPU_Usage");
            console.log(cpuUsage.cpu_Usage());
            var startTime = Date.now();
            for(var i = 0; i < 50; i++) { // i max = #requests/sec
                var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
                var xmlhttp = new XMLHttpRequest();
                xmlhttp.open('POST', yourstorage, true);
                xmlhttp.setRequestHeader("SOAPAction", "http://soap.fiap.org/query");
                // console.log(topic);
                var keyIDSet = '';
                for(var j = 0; j < 125; j++) {
                    keyIDSet += "Your sensor URL"; // To request 1 sensor for several times : Stress test
                } // j max = #PointIDs/request


                var xml_data =  '<?xml version="1.0" encoding="UTF-8"?>' + 
                                '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                                    '<soap:Body>' +
                                        '<query>' +
                                            '<transport xmlns="http://gutp.jp/fiap/2009/11/">' +
                                                '<header>' +
                                                    '<query id="12ed9de4-1c48-4b08-a41d-dac067fc1c0d"' +
                                                    ' type="storage"' +
                                                    ' acceptableSize="1000">' + 
                                                    keyIDSet +
                                                    '</query>' +
                                                '</header>' +
                                            '</transport>' +
                                        '</query>' + 
                                    '</soap:Body>' +
                                '</soap:Envelope>';
    


                // console.log(xml_data);
                xmlhttp.send(xml_data);
                // console.log('sending XML data');

                xmlhttp.onreadystatechange = function () {
                    // console.log('detected state change from POST response');
                    if (this.readyState == this.DONE && this.status == 200) {
                        // console.log('now publishing ReturnData back to NETPIE');
                        // console.log(this.responseText);
                        microgear_.publish("Your publish topic", this.responseText); //"Your publish topic" looks like file directory pattern; ex. "myTopicName/returnedSensorData/Bedroom"
                    }
                }
            }
            var stopTime = Date.now();
            console.log(stopTime-startTime);
        }, 1000);

    
});    


    
microgear_.connect("Your APPID");