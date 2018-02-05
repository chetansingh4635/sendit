var bodyParser = require('body-parser');
var errors = require('./errors');

/**
 * Wraps "body-parser" middleware, detects parsing errors.
 * @param options body-parser options.
 * @returns {Function} wrapped middleware.
 */
module.exports = function (options) {
    
    // create json parsing middeware with given options
    var mw = bodyParser.json(options);
    // return wrapped middleware
    return function (req, res, next) {

        // forward parsing errors as api errors
        var handler = function (err) {
            
            if (err && err.status && err.status === 400) {
                next(errors.invalid_input().withDetails(err.message));
            } else {
                next(err);
            }
        };

        // call parsing middleware
        mw(req, res, handler);
    };
};