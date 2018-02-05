var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    adminModule = require('../../modules/admin/'),
    authModule = require('../../modules/auth/');


var route = new Route('post', '/admin/login');

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
        email: { type: 'string' },
        remberMe: {type: 'boolean'}
    },
    required: ['email', 'password']
});


/**
 * middleware for checking user already registered.
 * input body should be email of user.
 * middleware response will be user document or null obejct.
 * route to next middleware if no such user is present, else throw error.   
**/
route.use(function (req, res, next) {
    return adminModule.findUser({ emailId: req.body.email })
        .then(function (doc) {
            if (doc) {
                res.locals.user = doc;
                // User find route to next middleware
                next();
            } else {
                // User is not found 
                // Send error message to client
                res.send(errors.invalid_login());
            }
        }, function (reject) {
            logger.error('findUser', 'Error in findUser while login', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * middleware for checking the password
 */

route.use(function(req, res, next){
    if(res.locals.user.password === req.body.password){
        next();
    }else{
        res.json(errors.invalid_login());
    }
});

/**
 * middleware for creating auth for user in system.
 * input body should be all information of user from previous middleware.
 * middleware response will be newly registered user document and auth object.   
**/
route.use(function (req, res, next) {
    var user = res.locals.user;
    return authModule.createForUser(user, {})
        .then(function (auth) {
            var response = {
                statusCode: 200,
                message: "logged in success",
                auth: auth.toJSON(),
                user: user.toJSON()
            };
            // reply with auth and user
            return res.json(response);
        }, function (reject) {
            logger.error('createForAdmin', 'Error in admin creating auth', reject);
            return res.json(reject);
        })
        .catch(next);
});
