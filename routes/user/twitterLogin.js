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


var route = new Route('get', '/user/twitterLogin/requestToken');

module.exports = route;

// public route
route.setPublic();

route.use(function(req, res, next){
    return twitter.requestToken(req.query.redirect_uri)
        .then(function(responce){
            res.redirect("https://api.twitter.com/oauth/authenticate?oauth_token=" + responce.requestToken);
        }, function(error){
            res.json(error);
        })
        .catch(next);
})