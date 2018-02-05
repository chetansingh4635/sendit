var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    authModule = require('../../modules/auth/'),
    logger = require('../../lib/logger'),
    messages = require('../../resources/messages'),
    requestModule = require('../../modules/request/');

var route = new Route('put', '/admin/markInactive/:id');

module.exports = route;
route.allowUserTypes('Admin');


route.validateInputBody({
    type: 'object',
    properties: {
        'inActive':{type: 'boolean'},
    }
});

route.validateInputParams({
    type: 'object',
    properties: {
        id: {type:'string', format: 'objectId'}
    }
});

/**
 * Check if user have formed partnerships
 * if no do the operation
 * else throw error
 */
route.use(function(req, res, next){
    if(!req.body.inactive){
        next();
    }else{
        var condition = [
            {
                $unwind: '$partner'
            },
            {
                $match:{
                    'partner.partnerShipStatus':{$in: config.activePartnerships}
                }
            },
            {
                $match: {
                    $or:[
                        {'partner.userId': req.params.id},
                        {'createdBy': req.params.id}
                    ]
                }
            }
        ];
        return requestModule.aggregateResult(condition)
            .then(function(doc){
                if(doc){
                    throw errors.has_active_partnerships().withDetails(messages.can_not_delete_user);
                }else{
                    next();
                }
            }, function(reject){
                res.json(reject)
            })
            .catch(next);
    }
});

route.use(function(req, res, next){
    var condition = {
        '_id': req.params.id
    };
    var data = {
        isActive: !req.body.inActive
    };
    
    return userModule.updateProfile(condition, data)
        .then(function(doc){
            var responce = {
                statusCode: 200,
                message: 'User',
                user: doc
            }
            res.json(responce);
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});