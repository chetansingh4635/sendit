var _ = require('lodash');
var resources = require('../resources/resources');
var authModule = require('../modules/auth');
var Promise = require('bluebird');
var errors = require('./errors');

/**
 * Function to validate a provided auth token.
 * Returns a Promise of auth check results object, which has following properties:
 *   1. isAnonymous : true if anonymous access is allowed. No user info is resolved in this case.
 *   2. userType : type of user authenticated.
 *   2. user : authenticated user document.
 * 
 * @param {String} authToken - auth token
 * @param {String[]} userTypes - array of allowed user types.
 * @param {String[]} permissions - array of permissions required to be present on user.
 * @param {Boolean} isPublic - true to allow anonymous (no token) access, false other wise.
 * 
 * @return {Promise} - Promise of  auth check result. 
 */
function authCheck(authToken, userTypes, permissions, isPublic) {
    
    // promise a result object
    return new Promise(function (resolve, reject) {
        
        // auth check result
        var result = {};

        // if token not provided
        if (!_.isString(authToken)) {

            if (isPublic) {
                // mark as anonymous
                result.isAnonymous = true;
                
                // nothing more to do
                return resolve(result);
            } else {
                // no auth token found
                return reject(errors.invalid_auth());
            }
        }
        // try ping auth in db
        authModule.getAndUpdateForToken(authToken) 
            .then(function (auth) { 
                if (auth) {
                    
                    // save user type in result
                    result.auth = auth;

                    if (userTypes.indexOf(auth.userType) < 0) {
                        // auth user type not in allowed user types of this route
                        throw errors.invalid_access().withDetails('User type: ' + auth.userType + ' is not allowed access.');
                    }
                 
                    // get user document according to auth
                    return authModule.getUserForAuth(auth);

                } else {
                    
                    // no such auth in db
                    throw errors.invalid_auth().withDetails('Auth token is invalid.');
                }
            }).then(function (usrDoc) { 
                if (usrDoc) {
                    
                    // save user doc in result
                    result.user = usrDoc;
                
                    // check accountEnabled status in user document
                    if (usrDoc.accountEnabled === false) {
                        throw errors.account_disabled().withDetails('User account is disabled.');
                    }

                    if (permissions.length < 1 || _.intersection(permissions, usrDoc.permissions).length === permissions.length) {
                        // no permissions defined, or all permissions match: proceed
                        return result;
                    } else {
                        // all permissions do not match
                        throw errors.invalid_permission().withDetails('Require ' + permissions.length + ' permission(s).');
                    }
                } else {
                    
                    // something wrong internally
                    throw new Error('No user could be resolved from auth');
                }
            })
            .then(resolve)
            .catch(reject);

    });
}

// export
module.exports = authCheck;
