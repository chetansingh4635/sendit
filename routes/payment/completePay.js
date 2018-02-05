var Route = require('../../lib/Route'),
    errors = require('../../lib/errors'),
    paypal = require('../../lib/paypal'),
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('post', '/pay/excute');

module.exports = route;

// public route
route.setPublic();

/**
 * validate input request.
 * properties should be expected input.
 * required should be mandatory field for input request.
 * on success of validation, response should route to next middleware. 
 * method create date: 09/09/2016
**/
route.validateInputBody({
    type: 'object',
    properties: {
        payKey: { type: 'string', format: 'nonEmptyOrBlank' },
        currencyCode: { type: 'string' }
    },
    required: ['payKey']
});

/**
 * middleware for payment for user in system.
 * input body should be all information of payment.
 * middleware response will be payment object.   
**/
route.use(function (req, res, next) {
    return paypal.completePayment(req.body)
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
