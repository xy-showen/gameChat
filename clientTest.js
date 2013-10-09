var WebSocket = require("ws");
var ClientWebSocket = new WebSocket("ws://192.168.2.106:6789"
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

    ClientWebSocket.send("command|@|init|12345611231|channelA");

    ClientWebSocket.send("command|@|enter|12345611231|channelA");

    //"command|@|enter|123456|channelA"

    //"channel|@|channelA|hellword"
setTimeout(function(){
        ClientWebSocket.send("message|@|channelA|12345611231|hellword", function(err) {

        if (err) {
            console.log("has err when send Identity information..");
        } else {
            console.log("send Identity information succ...");
        }
    });

},1000);

// setTimeout(function(){
//     ClientWebSocket.close(1000,"yy");
// },2000);
    // setTimeout(function(){
    //     ClientWebSocket.send("command|@|quit|12345611|channelA"); 
    // },1000);
    
});



ClientWebSocket.on("message", function(data, flags) {

    console.log("received:" + JSON.stringify(data));

});