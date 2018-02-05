var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var tv4 = require('tv4');
var utility = {};
var mongoose = require('mongoose');
var config = require('config');
const crypto = require('crypto');
var moment = require('moment');

module.exports = utility;

/**
 * Synchronously and recursively walk the given directory and load modules of given type.
 * Provided handler is called for each loaded module.
 * Note: All modules in directory should be of given type.
 * 
 * @param {String} rootPath - directory to walk.
 * @param {function} type - module class for "instance of" matching.
 * @param {function(*)} handler - module load handler.
 */
utility.walkModulesSync = function (rootPath, type, handler) {
    
    // read directory
    var files = fs.readdirSync(rootPath);

    // interate files
    for (var i = 0; i < files.length; i++) {

        var filePath = path.join(rootPath, files[i]);
        
        // stat file
        var stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // recurse into sub directory
            utility.walkModulesSync(filePath, type, handler);

        } else if (!_.startsWith(files[i], '.')) {
            // load module
            var module = require(filePath);

            if (module instanceof type) {
                // module of correct type
                handler(module);
            } else {
                // module of wrong type
                throw new Error('Invalid module type found:' + (typeof module) + '. Required: ' + (typeof type));
            }
        }
    }
};


/**
 * Numeric characters string: 0-9.
 * @type {string}
 */
utility.NUMERIC = '0123456789';


/**
 * Generate a string of given length of random numeric digits.
 * @param {Number} length - desired output length. Must be > 0;
 * @return {string} generated output string.
 */
utility.randomNumeric = function (length) {
    if (!_.isNumber(length) || length < 1) {
        throw new Error("length should be a non zero number.");
    }

    var random = [];
    for (var i = 0; i < length; i++) {
        random.push(utility.NUMERIC[_.random(0, utility.NUMERIC.length - 1)]);
    }

    return random.join("");
};

/**
 * Returns a tv4 validation result for given schema and data.
 * Returned result.valid will be true if validation passes.
 * If result.valid is not true, result is validation failure error.
 * @Param {Object} schema = tv4 schema 
 * @Param {*} data = data to validate 
 */
utility.validateData = function (schema, data) { 
    // make validation
    var result = tv4.validateResult(data, schema, false, true);
    _.unset(result, 'error.stack');
    _.unset(result, 'error.schemaPath');
    return result;
};

/**
 * Transform list to paginated response.
 * @param {Array} results - results of fetched record.
 * @param {Number} skip - number of skipped item.
 * @param {Number} limit - number of limit.
 * @return {Object} paginated data
 */
utility.transformReslutsToPaginated = function(results, skip, limit) {

    // result object
    var resObj = {
        skip: _.isFinite(skip) ? skip : 0,
        limit: _.isFinite(limit) ? limit : 25,
        items: results,
        hasPrev: skip > 0,
        hasNext: false
    };

    if (_.isArray(results) && results.length > limit) {
        // more result are available.
        resObj.hasNext = true;
        resObj.items.pop();
    }
    
    resObj.item_count = resObj.items.length;
    
    return resObj;
};


/**
 * convert array of string ids to array of object ids
 * @params {Array} - array of string ids
 * @return {Array} array of object ids
 */
utility.convertStringIdsToObjectIds = function(ids){
    return _.map(ids, function(id){
        return new mongoose.Types.ObjectId(id);
    });
};


/**
 * encrypt input text for password.
**/
utility.encrypt = function(text){
    
  var cipher = crypto.createCipher(config.algorithm,config.password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
};

/**
 * decrypt the database passord
**/
utility.decrypt = function(text){
  var decipher = crypto.createDecipher(config.algorithm,config.password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
};


utility.compareAirportsAndDates = function(type, intrested, linked){
    //Type true then match else opp.
    if(type){
        return intrested.departingAirpoart === linked.departingAirpoart &&
        intrested.arrivingAirpoart === linked.arrivingAirpoart &&
        (new Date(intrested.arrivingDate)).getTime() === (new Date(linked.arrivingDate)).getTime() &&
        (new Date(intrested.departingDate)).getTime() === (new Date(linked.departingDate)).getTime();
    }else{
        return intrested.departingAirpoart === linked.arrivingAirpoart &&
        intrested.arrivingAirpoart === linked.departingAirpoart &&
        (new Date(intrested.arrivingDate)).getTime()  === (new Date(linked.departingDate)).getTime() && 
        (new Date(intrested.departingDate)).getTime() === (new Date(linked.arrivingDate)).getTime();
    }
}

// utility.createRegex = function(data){
//     data = "/." + data + "*/";
//     return { $regex:  data};
// };

utility.createRegexObject = function(value, object){
    var condtion = {
        $or:[]
    };
    
    // if (!_.isObject(data)) {
    //     // not an object
    //     throw new Error("data must be an Object");
    // }

    _.each(object, function(data, key){
        var fieldQuery = {};
        fieldQuery[key] = {$regex: RegExp(value, "i")}
        condtion.$or.push(fieldQuery);
    });

    // _.each(data, function(value, key){
    //     object[key] = {$regex: RegExp(value, "i")}
    // });

    return condtion;

};

utility.travellerAmount = function(totalAmount){
    return totalAmount*config.travellerShare;
}

utility.compareDates = function(departingDate, arrivingDate, offset){
    var todayDate = moment().startOf('day');
    var departingDate = moment(departingDate).utcOffset(offset);
    var arrivingDate = moment(arrivingDate).utcOffset(offset);
    return todayDate.isBefore(departingDate) || todayDate.isSame(departingDate) && departingDate.isBefore(arrivingDate) || departingDate.isSame(arrivingDate);
}

utility.calculatePaymentDetails = function(amount){
    var paymentDetail = {};
    paymentDetail.senditAmount = amount - amount*config.travellerShare;
    paymentDetail.paypalFee =  (amount*config.travellerShare)*config.paypalFee/100 + config.paypalFixed;
    return paymentDetail;

}
utility.handleDiscourseError = function(error){
   if(error.email && error.values)
      return error.values.username;
   else
     return null;

}