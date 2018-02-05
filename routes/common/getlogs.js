var Route = require('../../lib/Route');

var route = new Route('get', '/logs');

module.exports = route;

route.setPublic();

route.use(function(req, res, next){
    var filename = './send_it_api.log';
    res.download(filename);    
});