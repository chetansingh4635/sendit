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
    _ = require('lodash');

var route = new Route('post', '/secure/updatePartnerShip');

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
        'status':{type: 'number', format: 'updatePartnerShipStatus'}
    },
    required: ['partnerShipId','status']
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
           if(doc && doc.length > 0)
                next();
           else
                throw errors.invalid_partnership();
        }, function(reject){
            res.json(reject);
        })
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
            'partner.$.partnerShipStatus':req.body.status
        }
    }

    return requestModule.updateRequest(condition, data)
    .then(function(doc){
        var responce = {
            statusCode: 200,
            data: doc
        }
    res.json(responce);
    }, function(reject){
        res.json(reject);
    })
    .catch(next);
});

