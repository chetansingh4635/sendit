var mongoose = require('mongoose');
var _ = require('lodash');


var emailRegexp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * Extra formats for tv4 JSON schema validator.
 */
module.exports = {

    'email': function (data) {
        var valid = _.isString(data) && emailRegexp.test(data);
        return valid ? null : 'Should be an email address.';
    },

    'date': function (data) {
        var valid = (_.isFinite(data) || _.isString(data) || _.isDate(data));
        valid = valid && new Date(data).toString() !== 'Invalid Date';
        return valid ? null : 'Should be a date.';
    },

    'objectId': function (data) {
        return mongoose.Types.ObjectId.isValid(data) ? null : 'Should be an object id.';
    },

    'nonEmptyOrBlank': function (data) {
        return (data.length > 0 && !/^\s+$/.test(data)) ? null : 'Should not be empty or blank.';
    },

    'mobileNumber': function (data) {
        return /^[\s\S]{9,10}$/.test(data) ? null : 'Should be a mobile number.';
    },

    'numberString': function (data) {
        return !isNaN(data) ? null : 'Should be a convertible number';
    },

    'booleanString': function (data) {
        return data === true || data === false ? null : 'Should be a convertible boolean';
    },

    'website': function (data) {
        return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(data) ? null : 'Should be a valid web url.'
    },

    'requestOrShipment': function(data){
        return data === 'request' || data === 'shipment' ? null : 'Should be a request or shipment';
    },

    'updatePartnerShipStatus': function(data){
        return config.updatePartnerShipStatus.indexOf(data) >= 0 ? null : 'Wrong Status'
    },

    'currency': function(data){
        return config.currency.indexOf(data) >= 0 ? null : 'Invalid currency code'
    }
}