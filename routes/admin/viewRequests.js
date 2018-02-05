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


var route = new Route('post', '/admin/requests/:requestType');
var fields = ['departingAirpoart', 'departingDate', 'arrivingAirpoart', 'arrivingDate', 'requestType', 'isActive'];

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
        isActive: {type: 'boolean'},
        sort:{
            type:'object',
            properties:{
                departingDate: {type: 'number'}
            }
        },
        limit:{type: 'number'},
        skip:{type: 'number'},
        outputToCsv:{type: 'boolean'}
    }
});


route.use(function(req,res, next){
    var condition = req.body.filterObject ? utility.createRegexObject(req.body.filterObject.keyword, config.filterConditionRequest) : {};
    if(req.body.isActive !== undefined) condition.isActive = req.body.isActive;
    
    // if(req.body.filterObject){
    //     condition.departingDate = { $gte: req.body.filterObject.startDepartingDate || new Date(), $lte: req.body.filterObject.endDepartingDate};
    //     condition.arrivingDate = { $gte: req.body.filterObject.startArrivingDate || new Date(), $lte: req.body.filterObject.endArrivingDate};
    // }

    var options = {
      skip: req.body.skip,
      limit: req.body.limit,
      sort: req.body.sort
    };

    return requestModule.adminSearchAndPaginate(condition, options)
        .then(function(docs){
            if(docs){
                if(req.body.outputToCsv){
                    res.locals.data = docs.items;
                    next();
                }else{
                    var responce = {
                        statusCode: 200,
                        message: 'Records retrieved successfully',
                        data: docs
                    }
                    return res.json(responce);
                }
            } 
             else
                throw errors.no_records();
        })
        .catch(next);
});

route.use(function(req, res, next){
    var csv = json2csv({ data: res.locals.data, fields: fields });
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
