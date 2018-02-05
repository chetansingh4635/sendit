/**
 * Implementaion of sparkpost module
 * will be used send emails
**/

var SparkPost = require('sparkpost');
var config = require('config');
var client = new SparkPost(config.apiKeys.sparkpost);
var sparkPostModule = {};
var Promise = require("bluebird");


module.exports = sparkPostModule;

/**
 * Method to send email will be called with an json object conatining recipent address
 */

sparkPostModule.sendEmail = function(recipients, type){
    var sparkPostPayload = JSON.parse(JSON.stringify(config.defaultSparkPostPayload));
    sparkPostPayload.content.template_id =  type; 
    sparkPostPayload.recipients = JSON.parse(JSON.stringify(recipients));

    return new Promise(function(resolve, reject){
         client.transmissions.send({transmissionBody:sparkPostPayload}, function(err, data){
              if(err)
                reject(err);
            else
                resolve(data)
         });
    });
    
    // return client.transmissions.send(sparkPostPayload, function(error, data){
    //     console.log(error, "Error", "Successs", data );
    // });
    //     // .then(function(data){
        //     return data;
        // }, function(err){
        //     return null;
        // });

}






