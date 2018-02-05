//Update Profile Api 

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
	 userModule = require('../../modules/user/'),
	 authModule = require('../../modules/auth/'),
     errors = require('../../lib/errors'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('put', '/secure/profile');

module.exports = route;

// Private route
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
    }
});


route.use(function(req, res, next){
    userModule.updateProfile({_id: req.user._id},req.body)
        .then(function(doc){
            if(doc){
            var response = {
                    statusCode: 200,
                    message: "Profile updated successfully",
                    user: doc.toJSON()
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