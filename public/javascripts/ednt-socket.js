$(document).ready(function() {
  History.Adapter.bind(window,'statechange',function(){
    var State = History.getState();
  });
    
  //History.pushState({plugin: 'ping', target: '8.8.8.8' }, 'EDNT: Ping', '?plugin=ping&target=8.8.8.8');
  
  var socket = io.connect('http://localhost:80');
  var result = document.getElementById('result');
  socket.on('output', function (data) {
      result.innerHTML = result.innerHTML + '<br>'+data;
      $('#pluginInputForm').submit(function(e) {
        e.preventDefault();
        var rParams = {};
        $('#pluginInputForm').children('input[type=text]').each(function(index, element) {
          var js = 'rParams.'+$(this).attr('data-paramName')+' = "'+$(this).val()+'"';
          eval(js);
        });
        var plugin = getUrlParameter('plugin');
        var request = { 
          'plugin': plugin,
          'params': rParams };
        socket.emit('newRequest', request);
        var queryStr = '?plugin='+plugin+'&'+$.param(request.params);
        History.pushState(request, 'Electric Dynamite Network Tools', queryStr);
        console.dir(e);
      });
  });
    

  executeUrl(socket);
  
});

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    var sURLParams = [];
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        sURLParams[sParameterName[0]] = sParameterName[1];
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    if(sParam === undefined) return sURLParams;
}


function executeUrl(socket) {
  var plugin = getUrlParameter('plugin');
  var urlParams = $.extend({},getUrlParameter());
    
  if(plugin !== undefined && plugin !== '') {
    socket.emit('newRequest', { 
      plugin: plugin,
      params: urlParams
    });
  }
  
}
