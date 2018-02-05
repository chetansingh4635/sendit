/**
 * Route to become a partner
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
    logger = require('../../lib/logger'),
    ObjectId = require('mongoose').Types.ObjectId;

var route = new Route('post', '/secure/retryPayment');

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
        'partnerShipId':{type: 'string', format: 'objectId'},
        'returnUrl':{type:'string' },
        'cancelUrl':{type: 'string' },
        'previousPaykey':{type: 'string'}
    },
        required: ['partnerShipId', 'returnUrl', 'cancelUrl', 'previousPaykey']
});

/**
 * middleware to check if partnerShip exist
 * Input will be the partnerShipId
 */
route.use(function(req, res, next){
    var condition = [
            {
                $unwind: {
                    "path":"$partner"
                }
            },
            {
                $match: {
                    "partner._id": ObjectId(req.body.partnerShipId)
                }
            }
        ]

    return requestModule.aggregateResult(condition)
        .then(function(doc){
           if(doc && doc.length > 0){
               res.locals.partnerShip = doc[0];
               next();
           }
           else
                throw errors.invalid_partnership();
        }, function(reject){
            logger.error('Error partnership', 'Error in findrecord while getPartnership', reject);
        })
        .catch(next);
});

route.use(function(req, res, next){
    return paypal.getPayDetail({payKey : res.locals.partnerShip.partner.payKey})
        .then(function (response) {
            res.locals.paymentStatus =  response.status;
            next();
        }, function (reject) {
            logger.error('payment detail', 'Error in payment', reject);
            return res.json(reject);
        })
        .catch(next);
});

route.use(function(req, res, next){
    if(res.locals.paymentStatus === config.paymentStatus.created ){
        next();
    }else{
        res.json(errors.allready_paid());
    }
});

/**
 * User object who is intrested
**/
route.use(function(req, res, next){
    return userModule.findUser({ _id: res.locals.partnerShip.partner.userId })
        .then(function (doc) {
            if (doc) {
                res.locals.payee = doc.toJSON();
                // User find route to next middleware
                next();
            } else {
                // User is not found 
                // Send error message to client
                res.send(resources.no_record_found());
            }
        }, function (reject) {
            logger.error('findUser', 'Error in findUser while payment', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * Do the payment of specific amount
 * middleware for payment for user in system.
 * input body should be all information of payment.
 * middleware response will be payment object.   
**/
route.use(function (req, res, next) {
    var payload = _.clone(config.payment.defaultRequestPayload);
        payload.currencyCode = config.paymentGateway.defaultCurrency;
        payload.returnUrl = req.body.returnUrl + "/" + res.locals.partnerShip._id + "/" + res.locals.partnerShip.partner.userId._id;
        payload.cancelUrl = req.body.returnUrl  + "/" + res.locals.partnerShip._id + "/" + res.locals.partnerShip.partner.userId._id; 

    var primaryReciver = _.clone(config.payment.primaryReciver);
        primaryReciver.amount = res.locals.partnerShip.partner.amount;
    
    var reciver = _.clone(config.payment.defaultReciver);
        reciver.amount = utility.travellerAmount(res.locals.partnerShip.partner.amount);
        reciver.email = res.locals.payee.paypalInfo.accountIdentifier.emailAddress;
    
    payload.receiverList = _.clone([]);
    payload.receiverList.push(primaryReciver, reciver);
    return paypal.pay(payload)
        .then(function (response) {
            res.locals.paymentInfo = response;
            next();
        }, function (reject) {
            logger.error('create payment', 'Error in payment', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * update partner with payment status to new
**/

route.use(function(req, res, next){
    
    var condition =  {
        "partner._id": req.body.partnerShipId
        }
    var data = {
        '$set':{
            'partner.$.paymentStatus':config.paymentStatus.created,
            'partner.$.payKey':res.locals.paymentInfo.payKey            
        }
    }

    return requestModule.updateRequest(condition, data)
    .then(function(doc){
        var responce = {
            statusCode: 200,
            paymentInfo: res.locals.paymentInfo
        }
    res.json(responce);
    }, function(reject){
        res.json(reject);
    })
    .catch(next);
});