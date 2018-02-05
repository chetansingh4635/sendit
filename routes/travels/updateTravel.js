//Route to create a new travel itenary

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    moment = require('moment'),
    requestModule = require('../../modules/request');

var route = new Route('put', '/secure/travel');

module.exports = route;

route.allowUserTypes('User');

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
        _id: {type: 'string'},
        departingAirpoart: { type: 'string' },
        departingDate: {type: 'string', format: 'date'},
        arrivingAirpoart: {type: 'string'},
        arrivingDate: {type: 'string', format: 'date'},
        offset: {type: 'number'}
    },
    required: ['_id']
});


/**
 * middleware to check if record exist
 * if exist then move to next middleware
 */
route.use(function(req, res, next){
    return requestModule.findOne({_id: req.body._id, requestType: config.requestsType.travel})
        .then(function(doc){           
            if(doc){
                 doc = doc.toJSON();
                res.locals.travel = doc;
                next();
            }else{
               throw errors.record_not_exist();
            }
        })
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
    if(req.user._id.equals(res.locals.travel.createdBy._id)){
        next();
    }else{
        throw errors.not_allowed();
    }
})

/**
 * middleware is used to store the travel itenary to DB
 * Input body should be the detail of travel itenary
**/
route.use(function(req, res, next){

    requestModule.updateRequest({_id: req.body._id}, req.body)
        .then(function(doc){
            if(doc){
                var response = {
                    statusCode: 200,
                    message: "Travel Updated successfully",
                    travel: doc
                }
                return res.json(response);
            }else{

            }

        }, function(reject){
            logger.error('Travel', 'Error in updating new Travel', reject);
            return res.json(reject);
        })
        .catch(next);
})