"use strict";

var
  request = require('request'),
  requestSync = require('sync-request'),
  querystring = require('querystring');

var actionTypeEnum = {
  LIKE: 1,
  WAS_LIKED: 2,
  BOOKMARK: 3,
  NEW_TOPIC: 4,
  REPLY: 5,
  RESPONSE: 6,
  MENTION: 7,
  QUOTE: 9,
  STAR: 10,
  EDIT: 11,
  NEW_PRIVATE_MESSAGE: 12,
  GOT_PRIVATE_MESSAGE: 13
};

var Discourse = function(url, api_key, api_username) {

  this.url = url;
  this.api_key = api_key;
  this.api_username = api_username;

};

module.exports = Discourse;

Discourse.prototype.get = function(url, parameters, callback) {

  var getUrl = this.url + '/' + url +
    '?api_key=' + this.api_key +
    '&api_username=' + this.api_username +
    '&' + querystring.stringify(parameters);

  var req = request.get({
      url: getUrl
    },
    function(error, response, body) {

      if (error) {
        req.abort();
        callback(error, {}, 500);
      }
      else if (!error && !!body.status && body.status !== 'OK'){
        error = new Error(body.description || body.error_message);
      }else{
        callback(error, body || {}, response != null ? response.statusCode : null);
      }
    }
  );
};


  Discourse.prototype.createUser = function (name, email, password, callback) {

    var url = this.url + 'users?api_key=' + this.api_key + '&api_username=' + this.api_username;
    console.log("Url", url);
    var userName = email.substring(0, email.indexOf('@'));
    var payload = {
        'name': name,
        'email': email,
        'username': userName,
        'password': password,
        'active': true
      };

      var options = {
        url: url,
        body: payload,
        json: true,
      }
      
    request.post(options,
      function (error, body, httpCode) {
        callback(error, body, httpCode);
      }
    );

  };


    Discourse.prototype.createTopic = function(title, raw, users, category, callback) {
    
    var url = this.url + 'posts?api_key=' + this.api_key + '&api_username=' + config.api_username;
    console.log("Url", url);
    var payload = {
        'title': title,
        'raw': raw,
        'category': category,
        'archetype': config.messageArchetype,
        'target_usernames':users
      };

      var options = {
        url: url,
        body: payload,
        json: true,
      }
      
    request.post(options,
      function (error, body, httpCode) {
        callback(error, body, httpCode);
      }
    );
  };

    Discourse.prototype.getUser = function (username, callback, errorCallback) {
    this.get('users/' + username + '.json',
      {},
      function (error, body, httpCode) {
        if (error) {
          return errorCallback(error, null);
        }else{
        try {
          var json = JSON.parse(body);
          if (json.user) return callback(null, json);
          else return callback({error: 'User not exist'}, null);
        }
        catch (err) {
          return callback(err, null);
        }

      }
    }
    );
  };

