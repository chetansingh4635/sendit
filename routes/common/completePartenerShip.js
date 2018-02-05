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
    moment = require('moment'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    sparkpost = require('../../lib/sparkpost'),
    ObjectId = require('mongoose').Types.ObjectId;

var route = new Route('post', '/secure/completePartnerShip');

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
        'accept':{type: 'boolean'}
    },
        required: ['partnerShipId']
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
            logger.error('matching socialid', 'Error in findrecord while login', reject);
        }).catch(next)
});

route.use(function(req, res, next){
    if(res.locals.partnerShip.partner.partnershipStatus <= config.partnershipStatus.established){
        res.json(errors.partnerShip_not_confirmed);
    }else{
        next();
    }
});

/**
 * Middleware to pay the traveller on his paypal account
 * input will be the partnership id
 */
route.use(function(req, res, next){
    var data = {
        payKey: res.locals.partnerShip.partner.payKey
    }
    if(!req.body.accept && res.locals.partnerShip.partner.userId.equals(req.user._id)){
        var currentDate = moment();
        var arrivingDate = moment(res.locals.partnerShip.arrivingDate);

        if(currentDate.diff(arrivingDate, 'days') > config.rejectPartnershipTime){
            res.json(errors.can_not_reject());
        }else{
            res.locals.paymentStatus = res.locals.partnerShip.partner.paymentStatus;
            next();
        }
    }else if(res.locals.partnerShip.createdBy.equals(req.user._id)){
    return paypal.completePayment(data)
        .then(function(success){
            if(success.httpStatusCode){
                res.locals.paymentStatus = success.paymentExecStatus;
                next();
            }
            else
                res.json(success);
        }, function(error){
            logger.log("error", "creding payment to traveller", error);
            res.json(error);
        })
        .catch(next);
    }
});

/**
 * Update the partnership status to completed and payment to done
 */

route.use(function(req, res, next){
    var condition =  {
        "partner._id": req.body.partnerShipId
        }
    var data = {
        '$set':{
            'partner.$.partnerShipStatus':req.body.accept ? config.partnershipStatus.completed : config.partnershipStatus.rejected,
            'partner.$.paymentStatus': res.locals.paymentStatus
        }
    }

    return requestModule.updateRequest(condition, data)
    .then(function(doc){
        res.locals.partnership = doc;
        var responce = {
            statusCode: 200,
            data: doc
        }
        next();
    res.json(responce);
    }, function(reject){
        res.json(reject);
    })
    .catch(next);

});


/**
 * middlware Types send email for the paymant sent to the travveler
 * Input will be user object of traveller, and payment details
 * traveller will recive an email with payment recipt
 */
route.use(function(req, res, next){
    var recipents = []
    var sendEmailTo = JSON.parse(JSON.stringify(config.sparkPostRecipent));
     
    var user = req.user.toJSON();

    sendEmailTo.address.email = res.locals.partnerShip.partner.userId.emailId;
    var amount_sent=res.locals.partnerShip.partner.amount;
    var paypal_fee=(res.locals.partnerShip.partner.amount*0.9*3.4)/100 + 0.35;
    var sendit_fee=res.locals.partnerShip.partner.amount - res.locals.partnerShip.partner.amount*0.9;
    var amount_recived=amount_sent - paypal_fee - sendit_fee;

    sendEmailTo.substitution_data ={
        "payment":{
            "amount_sent":amount_sent,
            "paypal_fee":paypal_fee,
            "sendit_fee":sendit_fee,
            "amount_recived":amount_recived
        }
    };
 
    recipents.push(sendEmailTo);
    if(res.locals.partnerShip.partner.userId && res.locals.partnerShip.partner.userId.notificationPref.paymentAccepted)
    {
    return sparkpost.sendEmail(recipents, config.sparkPostTemplates.paymentAccepted)
    .then(function(success){
    }, function(error){
    })
    .catch(next);
    }
    else{}

});