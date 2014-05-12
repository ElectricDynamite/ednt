$(document).ready(function() {
  
   History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
        var State = History.getState(); // Note: We are using History.getState() instead of event.state
    });
    
    History.pushState({plugin: 'ping', target: '8.8.8.8' }, 'EDNT: Ping', '?plugin=ping&target=8.8.8.8');
  
    var socket = io.connect('http://localhost:80');
    var result = document.getElementById('result');
    socket.on('output', function (data) {
        result.innerHTML = result.innerHTML + '<br>'+data;
    });
    socket.emit('newRequest', { 
      plugin: 'ednt-plugin-ping',
      params: {
        target: '8.8.8.8',
        count: 5,
        interval: 500
      }
    });

});
