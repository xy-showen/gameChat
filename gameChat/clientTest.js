var WebSocket=require("ws");
var ClientWebSocket= new WebSocket("ws://192.168.2.110:6789",{host:""});

    ClientWebSocket.on("open",function(){
    	console.log("has opend");
    });

    ClientWebSocket.on("message",function(data,flags){
    	console.log("received:"+data);
    });