/**
 * Route to delete the partnership which was inserted
**/ 

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    var messages = require('../../resources/messages'),
    config=require('config');
    _ = require('lodash'),
    paypal = require('../../lib/paypal'),
    ObjectId = require('mongoose').Types.ObjectId;

var route = new Route('GET', '/pay/success');

module.exports = route;

// public route
route.setPublic();


