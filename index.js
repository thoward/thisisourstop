var express = require('express');
var ejs = require('ejs');
var useragent = require('connect-useragent');
var app = module.exports = express.createServer();

// Custom template filter for dates.
ejs.filters.time = function(milliseconds) {
  return prettyDate(milliseconds);
};

app.set('jsonp callback', true);
app.set('view engine', 'ejs');

// Middleware
app.configure(function(){
  app.use(express.logger('\x1b[33m:method\x1b[0m \x1b[32m:url\x1b[0m :response-time'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.favicon());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(express.static(__dirname + '/public'));
  app.use(useragent());
  app.use(function(req, res, next){
    // Detect and discourage desktop browsers.
    if (req.url !== '/desktop' && (req.agent.os.machine === 'mac-os-x' || req.agent.os.machine === 'windows' || req.agent.os.machine === 'linux')) {
      res.redirect('/desktop');
    }
    else {
      next();
    }
  });
  app.use(app.router);
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// Routes
require('./routes/stop')(app);
require('./routes/comment')(app);

if (!module.parent) {
  app.listen(process.env.PORT || 3000);
  console.log('Express started!');
}

/*
 * Based on John Resig's Pretty Date: http://ejohn.org/blog/javascript-pretty-date/
 * Licensed under the MIT and GPL licenses.
 */

// Takes an ISO time and returns a string representing how
// long ago the date represents.
function prettyDate(time){
  var date = new Date(time),
    diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);

  if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
    return;

  return day_diff == 0 && (
      diff < 60 && "Just now" ||
      diff < 120 && "1 minute ago" ||
      diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
      diff < 7200 && "1 hour ago" ||
      diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
    day_diff == 1 && "Yesterday" ||
    day_diff < 7 && day_diff + " days ago" ||
    day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}
