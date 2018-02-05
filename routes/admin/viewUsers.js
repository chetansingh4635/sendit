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
    userModule = require('../../modules/user/');


var route = new Route('post', '/admin/users');

module.exports = route;
var fields = ['firstName', 'lastName', 'emailId', 'isActive', 'lastLogin']

route.allowUserTypes('Admin');

route.validateInputBody({
    type: 'object',
    properties:{
        searchObject:{type: 'object',
            properties:{
                keyword: {type: 'string'}
            }
        },
        isActive: {type: 'boolean'},
        limit:{type: 'number'},
        skip:{type: 'number'},
        outputToCsv:{type: 'boolean'}
    }
});

route.use(function(req,res, next){
    var condition = req.body.searchObject ? utility.createRegexObject(req.body.searchObject.keyword, config.filterConditionUser) : {};
    if(req.body.isActive !== undefined) condition.isActive = req.body.isActive;


    var options = {
      skip: req.body.skip,
      limit: req.body.limit
    };

    return userModule.searchAndPaginate(condition, options)
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