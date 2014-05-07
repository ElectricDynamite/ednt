nconf = require('nconf');
nconf.argv()
  .env()
  .file({ file: 'settings.json' });
nconf.defaults({
  "listen": {
    "port": 80
  },
  "plugins": [],
  "user": "ednt",
  "group": "ednt",
  "keeproot": false
});

var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var router = express.Router();
var routes = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var su_available = (process.getuid() === 0) ? true: false;

nconf.get('plugins').forEach(function(pluginName){
  app.plugins = app.plugins || [];
  app.mountpoints = app.mountpoints || [];
  try {
    var plugin = require(pluginName);
  } catch (err) {
    console.log('Error: Plugin '+pluginName+' not installed. Try "npm install '+pluginName+'"');
    return;
  }
  if(typeof(plugin.init) != "function") {
    console.log('Error: Plugin '+pluginName+' does not have a valid \
      init() function');
    return;
  } else {
      console.log("Trying to load plugin: "+pluginName);
      if(plugin.SU_REQUIRED && !su_available) {
        console.log('Plugin '+pluginName+' requires root privileges, but we don\'t have them. Aborting load.');
        return;
      }
      if(plugin.init()) {
        /* loop through routes provided by the plugin to extract them 
         * and their properties */
        for(var n in plugin.ROUTES) {
          var route = plugin.ROUTES[n];
          console.dir(route);
          if(n === "/") n = n+"?";
          var mw = "router."+route.method.toLowerCase()+
            "('/"+plugin.MOUNTPOINT+n+"', routes);"
          console.log('evaling: '+mw);
          eval(mw);
          for(var prop in route) {
            
          }
        }
        console.log('Plugin '+pluginName+' successfully loaded');
        app.plugins[pluginName] = plugin;
        app.mountpoints[plugin.MOUNTPOINT] = pluginName;
      } else {
        console.log('Error: Plugin '+pluginName+' did not load successfully');
      }
  }
});



app.use(function(req, res, next) {
  var exp = req.url.split(/^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/);
  var mountpoint = exp[5].split("/")[1]
  var plugin = app.mountpoints[mountpoint];
  if(plugin != undefined) {
    console.log("Detected request for plugin: "+plugin);
    req.plugin = app.plugins[app.mountpoints[mountpoint]];
  }
  next();
});


app.use(router);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


//module.exports = app;
app.set('port', nconf.get('listen:port'));

var server = app.listen(app.get('port'), function() {
  /* 
   * Try to drop root privileges, unless explicitly told not to
   */
  if(!nconf.get('keeproot')) {
    try {
      console.log('Old User ID: ' + process.getuid() + ', Old Group ID: ' + process.getgid());
      process.setgroups([nconf.get('group')]);
      process.setgid(nconf.get('group'));
      process.setuid(nconf.get('user'));
      console.log('New User ID: ' + process.getuid() + ', New Group ID: ' + process.getgid());
    } catch (err) {
      console.log('Error: Could not drop root privileges. Make sure user \
'+nconf.get('user')+' and group '+nconf.get('group')+' exist.');
      process.exit(1);
    }
  }
  console.log('EDNT server listening on port ' + server.address().port);
});

