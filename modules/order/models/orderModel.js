var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = require('mongoose').Schema,
    bcrypt = require('bcryptjs'),
    plugins = require('../../../plugins'),
    autopopulate = require('mongoose-autopopulate');

// transform
var omitPrivate = function (doc, schedule) {
    delete schedule.id;
    delete schedule.__v;
    return schedule;
};

// options
var options = {
    toJSON: { virtuals: true, transform: omitPrivate }
};

// schema
var schema = new Schema({
    luggage: { type: Schema.Types.ObjectId, ref: 'Luggage' },
    totalAmount: { type: Number },
    payKey: { type: String, default: "" },
    transactionId: { type: String, default: "" },
    createdAt: { type: Date, default: new Date() },
    status: { type: String, trim: true },
    schedule: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    receivers: [{
        id: { type: Schema.Types.ObjectId, ref: 'User' },
        email: { type: email },
        amount: { type: Number },
        primary: { type: boolean, default: false }
    }]
}, options);

// plugins
schema.plugin(plugins.mongooseFindPaginate);

// autopopulate plugin
schema.plugin(autopopulate);

// model
module.exports = mongoose.model('Order', schema);
