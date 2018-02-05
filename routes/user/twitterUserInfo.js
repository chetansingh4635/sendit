/* Route for user to login vai Social */

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    userModule = require('../../modules/user/'),
    authModule = require('../../modules/auth/'),
    resources = require('../../resources/resources'),
    twitter = require('../../lib/twitter'),
    logger = require('../../lib/logger');


var route = new Route('post', '/user/twitterLogin/userInfo');

module.exports = route;

// public route
route.setPublic();

route.validateInputBody({
    type: 'object',
    properties: {
        token: {type: 'string'},
        verifier: {type: 'string'}
    }
});

/**
 * middleware to get accessToken & accessSecret from twitter
 * Input will be token and verifier from twitter page
 */
route.use(function(req, res, next){
    return twitter.accessToken(req.body.token, req.body.verifier)
        .then(function(responce){
           res.locals.access = responce;
           next();
        }, function(error){
            res.json(error);
        })
        .catch(next);
});

/**
 * middleware to get user info
 * Input will be accessToken & accessSecret
 */
route.use(function(req, res, next){
    return twitter.verifyCredentials(res.locals.access.accessToken, res.locals.access.accessSecret)
        .then(function(responce){
            res.json({
                statusCode: 200,
                userInfo: responce 
            })
        }, function(error){
            res.json(error);
        });
});