var Route = require('../../lib/Route'),
    errors = require('../../lib/errors'),
    userModule = require('../../modules/user'),
    authModule = require('../../modules/auth'),
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('post', '/user/register');

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
        contactNumber: { type: 'string' }//, format: 'mobileNumber' Need to apply validation
    },
    required: ['contactNumber', 'password']
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
                // User is already registered 
                throw errors.already_register();
            } else {
                // If user is not registered then route to next middleware
                next();
            }
        }, function (reject) {
            logger.error('findUser', 'Error in findUser while register', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * middleware for registering user in system.
 * input body should be all information of user from request body.
 * middleware response will be newly registered user document or null obejct.
 * route to next middleware if user saved successfully, else throw error.   
**/
route.use(function (req, res, next) {
    req.body.password = utility.encrypt(req.body.password);
    return userModule.signUp(req.body)
        .then(function (doc) {
            if (doc) {
                res.locals.user = doc;
                next();
            } else {
                throw errors.internal_error();
            }
        }, function (reject) {
            logger.error('signUp', 'Error in signUp while register', reject);
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
            logger.error('createForUser', 'Error in createForUser while register', reject);
            return res.json(reject);
        })
        .catch(next);
});
