//Route to fetch my travel itenary

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    _ = require('lodash');

var route = new Route('POST', '/secure/requests');

module.exports = route;

route.allowUserTypes('User');


route.validateInputBody({
    type: 'object',
    properties:{
        searchObject:{type: 'object',
            properties:{
                departingAirpoart: { type: 'string' },
                departingDate: {type: 'string', format: 'date'},
                arrivingAirpoart: {type: 'string'},
                arrivingDate: {type: 'string', format: 'date'}
            }
        },
    sort:{
        type:'object',
        properties:{
            departingDate: {type: 'number'}
        }
    },
    limit:{type: 'number'},
    skip:{type: 'number'},
    }
});

/**
 * Midllware to find all records created by user
**/
route.use(function(req, res, next){
    var condition = req.body.searchObject || {};
    condition.createdBy = req.user._id || req.user._doc._id;
    condition.requestType = config.requestsType.request;
    var options = {
        sort: req.body.sort,
        limit: req.body.limit,
        skip: req.body.skip
    }

    return requestModule.searchAndPaginate(condition, options)
        .then(function(docs){
                res.locals.result = docs.items;
                res.locals.total_count = docs.total_count;
                next();
        })
        .catch(next);
});

/**
 * Middlewrae to filter the records for records where a partnerships has been established
**/

route.use(function(req, res, next){
    var partnershipEstablished = _.filter(res.locals.result,function(record){
            if(record.partner && record.partner.length > 0) {
                return record;
            }
    });

    var notIntrested = _.filter(res.locals.result,function(record){
            if(!(record.partner && record.partner.length > 0) && record.userIntrested.length === 0) {
                return record;
            }
    });

    var intrested = _.filter(res.locals.result,function(record){
            if(!(record.partner && record.partner.length > 0) && record.userIntrested.length > 0) {
                return record;
            }
    });

    var responce = {
            statusCode: 200,
            message: "Records fetched successfully",
            total_count: res.locals.total_count,
            partnershipEstablished: partnershipEstablished,
            interested: intrested,
            notIntrested: notIntrested
        };
    res.json(responce);  
});