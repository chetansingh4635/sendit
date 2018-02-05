/**
 * Route to create a new travel itenary
**/

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    moment = require('moment'),
    requestModule = require('../../modules/request');

var route = new Route('post', '/secure/travel');

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
        offset:{type:'number'}
    },
    required: ['departingAirpoart', 'departingDate', 'arrivingAirpoart', 'arrivingDate']
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
 * middleware is used to store the travel itenary to DB
 * Input body should be the detail of travel itenary
**/
route.use(function(req, res, next){
    var requestDetail = req.body;
    requestDetail.createdBy = req.user._id;
    requestDetail.requestType = config.requestsType.travel;

    requestModule.save(requestDetail)
        .then(function(doc){
            if(doc){
                var response = {
                    statusCode: 200,
                    message: "Travel saved successfully",
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