var mongoose = require('mongoose');
var Schema = require('mongoose').Schema;
var config = require('config');

// token expiry in seconds
var expireIn = config.get('tokenExpireIn');

// transform for sending as json
function omitPrivate(doc, obj) {
    delete obj.createdAt;
    delete obj.__v;
    delete obj.id;
    return obj;
}

// schema options
var options = { toJSON: { transform: omitPrivate } };

// schema
var schema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true },
    userType: { type: String, default: "" },
    authToken: { type: String, required: true, index: { unique: true }, expireAfterSeconds: 30 },
    createdAt: { type: Date, default: Date.now, expires: expireIn },
    timeStamp: { type: String, default: new Date().getTime() },
    socialToken: { type: String},
    providerType: {type: Number},
    isActive: {type: Boolean, default: true}
}, options);

// model
module.exports = mongoose.model('Authorization', schema);