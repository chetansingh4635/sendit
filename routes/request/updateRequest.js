var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    moment = require('moment'),
    requestModule = require('../../modules/request/');


var route = new Route('put', '/secure/request');

module.exports = route;

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
        _id: {type: 'string', format:'objectId'},
        departingAirpoart: { type: 'string' },
        departingDate: {type: 'string'},
        arrivingAirpoart: {type: 'string'},
        arrivingDate: {type: 'string'},

        requestedItem: {type: 'string'},
        brand: {type: 'string'},
        model: {type: 'string'},
        link: {type: 'string'},
        offset: {type: 'number'}
        
    },
    required: ['_id']
});


/**
 * middleware to check if record exist
 * if exist then move to next middleware
 */
route.use(function(req, res, next){
    return requestModule.findOne({_id: req.body._id, requestType: config.requestsType.request})
        .then(function(doc){          
            if(doc){
                 doc = doc.toJSON();
                res.locals.request = doc;
                next();
            }else{
               throw errors.record_not_exist();
            }
        })
        .catch(next);
});

/**
 * middleware to check the correct date
 * Input body should be the all travel details 
 */

route.use(function(req, res, next){
    var arrivingDate = req.body.arrivingDate ? req.body.arrivingDate : res.locals.request.arrivingDate;
    var departingDate = req.body.departingDate ? req.body.departingDate : res.locals.request.departingDate;
    var timeOffset = req.body.offset;
    
    if(utility.compareDates(departingDate, arrivingDate, timeOffset)){
        next();
    }else{
        return res.json(errors.travel_incorrect_dates());
    }
})


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
})

/**
 * middleware is used to update the request to DB
 * Input body should be the detail of request
**/
route.use(function(req, res, next){

    requestModule.updateRequest({_id: req.body._id}, req.body)
        .then(function(doc){
            if(doc){
                var response = {
                    statusCode: 200,
                    message: "Request Updated successfully",
                    request: doc
                }
                return res.json(response);
            }else{

            }

        }, function(reject){
            logger.error('Request', 'Error in updating request', reject);
            return res.json(reject);
        })
        .catch(next);
})
