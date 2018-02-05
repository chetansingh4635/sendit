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
    sparkpost = require('../../lib/sparkpost'),
    ObjectId = require('mongoose').Types.ObjectId;

var route = new Route('post', '/secure/:requestType/becomePartner');

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
        'userId':{type: 'string', format: 'objectId'},
        'requestId':{type: 'string', format: 'objectId'},
        'returnUrl':{type:'string' },
        'cancelUrl':{type: 'string' },
        'amount':{type: 'number', format:''}
    },
        required: ['userId', 'requestId', 'returnUrl', 'cancelUrl', 'amount']
});

/**
 * validate input params.
 * properties should be expected input.
 * required should be mandatory field for input request.
 * on success of validation, response should route to next middleware.
**/
route.validateInputParams({
    type: 'object',
    properties: {
        requestType: {type: 'string', format: 'requestOrShipment'}
    },
    required: ['requestType']
});

/**
 * check if request exists
 * if exist route to next middleware else throw error
 */
route.use(function(req, res, next){
    var condition = {
        _id:req.body.requestId,
        requestType: config.requestsType[req.params.requestType],
    }

    return requestModule.findOne(condition)
        .then(function(doc){
            if(doc){
                res.locals.requestObject = doc.toJSON();
                next();
            }
            else
                throw errors.record_not_exist();
        }, function(reject){
            logger.log("reject", reject);
            res.json(reject);
        })
        .catch(next);
});

/**
 * check the owner ship of the request
 * if current user is the owner route to next middleware
 * else throw error
 */

route.use(function(req, res, next){
    if(req.user._id.equals(res.locals.requestObject.createdBy._id)){
        next();
    }else{
        res.json(errors.not_allowed());
    }
});

/**
 * check if paypal info is added
 **/

route.use(function(req, res, next){
    if(req.user.paypalInfo){
        next();
    }else{
        res.json(errors.paypal_not_linked);
    }
});

/**
 * Check if there is any partner allready exists
 * if exists throw error
 * else route to next middlare
**/

// route.use(function(req, res, next){
//     var condition = [
//         {
//             $match:{
//                 "_id":ObjectId(req.body.requestId)
//             }
//         },
//         {
//             $unwind:{
//                 "path":"$partner"
//             }
//         },
//         {
//             $match:{
//                 $or: [
//                     {"partner.paymentStatus":config.paymentStatus.complete},
//                     {"partner.paymentStatus":config.paymentStatus.processing},
//                     {"partner.paymentStatus":config.paymentStatus.pending},
//                 ]
                
//             }             
//         }
//     ];

//     return requestModule.aggregateResult(condition)
//         .then(function(doc){
//             if(doc.length > 0){
//                 throw errors.already_had_partner();
//             }else{
//                 next();
//             }
//         }, function(reject){
//             res.json(reject);
//         })
//         .catch(next);
// });

/**
 * User object who is intrested
**/
route.use(function(req, res, next){
    return userModule.findUser({ _id: req.body.userId })
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
 * middleware to confirm if user has a paypal account linked
 */

route.use(function(req, res, next){
    if(res.locals.payee && res.locals.payee.paypalInfo){
       next(); 
    }else{
        res.json(errors.paypal_not_linked().withDetails(messages.paypal_not_linked_other));
    }
})

/**
 * middleware to check if user has expressed the intrest on the request
 * else throw error 
**/

route.use(function(req, res, next){
    var condition = [
        {
            $match:{
                "_id":ObjectId(req.body.requestId)
            }
        },
        {
            $unwind:{
                "path":"$userIntrested"
            }
        },
        {
            $match:{
                "userIntrested.userId":ObjectId(req.body.userId)
            }
        }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(doc){
            if(doc.length > 0 && doc[0].userIntrested.disscussionId){
                res.locals.request = doc[0];
                if(res.locals.request.partner && res.locals.request.partner.length > 0){
                    throw errors.already_had_partner();
                }else{
                    next();
                }
            }else if(doc.length > 0){
                throw errors.disscussion_not_started();
            }else{
                throw errors.person_not_intrested();
            }
        }, function(reject){
            res.json(reject);
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
        payload.returnUrl = req.body.returnUrl + "/" + req.body.requestId + "/" + req.body.userId;
        payload.cancelUrl = req.body.returnUrl  + "/" + req.body.requestId + "/" + req.body.userId; 

    var primaryReciver = _.clone(config.payment.primaryReciver);
        primaryReciver.amount = req.body.amount;
    
    var reciver = _.clone(config.payment.defaultReciver);
        reciver.amount = utility.travellerAmount(req.body.amount);
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
 * insert partner with payment status to new
**/

route.use(function(req, res, next){
    var condition = {
        _id: req.body.requestId
    }
    var data = {
        "userId":req.body.userId,
        "requestId":res.locals.request.userIntrested.requestId,
        "paymentStatus": config.paymentStatus.created,
        "payKey": res.locals.paymentInfo.payKey,
        "amount":req.body.amount,
        "partnerShipStatus":config.partnershipStatus.new 
    }



    return requestModule.insertPartner(condition,data)
        .then(function(doc){
            if(doc){
                res.json({
                    statusCode:200,
                    partnerShip: doc,
                    paymentInfo: res.locals.paymentInfo,
                    messages: "Partner ship created successfully!"
                })
                next();
            }else{
                throw errors.internal_error();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});

route.use(function(req, res, next){
    var recipents = []
    var sendEmailTo = JSON.parse(JSON.stringify(config.sparkPostRecipent));
     
    var user = req.user.toJSON();

    sendEmailTo.address.email = res.locals.payee.emailId;
    sendEmailTo.substitution_data ={};
 
    recipents.push(sendEmailTo);
    if(res.locals.payee.emailId && res.locals.payee.notificationPref.partnershipRequeted)
    {
    return sparkpost.sendEmail(recipents, config.sparkPostTemplates.partnershipRequeted)
    .then(function(success){
        next();
    }, function(error){
        next();
    })
    .catch(next);
    }
    else{}

});