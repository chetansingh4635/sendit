//Route to get all payments done or reived

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    _ = require('lodash'),
    ObjectId = require('mongoose').Types.ObjectId,
    config = require('config');

var route = new Route('post', '/secure/myPayments');

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
                    departingDate: {type: 'number'},
                }
            },
            limit:{type: 'number'},
            skip:{type: 'number'},
            isRecived: {type: 'boolean'}
        }
});

route.use(function(req, res, next){
var condition = [
            {
                '$match': req.body.searchObject
            },
            {
                '$unwind': '$partner'
            },
            {
                '$match': req.body.isRecived ? {'partner.userId': ObjectId(req.user._id)} : {'createdBy': ObjectId(req.user._id)}                    
            },
            {
                '$group':{
                    "_id": null,
                    total:{$sum: '$partner.amount'},
                    total_count:{$sum: 1},
                }               
            }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(docs){
            res.locals.responce = {
                statusCode: 200,
                message: "Records retrived success",
                data: docs[0] || {total_count:0},
                totalPaymentDetails: docs[0] ? utility.calculatePaymentDetails(docs[0].total) : 0
            }
            next();
        },function(reject){
             res.json(reject);
        });
});

route.use(function(req, res, next){
    var condition = [
            {
                '$match': req.body.searchObject
            },
            {
                '$unwind': '$partner'
            },
            {
                '$match': req.body.isRecived ? {'partner.userId': ObjectId(req.user._id)} : {'createdBy': ObjectId(req.user._id)}                
            },
            {
                $skip: req.body.skip || 0
            },
            {
                $limit: req.body.limit > 0 ? req.body.limit : 10
            },
            {
                $sort: req.body.sort || {'_id': 1}
            }
    ];
    return requestModule.aggregateResult(condition)
        .then(function(docs){
            _.each(docs, function(paymentObject){
                paymentObject.paymentDetails = utility.calculatePaymentDetails(paymentObject.partner.amount)
            })
            res.locals.responce.data.items = docs;
            res.json(res.locals.responce);
        }, function(reject){
             res.json(reject);
        });
});