/**
 * Route to become a partner
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
    logger = require('../../lib/logger'),
    ObjectId = require('mongoose').Types.ObjectId;

var route = new Route('post', '/secure/payment/details');

module.exports = route;

route.allowUserTypes('User');

