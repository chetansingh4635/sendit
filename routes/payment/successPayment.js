/**
 * Route to mark the payment as done
**/ 

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    var messages = require('../../resources/messages'),
    config=require('config');
    _ = require('lodash'),
    paypal = require('../../lib/paypal'),
    ObjectId = require('mongoose').Types.ObjectId;

var route = new Route('GET', '/pay/success/:userId/:requestId');

module.exports = route;

// public route
route.setPublic();

route.validateInputParams({
        type:'object',
        properties:{
            'userId':{type:'string', format: 'objectId'},
            'requestId':{type: 'string', format: 'objectId'}
        }
    }
);

route.use(function(req, res, next){
       var condition = [
        {
            $match:{
                "_id":ObjectId(req.params.requestId)
            }
        },
        {
            $unwind:{
                "path":"$partner"
            }
        },
        {
            $match:{
                "partner.userId":ObjectId(req.params.userId)
            }             
        }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(doc){
            if(doc && doc[0]){
                res.locals.payKey = doc[0].partner.payKey;
                next();
            }else{
                throw errors.payment_failed();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
})

/**
 * middleware for get details of payment.
 * request params contain the paykey
 * middleware response will be payment object.   
**/
route.use(function (req, res, next) {
    return paypal.getPayDetail({payKey : res.locals.payKey})
        .then(function (response) {
            res.locals.paymentStatus =  response.status;
            console.log("paypal responce", JSON.stringify(response));
            console.log("paypal primery recived status", response.paymentInfoList.paymentInfo[0].transactionStatus);
            console.log("paypal primery recived status", response.paymentInfoList.paymentInfo[1].transactionStatus);
            next();
        }, function (reject) {
            logger.error('payment detail', 'Error in payment', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * middleware for updating the partnership status
 */

route.use(function(req, res, next){
    var condition = {
        "_id": req.params.requestId,
        "partner.userId":req.params.userId
    }

    var data = {
        '$set':{'partner.$.paymentStatus':res.locals.paymentStatus}
    } 
    return requestModule.updateRequest(condition, data)
        .then(function(success){
            res.json({
                statusCode: 200,
                messages: "Payment Success",
                data: success
            })
        }, function(error){
            res.json(error);
        })
});