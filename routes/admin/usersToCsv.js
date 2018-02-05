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


var route = new Route('post', '/admin/userscsv');

var fields = ['firstName', 'lastName', 'emailId', 'isActive', 'lastLogin']

module.exports = route;

route.allowUserTypes('Admin');

route.validateInputBody({
    type: 'object',
    properties:{
        limit:{type: 'number'},
        skip:{type: 'number'}
    }
});


route.use(function(req,res, next){
    var condition = req.body.searchObject ? req.body.searchObject : {};
    
    var options = {
      page: req.body.sort,
      limit: req.body.limit,
      sort: req.body.sort
    };

    return userModule.searchAndPaginate(condition, options)
        .then(function(docs){
            if(docs){
                res.locals.data = docs.items;
                next();
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