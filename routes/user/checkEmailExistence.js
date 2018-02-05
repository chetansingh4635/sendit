//Api end point to check if user with email allready exist

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    userModule = require('../../modules/user'),
    logger = require('../../lib/logger');

var route = new Route('post', '/user/checkEmail');

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
        emailId: { type: 'string' }
        //Validation on email need to be applied
        //, format: 'mobileNumber' Need to apply validation
    },
    required: ['emailId']
});


/**
 * middleware for checking user already registered with the email.
 * input body should be email of user.
 * middleware response will be true if email exist else it will be false.
 * route to next middleware if no such user is present, else throw error.   
**/
route.use(function (req, res, next) {
    return userModule.findUser({ emailId: req.body.emailId })
        .then(function (doc) {
            if (doc) {
                //found
                res.send(resources.record_found())
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

