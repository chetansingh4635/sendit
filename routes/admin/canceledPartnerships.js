var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    authModule = require('../../modules/auth/'),
    logger = require('../../lib/logger'),
    json2csv = require('json2csv'),
    crypto = require('crypto'),
    fs = require('fs'),
    requestModule = require('../../modules/request/');


var route = new Route('post', '/admin/canceledPartnerships');

module.exports = route;
route.allowUserTypes('Admin');

route.validateInputBody({
    type: 'object',
    properties:{
        filterObject:{type:'object',
            properties:{
                keyword: {type: 'string'},
                startDepartingDate:{type: 'date'},
                endDepartingDate:{type: 'date'},
                startArrivingDate:{type: 'date'},
                endArrivingDate:{type: 'date'}
            }
        },
        sort:{type:'object',
            properties:{
                departingDate: {type: 'number'}
            }
        },
        limit:{type: 'number'},
        skip:{type: 'number'},
        outputToCsv: {type: 'boolean'}
    }
});

/**
 * Query to count total records
 */

route.use(function(req, res, next){
    res.locals.filterObject = req.body.filterObject ? utility.createRegexObject(req.body.filterObject.keyword, config.filterConditionRequest) : {}; 
       var condition = [
       {
           $match: res.locals.filterObject
       },
       {
           $unwind:'$partner'
        },
        {
            $match: {'partner.status': config.partnershipStatus.canceled}
        }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(docs){
            res.locals.total_count = docs.length;
            next();
        }, function(reject){
            logger.error('aggregateResult', 'Error in fetching all payments', reject);
            res.json(reject);
        })
        .catch(next);
});


route.use(function(req,res, next){
    var condition = [
       {
           $match: res.locals.filterObject
       },
       {
           $unwind:'$partner'
        },
        {
            $match: {'partner.status': config.partnershipStatus.canceled}
        },
        {
            $skip: req.body.skip || 0
        },
        {
            $limit: req.body.limit > 0 ? req.body.limit : 10
        },
        {
            $sort: req.body.sort || {'_id': 1}
        }
    ];

    return requestModule.aggregateResult(condition)
        .then(function(docs){
            if(req.body.outputToCsv){
                res.locals.data = docs;
                next();
            }else{
                var responce = {
                    statusCode: 200,
                    message: "Records retrived success",
                    data:{
                        items: docs,
                        total_count: res.locals.total_count,
                        limit: req.body.limit,
                        skip: req.body.skip
                    }
                }
                res.json(responce);
            }
        }, function(reject){
            logger.error('aggregateResult', 'Error in fetching all payments', reject);
            res.json(reject);
        })
        .catch(next);
});

route.use(function(req, res, next){
    var csv = json2csv({ data: res.locals.data, fields: config.csvFields });
    var fileName = './csv/' + crypto.randomBytes(20)
                    .toString('hex') // convert to hexadecimal format
                     + '.csv';

    if (!fs.existsSync('./csv')){
        fs.mkdirSync('./csv');
    } 

    fs.writeFile(fileName  , csv, function(err){
             if(err){
                 return res.send(err);
             }else{
                 return res.download(fileName);
             }
        });
});