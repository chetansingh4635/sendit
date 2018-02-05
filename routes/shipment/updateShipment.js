var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    moment = require('moment'),
    requestModule = require('../../modules/request/');


var route = new Route('put', '/secure/shipment');

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
        _id: {type: 'string'},
        departingAirpoart: { type: 'string' },
        departingDate: {type: 'string', format: 'date'},
        arrivingAirpoart: {type: 'string'},
        arrivingDate: {type: 'string', format: 'date'},
        shipmentDetail:{type:'object',
            properties:{
                item: {type: 'string'},
                quantity: {type: 'number'}
            }
        },
        recepientInformation:{type: 'object',
            properties:{
                firstName: {type: 'string'},
                lastName: {type: 'string'},
                email: {type: 'string', format: 'email'},
                phoneNumber: {type: 'string'}
            }

        },
        offset:{type:'number'}
        
    },
    required: ['_id']
});


/**
 * middleware to check if record exist
 * if exist then move to next middleware
 */
route.use(function(req, res, next){
    return requestModule.findOne({_id: req.body._id, requestType: config.requestsType.shipment})
        .then(function(doc){
           
            if(doc){
                 doc = doc.toJSON();
                res.locals.shipment = doc;
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
    if(req.user._id.equals(res.locals.shipment.createdBy._id)){
        next();
    }else{
        throw errors.not_allowed();
    }
})

/**
 * middleware is used to update the shipment to DB
 * Input body should be the detail of shipment
**/
route.use(function(req, res, next){

    requestModule.updateRequest({_id: req.body._id}, req.body)
        .then(function(doc){
            if(doc){
                var response = {
                    statusCode: 200,
                    message: "Shipment Updated successfully",
                    shipment: doc
                }
                return res.json(response);
            }else{

            }

        }, function(reject){
            logger.error('Shipment', 'Error in updating shipment', reject);
            return res.json(reject);
        })
        .catch(next);
})
