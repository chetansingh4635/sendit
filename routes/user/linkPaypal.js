var Route = require('../../lib/Route'),
    errors = require('../../lib/errors'),
    paypal = require('../../lib/paypal'),
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');
    userModule = require('../../modules/user/');

var route = new Route('post', '/secure/linkPaypal');

module.exports = route;

// Allow the user
route.allowUserTypes('User');

/**
 * validate input request.
 * properties should be expected input.
 * required should be mandatory field for input request.
 * on success of validation, response should route to next middleware.
**/
route.validateInputBody({
    type: 'object',
    properties: {
        'accountIdentifier': {type: 'object',
        properties:{
            'emailAddress':{type:'string', format: 'email'},
            'mobilePhoneNumber':{type:'string'},
            'accountId':{type:'string'}
        }
    },
        'firstName': {type: 'string'},
        'lastName': {type: 'string'}
    },
    required: ['accountIdentifier']
});

/**
 * middleware to get Verified Status of the account
 * if verified route to next middleware
 * else throw error
 */

route.use(function(req, res, next){
    return paypal.getVerifiedStatus(req.body)
        .then(function(result){
            if(result.accountStatus !== config.paymentGateway.verified){
                throw errors.account_not_verified();
            }else{
                next();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next)
});

/**
 * middleware to save the paypal information to user object
 */

route.use(function(req, res, next){
    return userModule.updateProfile({_id: req.user._id},{paypalInfo: req.body})
        .then(function(doc){
            var responce = {
                statusCode: 200,
                message: "Paypal linked successfully",
                user: doc
            }
            return res.json(responce);
        }, function(reject){
            return res.json(reject);
        })
        .catch(next);
})