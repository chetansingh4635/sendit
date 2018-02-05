/* Route for user to login vai Social */

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    userModule = require('../../modules/user/'),
    authModule = require('../../modules/auth/'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('post', '/user/socialLogin');

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
        //, format: 'mobileNumber' Need to apply validation
    },
    required: ['userProvider']
});

// socialId: {type: 'string'},
//         token: {type: 'string'},
//         providerType: {type: 'string'},



/**
 * middleware for checking user already registered.
 * input body should be socialId of user.
 * responce of the midlleware will be user object or null
 * route to next middleware if no such user is present, else throw error.   
**/
route.use(function (req, res, next) {
    return userModule.findBySocialId({ socialId: req.body.userProvider.socialId, providerType: req.body.userProvider.providerType })
        .then(function (doc) {
            if (doc) {
                if(!doc.isActive) throw errors.account_disabled();
                else{
                // record route to next middleware
                    res.locals.user = doc;
                    next();
                }
            } else {
                // User is not found
                // Need to registered 
                if(req.body.emailId) next();
                else res.json(resources.not_registred());
            }
        }, function (reject) {
            logger.error('matching socialid', 'Error in findrecord while login', reject);
            return res.json(reject);
        })
        .catch(next);
});




/**
 * middleware for finding if user trying to login using another socail networking
 * input body should be new token of user & another socail provider.
 * responce of the middleware will be the user document if found else 
 * responce error to client
**/
route.use(function(req, res, next){
    if(res.locals.user){
        next();
    }else{
        return userModule.find({emailId:req.body.emailId})
            .then(function(doc){
                if(doc){
                    res.locals.userNoProvider = doc;
                    next();
                }else{
                    res.json(resources.not_registred());
                }
                    
            },function(reject){
                logger.error('update token', 'error in update token', reject);
                return res.json(reject);
            })
            .catch(next);
    }
});



/**
 * middleware for Inserting new provider to user record
 * input body should be the user if exist
 * Insert a new user if no user exist
**/
route.use(function(req, res, next){
    if(res.locals.user){
        next();
    }else{
        return userModule.insertProvider(req.body.userProvider, req.body.emailId)
            .then(function(doc){
                    res.locals.user = res.locals.userNoProvider;
                    res.locals.user.userProvider = doc;
                    next();
            },function(reject){
                logger.error('insert error', 'error in Inserting user', reject);
                return res.json(reject);
            })
            .catch(next);
    }
})

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
                message: "Login successefully",
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
