var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    moment = require('moment'),
    requestModule = require('../../modules/request/');


var route = new Route('post', '/secure/shipment');

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
        offset: {type: 'number'}
        
    },
    required: ['departingAirpoart', 'departingDate', 'arrivingAirpoart', 'arrivingDate', 'shipmentDetail', 'recepientInformation']
});

route.use(function(req, res, next){
    if(req.body.arrivingAirpoart === req.body.departingAirpoart){
        return res.json(errors.incorrect_airports());
    }else{
        next();
    }
});

/**
 * middleware to check the correct date
 * Input body should be the all travel details 
 */

route.use(function(req, res, next){
    var arrivingDate = req.body.arrivingDate;
    var departingDate = req.body.departingDate;
    var timeOffset = req.body.offset;
    
    if(utility.compareDates(departingDate, arrivingDate, timeOffset)){
        next();
    }else{
        return res.json(errors.travel_incorrect_dates());
    }
})


/**
 * middleware for creating a new shipment.
 * input body should be the all detail of shipment
 * middleware response will be user document or null obejct.   
**/
route.use(function (req, res, next) {
    var requestDetail = req.body;
    requestDetail.createdBy = req.user._id;
    requestDetail.requestType = config.requestsType.shipment;

    return requestModule.save(req.body)
        .then(function (doc) {
            var response = {
                    statusCode: 200,
                    message: "Shipment saved successfully",
                    shipment: doc
                }
                return res.json(response);
        }, function (reject) {
            logger.error('Saving shipment', 'Error in saving shipment', reject);
            return res.json(reject);
        })
        .catch(next);
});
