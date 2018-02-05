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

var route = new Route('post', '/secure/removeIntrest');

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
        'requestId':{type: 'string', format: 'objectId'}
    },
        required: ['requestId']
});

/**
 * check if request exists
 * if exist route to next middleware else throw error
 */
route.use(function(req, res, next){
    var condition = {
        _id:req.body.requestId
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
                "userIntrested.userId":ObjectId(req.user._id)
            }
        }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(doc){
            if(doc.length > 0){
                res.locals.partnerShip = doc[0];
                next();
            }else{
                throw errors.allready_not_intrested();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});

/**
 * Check if partnerShip has made or not
 */
route.use(function(req, res, next){
    if(res.locals.partnerShip.partner.length > 0 && res.locals.partnerShip.partner[0].userId._id === req.user._id){
        res.json(errors.already_had_partner);
    }else{
        next();
    }
});

/**
 * Update the request remove the object of interested user
 * input will be the requestId
 */

route.use(function(req, res, next){
    var condition = {
        _id: req.body.requestId
    }
    var data = 
        {
            "$pull":{
                userIntrested:{
                    userId:ObjectId(req.user._id)
                }
            }
        }

    return requestModule.updateRequest(condition,data)
        .then(function(doc){
            if(doc){
                res.json({
                    statusCode:200,
                    request: doc,
                    messages: "Intrest removed successfully!"
                })
            }else{
                throw errors.internal_error();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});