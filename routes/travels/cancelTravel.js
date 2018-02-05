//Route to create a new travel itenary

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');

var route = new Route('delete', '/secure/travel/:id');

module.exports = route;

route.allowUserTypes('User');

/**
 * validate input request.
 * properties should be expected input.
 * required should be mandatory field for input request.
 * on success of validation, response should route to next middleware. 
 * method create date: 09/09/2016
**/
route.validateInputParams({
    type: 'object',
    properties: {
        id: {type: 'string', format: 'objectId'},
    },
    required: ['id']
});


/**
 * middleware to check if record exist
 * if exist then move to next middleware
 */
route.use(function(req, res, next){
    return requestModule.findOne({_id: req.params.id, requestType: config.requestsType.travel})
        .then(function(doc){
            if(doc){
                doc = doc.toJSON();
                res.locals.travel = doc;
                next();
            }else{
               throw errors.record_not_exist();
            }
        })
        .catch(next);
});


/**
 * middleware to check if the creator is editing the record
 * respone will be faulure else in next middleware
 */
route.use(function(req, res, next){
    if(req.user._id.equals(res.locals.travel.createdBy._id)){
        next();
    }else{
        throw errors.not_allowed();
    }
});


/**
 * middleware to check if there is any partner exist in doc
 * if yes we can not cancel the request
**/

route.use(function(req, res, next){
    if(res.locals.travel.partner && res.locals.travel.partner.length > 0){
        throw errors.can_not_cancel();
    }else{
        next();
    }
});

/**
 * middleware is used to store the travel itenary to DB
 * Input body should be the detail of travel itenary
**/
route.use(function(req, res, next){

    requestModule.updateRequest({_id: req.params.id}, {isActive: false})
        .then(function(doc){
            if(doc){
                var response = {
                    statusCode: 200,
                    message: "Travel deleted successfully",
                    travel: doc
                }
                return res.json(response);
            }else{

            }

        }, function(reject){
            logger.error('Travel', 'Error in create a new Travel', reject);
            return res.json(reject);
        })
        .catch(next);
})