//Route to create a new travel itenary

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');

var route = new Route('delete', '/secure/request/:id');

module.exports = route;

route.allowUserTypes('User');

/**
 * validate input request.
 * properties should be expected input.
 * required should be mandatory field for input request.
 * on success of validation, response should route to next middleware.
**/
route.validateInputParams({
    type: 'object',
    properties: {
        id: {type: 'string', format:'objectId'},
    },
    required: ['id']
});

/**
 * middleware to check if record exist
 * if exist then move to next middleware
**/
route.use(function(req, res, next){

    return requestModule.findOne({_id: req.params.id, requestType:config.requestsType.request})
        .then(function(doc){
            if(doc){
                doc = doc.toJSON();
                res.locals.request = doc;
                next();
            }else{
               throw errors.record_not_exist();
            }
        }, function(reject){
            console.log("reject", reject);
        })
        .catch(next);
});


/**
 * middleware to check if the creator is editing the record
 * respone will be faulure else in next middleware
 */
route.use(function(req, res, next){
    if(req.user._id.equals(res.locals.request.createdBy._id)){
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
    if(res.locals.request.partner && res.locals.request.partner.length > 0){
        throw errors.can_not_cancel();
    }else{
        next();
    }
});

/**
 * middleware is used to store the shipment to DB
 * Input body should be the detail of shipment
**/
route.use(function(req, res, next){

    requestModule.updateRequest({_id: req.params.id}, {isActive: false})
        .then(function(doc){
            if(doc){
                var response = {
                    statusCode: 200,
                    message: "Request deleted successfully",
                    travel: doc
                }
                return res.json(response);
            }else{

            }

        }, function(reject){
            logger.error('Request', 'Error in deleting request', reject);
            return res.json(reject);
        })
        .catch(next);
})