// apply global configure first
require('./lib/globalConfigure')();

var express = require('express');
config = require('config');
var Promise = require('bluebird');
var mongoose = require('mongoose');
var http = require('http');
var utility = require('./lib/utility');
var path = require('path');
var jsonParser = require('./lib/jsonBodyParser');
var cors = require('cors');
var setup = require('./assets/initialSetup');

// enforce correct environment settings
var envs = ['development', 'staging', 'production'];
if (envs.indexOf(process.env.NODE_ENV) < 0) {
    throw new Error('Node should be started with NODE_ENV set to one of:' + envs.join(','));
}

// setup middleware
var app = express();

// allow cross origin
app.use(cors());

// api key check middleware
app.use(require('./lib/apiKeyCheck').middleware);

// parse json body
app.use(jsonParser());
//app.use(jsonParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));
// mount roots
utility.walkModulesSync(path.join(__dirname, 'routes'), require('./lib/Route'), function (route) {
    route.mount(app);
});
//mongoose.set('debug',true)
// handle errors
app.use(require('./lib/errorHandler'));

// create server
var server = http.createServer(app);

console.log("Server Port running on.....",config.serverPort);
// boot server
var connectAsync = Promise.promisify(mongoose.connect, { context: mongoose });
var listenAsync = Promise.promisify(server.listen, { context: server });

connectAsync(config.get('mongoUrl'))
    .then(function () {
        return listenAsync(config.get('serverPort'));
    }).then(function () {
        return console.info("Server online.")
    }).catch(function (err) {
        throw err;
    });
setup.initialSetup();

io = require('socket.io')(server);
