var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema,
    bcrypt = require('bcryptjs'),
    plugins = require('../../../plugins'),
    autopopulate = require('mongoose-autopopulate');

// bcrypt password
var hashPass = function (value) {
    return bcrypt.hashSync(value);
}

// transform
var omitPrivate = function (doc, user) {
    delete user.password;
    delete user.id;
    delete user.__v;
    return user;
};

// options
var options = {
    toJSON: { virtuals: true, transform: omitPrivate }
};

// schema
var schema = new Schema({
    firstName: { type: String, trim: true},
    lastName: { type: String, trim: true },
    createdAt: { type: Date, default: new Date() },
    profileImage: { type: String, trim: true },
    emailId: { type: String, trim: true },
    lastLogin: { type: Date, default: new Date() },
    isActive: { type: Boolean, default: true },
    contactNumber: { type: String, trim: true},
    userProvider: [{
            socialId: {type: String, trim: true, unique: true },
            createdAt: { type: Date, default: new Date() },
            providerType: {type: Number, trim: true},
            isActive: { type: Boolean, default: true}
    }],
    address:{
        'address': {type: String, trim: true},
        'city':{type: String, trim: true},
        'zipCode':{type: String, trim: true},
        'country':{type: String, trim: true}
    },
    notificationPref:{
        'createInterest':{type: Boolean, default: true},
        'partnershipRequeted':{type: Boolean, default: true},
        'partnershipAccepted':{type: Boolean, default: true},
        'subscriptionExpired':{type: Boolean, default: true},
        'paymentAccepted':{type: Boolean, default: true}

    },
    paypalInfo:{
        'accountIdentifier': {
            'emailAddress':{type: String, trim: true},
            'mobilePhoneNumber': {type: String, trim: true},
            'accountId':{type: String, trim: true}
        },
        'firstName':{type: String, trim: true},
        'lastName': {type: String, trim: true}
    }
}, options);

// plugins
schema.plugin(plugins.mongooseFindPaginate);
schema.plugin(plugins.mongooseSearch, ['firstName', 'lastName', 'emailId']);

// autopopulate plugin
schema.plugin(autopopulate);

// // Schema hooks method
// schema.pre('save', function (next) {
//     this.fullName = _.isString(this.lastName) ? (this.firstName + ' ' + this.lastName) : this.firstName;
//     next();
// });

// model
module.exports = mongoose.model('User', schema);
