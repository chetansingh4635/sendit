var uuid = require('uuid');
var crypto = require('crypto');
var AuthModel = require('./models/AuthModel');

// user module
var userModule = require('../user');
var adminModule = require('../admin')



/**
 * Auth module
 */
var authModule = {};
module.exports = authModule;

/**
 * Get auth for given auth token. Also updated the auth timestamp, which delays its expiry.
 * @param {String} token - auth token.
 * @return auth document promise.
 */
authModule.getAndUpdateForToken = function(token) {
  return AuthModel.findOneAndUpdate({
    authToken: token
  }, {
    createdAt: Date.now()
  }).exec();
};

/**
 * Generates a new auth for given user document.
 * @param {Document} user - user document.
 * @return auth document promise.
 */
authModule.createForUser = function(user, userProvider) {
  
  // user type
  var userType = user.constructor.modelName;

  //validate type
  ensureValidUserType(userType);

  // universally unique token
  var tokenId = uuid.v4();

  // auth document
  var auth = new AuthModel({
    userId: user._id,
    userType: userType,
    authToken: crypto.createHmac('sha1', user._id.toString()).update(tokenId).digest('hex'),
    socialToken: userProvider.token,
    providerType: userProvider.providerType
  });

  // save auth
  return auth.save();
};







// valid user types: model names of different user types in app
var validUserTypes = [userModule.userType, adminModule.userType];

/**
 * Ensure given type is one of valid user types.
 * Throws error is any other type is provided.
 */
function ensureValidUserType(type) {
  if (validUserTypes.indexOf(type) < 0) {
    throw new Error('Invalid user model. Should be one of: ' + validUserTypes.join(','));
  }
}

/**
 * Get user document for user type and id denoted by given auth document.
 * @param {Document} auth - auth document.
 * @returns user document promise.
 */
authModule.getUserForAuth = function(auth) {

  // validate type
  ensureValidUserType(auth.userType);

  // get user document according to user model
  switch (auth.userType) {

    case adminModule.userType:
      // admin user
      return adminModule.findUser(auth.userId);
    case userModule.userType: 
      // userc
      return userModule.findUser(auth.userId);
      
    default:
      // no such user model exists, check above mapping is correct or if wrong model name saved as user type in auth.
      throw new Error('Invalid user_type set in auth:' + auth.userType);
  };
};




/**
 * Method use for updating auth token.
 * input will be user object.
 * userType will get from modelName of customer.
 * A hash generate for auth token.
 * return will be updated auth token.
**/
authModule.updateTokenForSignin = function(user){

  var userType = user.constructor.modelName;
  var tokenId = uuid.v4();

  return AuthModel.findOneAndUpdate({userId: user._id},
   { 
    authToken: crypto.createHmac('sha1', user._id.toString()).update(tokenId).digest('hex'),
    userType:userType
  },
  {new:true,upsert:true}).exec();
};
