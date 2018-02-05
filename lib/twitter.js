

var Twitter = require("node-twitter-api"),
    config = require("config"),
	Promise = require("bluebird");

module.exports = new function() {
	this._twitter = {};

	this.requestToken = function(redirectUri) {
		this._twitter = new Twitter({
			consumerKey: config.twitterLogin.consumer_key,
			consumerSecret: config.twitterLogin.consumer_secret,
			callback: redirectUri
		});;
		return new Promise(function(resolve, reject) {
			this._twitter.getRequestToken(function(err, requestToken, requestSecret) {
				if (err)
					reject(err);
				else {
					this._requestToken = requestToken;
					this._requestSecret = requestSecret;
                    var request = {
                        requestToken: requestToken,
                        requestSecret: requestSecret
                    }
					resolve(request);
				}
			}.bind(this));
		}.bind(this));
	};

	this.accessToken = function(token, verifier) {
		var secret = this._requestSecret;
		this._verifier = verifier;


		return new Promise(function(resolve, reject) {
			this._twitter.getAccessToken(token, secret, verifier, function(err, accessToken, accessSecret) {
				if (err)
					reject(err);
				else {
					this._accessToken = accessToken;
					this._accessSecret = accessSecret;
                    var twitterAccess = {
                        accessToken: accessToken,
                        accessSecret: accessSecret
                    }
					resolve(twitterAccess);
				}
			});
		}.bind(this));
	};

	this.verifyCredentials = function(accessToken, accessSecret) {
		//var accessSecret = this._accessSecret;

		return new Promise(function(resolve, reject) {
			this._twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
				if (err) reject(err);
				else resolve(user);
			});
		}.bind(this));
	};
};