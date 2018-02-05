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
    toJSON: { virtuals: true, transform: omitPrivate },
    timestamps: true
};

// schema
var schema = new Schema({
    firstName: { type: String, trim: true, lowercase: true },
    lastName: { type: String, trim: true, lowercase: true },
    profileImage: { type: String, trim: true },
    emailId: { type: String, trim: true, lowercase: true },
    password: {type: String, trim: true},
    lastLogin: { type: Date, default: new Date() },
    isActive: { type: Boolean, default: false }

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
module.exports = mongoose.model('Admin', schema);
