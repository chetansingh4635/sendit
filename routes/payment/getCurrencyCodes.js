/**
 * Route to get all curency codes
 * */
var Route = require('../../lib/Route'),    
route = new Route('get', '/curencyCodes');

module.exports = route;

route.setPublic();

route.use(function(req, res, next){
    res.json({
        statusCode: 200,
        data:{
            items:config.currency
        }
    })
});

