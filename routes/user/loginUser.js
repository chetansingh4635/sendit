var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    userModule = require('../../modules/user/');


var route = new Route('post', '/user/login');

module.exports = route;

// public route
route.setPublic();

/**
 * validate input request.
 * properties should be expected input.
 * required should be mandatory field for input request.
 * on success of validation, response should route to next middleware. 
 * method create date: 09/09/2016
**/
route.validateInputBody({
    type: 'object',
    properties: {
        password: { type: 'string' },
        emailId: { type: 'string' }//, format: 'mobileNumber' Need to apply validation
    },
    required: ['emailId', 'password']
});


/**
 * middleware for checking user already registered.
 * input body should be email of user.
 * middleware response will be user document or null obejct.
 * route to next middleware if no such user is present, else throw error.   
**/
route.use(function (req, res, next) {
    return userModule.findUser({ contactNumber: req.body.contactNumber })
        .then(function (doc) {
            if (doc) {
                res.locals.user = doc;
                // User find route to next middleware
                next();
            } else {
                // User is not found 
                // Send error message to client
                res.send(resources.no_record_found());
            }
        }, function (reject) {
            logger.error('findUser', 'Error in findUser while login', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * middleware for creating auth for user in system.
 * input body should be all information of user from previous middleware.
 * middleware response will be newly registered user document and auth object.   
**/
route.use(function (req, res, next) {
    var user = res.locals.user;
    return authModule.createForUser(user)
        .then(function (auth) {
            var response = {
                auth: auth.toJSON(),
                user: user.toJSON()
            };
            // reply with auth and user
            return res.json(response);
        }, function (reject) {
            logger.error('createForUser', 'Error in createForUser while login', reject);
            return res.json(reject);
        })
        .catch(next);
});
