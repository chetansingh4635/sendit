/**
 * Route to confirm a partner
 * Partner ship will be confirmed by the traveller
 * who is going to handover the product 
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

var route = new Route('post', '/secure/confirmPartnerShip');

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
        'confirm':{type: 'boolean'}
    },
        required: ['partnerShipId','confirm']
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
                    "partner._id": ObjectId(req.body.partnerShipId),
                    "partner.userId":ObjectId(req.user._id)
                }
            }
        ]

    return requestModule.aggregateResult(condition)
        .then(function(doc){
           if(doc && doc.length > 0){
               res.locals.partnerShipId = doc[0];
               next();
           }
           else
                throw errors.invalid_partnership();
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});

/**
 * middleware to check if payment is rcived in primary account
 * input will be the pay key
 */

route.use(function (req, res, next) {
    return paypal.getPayDetail({payKey : res.locals.partnerShipId.partner.payKey})
        .then(function (response) {
            res.locals.paymentStatus =  response.status;
            if(response.paymentInfoList.paymentInfo[0].transactionStatus === config.paymentStatus.pending){
                res.json(errors.payment_not_recived());
            }else
                next();
        }, function (reject) {
            logger.error('payment detail', 'Error in payment', reject);
            return res.json(reject);
        })
        .catch(next);
});

/**
 * Update the partnership status to confirm
 */

route.use(function(req, res, next){
    var condition =  {
        "partner._id": req.body.partnerShipId
        }
    var data = {
        '$set':{
            'partner.$.partnerShipStatus':req.body.confirm ? config.partnershipStatus.established : config.partnershipStatus.canceled
        }
    }

    return requestModule.updateRequest(condition, data)
    .then(function(doc){
        var responce = {
            statusCode: 200,
            data: doc
        }
    res.json(responce);
    next();
    }, function(reject){
        res.json(reject);
    })
    .catch(next);
});

route.use(function(req, res, next){
    var recipents = []
    var sendEmailTo = JSON.parse(JSON.stringify(config.sparkPostRecipent));
     
    var user = req.user.toJSON();

    sendEmailTo.address.email =  res.locals.partnerShipId.createdBy.emailId;
    sendEmailTo.substitution_data ={};
 
    recipents.push(sendEmailTo);
    if(req.body.confirm && res.locals.partnerShipId.createdBy.emailId && res.locals.partnerShipId.createdBy.notificationPref.partnershipAccepted)
    {
    return sparkpost.sendEmail(recipents, config.sparkPostTemplates.partnershipAccepted)
    .then(function(success){
    }, function(error){
    })
    .catch(next);
    }
    else{}

});