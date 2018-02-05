var Route = require('../../lib/Route'),
    errors = require('../../lib/errors'),
    userModule = require('../../modules/user'),
    authModule = require('../../modules/auth'),
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('put', '/user/notification');

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
        'createInterest':{type: 'boolean'},
        'partnershipRequeted':{type: 'boolean'},
        'partnershipAccepted':{type: 'boolean'},
        'subscriptionExpired':{type: 'boolean'},
        'paymentAccepted':{type: 'boolean'}
    }
});

route.use(function(req, res, next){
    userModule.updatePref({_id: req.user._id},req.body)
        .then(function(doc){
            if(doc){
            var response = {
                    statusCode: 200,
                    message: "Notification updated successfully"
                }
                return res.json(response);
            }else{

            }
        }, function(reject){
            logger.error('Profile', 'Error in Updating profile', reject);
            return res.json(reject);
        })
        .catch(next);    
});