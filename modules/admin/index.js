var _ = require('lodash');
var bcrypt = require('bcryptjs');
var AdminModel = require('./models/AdminModel');
var Promise = require('bluebird');
var utility = require('../../lib/utility');
var message = require('../../resources/messages');


/**
 * Admin module
 */
var adminModule = {};
module.exports = adminModule;

/**
 * User type.
 */
adminModule.userType = AdminModel.modelName;

adminModule.findUser = function (data) {
    return AdminModel.findOne(data)
        .populate([])
        .exec()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};