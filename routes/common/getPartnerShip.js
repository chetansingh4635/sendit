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

var route = new Route('get', '/secure/partnerShip/:partnerShipId');

module.exports = route;

route.allowUserTypes('User');

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
                    "partner._id": ObjectId(req.params.partnerShipId)
                }
            }
        ]

    return requestModule.aggregateResult(condition)
        .then(function(doc){
           if(doc && doc.length > 0){
               var responce = {
                   statusCode: 200,
                   messages: "Partnership record",
                   partnership: doc[0],
                   paymentDetails: utility.calculatePaymentDetails(doc[0].partner.amount)
               }
               res.json(responce);
           }
           else
                throw errors.invalid_partnership();
        }, function(reject){
            logger.error('Error partnership', 'Error in findrecord while getPartnership', reject);
        })
        .catch(next);
});