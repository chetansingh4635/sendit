//Route to get al partnership created

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    _ = require('lodash')
    config = require('config');

var route = new Route('post', '/secure/myPartnerships/:requestType');

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
        sort:{type:'object',
            properties:{
                departingDate: {type: 'number'}
            }
        },
        limit:{type: 'number'},
        skip:{type: 'number'},
    }
});

route.use(function(req, res, next){
    if(config.requestsType[req.params.requestType] === config.requestsType.travel){
        //matching request where I am paying
             res.locals.match = {
                     'createdBy':ObjectId(req.user._id),
                    'requestType':{$ne:config.requestsType[req.params.requestType]}
                }
    }else{
        //matching request where I have to pay
        res.locals.match = {
                    'partner.userId':ObjectId(req.user._id),
                    'requestType': config.requestsType[req.params.requestType]
                }
    }
    var condition = [
            {
                '$match': req.body.searchObject
            },
            {
                '$unwind': '$partner'
            },
            {
                '$match': res.locals.match
            },
            {
                '$group':{
                    "_id":null,
                    total_count:{$sum: 1},
                }
            }
        ];

    return requestModule.aggregateResult(condition)
        .then(function(docs){
            res.locals.response = {
                statusCode: 200,
                message: "Records retrived success",
                data: docs[0] || {total_count: 0}
            }
            next();
        }, function(reject){
             res.json(reject);
        });

})

route.use(function(req, res, next){
    var condition = [
            {
                '$match': req.body.searchObject
            },
            {
                '$unwind': '$partner'
            },
            {
                '$match': res.locals.match
            },
            {
                '$skip': req.body.skip || 0
            },
            {
                '$limit': req.body.limit > 0 ? req.body.limit : 10
            },
            {
                '$sort': req.body.sort || {'_id': 1}
            }            
        ];
    return requestModule.aggregateResult(condition)
        .then(function(docs){
            res.locals.result = docs;
            next();
        }, function(reject){
             res.json(reject);
        });
});


route.use(function(req, res, next){
    res.locals.response.data.newRequests = _.filter(res.locals.result, function(record){
      if(!record.partner.partnerShipStatus || record.partner.partnerShipStatus === config.partnershipStatus.new) return record;
    });

    res.locals.response.data.establishedRequests = _.filter(res.locals.result, function(record){
      if(record.partner.partnerShipStatus === config.partnershipStatus.established) return record; 
    });

    res.locals.response.data.deliveryInProgress = _.filter(res.locals.result, function(record){
      if(record.partner.partnerShipStatus >= config.partnershipStatus.packageRecived && record.partner.partnerShipStatus <= config.partnershipStatus.deliveryFinished) return record; 
    });

    res.locals.response.data.deliveryCompleted = _.filter(res.locals.result, function(record){
      if(record.partner.partnerShipStatus >= config.partnershipStatus.canceled) return record; 
    })

    res.json(res.locals.response);
});