var _ = require('lodash');
var bcrypt = require('bcryptjs');
var UserModel = require('./models/UserModel');
var Promise = require('bluebird');
var utility = require('../../lib/utility');
var message = require('../../resources/messages');

/**
 * User module
 */
var userModule = {};
module.exports = userModule;

/**
 * User type.
 */
userModule.userType = UserModel.modelName;

// full selection conditions for paths
//{ path: '', select: '_id name' }
var fullPopulate = [

];

/**
 * Method use for find the user.
 * input should query based for searching.
 * output should be either find data or null document.
 * return User promise
**/
userModule.findUser = function (data) {
    return UserModel.findOne(data)
        .populate(fullPopulate)
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};

/**
 * Method use for update user data.
 * input should condition and data to update.
 * output should be either nModified=1 or nModified=0.
 * return User promise
**/
userModule.updateProfile = function (condition, data) {
    return UserModel.update(condition, data)
        .populate(fullPopulate)
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return null;
        });

};





/*
 * Get User for given email and password.
 * @param {String} email - user email.
 * @param {String} password - user password.
 * @return User promise.
 */
userModule.getUserForLogin = function (email, password) {
    // find one by email
    return UserModel.findOne({ emailID: email })
        .populate(fullPopulate)
        .select('+password')
        .exec()
        .then(function (doc) {
            if (doc && _.isString(doc.password)) {
                // compare password
                return bcrypt.compareSync(password, doc.password) ? doc : null;
            } else {
                // no such document
                return null;
            }
        });
};

/**
 * Method use for register the user.
 * input should be data for register.
 * output should be either save data or failure, based on index on emailID key.
 * return User promise
 * if signup for firt time create a new record instead create a new provider record
**/
userModule.signUp = function (data) {



    return UserModel(data).save()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            console.log("reason", reason);
            return reason;
        });
};





/**
 * Method use for update user data.
 * input should condition and data to update.
 * output should be either update and return updated document or not update.
 * return User promise
**/
userModule.findAndUpdateProfile = function (condition, data) {
    return UserModel.findOneAndUpdate(condition, data, { new: true })
        .populate(fullPopulate)
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};


userModule.aggregateResult = function (condition, groupOn) {
    return UserModel.aggregate(condition, groupOn)
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};


userModule.findAllUser = function (data, options) {
    return UserModel.find(data, options)
        .populate(fullPopulate)
        .lean()
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};


/**
 * Method use for find the user.
 * input should query based for searching.
 * output should be either find data or null document.
 * return User promise
**/
userModule.findBySocialId = function (data) {
    return UserModel.findOne({'userProvider.providerType':data.providerType, 'userProvider.socialId':data.socialId})
        .populate(fullPopulate)
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};

/**
 * Method use for find the user.
 * input should query based for searching.
 * output should be either find data or null document.
 * return User promise
**/
userModule.find = function (data) {
    return UserModel.findOne(data)
        .populate(fullPopulate)
        .exec()
        .then(function (doc) {
            return doc ? doc.toJSON() : null;
        }, function (reason) {
            return reason;
        });
};

/**
 * Method use for update user data.
 * input should condition and data to update.
 * output should be either nModified=1 or nModified=0.
 * return User promise
**/
userModule.updateToken = function (condition, data) {
    return UserModel.update(condition, data)
        .populate(fullPopulate)
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};



/**
 * Method use for register the user.
 * input should be data for register.
 * output should be either save data or failure, based on index on emailID key.
 * return User promise
**/
userModule.insertProvider = function (data, emailId) {
    return UserModel.update({emailId:emailId},
        {$addToSet: {userProvider:data}})
        .then(function (doc) {
            return doc.ok ? doc : null;
        }, function (reason) {
            return reason;
        });
};


/**
 * Method to update the user profile
 * Input shuld be data user data which needs to be updated
 * output should be either no of records updated
 */

userModule.updateProfile = function(condition, data){
    return UserModel.findOneAndUpdate(condition,data, {new: true})
        .then(function(doc){
            return doc;
        }, function(reason){
            return reason;
        })
};

/**
 * Method to update the user profile
 * Input shuld be data user data which needs to be updated
 * output should be either no of records updated
 */

userModule.updatePref = function(condition, data){
    return UserModel.update(condition,{
        $set: {'notificationPref': data}        
        })
        .then(function(doc){
            return doc.ok ? doc : null;
        }, function(reason){
            return reason;
        })
};

/**
 * Method to fetch the users list
 * Input should be condition with isActive
 * output should be either no of records or null
 */

userModule.searchAndPaginate = function(condition, options){
    return UserModel.findPaginate(condition, options)
          .then(function(result){
                return result;
        }, function(reason){
            return reason;
        });
}
