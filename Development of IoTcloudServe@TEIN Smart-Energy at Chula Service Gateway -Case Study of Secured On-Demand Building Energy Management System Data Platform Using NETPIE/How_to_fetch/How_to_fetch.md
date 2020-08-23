# Fetching data using NETPIE security mechanisms

(1) Go to https://netpie.io/ to create NETPIE account. <br>
(2) In NETPIE account, click "RESOURCES" > "APPLICATIONS". On "APPLICATION" tab, click "+" button to create APPID. <br>
(3) In APPID, look at "APPLICATION KEY" tab. Click "+" button. At "--- select type ---", choose "Device Key" for Gateway__.js. <br>
(4) Repeat 3rd step, but choose "Session Key" (instead of "Device Key") for fetch__.html. <br>
(5) Install microgear by follow the guide from this link : https://drive.google.com/drive/folders/0B9jvOTVzGjXJVThqQ085dk9TLTQ <br>
(6) Copy the scripts from <a href="\New_codes">New_codes</a>. <br>
(7) Copy Key and Secret of "Device Key" to "microgear.create({gearkey : "Your key", gearsecret : "Your secret"}" in the gateway script. <br>
(8) Copy APPID name to "microgear_.connect("Your APPID")" in the gateway script. <br>
(9) Set "Your storage URL" in the gateway script. <br>
(10) Name topics for data exchange. "Your publish topic" of the gateway script and "Your subscribed topic" of the fetch html must be the same. <br>
     "Your subscribed topic" of the gateway script and "Your publish topic" of the fetch html must also be the same, but differ from the above topics. <br>
(11) Edit the copied scripts for your project. <br>
(12) In fetch html, click "Start FETCH" button to fetch data from CUBEMS. If you want to stop fetch, just click "Stop FETCH" botton. <br>      