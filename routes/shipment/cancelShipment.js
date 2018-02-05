//Route to create a new travel itenary

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');

var route = new Route('delete', '/secure/shipment/:id');

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
        id: {type: 'string', format: 'objectId'},
    },
    required: ['id']
});


/**
 * middleware to check if record exist
 * if exist then move to next middleware
 */
route.use(function(req, res, next){

    return requestModule.findOne({_id: req.params.id, requestType:config.requestsType.shipment})
        .then(function(doc){
            if(doc){
                doc = doc.toJSON();
                res.locals.shipment = doc;
                next();
            }else{
               throw errors.record_not_exist();
            }
        }, function(reject){
            logger.error("reject", reject);
            res.json(reject);
        })
        .catch(next);
});


/**
 * middleware to check if the creator is editing the record
 * respone will be faulure else in next middleware
 */
route.use(function(req, res, next){
    if(req.user._id.equals(res.locals.shipment.createdBy._id)){
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
    if(res.locals.shipment.partner && res.locals.shipment.partner.length > 0){
        res.json(errors.can_not_cancel());
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
            var response = {
                statusCode: 200,
                message: "Shipment deleted successfully",
                travel: doc
            }
            return res.json(response);
        }, function(reject){
            logger.error('Shipment', 'Error in deleting shipment', reject);
            return res.json(reject);
        })
        .catch(next);
})