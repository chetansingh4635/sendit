//Route to get single request detail

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    requestModule = require('../../modules/request');
    _ = require('lodash')
    config = require('config');


var route = new Route('get', '/secure/:requestType/:_id');

module.exports = route;

route.allowUserTypes('User');

route.validateInputParams({
    type: 'object',
    properties: {
        requestType: {type: 'string'},
        _id: {type: 'string', format:'objectId'}
    },
    required: ['requestType','_id']
});

route.use(function(req, res, next){
    var condition = {
        requestType: config.requestsType[req.params.requestType],
        _id: req.params._id 
    }

    return requestModule.findOne(condition)
        .then(function(doc){           
            if(doc){
                 data = doc.toJSON();
                 var responce = {
                     statusCode: 200,
                     message: "Request result",
                     data: data
                 }                
                 return res.json(responce);
            }else{
               throw errors.record_not_exist();
            }
        }, function(reject){
            console.log("reject", reject);
        })
        .catch(next);
    
});

