var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var path = require('path');
var tv4 = require('tv4');
var errors = require('./errors');
var authModule = require('../modules/auth');
var authCheck = require('./authCheck');

/**
 * Defines a request handling route. A route can: 
 * 1. Handle HTTP requests for a particular url path with particular HTTP method.
 * 2. Enforce access on requests, by user type and further by permissions, if required.
 * 3. Enriches request with current "user" property on authentication.
 * 4. Validate and filter request input including request body, query and path params.
 * 5. Chain arbitrary express middleware for handling the request.
 *  
 * @param {String} method - HTTP method. E.g. 'get', 'post' etc.
 * @param {String} path - Request route path. E.g. '/users/:id'.
 * @constructor
 */
function Route(method, path) {

    if (_.isString(method)) {
        // method should be lower case
        method = method.toLowerCase();
    }

    if (!_.includes(Route.REQUEST_METHODS, method)) {
        // not a valid method name
        throw new Error("Method must be one of:[" + Route.REQUEST_METHODS.join(",") + "]");
    }

    if (!_.isString(path) || path.length < 0) {
        // not a valid path
        throw new Error("Path must be a String");
    }

    // route data members
    this.middlewares = [];
    this.method = method;
    this.path = path;
    this.userTypes = [];
    this.permissions = [];
    this.isPublic = false;
    this.inputSchema = {};
};

// Inherits from Object
util.inherits(Route, Object);

/**
 * Route class.
 * @type {Route}
 */
module.exports = Route;

/**
 * Allowed HTTP methods for Route.
 * @type {string[]}
 */
Route.REQUEST_METHODS = ['get', 'post', 'put', 'delete', 'head'];

/**
 * Use one or more middleware on this route. Multiple middleware can be provided as arguments to this function.
 * @param {function} middleware - middleware function(s). 
 * @return route object.
 */
Route.prototype.use = function () {

    // iterate arguments
    for (var i = 0; i < arguments.length; i++) {
        var mw = arguments[i];

        if (_.isFunction(mw)) {
            // collect to middlewares
            this.middlewares.push(mw);
        } else {
            // not a function
            throw new Error("Arguments should be middleware functions");
        }
    }

    // return for chained calls
    return this;
};


/**
 * Make route require one or more authenticated user type (user model name, case sensitive). 
 * Multiple types can be provided as arguments to this function.
 * @param {String} userType - user type(s).
 * @return route object. 
 */
Route.prototype.allowUserTypes = function () {
    
    // iterate arguments
    for (var i = 0; i < arguments.length; i++) {
        var userType = arguments[i];

        if (_.isString(userType)) { 
            // add user type if not already added
            if (this.userTypes.indexOf(userType) < 0) {
                this.userTypes.push(userType);
            }
        } else {
            // not a string
            throw new Error("Arguments should be user type Strings.");
        }
    }
    
    // return for chained calls
    return this;
};

/**
 * Make route require ALL of given access permissions to be present in calling user. 
 * Multiple permissions can be provided as arguments to this function. 
 * Note: Must set at least one user type first.
 * @param {String} permission - access permission(s).
 * @return route object. 
 */
Route.prototype.requirePermissions = function () {

    if (this.userTypes.length < 1) {
        // permissions check requires a user type check to be set first.
        throw new Error("At least one user type must be set to use permissions. Use allowUserTypes() to set user types first.");
    }

    // iterate arguments
    for (var i = 0; i < arguments.length; i++) {
        var permission = arguments[i];

        if (_.isString(permission)) {
            // add permission if not already added
            if (this.permissions.indexOf(permission) < 0) {
                this.permissions.push(permission);
            }
        } else {
            // not a string
            throw new Error("Arguments should be permission Strings.");
        }
    }
    
    // return for chained calls
    return this;
};


/**
 * Set route as publicly accessible.
 * @return route object. 
 */
Route.prototype.setPublic = function () {

    // mark public
    this.isPublic = true;
    
    // return for chained calls
    return this;
};

/**
 * Set the route to validate request body JSON with given tv4 validator schema.
 * @param {Object} schema - validation schema.
 * @return route object. 
 */
Route.prototype.validateInputBody = function (schema) {

    if (!_.isObject(schema)) {
        // not an object
        throw new Error("Schema must be an Object");
    }

    // set body validation schema
    this.inputSchema.body = schema;
    
    // return for chained calls
    return this;
};

/**
 * Set the route to validate request query JSON with given tv4 validator schema.
 * @param {Object} schema - validation schema.
 * @return route object. 
 */
Route.prototype.validateInputQuery = function (schema) {

    if (!_.isObject(schema)) {
        // not an object
        throw new Error("schema must be an Object");
    }

    // set query validation schema
    this.inputSchema.query = schema;
    
    // return for chained calls
    return this;
};

/**
 * Set the route to validate request path params JSON with given tv4 validator schema.
 * @param {Object} schema - validation schema.
 * @return route object. 
 */
Route.prototype.validateInputParams = function (schema) {

    if (!_.isObject(schema)) {
        // not an object
        throw new Error("schema must be an Object");
    }

    // set path params validation schema
    this.inputSchema.params = schema;
    
    // return for chained calls
    return this;
};

/**
 * Mount this route on given express Router.
 * @param {Object} router - express Router.
 */
Route.prototype.mount = function (router) {
    
    // middlewares to mount
    var mountMiddlewares = [];

    if (!this.isPublic && this.userTypes.length < 1) {
        // enforce route access to be explicitly defined.
        throw new Error('Access not configured for route. Use allowUserTypes() and/or setPublic() to do so.');
    }

    if (this.userTypes.length > 0) {
        // add access check
        mountMiddlewares.push(_.partial(checkAuth, this.userTypes, this.permissions, this.isPublic));
    }

    var self = this;
    _.keys(this.inputSchema).forEach(function (key) {
        // add request key schema validation
        mountMiddlewares.push(_.partial(validateRequestData, self.inputSchema[key], key));
    });

    // append route middlewares
    mountMiddlewares = mountMiddlewares.concat(this.middlewares);
    
    // mount route on provided router.
    router[this.method](this.path, mountMiddlewares);
};

/**
 * Enforces request to have a valid auth token, and for given permissions.
 * If passed, the request is enriched with current user and userType, or anonymous flag.
 * @param {String[]} userTypes - userTypes array.
 * @param {String[]} permissions - permissions array.
 * @param {Boolean} isPublic - public flag.
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function(err)} next - express next.
 */
function checkAuth(userTypes, permissions, isPublic, req, res, next) {

    // get auth token from header, or query string
    var authToken = req.get('auth_token') || _.get(req.query, 'auth_token');

    return authCheck(authToken, userTypes, permissions, isPublic)
        .then(function (result) {
            
            // populate request with result
            _.assign(req, result);
            
            // proceed
            return next();
        })
        .catch(next);
};

/**
 * Applies request body JSON avlidation as per schema.
 * @param {Object} schema - validation schema.
 * @param {String} key - request property to validate.
 * @param {Object} req - express request.
 * @param {Object} res - express response.
 * @param {function(err)} next - express next.
 */
function validateRequestData(schema, key, req, res, next) {
    // make validation
    var data = req[key];
    var result = tv4.validateResult(data, schema, false, true);

    if (result.valid) {
        next();
    } else {
        _.unset(result, 'error.stack');
        _.unset(result, 'error.schemaPath');        
        // not valid, send error with validation issues as details
        next(errors.invalid_input().withDetails(result));
    }
};