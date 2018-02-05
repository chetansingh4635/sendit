//Route to add an intrest to a request 

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request'),
    messages = require('../../resources/messages'),
    sparkpost = require('../../lib/sparkpost'),
    config=require('config'),
    _ = require('lodash');


var route = new Route('post', '/secure/expressIntrest');

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
        'requestToLink':{type: 'string', format: 'objectId'},
        'requestId': {type: 'string', format: 'objectId'}    
    },
        required: ['requestId','requestToLink']
});


/**
 * finding if record exist
**/
route.use(function(req, res, next){
    return requestModule.findOne({_id:req.body.requestId})
        .then(function(doc){
            if(doc){
                res.locals.intrestedRequest = doc.toJSON();
                next();
            }
            else
                throw errors.record_not_exist();
        }, function(reject){
            console.log("reject", reject);
            res.json(reject);
        })
        .catch(next);
});


/**
 * middleware to check if requests has no partneres
 * if it has partners can not create intrest
**/
// route.use(function(req, res, next){
//     if(res.locals.intrestedRequest.partner && res.locals.intrestedRequest.partner.length > 0){
//         //res.json();   
//     }else{
//         next();
//     }
// });

/**
 * Check the owner ship is the owner of the user
**/

route.use(function(req, res, next){
    if(req.user._id.equals(res.locals.intrestedRequest.createdBy._id))
        throw errors.not_allowed().withDetails(messages.sameOwner);
    else
        next();  
});

/**
 * Check requests compatability
 * If Intrested request is travel shipment and request can be linked
 *      * if is shipment (Same Depp. and Arrival)
 * If Intrested request is shipment only travel can be linked (Same Depp. and Arrival)
 * If Intrested request is request only travel can be linked (Opp. Depp. and Arrival)
 */

route.use(function(req, res, next){
    var condition = {};
    if(res.locals.intrestedRequest.requestType === config.requestsType.travel){
        condition = {
            '_id':req.body.requestToLink,
            requestType: { $ne: config.requestsType.travel },
            arrivingAirpoart: res.locals.intrestedRequest.arrivingAirpoart,
            departingAirpoart: res.locals.intrestedRequest.departingAirpoart
        }
    }else{
        condition = {
            '_id':req.body.requestToLink,
            requestType: config.requestsType.travel,
            arrivingAirpoart: res.locals.intrestedRequest.arrivingAirpoart,
            departingAirpoart: res.locals.intrestedRequest.departingAirpoart
        }
    }
    condition.createdBy = req.user._id;
    return requestModule.findOne(condition)
        .then(function(doc){
            if(doc){
                next();
            }else{
                throw errors.can_not_link();
            }
        },function(reject){
            res.json(reject);
        })
        .catch(next);
});

/**
 * middleware to push the id of request which is to be linked with intrested req
 */
route.use(function(req, res, next){
var data = {
    requestId: req.body.requestId,
    userId: req.user._id,
    requestToLink: req.body.requestToLink
}
  return requestModule.addInterest(data)
    .then(function(doc){
        var response = {
            statusCode: 200,
            message: "Interest added succesfully!"
        }
        res.json(response);
        next();
    }, function(reject){
        res.json(reject);
    }).catch(next);
});

route.use(function(req, res, next){
    var recipents = []
    var sendEmailTo = JSON.parse(JSON.stringify(config.sparkPostRecipent));
     
    var user = req.user.toJSON();

    sendEmailTo.address.email = res.locals.intrestedRequest.createdBy.emailId;
    sendEmailTo.substitution_data ={};
 
    recipents.push(sendEmailTo);
    if(res.locals.intrestedRequest.createdBy && res.locals.intrestedRequest.createdBy.notificationPref.createInterest)
    {
    return sparkpost.sendEmail(recipents, config.sparkPostTemplates.createIntrest)
    .then(function(success){
        next();
    }, function(error){
        next();
    })
    .catch(next);
    }
    else{}

});