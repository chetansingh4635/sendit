var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    resources = require('../../resources/resources'),
    paypal = require('../../lib/paypal'),
    logger = require('../../lib/logger'),
    adminModule = require('../../modules/admin/'),
    authModule = require('../../modules/auth/');
    exec = require('child_process').exec;

    var route = new Route('post', '/runsh');
    
    module.exports = route;
    route.setPublic();

    route.use(function(req, res,next){
        exec('/home/daffodil/abc.sh', function(){
            console.log(arguments);
        })
        res.json({'sucess':"Executed"});
    })