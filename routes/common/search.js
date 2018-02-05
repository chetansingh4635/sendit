/**
 * Route to retrive the records from request object
 */

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    moment = require('moment'),
    requestModule = require('../../modules/request');

var route = new Route('post', '/secure/search/:requestType?');

module.exports = route;

route.allowUserTypes('User');

route.validateInputParams({
    type: 'object',
    properties: {
        requestType: {type: 'string'}
    },
    required: ['requestType']
});


route.validateInputBody({
    type: 'object',
    properties:{
        searchObject:{type: 'object',
            properties:{
                departingAirpoart: { type: 'string' },
                departingDate: {type: 'string', format:'date'},
                arrivingAirpoart: {type: 'string'},
                arrivingDate: {type: 'string',format:'date'}
            }
        },
    sort:{type:'object',
        properties:{
            departingDate: {type: 'number'}
        }
    },
    limit:{type: 'number'},
    skip:{type: 'number'},
    }
});


route.use(function(req,res, next){
    var condition = req.body.searchObject ? req.body.searchObject : {};
    condition.requestType = req.params.requestType ? config.requestsType[req.params.requestType] : 1;
    condition.createdBy = { $ne: req.user._id}

                                                                                                    
    
    if(!condition.departingDate){
        condition.departingDate=moment().toISOString();
    var startDate = moment()._d.getTime() > moment(condition.departingDate).subtract(5, "days")._d.getTime() ? moment().toISOString() : moment(condition.departingDate).subtract(5, "days").toISOString();
        condition.departingDate = {
            $gte : startDate
        }
    }else{
        var endDate = moment(condition.departingDate).add(5, "days").toISOString();
        var startDate = moment()._d.getTime() > moment(condition.departingDate).subtract(5, "days")._d.getTime() ? moment().toISOString() : moment(condition.departingDate).subtract(5, "days").toISOString();
        condition.departingDate = {
            $gte : startDate,
            $lte: endDate
        }    
    }



    var options = {
      skip: req.body.skip,
      limit: req.body.limit,
      sort: req.body.sort
    };

    options.select = {
        createdBy: 1,
        departingAirpoart: 1,
        departingDate: 1,
        arrivingAirpoart: 1,
        arrivingDate: 1,
        shipmentDetail:1,
        recepientInformation:1,
        partner:1,
        requestType: 1,
        requestedItem: 1,
        brand: 1,
        model:1,
        link:1,
        isActive: 1,
        userIntrested:{
            $elemMatch:{
                userId: req.user._id
            }
        }
    }

    return requestModule.searchAndPaginate(condition, options)
        .then(function(docs){
            if(docs){
                var responce = {
                    statusCode: 200,
                    message: 'Records retrieved successfully',
                    data: docs
                }
                return res.json(responce);
            } 
             else
                throw errors.no_records();
        })
        .catch(next);
});
