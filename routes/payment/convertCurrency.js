var Route = require('../../lib/Route'),
    errors = require('../../lib/errors'),
    paypal = require('../../lib/paypal'),
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('post', '/convertCurrency');

module.exports = route;

// public route
route.setPublic();


/**
 * middleware for payment for user in system.
 * input body should be all information of payment.
 * middleware response will be payment object.   
**/
route.use(function (req, res, next) {
    return paypal.convertCurrency(req.body)
        .then(function (response) {
            console.log(response);
            // reply with auth and user
            return res.json(response);
        }, function (reject) {
            console.log(reject);
            logger.error('create payment', 'Error in payment', reject);
            return res.json(reject);
        })
        .catch(next);
});
