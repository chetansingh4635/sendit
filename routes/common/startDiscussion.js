/**
 * Route to start a discussion with intrested member
 */

var Route = require('../../lib/Route'),
Promise = require("bluebird"),
    errors = require('../../lib/errors'),  
    utility = require('../../lib/utility'),
    Discourse = require('../../lib/discourse'),
    config = require('config'),
    _ = require('lodash'),
    messages = require('../../resources/messages'),
    sparkpost = require('../../lib/sparkpost'),
    crypto = require('crypto'),
    logger = require('../../lib/logger'),
    ObjectId = require('mongoose').Types.ObjectId,
    requestModule = require('../../modules/request');

var route = new Route('post', '/secure/startDiscussion');

module.exports = route;

route.allowUserTypes('User');

var discourse = new Discourse(config.discourseUrl, config.apiKeys.discourse, 'senditdeveloper');

route.validateInputBody({
    type: 'object',
    properties: {
        "userId":{type: 'string', format: 'objectId'},
        "requestId":{type: 'string', format: 'objectId'},
        "disscussionTitle": {type: 'string'},
        "disscussionTopic": {type: 'string'}
    },
    required:['userId','requestId', 'disscussionTitle', 'disscussionTopic']
});


/**
 * middleware to check if intrest has been created if not throw error
 * else route to next middleware
 */

route.use(function(req, res, next){
      var condition = {
        "_id": req.body.requestId
        }
    return requestModule.findOne(condition)
        .then(function(doc){
            if(doc){
                res.locals.request = doc;
                next();
            }else{
                throw errors.no_record_found();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});

/**
 * middleware to check the owner ship of the request
 * to start a disscusion user should be the creator of the request
 */

route.use(function(req, res, next){
    if(req.user._id.equals(res.locals.request.createdBy._id)){
        next();
    }else{
        res.json(errors.not_allowed());
    }
});

/**
 * middleware to check if user has expressed the intrest on the request
 * else throw error 
 */

route.use(function(req, res, next){
    var condition = [
            {
                '$match':{
                    "_id": ObjectId(req.body.requestId)
                }
            },
            {
                '$unwind': '$userIntrested'
            },
            {
                '$match': {
                    'userIntrested.userId': ObjectId(req.body.userId)
                }
            }
        ]
    return requestModule.aggregateResult(condition)
        .then(function(doc){
            if(doc.length){
                if(doc[0].userIntrested.disscussionId) {
                    return res.json({
                        statusCode: 200,
                        message: "Disscussion allready created",
                        disscussionUrl: config.discourseUrl + 't/' + doc[0].userIntrested.disscussionId
                    })
                }else{
                    res.locals.request = doc[0];
                    next();
                }

            }else{
                throw errors.person_not_intrested();
            }
        }, function(reject){
            res.json(reject);
        })
        .catch(next);
});

/**
 * middleware to find email of the intrested user
 */

route.use(function(req, res, next){
     return userModule.findUser({ _id: req.body.userId })
        .then(function (doc) {
            if (doc) {
                res.locals.intrestedUser = doc;
                next();
            } else {
                // User is not found 
                // Send error message to client
                res.send(errors.record_not_exist());
            }
        }, function (reject) {
            logger.error('findUser', 'Error in findUser while login', reject);
            return res.json(reject);
        })
        .catch(next);
});


/**
 * route api to verify if intrested user exist
 * at discourse
**/
route.use(function(req, res, next){
    var indexOfAt = res.locals.intrestedUser.emailId.indexOf('@');
    discourse.getUser(res.locals.intrestedUser.emailId.substring(0, indexOfAt), function(error, success){
        if(!error) {
            res.locals.discourseIntrested = success.user;
            //res.locals.discourseIntrested.username = res.locals.intrestedUser.emailId.substring(0, indexOfAt);
        }
            next();
    }, function(){
        return res.json(errors.discourse_error());
    }); 
});


/**
 * Creating a user at discourse for intrested user if not exist
 * else route to next middleware
 */
route.use(function(req, res, next){
    var indexOfAt = res.locals.intrestedUser.emailId.indexOf('@');
    /**
     * Crearing a random password
    **/  
    var password = crypto.randomBytes(12)
                    .toString('hex');
    if(res.locals.discourseIntrested){
        next();
    }else{
        discourse.createUser(res.locals.intrestedUser.firstName, res.locals.intrestedUser.emailId, password, function(error, success){
            if(success && success.body && success.body.success ){
                res.locals.discourseIntrested = success.body;
                res.locals.discourseIntrested.password = password;
                res.locals.discourseIntrested.username = res.locals.intrestedUser.emailId.substring(0, indexOfAt);
                next();
            }
            else if(success && success.body){
                res.json(errors.unable_to_register_sender().withDetails(success.body.message));
            }else{
                logger.error('create discourse', 'Error in creating user for discourse', success.errors);
                res.json(errors.unable_to_register_sender().withDetails(messages.discourse_register_message));
            }
        });

    }
});

/**
 * route api to verify if creator user exist
 * at discourse
**/
route.use(function(req, res, next){
    var indexOfAt = req.user.emailId.indexOf('@');
    discourse.getUser(req.user.emailId.substring(0, indexOfAt), function(error, success){
        if(!error) {
            //logger.error(success);
            res.locals.creatordiscourse = success.user;
            //res.locals.creatordiscourse.username = req.user.emailId.substring(0, indexOfAt);
        }
            next();
    }); 
});


/**
 * Creating a user at discourse for creater user if not exist
 * else route to next middleware
 */
route.use(function(req, res, next){
    /**
     * Crearing a random password for creater
    **/
    var password = crypto.randomBytes(12)
                    .toString('hex');
    var indexOfAt = req.user.emailId.indexOf('@');
    if(res.locals.creatordiscourse){
        next();
    }else{
        discourse.createUser(req.user.firstName, req.user.emailId, password, function(error, success){
            if(success && success.body && success.body.success){
                res.locals.creatordiscourse = success.body;
                res.locals.creatordiscourse.password = password;
                res.locals.creatordiscourse.username = req.user.emailId.substring(0, indexOfAt);
                next();
            }else if(success && success.body){
                logger.error('create discourse', 'Error in creating user for discourse', success.errors);
                res.json(errors.unable_to_register_creator().withDetails(success.body.message));
            }else{
                logger.error('create discourse', 'Error in creating user for discourse', success.errors);
                res.json(errors.unable_to_register_creator().withDetails(messages.discourse_register_message));
            }
        });

    }
});


/**
 * Input body is the user object of a user with all information for discourse
 * middleware to create a topic on discourse and invite the another user 
**/

route.use(function(req, res, next){
    discourse.createTopic(req.body.disscussionTitle, req.body.disscussionTopic, res.locals.creatordiscourse.username+','+res.locals.discourseIntrested.username, 'Sendit Disscusion', function(error, success){
        if(success && success.toJSON()){
            success = success.toJSON();
            if(success.statusCode === config.discourseSuccessCode){
                res.locals.topicInfo = success.body;
                next();
            }else{
                res.json(errors.disscussion_not_created().withDetails(success.body.errors[0]));
            }       
        }else{
            res.json(errors.disscussion_not_created().withDetails());
        }

    })
});



/**
 * middleware to send email via sparkpost to both users with topic info
 */

route.use(function(req, res, next){
    var recipents = []
    var creator = JSON.parse(JSON.stringify(config.sparkPostRecipent));
    var intrested = JSON.parse(JSON.stringify(config.sparkPostRecipent));
    
    var user = req.user.toJSON();

    creator.address.email = user.emailId;
    creator.substitution_data = {
            firstName: req.user.firstName,
            topicInfo: res.locals.topicInfo,
            discourseUser: res.locals.creatordiscourse
        };
    
    intrested.address.email = res.locals.intrestedUser.emailId;
    intrested.substitution_data = {
        firstName: res.locals.intrestedUser.firstName,
        topicInfo: res.locals.topicInfo,
        discourseUser: res.locals.discourseIntrested
    }

    recipents.push(creator, intrested);
    
    return sparkpost.sendEmail(recipents, config.sparkPostTemplates.startADiscussion)
    .then(function(success){
        next();
    }, function(error){
        next();
    })
    .catch(next);

});


route.use(function(req, res, next){
        /**
         * Add userId to other request to intrests
         */

        var data = {
            requestId: res.locals.request.userIntrested.requestId,
            requestToLink: req.body.requestId,
            userId: req.user._id,
            disscussionId: res.locals.topicInfo.topic_id
        }
        return requestModule.addInterest(data)
        .then(function(doc){
            next();
        }, function(reject){
            res.json(reject);
        }).catch(next);
});

route.use(function(req,res, next){
    var condition =  {
        "_id": req.body.requestId,
        "userIntrested.userId":req.body.userId
        }
    var data = {
        '$set':{'userIntrested.$.disscussionId':res.locals.topicInfo.topic_id}
    }
    return requestModule.updateRequest(condition, data)
    .then(function(doc){
        var responce = {
            statusCode: 200,
            message: "Disscussion created successfully",
            disscussion:res.locals.topicInfo,
            disscussionUrl: config.discourseUrl + '/t/' + res.locals.topicInfo.topic_id
        }
    res.json(responce);
    }, function(reject){
        res.json(reject);
    })
    .catch(next);
});