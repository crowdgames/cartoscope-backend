var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var passport = require('passport');
var fs = require('fs');
var os = require('os');

var users = require('./routes/users');
var login = require('./routes/login');
var projectsApi = require('./routes/projects');
var taskApi = require('./routes/tasks');
var session = require('express-session');
var anonApi = require('./routes/anonUser');
var results = require('./routes/results');
var dynamicr = require('./routes/dynamic');
var tileoscope = require('./routes/tileoscope');
var inaturalist = require('./routes/inaturalist');
var qlearn = require('./routes/qlearn');

var trials = require('./routes/trials');



var featured = require('./routes/featured');
var d3 = require('d3');
var debug = require('debug')('converge_backend:server');
var http = require('http');
var https = require('https');
var db = require('./db/db.js');

var app = express();


var multer = require('multer');



//app.use(cors());
const cors = require('cors');
app.use(cors({
    origin: 'http://localhost:8081',
    credentials: true
}));

app.use('/node_modules',  express.static(__dirname + '/node_modules'));


//
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '1000mb'}));
app.use(bodyParser.urlencoded({limit: '1000mb', extended: true}));

app.use(cookieParser());
app.use(compression());
app.use(express.static(path.join(__dirname, 'public')));


// -----------------------------------------------------
app.use(session({
  secret: 'CoNvErGe',
  rolling: true,
  resave: true,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// @TODO Figure out best way to serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
// -----------------------------------------------------



app.use('/api/user', users);
app.use('/api/project', projectsApi);
app.use('/api/', login);
app.use('/api/tasks', taskApi);
app.use('/api/anon', anonApi);

app.use('/api/featured', featured);

app.use('/api/test', require('./routes/test'));

// Results api, refers to heatmap results presently
app.use('/api/results', results);
app.use('/api/dynamic', dynamicr);
app.use('/api/tileoscope', tileoscope);
app.use('/api/inat', inaturalist);
app.use('/api/trials', trials);
app.use('/api/qlearn', qlearn);




//ar game download (no logging)
app.get('/ar_apk', function(req, res) {

    var version1 = 'https://drive.google.com/open?id=1-iiiuU_KfkUDYtNGIlJnLcQh0NJ5u-d4'
    var version2 = 'https://drive.google.com/open?id=1kPyDCCdUKpRpLfMOMFOGYkE4HAlpPVmy';

    var version_unlogged = "https://drive.google.com/file/d/1-iiiuU_KfkUDYtNGIlJnLcQh0NJ5u-d4/view?usp=sharing"

    res.redirect(version_unlogged);
});

//ar game download (no logging)
app.get('/ar_apk_log', function(req, res) {

    var version1 = 'https://drive.google.com/open?id=1-iiiuU_KfkUDYtNGIlJnLcQh0NJ5u-d4'
    var version2 = 'https://drive.google.com/file/d/1Ki4XAQmMcQU92-06vC5ueCLjV6VPQ6w5/view?usp=sharing';

    //var version_unlogged = "https://drive.google.com/file/d/1-iiiuU_KfkUDYtNGIlJnLcQh0NJ5u-d4/view?usp=sharing"

    res.redirect(version2);
});


//ar game instructions
app.get('/ar_games', function(req, res) {
    var filePath = "public/files/cartoscope_ar_games_rules.pdf";

    fs.readFile( filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });});


//ar tags
app.get('/ar_tags', function(req, res) {
    var filePath = "public/files/cartoscope_ar_tags_print.pdf";

    fs.readFile( filePath , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
});


//ar gameplay video
app.get('/ar_video', function(req, res) {

    var video_path = 'https://drive.google.com/file/d/1Yzdcs1UMHL_tUeL5kXuHvW4W52yJMqvr/view?usp=sharing';

    res.redirect(video_path);
});



//ar main page
app.get('/ar', function(req, res) {
    res.redirect('/#/home_ar');
});


//fix Tiles lowercase redirect
app.get('/tiles', function(req, res) {
    res.redirect('/Tiles');
});



//go to inat report page after authorization with code attached
app.get('/inat_auth', function(req, res) {

    var session_id = req.session.passport.ar_session_id;
    var access_code = req.query.code;
    // req.session.passport = {};

    var core_site = 'https://cartosco.pe';
    if(os.hostname().indexOf("local") > -1){
        core_site = 'http://localhost:8081';
    }
    var site = "https://www.inaturalist.org";
    var app_id = process.env.INAT_APP_ID ;
    var app_secret = process.env.INAT_SECRET ;
    var postData = JSON.stringify({
        'client_id': app_id,
        'client_secret': app_secret,
        'code': access_code,
        'redirect_uri': core_site + '/inat_auth',
        'grant_type': "authorization_code"
    });

    var options = {
        hostname: 'inaturalist.org',
        port: 443,
        path: '/oauth/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': postData.length
        }
    };
    var request = https.request(options, function(resp) {
        resp.setEncoding('utf8');
        resp.on('data', function (chunk) {

            var access_token = JSON.parse(chunk).access_token;
            var redirect_uri = '/#/inat_report_view/' + session_id + '/' + access_token ;
            res.redirect(redirect_uri)
        });
    });

    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    // write data to request body
    request.write(postData);
    request.end();
});


//healthy gulf: Landloss Lookout
app.get('/landloss', function(req, res) {

    // var subprojects = ["UOYIiFeapnyI","ocioawiaGcjw","KyW6Ti9QUr4I","Srz9arMDwthQ","94yoCWhFkpMk","cXz6ImkmG9k5"];
    // var pick_d = randomInt(0,subprojects.length - 1); //pick dataset [start,end]
    // var project_code = subprojects[pick_d];
    // var link = "kioskProject.html#/kioskStart/" + project_code;
    // res.redirect('./' + link); // send to project page

    res.redirect('./kioskProject.html#/hg_landloss');

});



//healthy gulf event: algal Blooms
app.get('/hg', function(req, res) {
    var project_code = "ChAkLfwYIBgo";
    var link = "kioskProject.html#/kioskStart/" + project_code;
    res.redirect('./' + link); // send to project page
});

//serve html pages
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});






// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

//cors
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500);
    res.send('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  console.log(err);
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


var port = normalizePort(process.env.CARTO_PORT || '8081');
var port_ssl = normalizePort(process.env.CARTO_PORT_SSL || '8082');

app.set('port', port);
var server = http.createServer(app);


//SSL CREDENTIALS (normalize path to ssl to make sure it works on all platforms)
const options = {
    key: fs.readFileSync(path.normalize(process.env.CARTO_SSL_KEY)),
    cert: fs.readFileSync(path.normalize(process.env.CARTO_SSL_CRT))
};
var https_Server = https.createServer(options,app);

// Connect to DB and if successful, start server on port
db.connect(app.get('env'), function(err) {
    if (err) {
        console.log('Unable to connect to MySQL.');
        process.exit(1);
    } else {
        server.listen(port);
        server.on('error', onError);
        server.on('listening', onListening);
        //https server:
        https_Server.listen(port_ssl);
        //https_Server.on('error', onError);
        //https_Server.on('listening', onListening);
    }
});

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {

    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}


//return random integer [min,max]
function randomInt(min,max){
    return (Math.floor(Math.random() * (max - min + 1) ) + min);
}

module.exports = app;
