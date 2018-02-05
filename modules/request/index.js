var _ = require('lodash');
var bcrypt = require('bcryptjs');
var RequestModel = require('./models/RequestModel');
var Promise = require('bluebird');
var utility = require('../../lib/utility');
var message = require('../../resources/messages');
var quires = require('../../resources/queries');


/**
 * Request module
 */
var requestModule = {};
module.exports = requestModule;

// full selection conditions for paths
//{ path: '', select: '_id name' }
var fullPopulate = [
    'partner',
    'createdBy'
];

/**
 * Method use for create a new travel.
 * input should of new Travel.
 * output should be either save data or failure, based on index on emailID key.
 * return User promise
**/
requestModule.save = function (data) {

    return RequestModel(data).save()
        .then(function (doc) {
            return doc;
        }, function (reason) {
            return reason;
        });
};

requestModule.aggregateResult = function(condition){
   return RequestModel.aggregate(condition)
                    .exec()
                    .then(function(docs){
                            return RequestModel.populate(docs, [{path: 'createdBy'},{path: 'partner.userId'},{path: 'partner.requestId'}], function(err, docs){
                               if(err) return null;
                               else return docs
                           })
                        },function(reason){
                        return null;
                    }); 
}


requestModule.updateRequest = function(condition,data){
    return RequestModel.findOneAndUpdate(condition,data, {new: true})
            .then(function (doc) {
                return doc;
            },function(reason){
                return reason;
            }); 
};

requestModule.searchAndPaginate = function(condition, options){
    options.populate = ['createdBy'];
    condition.isActive = true;
    return RequestModel.findPaginate(condition, options)
          .then(function(result){
                return result;
        }, function(reason){
            return reason;
        });
}

requestModule.adminSearchAndPaginate = function(condition, options){
    options.populate = ['createdBy'];
    return RequestModel.findPaginate(condition, options)
          .then(function(result){
                return result;
        }, function(reason){
            return reason;
        });

}

requestModule.findOne = function(condition){
    condition.isActive = true;
      return RequestModel.findOne(condition)
        .populate(quires.requestPopulation)
        .exec()
        .then(function (doc) {
            return doc;
        },function(reason){
            return reason;
        });
}

requestModule.addTravelInterest = function(data){
    return RequestModel.update({_id: data._id},
        {$addToSet: {userIntrested:{requestId: data.requestId}}})
        .then(function (doc) {
            return doc.ok ? data : null;
        }, function (reason) {
            return reason;
        });
}

requestModule.addInterest = function(data){
    return RequestModel.update({_id: data.requestId, 'userIntrested.userId' :{$ne: data.userId} },
        {$addToSet: {userIntrested:{userId: data.userId, requestId: data.requestToLink,disscussionId: data.disscussionId }}})
        .then(function (doc) {
            return doc.ok ? doc : null;
        }, function (reason) {
            return reason;
        });
}

/**
 * Method use to insert partner into
 * input should be data for register.
 * output should be either save data or failure, based on index on emailID key.
 * return User promise
**/
requestModule.insertPartner = function (condition, data) {
    return RequestModel.update(condition,
        {$addToSet:{partner: data}})
        .then(function (doc) {
            return doc.ok ? doc : null;
        }, function (reason) {
            return reason;
        });
};