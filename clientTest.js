var WebSocket = require("ws");
var ClientWebSocket = new WebSocket("ws://192.168.2.113:6781"
    , {
        host: "192.168.2.107",
        origin: "192.168.2.110"
        // ,pfx:"123"
        // ,key:"123456"
        // ,passphrase:"45646"
        // ,cert:"7465465"
        // ,ca:[]
        // ,ciphers:"4574987"
        // ,rejectUnauthorized:false
    });

ClientWebSocket.on("open", function() {

    console.log("client has opend succ");

    ClientWebSocket.send("command|@|init|123456112|channelA");

    ClientWebSocket.send("command|@|enter|123456112|channelA");

    //"command|@|enter|123456|channelA"

    //"channel|@|channelA|hellword"

    ClientWebSocket.send("channel|@|channelA|hellword", function(err) {

        if (err) {

            console.log("has err when send Identity information..");
        } else {
            console.log("send Identity information succ...");
        }
    });
    // setTimeout(function(){
    //     ClientWebSocket.send("command|@|quit|12345611|channelA"); 
    // },1000);
    
});



ClientWebSocket.on("message", function(data, flags) {

    console.log("received:" + data);

});