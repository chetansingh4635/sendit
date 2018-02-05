//Register social 

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
	 userModule = require('../../modules/user/'),
	 authModule = require('../../modules/auth/'),
     errors = require('../../lib/errors'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('post', '/user/socialRegister');

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
    	userProvider: {type: 'object',
            properties:{
                "socialId": {type: 'string'},
                "token": {type: 'string'},
                "providerType": {type: 'number'}
            }
        },
        emailId: { type: 'string', format: 'email' },
        firstName: {type: 'string'},
        lastName: {type: 'string'},
        profileImage: {type: 'string'},
        contactNumber: {type: 'string', trim: true},
        address:{ type: 'object',
            properties:{
                "address":{type: 'string'},
                "city":{type: 'string'},
                "zipCode":{type: 'string'},
                "country":{type: 'string'}
            }
        }
        //, format: 'mobileNumber' Need to apply validation
    },
    required: ['userProvider','emailId','firstName','lastName','address']
});




/**
 * middleware for checking user already registered.
 * input body should be soacial id of user.
 * middleware response will be null obejct.
 * route to next middleware if no such user is present, else throw error.   
**/
route.use(function (req, res, next) {
    return userModule.findUser({$or: [{'userProvider.socialId': req.body.userProvider.socialId}, {'emailId':req.body.emailId.toLowerCase}]})
        .then(function (doc) {
            if (doc) {
	              return res.send(resources.already_registered());
            } else {
                // User is not found 
                // next middleware for creating a user document
				next();
            }
        }, function (reject) {
            logger.error('findUser', 'Error in findUser while login', reject);
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
    return authModule.createForUser(user, req.body.userProvider)
        .then(function (auth) {
            var response = {
                statusCode: 200,
                message: "Registered successfully",
                auth: auth.toJSON(),
                user: user.toJSON()
            };
            // reply with auth, user & provider
            return res.json(response);
        }, function (reject) {
            logger.error('createForUser', 'Error in createForUser while register', reject);
            return res.json(reject);
        })
        .catch(next);
});
