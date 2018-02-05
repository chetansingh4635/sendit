//Route to get al partnership created

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    _ = require('lodash'),
    messages = require('../../resources/messages'),
    ObjectId = require('mongoose').Types.ObjectId,
    config = require('config');

var route = new Route('POST', '/secure/myIntrests/:requestType');

module.exports = route;

route.allowUserTypes('User');

route.validateInputBody({
    type: 'object',
    properties: {
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
    skip:{type:'number'},
    limit:{type: 'number'}
    }
});

route.use(function(req, res, next){
    var condition = [
        {
            '$unwind': '$userIntrested'
        },
        {
            '$match': req.body.searchObject || {}
        },
        {
            '$match': {
                'partner':[],
                 'requestType':config.requestsType[req.params.requestType] || config.requestsType.travel,
                 'userIntrested.userId':req.user._id}
        }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(docs){
            res.locals.responce = _.clone(config.defaultResponceObject);
            res.locals.responce.message = messages.recordsFetch;
            res.locals.responce.data = {
                limit: req.body.limit || config.defaultPagging.limit,
                skip: req.body.skip || 0,
                total_count: docs.length
            }
            next();
        }, function(reject){
             res.json(reject);
        });      

});

route.use(function(req, res, next){
    var condition = [
            {
                '$unwind': '$userIntrested'
            },
            {
                '$match': req.body.searchObject || {},
            },
            {
                '$match': {
                    'partner':[],
                    'requestType':config.requestsType[req.params.requestType] || config.requestsType.travel,
                    'userIntrested.userId':req.user._id
                }
            },
            {
                '$sort':req.body.sort || {'_id': 1}
            },
            {
                '$skip': req.body.skip || 0
            },
            {
                '$limit': req.body.limit > 0 ? req.body.limit : 10
            }
    ];
    return requestModule.aggregateResult(condition)
        .then(function(docs){
            res.locals.responce.data.items = docs;
            res.json(res.locals.responce);
        }, function(reject){
             res.json(reject);
        });      
});