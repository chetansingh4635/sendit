var Route = require('../../lib/Route'),
    errors = require('../../lib/errors'),
    paypal = require('../../lib/paypal'),
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    logger = require('../../lib/logger');

var route = new Route('get', '/pay/detail/:payKey');

module.exports = route;

// public route
route.setPublic();


/**
 * middleware for get details of payment.
 * request params contain the paykey
 * middleware response will be payment object.   
**/
route.use(function (req, res, next) {
    return paypal.getPayDetail({payKey : req.params.payKey})
        .then(function (response) {console.log(response);
            // reply with auth and user
            return res.json(response);
        }, function (reject) {console.log(reject);
            logger.error('payment detail', 'Error in payment', reject);
            return res.json(reject);
        })
        .catch(next);
});
